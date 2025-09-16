import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { generateTypedFirebaseEmail } from '@/lib/utils/firebase-email-generator';

export async function POST(request: NextRequest) {
  try {
    const { userId, collectionName, newEmail } = await request.json();
    
    if (!userId || !collectionName || !newEmail) {
      return NextResponse.json({
        success: false,
        error: 'المعاملات المطلوبة: userId, collectionName, newEmail'
      }, { status: 400 });
    }

    console.log('🔄 Starting email migration:', { userId, collectionName, newEmail });

    // التحقق من وجود المستخدم
    const userRef = doc(db, collectionName, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json({
        success: false,
        error: 'المستخدم غير موجود'
      }, { status: 404 });
    }

    const userData = userDoc.data();
    const currentEmail = userData['email'];

    // التحقق من أن البريد الإلكتروني الجديد مختلف
    if (currentEmail === newEmail) {
      return NextResponse.json({
        success: false,
        error: 'البريد الإلكتروني الجديد مطابق للحالي'
      }, { status: 400 });
    }

    // تحديث البريد الإلكتروني
    await updateDoc(userRef, {
      email: newEmail,
      firebaseEmail: newEmail,
      emailMigratedAt: new Date(),
      previousEmail: currentEmail
    });

    console.log('✅ Email migration completed:', {
      userId,
      oldEmail: currentEmail,
      newEmail
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث البريد الإلكتروني بنجاح',
      data: {
        userId,
        oldEmail: currentEmail,
        newEmail,
        migratedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Email migration error:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء تحديث البريد الإلكتروني'
    }, { status: 500 });
  }
}

// دالة لإنشاء بريد إلكتروني جديد تلقائياً
export async function PUT(request: NextRequest) {
  try {
    const { userId, collectionName, phone, countryCode, accountType } = await request.json();
    
    if (!userId || !collectionName || !phone) {
      return NextResponse.json({
        success: false,
        error: 'المعاملات المطلوبة: userId, collectionName, phone'
      }, { status: 400 });
    }

    // إنشاء بريد إلكتروني جديد
    const newEmail = generateTypedFirebaseEmail(
      phone, 
      countryCode || '+20', 
      accountType || 'user'
    );

    // تحديث البريد الإلكتروني
    const userRef = doc(db, collectionName, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json({
        success: false,
        error: 'المستخدم غير موجود'
      }, { status: 404 });
    }

    const userData = userDoc.data();
    const currentEmail = userData['email'];

    await updateDoc(userRef, {
      email: newEmail,
      firebaseEmail: newEmail,
      emailMigratedAt: new Date(),
      previousEmail: currentEmail
    });

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء وتحديث البريد الإلكتروني بنجاح',
      data: {
        userId,
        oldEmail: currentEmail,
        newEmail,
        migratedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Auto email migration error:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء إنشاء البريد الإلكتروني الجديد'
    }, { status: 500 });
  }
}


