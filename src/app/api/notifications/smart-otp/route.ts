import { NextRequest, NextResponse } from 'next/server';
import { beonSMSService } from '@/lib/beon';
import { storeOTP, getOTP } from '../../sms/otp-storage';
import { safeExecute, createResponseHandler, validateInput } from '@/lib/utils/complexity-reducer';

// إعدادات الحماية
const CACHE_DURATION = 60000; // دقيقة واحدة
const MAX_REQUESTS_PER_MINUTE = 3;
const MIN_INTERVAL_BETWEEN_REQUESTS = 5000; // 5 ثوانٍ

// تخزين مؤقت للطلبات
const requestCache = new Map<string, { timestamp: number; count: number; lastRequest: number }>();

// معالج الاستجابة
const responseHandler = createResponseHandler();

// قواعد التحقق من البيانات
const validationRules = {
  phone: (phone: string) => phone && phone.trim().length > 0,
  name: (name: string) => name && name.trim().length > 0,
  country: (country: string) => country && country.trim().length > 0,
  countryCode: (code: string) => code && code.trim().length > 0
};

// إدارة الكاش المحلي
function manageRequestCache(phone: string) {
  const now = Date.now();
  const cacheKey = phone;
  const cachedRequest = requestCache.get(cacheKey);
  
  if (cachedRequest) {
    const timeDiff = now - cachedRequest.timestamp;
    const lastRequestDiff = now - cachedRequest.lastRequest;
    
    // التحقق من الفاصل الزمني الأدنى
    if (lastRequestDiff < MIN_INTERVAL_BETWEEN_REQUESTS) {
      return {
        allowed: false,
        response: NextResponse.json(
          { success: false, error: 'يرجى الانتظار 5 ثوانٍ قبل إرسال طلب جديد' },
          { status: 429 }
        )
      };
    }
    
    // التحقق من الحد الأقصى للطلبات
    if (timeDiff < CACHE_DURATION && cachedRequest.count >= MAX_REQUESTS_PER_MINUTE) {
      return {
        allowed: false,
        response: NextResponse.json(
          { success: false, error: 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار دقيقة واحدة قبل المحاولة مرة أخرى.' },
          { status: 429 }
        )
      };
    }
    
    // تحديث الكاش
    if (timeDiff < CACHE_DURATION) {
      cachedRequest.count++;
      cachedRequest.lastRequest = now;
    } else {
      requestCache.set(cacheKey, { timestamp: now, count: 1, lastRequest: now });
    }
  } else {
    requestCache.set(cacheKey, { timestamp: now, count: 1, lastRequest: now });
  }

  // تنظيف الكاش القديم
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      requestCache.delete(key);
    }
  }

  return { allowed: true };
}

// فحص OTP موجود
async function checkExistingOTP(phone: string) {
  const existingOTP = await getOTP(phone);
  if (existingOTP && !existingOTP.expired) {
    console.log('📱 Found existing valid OTP for:', phone, 'OTP:', existingOTP.otp);
    return { found: true, otp: existingOTP };
  }
  return { found: false };
}

// إرسال OTP ذكي
async function sendSmartOTP(phone: string, name: string, country: string, countryCode: string) {
  console.log('📱 Attempting to send Smart OTP to:', phone);
  
  // توليد OTP
  const otp = generateOTP();
  
  // إنشاء رسالة OTP
  const message = `مرحباً ${name}، رمز التحقق الخاص بك هو: ${otp}. لا تشارك هذا الرمز مع أي شخص.`;
  
  // إرسال SMS باستخدام الخدمة المتاحة
  const smsResult = await beonSMSService.sendSingleSMS(phone, message);
  
  // إضافة OTP للنتيجة
  return {
    ...smsResult,
    otp: smsResult.success ? otp : undefined
  };
}

// توليد OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// معالجة OTP المرسل
async function handleSentOTP(phone: string, smsResult: any) {
  if (!smsResult.success) {
    return {
      success: false,
      error: smsResult.error || 'فشل في إرسال رمز التحقق'
    };
  }

  console.log('📱 Smart OTP sent successfully to:', phone);
  
  if (smsResult.otp) {
    await storeOTP(phone, smsResult.otp, 'sms');
    console.log('💾 Smart OTP stored successfully for verification');
  }

  return {
    success: true,
    message: 'تم إرسال رمز التحقق بنجاح',
    phoneNumber: phone,
    otp: smsResult.otp
  };
}

// الدالة الرئيسية
export async function POST(request: NextRequest) {
  return safeExecute(async () => {
    const body = await request.json();
    const { phone, name, country, countryCode } = body;

    console.log('📱 Smart OTP Request:', { phone, name, country, countryCode });

    // التحقق من البيانات المطلوبة
    const validation = validateInput(body, validationRules);
    if (!validation.isValid) {
      return NextResponse.json(
        responseHandler.error(validation.error || 'جميع البيانات مطلوبة (phone, name, country, countryCode)'),
        { status: 400 }
      );
    }

    // إدارة الكاش المحلي
    const cacheCheck = manageRequestCache(phone);
    if (!cacheCheck.allowed) {
      return cacheCheck.response;
    }

    // فحص OTP موجود
    const existingOTPCheck = await checkExistingOTP(phone);
    if (existingOTPCheck.found) {
      return NextResponse.json(responseHandler.success({
        phoneNumber: phone,
        existingOTP: true,
        otp: existingOTPCheck.otp.otp
      }, 'تم إرسال رمز التحقق بنجاح'));
    }

    console.log('📱 Rate limit check passed for:', phone);

    // إرسال OTP ذكي
    const smsResult = await sendSmartOTP(phone, name, country, countryCode);
    
    // معالجة النتيجة
    const result = await handleSentOTP(phone, smsResult);
    
    if (result.success) {
      return NextResponse.json(responseHandler.success(result, result.message));
    } else {
      return NextResponse.json(
        responseHandler.error(result.error),
        { status: 500 }
      );
    }

  }, 'Smart OTP API').then(result => {
    if (result.success) {
      return result.data;
    } else {
      return NextResponse.json(
        responseHandler.error(result.error || 'خطأ في الخادم. يرجى المحاولة مرة أخرى.'),
        { status: 500 }
      );
    }
  });
}