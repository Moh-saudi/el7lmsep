import { NextRequest, NextResponse } from 'next/server';
import { beonWhatsAppService } from '@/lib/beon';

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

export async function POST(request: NextRequest) {
  try {
    const { phoneNumbers, message, singlePhone, useFallback = true } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'الرسالة مطلوبة' },
        { status: 400 }
      );
    }

    let phones: string[] = [];

    if (singlePhone) {
      // إرسال رسالة واحدة
      if (!singlePhone) {
        return NextResponse.json(
          { success: false, error: 'رقم الهاتف مطلوب' },
          { status: 400 }
        );
      }
      phones = [formatEgyptianPhone(singlePhone)];
    } else if (phoneNumbers && Array.isArray(phoneNumbers)) {
      // إرسال رسائل جماعية
      phones = phoneNumbers.map(formatEgyptianPhone);
    } else {
      return NextResponse.json(
        { success: false, error: 'أرقام الهاتف مطلوبة' },
        { status: 400 }
      );
    }

    console.log('📱 إرسال WhatsApp:', { phoneCount: phones.length, messageLength: message.length, useFallback });

    let result;

    if (useFallback && phones.length === 1) {
      // استخدام fallback للرسائل الفردية
      result = await beonWhatsAppService.sendWhatsAppWithFallback(phones[0]!, message);
    } else {
      // إرسال جماعي عادي
      result = await beonWhatsAppService.sendBulkWhatsApp(phones, message);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data,
        method: result.method || 'whatsapp',
        fallback: result.fallback || false
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error, details: result.data },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ خطأ في API WhatsApp:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إرسال رسائل WhatsApp' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'BeOn V3 WhatsApp API',
    warning: '⚠️ BeOn V3 لا يدعم WhatsApp فعلياً - جميع الرسائل يتم إرسالها كـ SMS',
    endpoints: {
      POST: 'إرسال رسائل (كـ SMS)',
      parameters: {
        phoneNumbers: 'مصفوفة أرقام الهاتف (للرسائل الجماعية)',
        singlePhone: 'رقم هاتف واحد (لرسالة واحدة)',
        message: 'نص الرسالة',
        useFallback: 'استخدام SMS كبديل عند فشل WhatsApp (افتراضي: true)'
      }
    },
    note: 'جميع طلبات WhatsApp يتم إرسالها كـ SMS حسب الوثائق الرسمية لـ BeOn V3'
  });
}
