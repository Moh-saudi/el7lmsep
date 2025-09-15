import { NextRequest, NextResponse } from 'next/server';
import { unifiedMessagingService } from '@/lib/beon/unified-messaging-service';

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
    const { phoneNumbers, message, singlePhone, preferredMethod = 'sms' } = await request.json();

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

    console.log('📱 إرسال رسالة موحدة:', { 
      phoneCount: phones.length, 
      messageLength: message.length, 
      preferredMethod 
    });

    const result = await unifiedMessagingService.sendMessage({
      phoneNumbers: phones,
      message,
      preferredMethod: preferredMethod as 'sms' | 'whatsapp'
    });

    if (result.success) {
      // إذا كانت النتيجة تحتوي على روابط WhatsApp، أضف معلومات إضافية
      if (result.data?.method === 'whatsapp_share') {
        console.log('📱 تم إنشاء روابط WhatsApp:', result.data.whatsappLinks);
      }
      
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error, details: result.data },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ خطأ في API الرسائل الموحدة:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إرسال الرسائل' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'BeOn V3 Unified Messaging API',
    description: 'خدمة موحدة لإرسال الرسائل - SMS عبر BeOn V3 و WhatsApp عبر روابط الشير',
    endpoints: {
      POST: 'إرسال رسائل (SMS عبر BeOn V3 أو WhatsApp عبر روابط الشير)',
      parameters: {
        phoneNumbers: 'مصفوفة أرقام الهاتف (للرسائل الجماعية)',
        singlePhone: 'رقم هاتف واحد (لرسالة واحدة)',
        message: 'نص الرسالة',
        preferredMethod: 'الطريقة المفضلة (sms أو whatsapp)'
      }
    },
    methods: {
      sms: 'إرسال SMS عبر BeOn V3 API',
      whatsapp: 'إنشاء روابط WhatsApp للشير (wa.me)'
    },
    note: 'WhatsApp يستخدم روابط الشير بدلاً من API مباشر'
  });
}



