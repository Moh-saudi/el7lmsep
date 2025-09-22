import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    console.log('🔐 Password update request for email:', email);

    // التحقق من البيانات المطلوبة
    if (!email || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني وكلمة المرور الجديدة مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من طول كلمة المرور
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // تغيير كلمة المرور باستخدام Firebase Admin SDK
    try {
      const admin = await initializeFirebaseAdmin();
      if (!admin) {
        throw new Error('Failed to initialize Firebase Admin');
      }
      
      const auth = getAuth(admin);
      
      // البحث عن المستخدم بالبريد الإلكتروني
      const userRecord = await auth.getUserByEmail(email);
      
      // تحديث كلمة المرور
      await auth.updateUser(userRecord.uid, {
        password: newPassword
      });
      
      console.log('✅ Password updated successfully for user:', email);
      
      return NextResponse.json({
        success: true,
        message: 'تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
        user: {
          email: email,
          uid: userRecord.uid
        }
      });
      
    } catch (adminError: any) {
      console.error('❌ Firebase Admin error:', adminError);
      
      // إذا فشل تغيير كلمة المرور، نعرض رسالة خطأ
      return NextResponse.json({
        success: false,
        error: 'فشل في تغيير كلمة المرور. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.',
        details: adminError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Password update API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في الخادم',
        details: error.message
      },
      { status: 500 }
    );
  }
}






