# دليل تقليل التعقيد المعرفي
# Cognitive Complexity Reduction Guide

## نظرة عامة
هذا الدليل يوضح كيفية تقليل التعقيد المعرفي (Cognitive Complexity) في الكود لتحسين قابلية القراءة والصيانة.

## ما هو التعقيد المعرفي؟
التعقيد المعرفي هو مقياس لصعوبة فهم الكود. كلما زاد التعقيد، كلما كان الكود أصعب في الفهم والصيانة.

### الحدود المقبولة:
- **0-10**: بسيط (Simple)
- **11-20**: معقد (Complex) 
- **21+**: معقد جداً (Very Complex) - يحتاج إعادة كتابة

## استراتيجيات تقليل التعقيد

### 1. تقسيم الدوال الكبيرة
```typescript
// ❌ دالة معقدة (تعقيد 25+)
function processUserData(userData: any) {
  if (userData) {
    if (userData.email) {
      if (userData.email.includes('@')) {
        if (userData.phone) {
          if (userData.phone.length > 10) {
            // منطق معقد...
          }
        }
      }
    }
  }
}

// ✅ دوال مبسطة (تعقيد < 10 لكل دالة)
function validateEmail(email: string): boolean {
  return email && email.includes('@');
}

function validatePhone(phone: string): boolean {
  return phone && phone.length > 10;
}

function processUserData(userData: any) {
  if (!userData) return;
  
  if (!validateEmail(userData.email)) return;
  if (!validatePhone(userData.phone)) return;
  
  // منطق مبسط...
}
```

### 2. استخدام Early Returns
```typescript
// ❌ تعقيد عالي
function processPayment(payment: any) {
  if (payment) {
    if (payment.amount) {
      if (payment.amount > 0) {
        if (payment.currency) {
          if (payment.currency === 'USD' || payment.currency === 'EUR') {
            // منطق الدفع...
          }
        }
      }
    }
  }
}

// ✅ تعقيد منخفض
function processPayment(payment: any) {
  if (!payment) return { error: 'No payment data' };
  if (!payment.amount || payment.amount <= 0) return { error: 'Invalid amount' };
  if (!payment.currency) return { error: 'No currency' };
  if (!['USD', 'EUR'].includes(payment.currency)) return { error: 'Unsupported currency' };
  
  // منطق الدفع...
}
```

### 3. استخراج الشروط المعقدة
```typescript
// ❌ شروط معقدة
function canUserAccess(user: any, resource: any) {
  if (user && user.role && (user.role === 'admin' || user.role === 'moderator') && 
      resource && resource.ownerId && (resource.ownerId === user.id || 
      user.permissions && user.permissions.includes('read_all'))) {
    return true;
  }
  return false;
}

// ✅ شروط مبسطة
function isAdminOrModerator(user: any): boolean {
  return user?.role === 'admin' || user?.role === 'moderator';
}

function isOwnerOrHasPermission(user: any, resource: any): boolean {
  return resource?.ownerId === user?.id || 
         user?.permissions?.includes('read_all');
}

function canUserAccess(user: any, resource: any): boolean {
  return isAdminOrModerator(user) && isOwnerOrHasPermission(user, resource);
}
```

### 4. استخدام Lookup Tables
```typescript
// ❌ switch معقد
function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'yellow';
    case 'approved':
      return 'green';
    case 'rejected':
      return 'red';
    case 'cancelled':
      return 'gray';
    case 'expired':
      return 'orange';
    default:
      return 'blue';
  }
}

// ✅ lookup table
const STATUS_COLORS = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
  cancelled: 'gray',
  expired: 'orange'
} as const;

function getStatusColor(status: string): string {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'blue';
}
```

### 5. استخدام Helper Functions
```typescript
// ❌ منطق معقد في دالة واحدة
async function sendOTP(phone: string) {
  // التحقق من Rate Limiting
  if (rateLimitCheck(phone)) {
    // البحث عن OTP موجود
    const existing = await findExistingOTP(phone);
    if (existing) {
      // إرسال OTP
      const result = await sendSMS(phone);
      if (result.success) {
        // حفظ OTP
        await saveOTP(phone, result.otp);
        return { success: true };
      }
    }
  }
  return { success: false };
}

// ✅ دوال مساعدة
async function checkRateLimit(phone: string): Promise<boolean> {
  return rateLimitCheck(phone);
}

async function findExistingOTP(phone: string): Promise<any> {
  return await getOTP(phone);
}

async function sendOTP(phone: string) {
  if (!await checkRateLimit(phone)) return { success: false };
  
  const existing = await findExistingOTP(phone);
  if (existing) return { success: true, existing: true };
  
  const result = await sendSMS(phone);
  if (result.success) {
    await saveOTP(phone, result.otp);
  }
  
  return result;
}
```

## أدوات مساعدة متوفرة

### 1. `complexity-reducer.ts`
```typescript
import { safeExecute, createResponseHandler, validateInput } from '@/lib/utils/complexity-reducer';

// معالجة آمنة للأخطاء
const result = await safeExecute(async () => {
  // منطق العملية
}, 'Operation Name');

// معالج الاستجابة
const responseHandler = createResponseHandler();
return NextResponse.json(responseHandler.success(data));

// التحقق من البيانات
const validation = validateInput(data, rules);
if (!validation.isValid) {
  return NextResponse.json(responseHandler.error(validation.error));
}
```

### 2. استخدام Type Guards
```typescript
function isValidUser(user: any): user is User {
  return user && 
         typeof user.id === 'string' && 
         typeof user.email === 'string';
}

function processUser(user: any) {
  if (!isValidUser(user)) {
    return { error: 'Invalid user data' };
  }
  
  // الآن TypeScript يعرف أن user هو User
  return { success: true, userId: user.id };
}
```

## أفضل الممارسات

### 1. قاعدة الـ 15
- لا تتجاوز التعقيد المعرفي 15 في أي دالة
- إذا تجاوزت، قسّم الدالة إلى دوال أصغر

### 2. قاعدة الـ 4 مستويات
- لا تتجاوز 4 مستويات من التعشيق (nesting)
- استخدم early returns لتقليل التعشيق

### 3. أسماء واضحة
```typescript
// ❌ أسماء غير واضحة
function process(data: any) {
  if (data.x && data.y) {
    // ...
  }
}

// ✅ أسماء واضحة
function validateUserRegistration(userData: UserRegistrationData) {
  if (userData.email && userData.password) {
    // ...
  }
}
```

### 4. تعليقات مفيدة
```typescript
// ✅ تعليقات توضح النية
function calculateDiscount(price: number, userType: UserType): number {
  // خصم 10% للمستخدمين المميزين
  if (userType === 'premium') {
    return price * 0.1;
  }
  
  // خصم 5% للمستخدمين العاديين
  if (userType === 'regular') {
    return price * 0.05;
  }
  
  return 0;
}
```

## أمثلة عملية

### قبل الإصلاح (تعقيد 37)
```typescript
export async function POST(request: NextRequest) {
  try {
    // 200+ سطر من الكود المعقد
    // تعشيق عميق
    // شروط متعددة
    // منطق معقد
  } catch (error) {
    // معالجة أخطاء
  }
}
```

### بعد الإصلاح (تعقيد < 15)
```typescript
export async function POST(request: NextRequest) {
  return safeExecute(async () => {
    const data = await validateAndParseRequest(request);
    const result = await processRequest(data);
    return createSuccessResponse(result);
  }, 'API Name').then(handleResponse);
}
```

## أدوات التحليل

### 1. SonarQube
- تحليل التعقيد المعرفي
- اقتراحات للتحسين
- تتبع التقدم

### 2. ESLint Rules
```json
{
  "rules": {
    "complexity": ["error", 15],
    "max-depth": ["error", 4],
    "max-lines-per-function": ["error", 50]
  }
}
```

## الخلاصة

تقليل التعقيد المعرفي يحسن:
- **قابلية القراءة**: الكود أسهل في الفهم
- **قابلية الصيانة**: أسهل في التعديل والإصلاح
- **قابلية الاختبار**: أسهل في كتابة الاختبارات
- **قابلية إعادة الاستخدام**: الدوال الصغيرة قابلة لإعادة الاستخدام

**تذكر**: الكود يُكتب مرة ويُقرأ مئات المرات. استثمر في جعل الكود واضحاً ومفهوماً.
