import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// GET - جلب بطولة محددة
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = params.id;
    
    if (!tournamentId) {
      return NextResponse.json(
        { success: false, error: 'معرف البطولة مطلوب' },
        { status: 400 }
      );
    }

    const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));
    
    if (!tournamentDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'البطولة غير موجودة' },
        { status: 404 }
      );
    }

    const tournament = {
      id: tournamentDoc.id,
      ...tournamentDoc.data()
    };

    return NextResponse.json({
      success: true,
      tournament
    });

  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب البطولة' },
      { status: 500 }
    );
  }
}

// PUT - تحديث بطولة
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = params.id;
    const updateData = await request.json();
    
    if (!tournamentId) {
      return NextResponse.json(
        { success: false, error: 'معرف البطولة مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من وجود البطولة
    const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));
    
    if (!tournamentDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'البطولة غير موجودة' },
        { status: 404 }
      );
    }

    // إضافة timestamp للتحديث
    const updatedData = {
      ...updateData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'tournaments', tournamentId), updatedData);

    return NextResponse.json({
      success: true,
      message: 'تم تحديث البطولة بنجاح'
    });

  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث البطولة' },
      { status: 500 }
    );
  }
}

// DELETE - حذف بطولة
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = params.id;
    
    if (!tournamentId) {
      return NextResponse.json(
        { success: false, error: 'معرف البطولة مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من وجود البطولة
    const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));
    
    if (!tournamentDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'البطولة غير موجودة' },
        { status: 404 }
      );
    }

    // حذف البطولة
    await deleteDoc(doc(db, 'tournaments', tournamentId));

    return NextResponse.json({
      success: true,
      message: 'تم حذف البطولة بنجاح'
    });

  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حذف البطولة' },
      { status: 500 }
    );
  }
}
