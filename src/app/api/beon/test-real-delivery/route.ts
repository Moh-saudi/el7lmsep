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

    console.log('📱 اختبار إرسال حقيقي:', { phone, messageLength: message.length });

    // اختبار تنسيقات مختلفة للطلب
    const requestFormats = [
      // التنسيق الحالي
      {
        name: 'التنسيق الحالي',
        body: {
          phoneNumbers: [phone],
          message: message,
          sender: BEON_V3_CONFIG.DEFAULTS.SENDER_NAME,
          lang: BEON_V3_CONFIG.DEFAULTS.LANGUAGE
        }
      },
      // تنسيق بدون sender
      {
        name: 'بدون sender',
        body: {
          phoneNumbers: [phone],
          message: message,
          lang: BEON_V3_CONFIG.DEFAULTS.LANGUAGE
        }
      },
      // تنسيق بدون lang
      {
        name: 'بدون lang',
        body: {
          phoneNumbers: [phone],
          message: message,
          sender: BEON_V3_CONFIG.DEFAULTS.SENDER_NAME
        }
      },
      // تنسيق مبسط
      {
        name: 'تنسيق مبسط',
        body: {
          phoneNumbers: [phone],
          message: message
        }
      },
      // تنسيق مع phoneNumber بدلاً من phoneNumbers
      {
        name: 'phoneNumber بدلاً من phoneNumbers',
        body: {
          phoneNumber: phone,
          message: message,
          sender: BEON_V3_CONFIG.DEFAULTS.SENDER_NAME,
          lang: BEON_V3_CONFIG.DEFAULTS.LANGUAGE
        }
      },
      // تنسيق مع text بدلاً من message
      {
        name: 'text بدلاً من message',
        body: {
          phoneNumbers: [phone],
          text: message,
          sender: BEON_V3_CONFIG.DEFAULTS.SENDER_NAME,
          lang: BEON_V3_CONFIG.DEFAULTS.LANGUAGE
        }
      }
    ];

    const results = [];

    for (const format of requestFormats) {
      try {
        console.log(`📱 اختبار تنسيق: ${format.name}`);
        
        const response = await fetch(`${BEON_V3_CONFIG.BASE_URL}${BEON_V3_CONFIG.ENDPOINTS.SMS_BULK}`, {
          method: 'POST',
          headers: createBeOnHeaders(BEON_V3_CONFIG.TOKEN),
          body: JSON.stringify(format.body)
        });

        const responseData = await response.text();
        
        results.push({
          format: format.name,
          requestBody: format.body,
          status: response.status,
          success: response.ok,
          response: responseData,
          timestamp: new Date().toISOString()
        });

        console.log(`📱 نتيجة ${format.name}:`, {
          status: response.status,
          success: response.ok,
          response: responseData
        });

      } catch (error) {
        results.push({
          format: format.name,
          requestBody: format.body,
          error: error.message,
          success: false
        });
      }
    }

    // تحليل النتائج
    const successfulFormats = results.filter(r => r.success);
    const differentResponses = results.filter(r => r.success && r.response !== '{"status":200,"message":"massage send"}');

    return NextResponse.json({
      success: true,
      message: 'تم اختبار تنسيقات مختلفة للطلب',
      data: {
        results,
        analysis: {
          totalFormats: results.length,
          successfulFormats: successfulFormats.length,
          differentResponses: differentResponses.length,
          allResponsesSame: differentResponses.length === 0
        },
        recommendations: [
          successfulFormats.length > 0 ? 'التنسيق الحالي يعمل' : 'تحقق من تنسيق الطلب',
          differentResponses.length > 0 ? 'وجدنا استجابات مختلفة' : 'جميع الاستجابات متشابهة',
          'تحقق من رصيد الحساب',
          'تواصل مع دعم BeOn لمعرفة سبب عدم وصول الرسائل'
        ],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ خطأ في اختبار الإرسال الحقيقي:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في اختبار الإرسال الحقيقي' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'BeOn V3 Real Delivery Test',
    description: 'اختبار إرسال حقيقي بتنسيقات مختلفة',
    endpoints: {
      POST: 'اختبار إرسال حقيقي',
      parameters: {
        phone: 'رقم الهاتف',
        message: 'نص الرسالة'
      }
    }
  });
}


