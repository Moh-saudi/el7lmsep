import { initializeFirebaseAdmin, getAdminDb } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, getClientIpFromHeaders } from '@/lib/security/rate-limit';

// دالة لتطبيع رقم الهاتف
function normalizePhoneNumber(phone: string): string[] {
  // إزالة جميع الرموز غير الرقمية
  let cleaned = phone.replace(/[^\d]/g, '');
  
  // إنشاء قائمة بالتنسيقات المحتملة
  const formats = [cleaned];
  
  // إزالة الصفر من البداية إذا كان موجوداً
  const withoutLeadingZero = cleaned.replace(/^0+/, '');
  if (withoutLeadingZero !== cleaned) {
    formats.push(withoutLeadingZero);
  }
  
  // إضافة تنسيقات مختلفة حسب كود الدولة
  if (cleaned.startsWith('20')) {
    // رقم مصري
    const withoutCountryCode = cleaned.substring(2);
    formats.push(withoutCountryCode); // بدون كود مصر
    formats.push('0' + withoutCountryCode); // مع صفر في البداية
    // إضافة تنسيقات أخرى للرقم المصري
    if (withoutCountryCode.length === 10) {
      formats.push(withoutCountryCode.substring(0, 9)); // بدون آخر رقم
      formats.push('0' + withoutCountryCode.substring(0, 9)); // مع صفر وبدون آخر رقم
    }
  } else if (cleaned.length === 10 && cleaned.startsWith('1')) {
    // رقم مصري بدون صفر في البداية (مثل 1017799580)
    formats.push(cleaned); // الرقم كما هو
    formats.push('0' + cleaned); // مع صفر في البداية
    formats.push(cleaned.substring(0, 9)); // بدون آخر رقم
    formats.push('0' + cleaned.substring(0, 9)); // مع صفر وبدون آخر رقم
  } else if (cleaned.startsWith('966')) {
    // رقم سعودي
    formats.push(cleaned.substring(3)); // بدون كود السعودية
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('971')) {
    // رقم إماراتي
    formats.push(cleaned.substring(3)); // بدون كود الإمارات
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('974')) {
    // رقم قطري
    formats.push(cleaned.substring(3)); // بدون كود قطر
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('965')) {
    // رقم كويتي
    formats.push(cleaned.substring(3)); // بدون كود الكويت
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('973')) {
    // رقم بحريني
    formats.push(cleaned.substring(3)); // بدون كود البحرين
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('968')) {
    // رقم عماني
    formats.push(cleaned.substring(3)); // بدون كود عمان
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('962')) {
    // رقم أردني
    formats.push(cleaned.substring(3)); // بدون كود الأردن
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('961')) {
    // رقم لبناني
    formats.push(cleaned.substring(3)); // بدون كود لبنان
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('964')) {
    // رقم عراقي
    formats.push(cleaned.substring(3)); // بدون كود العراق
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('963')) {
    // رقم سوري
    formats.push(cleaned.substring(3)); // بدون كود سوريا
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('212')) {
    // رقم مغربي
    formats.push(cleaned.substring(3)); // بدون كود المغرب
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('213')) {
    // رقم جزائري
    formats.push(cleaned.substring(3)); // بدون كود الجزائر
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('216')) {
    // رقم تونسي
    formats.push(cleaned.substring(3)); // بدون كود تونس
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('218')) {
    // رقم ليبي
    formats.push(cleaned.substring(3)); // بدون كود ليبيا
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('249')) {
    // رقم سوداني
    formats.push(cleaned.substring(3)); // بدون كود السودان
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('221')) {
    // رقم سنغالي
    formats.push(cleaned.substring(3)); // بدون كود السنغال
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('225')) {
    // رقم ساحل العاج
    formats.push(cleaned.substring(3)); // بدون كود ساحل العاج
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('253')) {
    // رقم جيبوتي
    formats.push(cleaned.substring(3)); // بدون كود جيبوتي
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('34')) {
    // رقم إسباني
    formats.push(cleaned.substring(2)); // بدون كود إسبانيا
    formats.push('0' + cleaned.substring(2)); // مع صفر في البداية
  } else if (cleaned.startsWith('33')) {
    // رقم فرنسي
    formats.push(cleaned.substring(2)); // بدون كود فرنسا
    formats.push('0' + cleaned.substring(2)); // مع صفر في البداية
  } else if (cleaned.startsWith('44')) {
    // رقم إنجليزي
    formats.push(cleaned.substring(2)); // بدون كود إنجلترا
    formats.push('0' + cleaned.substring(2)); // مع صفر في البداية
  } else if (cleaned.startsWith('351')) {
    // رقم برتغالي
    formats.push(cleaned.substring(3)); // بدون كود البرتغال
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('39')) {
    // رقم إيطالي
    formats.push(cleaned.substring(2)); // بدون كود إيطاليا
    formats.push('0' + cleaned.substring(2)); // مع صفر في البداية
  } else if (cleaned.startsWith('30')) {
    // رقم يوناني
    formats.push(cleaned.substring(2)); // بدون كود اليونان
    formats.push('0' + cleaned.substring(2)); // مع صفر في البداية
  } else if (cleaned.startsWith('357')) {
    // رقم قبرصي
    formats.push(cleaned.substring(3)); // بدون كود قبرص
    formats.push('0' + cleaned.substring(3)); // مع صفر في البداية
  } else if (cleaned.startsWith('90')) {
    // رقم تركي
    formats.push(cleaned.substring(2)); // بدون كود تركيا
    formats.push('0' + cleaned.substring(2)); // مع صفر في البداية
  } else if (cleaned.startsWith('66')) {
    // رقم تايلندي
    formats.push(cleaned.substring(2)); // بدون كود تايلاند
    formats.push('0' + cleaned.substring(2)); // مع صفر في البداية
  } else {
    // إذا لم يكن هناك كود دولة معروف، أضف تنسيقات مختلفة
    if (cleaned.length > 9) {
      // إذا كان الرقم طويل، قد يكون مع كود دولة
      formats.push(cleaned.substring(2)); // بدون أول رقمين
      formats.push(cleaned.substring(3)); // بدون أول ثلاثة أرقام
    }
  }
  
  // إزالة التكرار
  return [...new Set(formats)];
}

export async function POST(request: NextRequest) {
  let email, phone;
  try {
    // rate limit by IP
    const clientIp = getClientIpFromHeaders(request.headers);
    const ipCheck = rateLimiter.check(`auth:check:${clientIp}`, { windowMs: 60_000, max: 60 });
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ipCheck.retryAfterMs / 1000)) } }
      );
    }
    const body = await request.json();
    email = body.email;
    phone = body.phone;
  } catch (err) {
    return NextResponse.json({
      error: 'يرجى إرسال البيانات بصيغة JSON صحيحة (مثال: { "phone": "..." })',
        emailExists: false,
        phoneExists: false 
    }, { status: 400 });
  }
  
  try {
    let emailExists = false;
    let phoneExists = false;
    
    console.log('🔍 Checking user exists:', { email, phone });
    
    // تهيئة Firebase Admin أولاً
        initializeFirebaseAdmin();
        
        // استخدام Firebase Admin للوصول إلى Firestore
        const db = getAdminDb();
        console.log('✅ Firestore instance created successfully');
        
    // قائمة جميع collections للبحث فيها
    const collections = ['users', 'clubs', 'players', 'academies', 'agents', 'trainers'];
    
    // دالة للبحث مع timeout
    const searchWithTimeout = async (collectionName: string, field: string, value: string) => {
      try {
        const query = await Promise.race([
          db.collection(collectionName).where(field, '==', value).limit(1).get(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);
        return { collectionName, found: !(query as any).empty };
      } catch (error) {
        console.log(`⚠️ Timeout or error searching ${collectionName}:`, (error as Error).message);
        return { collectionName, found: false };
      }
    };
    
    // البحث عن المستخدم بالبريد الإلكتروني (متوازي)
        if (email) {
      console.log('📧 Starting parallel email search...');
      const emailPromises = collections.map(collection => 
        searchWithTimeout(collection, 'email', email)
      );
      
      const emailResults = await Promise.all(emailPromises);
      emailExists = emailResults.some(result => result.found);
      
      if (emailExists) {
        const foundIn = emailResults.find(result => result.found)?.collectionName;
        console.log(`📧 Email found in ${foundIn}:`, emailExists);
      }
          console.log('📧 Email check result:', emailExists);
        }
        
    // البحث عن المستخدم برقم الهاتف (متوازي)
        if (phone) {
      console.log('📱 Starting parallel phone search...');
      
      // تطبيع الرقم للحصول على جميع التنسيقات المحتملة
      const phoneFormats = normalizePhoneNumber(phone);
      console.log('📱 Phone formats to search:', phoneFormats);
      
      // البحث في جميع التنسيقات
      const allPhonePromises = [];
      
      for (const collectionName of collections) {
        for (const phoneFormat of phoneFormats) {
          allPhonePromises.push(
            searchWithTimeout(collectionName, 'phone', phoneFormat)
          );
        }
      }
      
      const phoneResults = await Promise.all(allPhonePromises);
      phoneExists = phoneResults.some(result => result.found);
      
      if (phoneExists) {
        const foundResult = phoneResults.find(result => result.found);
        console.log(`📱 Phone found in ${foundResult?.collectionName}:`, phoneExists);
      }
      console.log('📱 Phone check result:', phoneExists);
    }
    
    console.log('✅ User existence check completed:', { emailExists, phoneExists });
    
    return NextResponse.json({ 
      emailExists,
      phoneExists,
      message: 'User existence check completed successfully'
    });
    
  } catch (error) {
    console.error('❌ Error checking user existence:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        emailExists: false,
        phoneExists: false 
      },
      { status: 500 }
    );
  }
} 
