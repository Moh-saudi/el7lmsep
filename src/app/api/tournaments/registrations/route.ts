import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { TournamentRegistration } from '@/types/tournament';

// GET - جلب تسجيلات البطولات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');
    const playerId = searchParams.get('playerId');
    const status = searchParams.get('status') || 'all';

    let registrationsQuery = query(
      collection(db, 'tournament_registrations'),
      orderBy('registrationDate', 'desc')
    );

    // تطبيق الفلاتر
    if (tournamentId) {
      registrationsQuery = query(registrationsQuery, where('tournamentId', '==', tournamentId));
    }

    if (playerId) {
      registrationsQuery = query(registrationsQuery, where('playerId', '==', playerId));
    }

    if (status !== 'all') {
      registrationsQuery = query(registrationsQuery, where('paymentStatus', '==', status));
    }

    const querySnapshot = await getDocs(registrationsQuery);
    const registrations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TournamentRegistration[];

    return NextResponse.json({
      success: true,
      registrations,
      total: registrations.length
    });

  } catch (error) {
    console.error('Error fetching tournament registrations:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب تسجيلات البطولات' },
      { status: 500 }
    );
  }
}

// POST - تسجيل في بطولة
export async function POST(request: NextRequest) {
  try {
    const registrationData = await request.json();

    // التحقق من البيانات المطلوبة
    const requiredFields = ['tournamentId', 'playerId', 'playerName', 'playerEmail', 'playerPhone', 'playerAge', 'playerPosition'];
    const missingFields = requiredFields.filter(field => !registrationData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `الحقول المطلوبة مفقودة: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // التحقق من وجود البطولة
    const tournamentDoc = await getDoc(doc(db, 'tournaments', registrationData.tournamentId));
    
    if (!tournamentDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'البطولة غير موجودة' },
        { status: 404 }
      );
    }

    const tournament = tournamentDoc.data();

    // التحقق من إمكانية التسجيل
    if (!tournament['isActive']) {
      return NextResponse.json(
        { success: false, error: 'البطولة غير نشطة' },
        { status: 400 }
      );
    }

    if (tournament['currentParticipants'] >= tournament['maxParticipants']) {
      return NextResponse.json(
        { success: false, error: 'البطولة ممتلئة' },
        { status: 400 }
      );
    }

    const registrationDeadline = new Date(tournament['registrationDeadline']);
    const now = new Date();
    
    if (registrationDeadline < now) {
      return NextResponse.json(
        { success: false, error: 'انتهت فترة التسجيل' },
        { status: 400 }
      );
    }

    // التحقق من عدم التسجيل مسبقاً
    const existingRegistrationQuery = query(
      collection(db, 'tournament_registrations'),
      where('tournamentId', '==', registrationData['tournamentId']),
      where('playerId', '==', registrationData['playerId'])
    );

    const existingRegistrations = await getDocs(existingRegistrationQuery);
    
    if (!existingRegistrations.empty) {
      return NextResponse.json(
        { success: false, error: 'أنت مسجل بالفعل في هذه البطولة' },
        { status: 400 }
      );
    }

    // إنشاء التسجيل
    const newRegistration = {
      ...registrationData,
      registrationDate: serverTimestamp(),
      paymentStatus: tournament['isPaid'] ? 'pending' : 'free',
      paymentAmount: tournament['isPaid'] ? tournament['entryFee'] : 0
    };

    const docRef = await addDoc(collection(db, 'tournament_registrations'), newRegistration);

    // تحديث عدد المشاركين في البطولة
    await updateDoc(doc(db, 'tournaments', registrationData['tournamentId']), {
      currentParticipants: tournament['currentParticipants'] + 1,
      updatedAt: serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      message: 'تم التسجيل في البطولة بنجاح',
      registrationId: docRef.id
    });

  } catch (error) {
    console.error('Error registering for tournament:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في التسجيل في البطولة' },
      { status: 500 }
    );
  }
}
