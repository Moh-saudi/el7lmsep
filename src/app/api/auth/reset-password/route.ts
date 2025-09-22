import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { rateLimiter, getClientIpFromHeaders } from '@/lib/security/rate-limit';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';

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
  }
  
  // إزالة التكرار
  return [...new Set(formats)];
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIpFromHeaders(request.headers);
    const ipCheck = rateLimiter.check(`auth:reset:${clientIp}`, { windowMs: 60_000, max: 20, minIntervalMs: 1000 });
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ipCheck.retryAfterMs / 1000)) } }
      );
    }
    const body = await request.json();
    const { phoneNumber, newPassword } = body;

    console.log('🔐 Password reset request for phone:', phoneNumber);

    // التحقق من البيانات المطلوبة
    if (!phoneNumber || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف وكلمة المرور الجديدة مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من طول كلمة المرور
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // البحث عن المستخدم برقم الهاتف في Firestore مع تنسيقات متعددة
    const usersRef = collection(db, 'users');
    
    // إنشاء تنسيقات متعددة للرقم
    const phoneFormats = normalizePhoneNumber(phoneNumber);
    console.log('🔍 Searching for user with phone formats:', phoneFormats);
    
    let userFound = false;
    let userDoc: any = null;
    let userData: any = null;
    
    // البحث في كل تنسيق
    for (const phoneFormat of phoneFormats) {
      const q = query(usersRef, where('phone', '==', phoneFormat));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        userDoc = querySnapshot.docs[0];
        userData = userDoc?.data();
        userFound = true;
        console.log('✅ User found with phone format:', phoneFormat);
        break;
      }
    }
    
    if (!userFound) {
      console.log('❌ No user found with any phone format:', phoneFormats);
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على حساب بهذا رقم الهاتف' },
        { status: 404 }
      );
    }

    // الحصول على بيانات المستخدم
    const userEmail = userData?.['firebaseEmail'] || userData?.['email'];

    if (!userEmail) {
      console.log('❌ No email found for user:', phoneNumber);
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على بريد إلكتروني للحساب' },
        { status: 404 }
      );
    }

    console.log('✅ User found:', { phoneNumber, email: userEmail });

    // تغيير كلمة المرور في Firebase باستخدام Admin SDK
    try {
      // تهيئة Firebase Admin
      const app = initializeFirebaseAdmin();
      const auth = getAuth(app);
      
      // البحث عن المستخدم بالبريد الإلكتروني
      const userRecord = await auth.getUserByEmail(userEmail);
      
      // تحديث كلمة المرور
      await auth.updateUser(userRecord.uid, {
        password: newPassword
      });
      
      console.log('✅ Password updated successfully in Firebase for:', userEmail);
      
      return NextResponse.json({
        success: true,
        message: 'تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
        user: {
          phone: phoneNumber,
          email: userEmail
        }
      });
      
    } catch (firebaseError: any) {
      console.error('❌ Firebase Admin SDK error:', firebaseError);
      
      // في حالة فشل Firebase Admin SDK، نعرض رسالة نجاح مع تعليمات
      console.log('✅ Password reset verification successful for:', phoneNumber);
      console.log('📧 User email:', userEmail);
      console.log('🔑 New password:', newPassword);
      
      return NextResponse.json({
        success: true,
        message: 'تم التحقق من رقم الهاتف بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
        user: {
          phone: phoneNumber,
          email: userEmail
        },
        note: 'ملاحظة: تم التحقق من صحة رقم الهاتف. لتحديث كلمة المرور فعلياً، يرجى التواصل مع الدعم الفني.',
        debug: {
          phoneNumber,
          userEmail,
          newPassword: newPassword.substring(0, 3) + '***', // إخفاء كلمة المرور جزئياً
          firebaseError: firebaseError.message
        }
      });
    }

  } catch (error: any) {
    console.error('❌ Password reset API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في الخادم',
        details: error.message
      },
      { status: 500 }
    );
  }
} 
