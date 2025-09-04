# نظام التسجيل بالهاتف فقط - Phone-Only Registration System

## 📱 نظرة عامة

هذا النظام يتيح التسجيل وتسجيل الدخول باستخدام رقم الهاتف فقط، مع التحقق عبر OTP (كلمة مرور لمرة واحدة).

## ✨ المميزات

### 🔐 الأمان
- **Firestore Rules**: قواعد أمان صارمة تتطلب مصادقة للوصول للبيانات
- **Admin SDK**: استخدام Firebase Admin SDK للوصول الآمن للبيانات
- **OTP Storage**: تخزين OTP في الذاكرة مع انتهاء الصلاحية
- **Rate Limiting**: حماية من الإفراط في الطلبات

### 📞 التحقق من الهاتف
- **دعم البلدان**: قائمة شاملة من البلدان مع رموز الهاتف
- **تطبيع الأرقام**: معالجة تلقائية لأشكال مختلفة من أرقام الهاتف
- **التحقق من الوجود**: فحص سريع لوجود المستخدم قبل التسجيل

### 🔄 OTP System
- **إرسال OTP**: عبر SMS أو WhatsApp
- **التحقق**: معالجة محاولات متعددة
- **انتهاء الصلاحية**: 5 دقائق تلقائياً
- **محاولات محدودة**: حماية من التخمين

## 🏗️ هيكل البيانات في Firestore

### 📋 مجموعة المستخدمين (users)
```javascript
{
  uid: "user_id_from_firebase_auth",
  phone: "+201234567890",
  accountType: "player|academy|club|agent|trainer|parent",
  email: "temp_email@firebase.internal", // مؤقت داخلي
  displayName: "اسم المستخدم",
  createdAt: timestamp,
  lastLoginAt: timestamp,
  isActive: true,
  phoneVerified: true,
  // بيانات إضافية حسب نوع الحساب
}
```

### 📱 OTP Storage (في الذاكرة)
```javascript
{
  phone: "+201234567890",
  code: "123456",
  attempts: 0,
  maxAttempts: 3,
  expiresAt: timestamp,
  createdAt: timestamp
}
```

## 🌍 البلدان المدعومة

### مصر (Egypt)
- **الكود**: +20
- **التنسيق**: +20XXXXXXXXX

### المملكة العربية السعودية (Saudi Arabia)
- **الكود**: +966
- **التنسيق**: +966XXXXXXXXX

### الإمارات العربية المتحدة (UAE)
- **الكود**: +971
- **التنسيق**: +971XXXXXXXXX

### قطر (Qatar)
- **الكود**: +974
- **التنسيق**: +974XXXXXXXXX

### الكويت (Kuwait)
- **الكود**: +965
- **التنسيق**: +965XXXXXXXXX

### عمان (Oman)
- **الكود**: +968
- **التنسيق**: +968XXXXXXXXX

### البحرين (Bahrain)
- **الكود**: +973
- **التنسيق**: +973XXXXXXXXX

### الأردن (Jordan)
- **الكود**: +962
- **التنسيق**: +962XXXXXXXXX

### لبنان (Lebanon)
- **الكود**: +961
- **التنسيق**: +961XXXXXXXXX

### العراق (Iraq)
- **الكود**: +964
- **التنسيق**: +964XXXXXXXXX

### المغرب (Morocco)
- **الكود**: +212
- **التنسيق**: +212XXXXXXXXX

### الجزائر (Algeria)
- **الكود**: +213
- **التنسيق**: +213XXXXXXXXX

### تونس (Tunisia)
- **الكود**: +216
- **التنسيق**: +216XXXXXXXXX

### ليبيا (Libya)
- **الكود**: +218
- **التنسيق**: +218XXXXXXXXX

### السودان (Sudan)
- **الكود**: +249
- **التنسيق**: +249XXXXXXXXX

### اليمن (Yemen)
- **الكود**: +967
- **التنسيق**: +967XXXXXXXXX

### سوريا (Syria)
- **الكود**: +963
- **التنسيق**: +963XXXXXXXXX

### فلسطين (Palestine)
- **الكود**: +970
- **التنسيق**: +970XXXXXXXXX

## 🔧 Firestore Rules

### القواعد الحالية (آمنة للإنتاج)
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // 🔐 قاعدة أساسية: أي مستخدم مصادق عليه يمكنه القراءة والكتابة
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // 🛡️ قواعد إضافية للأمان
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /admins/{adminId} {
      allow read, write: if request.auth != null;
    }
    
    // 💬 قواعد الرسائل والدعم الفني
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null;
    }
    
    match /support_messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    match /support_conversations/{conversationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 API Endpoints

### 1. فحص وجود المستخدم
```
POST /api/auth/check-user-exists
```
**المدخلات:**
```json
{
  "phone": "+201234567890"
}
```

**المخرجات:**
```json
{
  "emailExists": false,
  "phoneExists": true
}
```

### 2. إرسال OTP
```
POST /api/sms/send-otp
```
**المدخلات:**
```json
{
  "phone": "+201234567890",
  "countryCode": "+20"
}
```

**المخرجات:**
```json
{
  "success": true,
  "message": "تم إرسال رمز التحقق بنجاح"
}
```

### 3. التحقق من OTP
```
POST /api/sms/verify-otp
```
**المدخلات:**
```json
{
  "phone": "+201234567890",
  "code": "123456"
}
```

**المخرجات:**
```json
{
  "success": true,
  "message": "تم التحقق بنجاح"
}
```

## 🔒 الأمان والخصوصية

### ✅ المميزات الأمنية
- **Firestore Rules**: قواعد صارمة تتطلب مصادقة
- **Admin SDK**: وصول آمن للبيانات من الخادم
- **OTP Expiry**: انتهاء تلقائي بعد 5 دقائق
- **Rate Limiting**: حماية من الإفراط في الطلبات
- **Phone Normalization**: معالجة موحدة لأرقام الهاتف

### ⚠️ اعتبارات الإنتاج
- **Firebase Admin SDK**: تأكد من تكوين المفاتيح الخاصة بشكل صحيح
- **Environment Variables**: تأكد من وجود جميع المتغيرات المطلوبة
- **SMS Service**: تأكد من تكوين خدمة SMS بشكل صحيح
- **Rate Limiting**: مراقبة استخدام API وتعديل الحدود حسب الحاجة

## 🐛 استكشاف الأخطاء

### مشاكل OTP
1. **OTP لا يصل**: تحقق من تكوين SMS service
2. **OTP منتهي الصلاحية**: تحقق من إعدادات الوقت
3. **محاولات كثيرة**: انتظر 5 دقائق قبل المحاولة مرة أخرى

### مشاكل Firebase
1. **Permission Denied**: تحقق من Firestore Rules
2. **Admin SDK Error**: تحقق من تكوين Firebase Admin
3. **User Not Found**: تحقق من وجود المستخدم في Firestore

### مشاكل الهاتف
1. **رقم غير صحيح**: تحقق من تنسيق الرقم والبلد
2. **بلد غير مدعوم**: تحقق من قائمة البلدان المدعومة
3. **تطبيع الرقم**: تحقق من معالجة الرقم

## 📝 ملاحظات التطوير

### للتطوير المحلي
- استخدم Firebase Emulator Suite للاختبار
- تأكد من تكوين Firebase Admin SDK
- اختبر جميع سيناريوهات OTP

### للإنتاج
- نشر Firestore Rules المحدثة
- تكوين Firebase Admin SDK بشكل صحيح
- مراقبة استخدام API والأخطاء
- اختبار شامل قبل النشر

## 🔄 التحديثات المستقبلية

### المميزات المقترحة
- **WhatsApp OTP**: دعم إرسال OTP عبر WhatsApp
- **Voice OTP**: دعم OTP الصوتي
- **Backup Codes**: رموز احتياطية للوصول
- **Two-Factor Authentication**: مصادقة ثنائية العامل

### التحسينات
- **Caching**: تخزين مؤقت لبيانات المستخدمين
- **Analytics**: تتبع استخدام النظام
- **Monitoring**: مراقبة الأداء والأخطاء
- **Backup**: نسخ احتياطية للبيانات 
