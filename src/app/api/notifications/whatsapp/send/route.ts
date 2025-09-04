import { NextRequest, NextResponse } from 'next/server';
import { BEON_CONFIG, getBeOnToken, getBeOnEndpoint, createBeOnHeaders } from '@/lib/beon/config';

// تنسيق رقم الهاتف المصري
const formatEgyptianPhone = (phone: string): string => {
  // إزالة جميع المسافات والرموز
  let cleaned = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  // إذا كان الرقم يبدأ بـ 0 (مصري محلي)
  if (cleaned.startsWith('0')) {
    return '+20' + cleaned.substring(1);
  }
  
  // إذا كان الرقم يبدأ بـ 20 (مصري بدون +)
  if (cleaned.startsWith('20')) {
    return '+' + cleaned;
  }
  
  // إذا كان الرقم يبدأ بـ +20 (مصري صحيح)
  if (cleaned.startsWith('+20')) {
    return cleaned;
  }
  
  // إذا كان الرقم 11 رقم (مصري بدون رمز الدولة)
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    return '+20' + cleaned.substring(1);
  }
  
  // إذا كان الرقم 10 أرقام (مصري بدون 0)
  if (cleaned.length === 10 && cleaned.startsWith('1')) {
    return '+20' + cleaned;
  }
  
  // إذا لم يكن مصري، نعيده كما هو
  return cleaned;
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('📱 === بدء طلب WhatsApp ===');
    console.log('🕐 وقت البداية:', new Date().toISOString());
    
    const { phoneNumber, message, type = 'notification' } = await request.json();

    console.log('📱 البيانات المستلمة:', { phoneNumber, messageLength: message?.length, type });

    if (!phoneNumber || !message) {
      console.error('❌ بيانات مفقودة:', { hasPhone: !!phoneNumber, hasMessage: !!message });
      return NextResponse.json(
        { error: 'رقم الهاتف والرسالة مطلوبان' },
        { status: 400 }
      );
    }

    // تنسيق رقم الهاتف
    const formattedPhoneNumber = formatEgyptianPhone(phoneNumber);
    console.log('📱 تنسيق رقم الهاتف:', { original: phoneNumber, formatted: formattedPhoneNumber });

    // في وضع التطوير، نعرض رسالة محاكاة بدلاً من الإرسال الفعلي
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_WHATSAPP_SIMULATION === 'true') {
      console.log('🔧 وضع التطوير - محاكاة WhatsApp');
      console.log('📱 سيتم إرسال WhatsApp إلى:', formattedPhoneNumber);
      console.log('📱 الرسالة:', message);
      
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const responseTime = Date.now() - startTime;
      console.log('✅ محاكاة WhatsApp ناجحة');
      console.log('⏱️ وقت الاستجابة:', responseTime + 'ms');
      console.log('📱 === انتهاء طلب WhatsApp ===');
      
      return NextResponse.json({
        success: true,
        message: 'تم إرسال الإشعار عبر WhatsApp بنجاح (محاكاة)',
        method: 'whatsapp',
        simulated: true,
        originalPhone: phoneNumber,
        formattedPhone: formattedPhoneNumber,
        responseTime
      });
    }

    // الحصول على Token من متغيرات البيئة
    const BEON_TOKEN = getBeOnToken('whatsapp');
    const WHATSAPP_ENDPOINT = getBeOnEndpoint('whatsapp');
    const SENDER_NAME = BEON_CONFIG.DEFAULTS.SENDER_NAME;

    console.log('🔧 تكوين WhatsApp:', {
      token: BEON_TOKEN.substring(0, 10) + '...',
      endpoint: WHATSAPP_ENDPOINT,
      senderName: SENDER_NAME
    });

    console.log('📱 إرسال WhatsApp إلى:', formattedPhoneNumber);
    console.log('📱 الرسالة:', message);
    console.log('⚠️ ملاحظة: BeOn لا يدعم WhatsApp فعلياً - سيتم الإرسال كـ SMS');
    
    // إرسال عبر WhatsApp باستخدام API الصحيح
    const apiStartTime = Date.now();
    const response = await fetch(`${BEON_CONFIG.ENDPOINTS.BASE_URL}${WHATSAPP_ENDPOINT}`, {
      method: 'POST',
      headers: createBeOnHeaders(BEON_TOKEN),
      body: JSON.stringify({
        phoneNumbers: [formattedPhoneNumber], // ✅ مصفوفة أرقام الهاتف
        message: message // ✅ الرسالة
      })
    });

    const apiResponseTime = Date.now() - apiStartTime;
    const totalResponseTime = Date.now() - startTime;

    console.log('📱 استجابة API WhatsApp:', {
      status: response.status,
      statusText: response.statusText,
      apiResponseTime: apiResponseTime + 'ms',
      totalResponseTime: totalResponseTime + 'ms'
    });
    console.log('📱 Headers الاستجابة:', Object.fromEntries(response.headers.entries()));
    
    // قراءة جسم الاستجابة من المزود
    let responseBodyText = '';
    try {
      responseBodyText = await response.text();
      if (responseBodyText) {
        console.log('📄 WhatsApp Provider body:', responseBodyText);
      } else {
        console.log('📄 WhatsApp Provider body: <empty>');
      }
    } catch (e) {
      console.log('⚠️ تعذر قراءة جسم الاستجابة من المزود');
    }

    let providerJson: any = null;
    if (responseBodyText) {
      try {
        providerJson = JSON.parse(responseBodyText);
      } catch {
        // ليس JSON — نتجاهل
      }
    }

    const providerErrorText = (responseBodyText || '').toLowerCase();
    const providerStatus = providerJson?.status ?? providerJson?.code;
    const isProviderError = (
      providerStatus === 400 || providerStatus === '400' ||
      providerErrorText.includes('public sender error') ||
      providerErrorText.includes("you can't use this api while you use public sender")
    );
    
    if (response.ok && !isProviderError) {
      console.log('✅ WhatsApp تم إرساله بنجاح إلى:', phoneNumber);
      console.log('📱 === انتهاء طلب WhatsApp ===');
      
      return NextResponse.json({
        success: true,
        message: 'تم إرسال الإشعار عبر WhatsApp بنجاح',
        method: 'whatsapp',
        originalPhone: phoneNumber,
        formattedPhone: formattedPhoneNumber,
        providerStatus,
        providerBody: providerJson || responseBodyText || null,
        responseTime: totalResponseTime
      });
    } else {
      const errorPayload = {
        status: response.status,
        statusText: response.statusText,
        providerStatus,
        providerBody: providerJson || responseBodyText || null,
        phoneNumber: formattedPhoneNumber
      };
      console.error('❌ فشل إرسال WhatsApp (مزود):', errorPayload);
      console.log('📱 === انتهاء طلب WhatsApp ===');
      
      return NextResponse.json(
        { error: providerJson?.message || `فشل في إرسال الإشعار عبر WhatsApp: ${response.status} ${response.statusText}`, details: errorPayload },
        { status: 502 }
      );
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ خطأ في WhatsApp:', error);
    console.log('📱 === انتهاء طلب WhatsApp ===');
    
    return NextResponse.json(
      { error: 'حدث خطأ في إرسال الإشعار عبر WhatsApp' },
      { status: 500 }
    );
  }
}
