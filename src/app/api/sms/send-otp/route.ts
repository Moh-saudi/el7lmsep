import { NextRequest, NextResponse } from 'next/server';
import { beonSMSService } from '@/lib/beon';
import { storeOTP, getOTP, getOTPStatus } from '../otp-storage';
import { rateLimiter, getClientIpFromHeaders } from '@/lib/security/rate-limit';
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
  phoneNumber: (phone: string) => phone && phone.trim().length > 0
};

// فحص OTP موجود بتنسيقات مختلفة
async function checkExistingOTP(phoneNumber: string): Promise<any> {
  const formats = [
    phoneNumber,
    phoneNumber.replace('+', ''),
    '+' + phoneNumber.replace('+', ''),
    phoneNumber
  ];

  for (const format of formats) {
    const existingOTP = await getOTP(format);
    if (existingOTP && !existingOTP.expired) {
      console.log('📱 Found existing valid OTP for:', format, 'OTP:', existingOTP.otp);
      return { found: true, otp: existingOTP, format };
    }
  }
  
  return { found: false };
}

// التحقق من Rate Limiting
function checkRateLimit(formattedPhone: string, clientIp: string) {
  // Global rate limit per IP
  const ipCheck = rateLimiter.check(`sms:send:${clientIp}`, { 
    windowMs: 60_000, 
    max: 10, 
    minIntervalMs: 1000 
  });
  
  if (!ipCheck.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        { success: false, error: 'تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ipCheck.retryAfterMs / 1000)) } }
      )
    };
  }

  // Per phone rate limit
  const perPhoneCheck = rateLimiter.check(`sms:phone:${formattedPhone}`, { 
    windowMs: 60_000, 
    max: 3, 
    minIntervalMs: 5_000 
  });
  
  if (!perPhoneCheck.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        { success: false, error: 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار دقيقة واحدة قبل المحاولة مرة أخرى.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(perPhoneCheck.retryAfterMs / 1000)) } }
      )
    };
  }

  return { allowed: true };
}

// إدارة الكاش المحلي
function manageRequestCache(formattedPhone: string) {
  const now = Date.now();
  const cacheKey = formattedPhone;
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

// إرسال OTP
async function sendOTP(formattedPhone: string, name: string) {
  console.log('📱 Attempting to send OTP to:', formattedPhone);
  
  // محاولة API الجديد أولاً
  let smsResult = await beonSMSService.sendOTPNew(formattedPhone, name, 6, 'ar');
  
  // إذا فشل، جرب الطريقة البديلة
  if (!smsResult.success) {
    console.log('📱 New API failed, trying alternative method...');
    const otp = beonSMSService.generateOTP();
    smsResult = await beonSMSService.sendOTPPlain(formattedPhone, otp, name);
  }
  
  return smsResult;
}

// معالجة OTP المرسل
async function handleSentOTP(formattedPhone: string, smsResult: any) {
  if (!smsResult.success) {
    return {
      success: false,
      error: smsResult.error || 'فشل في إرسال رمز التحقق'
    };
  }

  console.log('📱 OTP sent successfully to:', formattedPhone);
  
  if (smsResult.otp) {
    // التحقق من وجود OTP مخزن مسبقاً
    const existingOTP = await getOTP(formattedPhone);
    
    if (existingOTP && !existingOTP.expired) {
      console.log('📱 Found existing OTP, not overwriting:', formattedPhone);
      return {
        success: true,
        message: 'تم إرسال رمز التحقق بنجاح',
        phoneNumber: formattedPhone,
        existingOTP: true,
        otp: existingOTP.otp,
        source: existingOTP.source
      };
    } else {
      await storeOTP(formattedPhone, smsResult.otp, 'sms');
      console.log('💾 SMS OTP stored successfully for verification');
    }
    
    await getOTPStatus();
  }

  return {
    success: true,
    message: 'تم إرسال رمز التحقق بنجاح',
    phoneNumber: formattedPhone,
    otp: smsResult.otp
  };
}

// الدالة الرئيسية لإرسال OTP
export async function POST(request: NextRequest) {
  return safeExecute(async () => {
    const clientIp = getClientIpFromHeaders(request.headers);
    const body = await request.json();
    const { phoneNumber, name, useTemplate = false, templateId = 133 } = body;

    console.log('📱 SMS OTP Request:', { phoneNumber, name, useTemplate, templateId });

    // التحقق من البيانات المطلوبة
    const validation = validateInput(body, validationRules);
    if (!validation.isValid) {
      return NextResponse.json(
        responseHandler.error(validation.error || 'رقم الهاتف مطلوب'),
        { status: 400 }
      );
    }

    // تنسيق رقم الهاتف
    const formattedPhone = beonSMSService.formatPhoneNumber(phoneNumber);
    console.log('📱 Formatted phone:', formattedPhone);
    
    // التحقق من صحة رقم الهاتف
    if (!beonSMSService.validatePhoneNumber(formattedPhone)) {
      return NextResponse.json(
        responseHandler.error('رقم الهاتف غير صحيح'),
        { status: 400 }
      );
    }

    // فحص OTP موجود
    const existingOTPCheck = await checkExistingOTP(formattedPhone);
    if (existingOTPCheck.found) {
      return NextResponse.json(responseHandler.success({
        phoneNumber: formattedPhone,
        existingOTP: true,
        otp: existingOTPCheck.otp.otp
      }, 'تم إرسال رمز التحقق بنجاح'));
    }

    // التحقق من Rate Limiting
    const rateLimitCheck = checkRateLimit(formattedPhone, clientIp);
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response;
    }

    // إدارة الكاش المحلي
    const cacheCheck = manageRequestCache(formattedPhone);
    if (!cacheCheck.allowed) {
      return cacheCheck.response;
    }

    console.log('📱 Rate limit check passed for:', formattedPhone);

    // إرسال OTP
    const smsResult = await sendOTP(formattedPhone, name);
    
    // معالجة النتيجة
    const result = await handleSentOTP(formattedPhone, smsResult);
    
    if (result.success) {
      return NextResponse.json(responseHandler.success(result, result.message));
    } else {
      return NextResponse.json(
        responseHandler.error(result.error),
        { status: 500 }
      );
    }
  }, 'SMS OTP API').then(result => {
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

// التحقق من صحة رقم الهاتف
export async function GET(request: NextRequest) {
  return safeExecute(async () => {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json(
        responseHandler.error('رقم الهاتف مطلوب'),
        { status: 400 }
      );
    }

    const formattedPhone = beonSMSService.formatPhoneNumber(phoneNumber);
    const isValid = beonSMSService.validatePhoneNumber(formattedPhone);

    return NextResponse.json(responseHandler.success({
      isValid,
      formattedPhone: isValid ? formattedPhone : null,
      error: isValid ? null : 'رقم الهاتف غير صحيح'
    }));
  }, 'Phone validation API').then(result => {
    if (result.success) {
      return result.data;
    } else {
      return NextResponse.json(
        responseHandler.error(result.error || 'حدث خطأ في التحقق من رقم الهاتف'),
        { status: 500 }
      );
    }
  });
}