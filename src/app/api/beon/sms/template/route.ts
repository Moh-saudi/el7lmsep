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
    const { template_id, phoneNumber, name, vars } = await request.json();

    if (!template_id || !phoneNumber || !name) {
      return NextResponse.json(
        { success: false, error: 'معرف القالب ورقم الهاتف والاسم مطلوبون' },
        { status: 400 }
      );
    }

    const formattedPhone = formatEgyptianPhone(phoneNumber);
    const templateVars = vars || [];

    console.log('📱 إرسال SMS بالقالب:', { 
      template_id, 
      phoneNumber: formattedPhone, 
      name, 
      vars: templateVars 
    });

    const result = await beonSMSService.sendTemplateSMS(
      template_id, 
      formattedPhone, 
      name, 
      templateVars
    );

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
    console.error('❌ خطأ في API SMS Template:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إرسال الرسالة النصية بالقالب' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'BeOn V3 SMS Template API',
    endpoints: {
      POST: 'إرسال رسالة SMS باستخدام قالب',
      parameters: {
        template_id: 'معرف القالب (رقم)',
        phoneNumber: 'رقم الهاتف',
        name: 'اسم المستلم',
        vars: 'مصفوفة المتغيرات (اختياري)'
      }
    }
  });
}

















