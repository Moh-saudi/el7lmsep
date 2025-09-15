import { NextRequest, NextResponse } from 'next/server';
import { beonSMSService } from '@/lib/beon';

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
    const { phoneNumbers, message, singlePhone } = await request.json();

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

    console.log('📱 إرسال SMS:', { phoneCount: phones.length, messageLength: message.length });

    const result = await beonSMSService.sendBulkSMS(phones, message);

    if (result.success) {
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
    console.error('❌ خطأ في API SMS:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إرسال الرسائل النصية' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'BeOn V3 SMS API',
    endpoints: {
      POST: 'إرسال رسائل SMS',
      parameters: {
        phoneNumbers: 'مصفوفة أرقام الهاتف (للرسائل الجماعية)',
        singlePhone: 'رقم هاتف واحد (لرسالة واحدة)',
        message: 'نص الرسالة'
      }
    }
  });
}

















