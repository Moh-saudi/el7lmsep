import { NextRequest, NextResponse } from 'next/server';
import { BEON_V3_CONFIG, createBeOnHeaders } from '@/lib/beon/config';

export async function GET(request: NextRequest) {
  try {
    console.log('💰 فحص رصيد الحساب...');

    // محاولة endpoints مختلفة لفحص الحساب
    const accountEndpoints = [
      '/api/v3/account',
      '/api/v3/balance',
      '/api/v3/user/account',
      '/api/v3/partner/account',
      '/api/v3/account/balance',
      '/api/v3/account/info'
    ];

    const results = [];

    for (const endpoint of accountEndpoints) {
      try {
        console.log(`💰 اختبار endpoint: ${endpoint}`);
        
        const response = await fetch(`${BEON_V3_CONFIG.BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: createBeOnHeaders(BEON_V3_CONFIG.TOKEN)
        });

        const responseData = await response.text();
        
        results.push({
          endpoint,
          status: response.status,
          success: response.ok,
          response: responseData,
          timestamp: new Date().toISOString()
        });

        console.log(`💰 نتيجة ${endpoint}:`, {
          status: response.status,
          success: response.ok,
          response: responseData.substring(0, 200) + '...'
        });

        // إذا وجدنا endpoint يعمل، نعيد النتيجة فوراً
        if (response.ok) {
          return NextResponse.json({
            success: true,
            message: 'تم العثور على endpoint صحيح للحساب',
            data: {
              workingEndpoint: endpoint,
              accountData: responseData,
              status: response.status,
              timestamp: new Date().toISOString()
            }
          });
        }

      } catch (error) {
        results.push({
          endpoint,
          error: error.message,
          success: false
        });
      }
    }

    // إذا لم نجد أي endpoint يعمل
    return NextResponse.json({
      success: false,
      message: 'لم يتم العثور على endpoint صحيح لفحص الحساب',
      data: {
        testedEndpoints: results,
        recommendations: [
          'تواصل مع دعم BeOn لمعرفة endpoint فحص الحساب الصحيح',
          'تحقق من صلاحيات الحساب',
          'تأكد من صحة التوكن',
          'تحقق من رصيد الحساب من لوحة التحكم'
        ],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ خطأ في فحص رصيد الحساب:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في فحص رصيد الحساب' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    message: 'BeOn V3 Account Balance Check',
    description: 'فحص رصيد الحساب عبر endpoints مختلفة',
    endpoints: {
      GET: 'فحص رصيد الحساب'
    }
  });
}


