import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Tournament } from '@/types/tournament';

// GET - جلب البطولات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    let tournamentsQuery = query(
      collection(db, 'tournaments'),
      orderBy('startDate', 'asc')
    );

    // تطبيق الفلاتر
    if (status === 'active') {
      tournamentsQuery = query(tournamentsQuery, where('isActive', '==', true));
    } else if (status === 'upcoming') {
      const now = new Date();
      tournamentsQuery = query(
        tournamentsQuery,
        where('startDate', '>', now.toISOString()),
        where('isActive', '==', true)
      );
    }

    const querySnapshot = await getDocs(tournamentsQuery);
    let tournaments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Tournament[];

    // فلترة إضافية حسب الفئة
    if (category !== 'all') {
      tournaments = tournaments.filter(tournament => 
        tournament.categories?.includes(category)
      );
    }

    // تحديد الحد الأقصى
    tournaments = tournaments.slice(0, limit);

    return NextResponse.json({
      success: true,
      tournaments,
      total: tournaments.length
    });

  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب البطولات' },
      { status: 500 }
    );
  }
}

// POST - إنشاء بطولة جديدة
export async function POST(request: NextRequest) {
  try {
    const tournamentData = await request.json();

    // التحقق من البيانات المطلوبة
    const requiredFields = ['name', 'description', 'location', 'startDate', 'endDate', 'registrationDeadline', 'maxParticipants', 'entryFee'];
    const missingFields = requiredFields.filter(field => !tournamentData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `الحقول المطلوبة مفقودة: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // إضافة البيانات الافتراضية
    const newTournament = {
      ...tournamentData,
      currentParticipants: 0,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'tournaments'), newTournament);

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء البطولة بنجاح',
      tournamentId: docRef.id
    });

  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء البطولة' },
      { status: 500 }
    );
  }
}
