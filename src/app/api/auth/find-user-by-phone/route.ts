import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    
    console.log('🔍 Searching for user with phone:', phone);

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف مطلوب' },
        { status: 400 }
      );
    }

    // للاختبار، نعيد بيانات المستخدم الحقيقي
    return NextResponse.json({
      success: true,
      user: {
        id: 'test-user-id',
        email: 'user_20_201017799580_1755026927645_o58h37@el7hm.com',
        phone: phone,
        full_name: 'Test User',
        accountType: 'player',
        collection: 'users'
      },
      message: 'User found successfully (test mode)'
    });

  } catch (error) {
    console.error('❌ Error in find-user-by-phone:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في البحث عن المستخدم' },
      { status: 500 }
    );
  }
}
