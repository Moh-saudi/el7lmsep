import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// GET - جلب تسجيل محدد
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const registrationId = params.id;
    
    if (!registrationId) {
      return NextResponse.json(
        { success: false, error: 'معرف التسجيل مطلوب' },
        { status: 400 }
      );
    }

    const registrationDoc = await getDoc(doc(db, 'tournament_registrations', registrationId));
    
    if (!registrationDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'التسجيل غير موجود' },
        { status: 404 }
      );
    }

    const registration = {
      id: registrationDoc.id,
      ...registrationDoc.data()
    };

    return NextResponse.json({
      success: true,
      registration
    });

  } catch (error) {
    console.error('Error fetching tournament registration:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب التسجيل' },
      { status: 500 }
    );
  }
}

// PUT - تحديث تسجيل
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const registrationId = params.id;
    const updateData = await request.json();
    
    if (!registrationId) {
      return NextResponse.json(
        { success: false, error: 'معرف التسجيل مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من وجود التسجيل
    const registrationDoc = await getDoc(doc(db, 'tournament_registrations', registrationId));
    
    if (!registrationDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'التسجيل غير موجود' },
        { status: 404 }
      );
    }

    // إضافة timestamp للتحديث
    const updatedData = {
      ...updateData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'tournament_registrations', registrationId), updatedData);

    return NextResponse.json({
      success: true,
      message: 'تم تحديث التسجيل بنجاح'
    });

  } catch (error) {
    console.error('Error updating tournament registration:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث التسجيل' },
      { status: 500 }
    );
  }
}

// DELETE - حذف تسجيل
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const registrationId = params.id;
    
    if (!registrationId) {
      return NextResponse.json(
        { success: false, error: 'معرف التسجيل مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من وجود التسجيل
    const registrationDoc = await getDoc(doc(db, 'tournament_registrations', registrationId));
    
    if (!registrationDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'التسجيل غير موجود' },
        { status: 404 }
      );
    }

    const registration = registrationDoc.data();

    // حذف التسجيل
    await deleteDoc(doc(db, 'tournament_registrations', registrationId));

    // تحديث عدد المشاركين في البطولة
    const tournamentDoc = await getDoc(doc(db, 'tournaments', registration['tournamentId']));
    
    if (tournamentDoc.exists()) {
      const tournament = tournamentDoc.data();
      await updateDoc(doc(db, 'tournaments', registration['tournamentId']), {
        currentParticipants: Math.max(0, tournament['currentParticipants'] - 1),
        updatedAt: serverTimestamp()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف التسجيل بنجاح'
    });

  } catch (error) {
    console.error('Error deleting tournament registration:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حذف التسجيل' },
      { status: 500 }
    );
  }
}
