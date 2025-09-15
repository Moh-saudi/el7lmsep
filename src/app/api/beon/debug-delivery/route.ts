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

    console.log('🔍 بدء التشخيص العميق للرسالة:', { phone, messageLength: message.length });

    const results = {
      phoneFormats: [],
      accountCheck: null,
      endpointTests: [],
      deliveryStatus: null,
      recommendations: []
    };

    // 1. اختبار تنسيقات مختلفة لرقم الهاتف
    const phoneFormats = [
      phone, // التنسيق الأصلي
      phone.startsWith('0') ? '+20' + phone.substring(1) : phone, // إضافة +20
      phone.startsWith('+20') ? phone : '+20' + phone, // التأكد من +20
      phone.replace(/\s+/g, ''), // إزالة المسافات
      phone.replace(/[^\d+]/g, ''), // إزالة الأحرف غير الرقمية
      '201017799580', // بدون +
      '01017799580', // بدون +20
      '+201017799580' // التنسيق الكامل
    ];

    console.log('📱 اختبار تنسيقات الهاتف:', phoneFormats);

    for (const format of phoneFormats) {
      try {
        const testBody = {
          phoneNumbers: [format],
          message: `اختبار تنسيق: ${format}`,
          sender: BEON_V3_CONFIG.DEFAULTS.SENDER_NAME,
          lang: BEON_V3_CONFIG.DEFAULTS.LANGUAGE
        };

        const response = await fetch(`${BEON_V3_CONFIG.BASE_URL}${BEON_V3_CONFIG.ENDPOINTS.SMS_BULK}`, {
          method: 'POST',
          headers: createBeOnHeaders(BEON_V3_CONFIG.TOKEN),
          body: JSON.stringify(testBody)
        });

        const responseData = await response.text();
        
        results.phoneFormats.push({
          format,
          status: response.status,
          success: response.ok,
          response: responseData,
          timestamp: new Date().toISOString()
        });

        console.log(`📱 تنسيق ${format}:`, {
          status: response.status,
          success: response.ok,
          response: responseData
        });

      } catch (error) {
        results.phoneFormats.push({
          format,
          error: error.message,
          success: false
        });
      }
    }

    // 2. فحص الحساب
    try {
      console.log('🔍 فحص الحساب...');
      const accountResponse = await fetch(`${BEON_V3_CONFIG.BASE_URL}${BEON_V3_CONFIG.ENDPOINTS.ACCOUNT_DETAILS}`, {
        method: 'GET',
        headers: createBeOnHeaders(BEON_V3_CONFIG.TOKEN)
      });

      const accountData = await accountResponse.text();
      results.accountCheck = {
        status: accountResponse.status,
        success: accountResponse.ok,
        data: accountData,
        timestamp: new Date().toISOString()
      };

      console.log('🔍 نتيجة فحص الحساب:', {
        status: accountResponse.status,
        success: accountResponse.ok,
        data: accountData
      });

    } catch (error) {
      results.accountCheck = {
        error: error.message,
        success: false
      };
    }

    // 3. اختبار endpoints مختلفة
    const endpoints = [
      '/api/v3/messages/sms/bulk',
      '/api/v3/send/message/sms',
      '/api/v3/messages/sms/send',
      '/api/v3/sms/send',
      '/api/v3/send/sms',
      '/api/v3/sms/bulk'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🧪 اختبار endpoint: ${endpoint}`);
        
        const testBody = {
          phoneNumbers: ['+201017799580'],
          message: `اختبار endpoint: ${endpoint}`,
          sender: BEON_V3_CONFIG.DEFAULTS.SENDER_NAME,
          lang: BEON_V3_CONFIG.DEFAULTS.LANGUAGE
        };

        const response = await fetch(`${BEON_V3_CONFIG.BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: createBeOnHeaders(BEON_V3_CONFIG.TOKEN),
          body: JSON.stringify(testBody)
        });

        const responseData = await response.text();
        
        results.endpointTests.push({
          endpoint,
          status: response.status,
          success: response.ok,
          response: responseData,
          timestamp: new Date().toISOString()
        });

        console.log(`🧪 نتيجة ${endpoint}:`, {
          status: response.status,
          success: response.ok,
          response: responseData
        });

      } catch (error) {
        results.endpointTests.push({
          endpoint,
          error: error.message,
          success: false
        });
      }
    }

    // 4. تحليل النتائج وإعطاء توصيات
    const successfulFormats = results.phoneFormats.filter(r => r.success);
    const successfulEndpoints = results.endpointTests.filter(r => r.success);
    
    if (successfulFormats.length > 0) {
      results.recommendations.push(`استخدم تنسيق الهاتف: ${successfulFormats[0].format}`);
    }
    
    if (successfulEndpoints.length > 0) {
      results.recommendations.push(`استخدم endpoint: ${successfulEndpoints[0].endpoint}`);
    }

    if (results.accountCheck && results.accountCheck.success) {
      results.recommendations.push('الحساب يعمل بشكل صحيح');
    } else {
      results.recommendations.push('تحقق من حالة الحساب مع دعم BeOn');
    }

    // 5. توصيات إضافية
    results.recommendations.push('تحقق من رصيد الحساب');
    results.recommendations.push('تأكد من أن رقم الهاتف نشط');
    results.recommendations.push('تحقق من إعدادات الشبكة');
    results.recommendations.push('تواصل مع دعم BeOn إذا استمرت المشكلة');

    console.log('🎯 التوصيات:', results.recommendations);

    return NextResponse.json({
      success: true,
      message: 'تم التشخيص العميق بنجاح',
      data: {
        ...results,
        summary: {
          totalPhoneFormats: results.phoneFormats.length,
          successfulFormats: successfulFormats.length,
          totalEndpoints: results.endpointTests.length,
          successfulEndpoints: successfulEndpoints.length,
          accountWorking: results.accountCheck?.success || false
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ خطأ في التشخيص العميق:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في التشخيص العميق' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'BeOn V3 Deep Delivery Diagnosis',
    description: 'تشخيص عميق لمشكلة عدم وصول الرسائل',
    endpoints: {
      POST: 'تشخيص عميق للرسائل',
      parameters: {
        phone: 'رقم الهاتف',
        message: 'نص الرسالة'
      }
    }
  });
}


