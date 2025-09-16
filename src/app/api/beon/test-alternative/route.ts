import { NextRequest, NextResponse } from 'next/server';
import { BEON_V3_CONFIG, createBeOnHeaders } from '@/lib/beon/config';

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف والرسالة مطلوبان' },
        { status: 400 }
      );
    }

    // تجربة endpoint مختلف
    const alternativeEndpoints = [
      '/api/v3/send/message/sms',
      '/api/v3/messages/sms/send',
      '/api/v3/sms/send',
      '/api/v3/send/sms'
    ];

    const results = [];

    for (const endpoint of alternativeEndpoints) {
      try {
        console.log(`🧪 اختبار endpoint: ${endpoint}`);
        
        const requestBody = {
          phoneNumber: phone,
          message: message,
          sender: BEON_V3_CONFIG.DEFAULTS.SENDER_NAME,
          lang: BEON_V3_CONFIG.DEFAULTS.LANGUAGE
        };

        const response = await fetch(`${BEON_V3_CONFIG.BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: createBeOnHeaders(BEON_V3_CONFIG.TOKEN),
          body: JSON.stringify(requestBody)
        });

        const responseData = await response.text();
        
        results.push({
          endpoint,
          status: response.status,
          statusText: response.statusText,
          response: responseData,
          success: response.ok
        });

        console.log(`🧪 نتيجة ${endpoint}:`, {
          status: response.status,
          success: response.ok,
          response: responseData
        });

      } catch (error) {
        results.push({
          endpoint,
          error: (error as Error).message,
          success: false
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم اختبار جميع الـ endpoints البديلة',
      data: {
        results,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ خطأ في اختبار الـ endpoints البديلة:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في اختبار الـ endpoints البديلة' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'BeOn V3 Alternative Endpoints Test',
    description: 'اختبار endpoints بديلة لـ BeOn V3 API',
    endpoints: {
      POST: 'اختبار endpoints بديلة',
      parameters: {
        phone: 'رقم الهاتف',
        message: 'نص الرسالة'
      }
    }
  });
}


