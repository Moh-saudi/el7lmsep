import { NextRequest, NextResponse } from 'next/server';
import { beonSMSService } from '@/lib/beon';
import { rateLimiter, getClientIpFromHeaders } from '@/lib/security/rate-limit';

// تنسيق رقم الهاتف المصري
const formatEgyptianPhone = (phone: string): string => {
  let cleaned = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('0')) {
    return '+20' + cleaned.substring(1);
  }
  
  if (cleaned.startsWith('20')) {
    return '+' + cleaned;
  }
  
  if (cleaned.startsWith('+20')) {
    return cleaned;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    return '+20' + cleaned.substring(1);
  }
  
  if (cleaned.length === 10 && cleaned.startsWith('1')) {
    return '+20' + cleaned;
  }
  
  return cleaned;
};

// التحقق من صحة رقم الهاتف
const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+20[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// إنشاء OTP
const generateOTP = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// تخزين مؤقت للطلبات لمنع الإرسال المتكرر
const requestCache = new Map<string, { timestamp: number; count: number; lastRequest: number }>();
const CACHE_DURATION = 60000; // دقيقة واحدة
const MAX_REQUESTS_PER_MINUTE = 3;
const MIN_INTERVAL_BETWEEN_REQUESTS = 5000; // 5 ثوانٍ بين الطلبات

export async function POST(request: NextRequest) {
  try {
    // Global rate limit per IP + per phone
    const clientIp = getClientIpFromHeaders(request.headers);
    const ipCheck = rateLimiter.check(`wa:send:${clientIp}`, { windowMs: 60_000, max: 10, minIntervalMs: 1000 });
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ipCheck.retryAfterMs / 1000)) } }
      );
    }
    const body = await request.json();
    const { phoneNumber, name, serviceType = 'business' } = body;

    console.log('📱 WhatsApp OTP Request:', { phoneNumber, name, serviceType });

    // التحقق من البيانات المطلوبة
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف مطلوب' },
        { status: 400 }
      );
    }

    // تنسيق رقم الهاتف
    const formattedPhone = formatEgyptianPhone(phoneNumber);
    
    // التحقق من صحة رقم الهاتف
    if (!validatePhoneNumber(formattedPhone)) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف غير صحيح' },
        { status: 400 }
      );
    }

    // حماية ضد الإرسال المتكرر
    const perPhoneCheck = rateLimiter.check(`wa:phone:${formattedPhone}`, { windowMs: 60_000, max: 3, minIntervalMs: 5_000 });
    if (!perPhoneCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار دقيقة واحدة قبل المحاولة مرة أخرى.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(perPhoneCheck.retryAfterMs / 1000)) } }
      );
    }
    const now = Date.now();
    const cacheKey = formattedPhone;
    const cachedRequest = requestCache.get(cacheKey);
    
    if (cachedRequest) {
      const timeDiff = now - cachedRequest.timestamp;
      const lastRequestDiff = now - cachedRequest.lastRequest;
      
      // التحقق من الفاصل الزمني الأدنى بين الطلبات
      if (lastRequestDiff < MIN_INTERVAL_BETWEEN_REQUESTS) {
        console.log('🛑 Too frequent requests for:', formattedPhone, 'last request was', lastRequestDiff, 'ms ago');
        return NextResponse.json(
          { 
            success: false, 
            error: 'يرجى الانتظار 5 ثوانٍ قبل إرسال طلب جديد' 
          },
          { status: 429 }
        );
      }
      
      // إذا كان الطلب في آخر دقيقة
      if (timeDiff < CACHE_DURATION) {
        if (cachedRequest.count >= MAX_REQUESTS_PER_MINUTE) {
          console.log('🛑 Rate limit exceeded for:', formattedPhone);
          return NextResponse.json(
            { 
              success: false, 
              error: 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار دقيقة واحدة قبل المحاولة مرة أخرى.' 
            },
            { status: 429 }
          );
        }
        
        // زيادة العداد
        cachedRequest.count++;
        cachedRequest.lastRequest = now;
        requestCache.set(cacheKey, cachedRequest);
      } else {
        // إعادة تعيين العداد بعد انتهاء المدة
        requestCache.set(cacheKey, { timestamp: now, count: 1, lastRequest: now });
      }
    } else {
      // أول طلب لهذا الرقم
      requestCache.set(cacheKey, { timestamp: now, count: 1, lastRequest: now });
    }

    // تنظيف الكاش القديم
    for (const [key, value] of requestCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        requestCache.delete(key);
      }
    }

    console.log('📱 Rate limit check passed for:', formattedPhone);

    // إنشاء OTP جديد
    const otp = generateOTP();
    
    // إرسال OTP عبر SMS (BeOn V3 لا يدعم WhatsApp فعلياً)
    const smsResult = await beonSMSService.sendBulkSMS([formattedPhone], `رمز التحقق الخاص بك هو: ${otp}`);

    if (smsResult.success) {
      console.log('📱 SMS OTP sent successfully to:', formattedPhone);
      
      return NextResponse.json({
        success: true,
        message: 'تم إرسال رمز التحقق عبر SMS بنجاح (BeOn V3 لا يدعم WhatsApp فعلياً)',
        phoneNumber: formattedPhone,
        // لا نرسل OTP في الاستجابة لأمان
        otpLength: otp.length
      });
    } else {
      console.error('❌ Failed to send SMS OTP:', smsResult.error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: smsResult.error || 'فشل في إرسال رمز التحقق عبر SMS' 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ WhatsApp API error:', error);
    
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
