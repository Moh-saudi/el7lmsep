import { NextRequest, NextResponse } from 'next/server';
import { BEON_V3_CONFIG, createBeOnHeaders } from '@/lib/beon/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || BEON_V3_CONFIG.TOKEN;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'توكن API مطلوب' },
        { status: 400 }
      );
    }

    console.log('🔍 التحقق من حساب BeOn V3:', { token: token.substring(0, 10) + '...' });

    const response = await fetch(`${BEON_V3_CONFIG.BASE_URL}${BEON_V3_CONFIG.ENDPOINTS.ACCOUNT_DETAILS}`, {
      method: 'GET',
      headers: createBeOnHeaders(token)
    });

    console.log('🔍 استجابة حساب BeOn V3:', {
      status: response.status,
      statusText: response.statusText
    });

    if (response.ok) {
      const accountData = await response.json();
      
      console.log('🔍 بيانات الحساب:', accountData);
      
      return NextResponse.json({
        success: true,
        message: 'تم جلب بيانات الحساب بنجاح',
        data: {
          account: accountData,
          status: response.status,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      const errorData = await response.text();
      console.error('❌ خطأ في حساب BeOn V3:', errorData);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `فشل في جلب بيانات الحساب: ${response.status} ${response.statusText}`,
          code: `HTTP_${response.status}`,
          data: errorData
        },
        { status: response.status }
      );
    }

  } catch (error) {
    console.error('❌ خطأ في API حساب BeOn V3:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب بيانات الحساب' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    message: 'BeOn V3 Account API',
    endpoints: {
      GET: 'جلب بيانات الحساب',
      parameters: {
        token: 'توكن API (اختياري)'
      }
    }
  });
}