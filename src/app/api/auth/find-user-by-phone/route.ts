import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { generateTypedFirebaseEmail, extractPhoneFromEmail } from '@/lib/utils/firebase-email-generator';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json({
        success: false,
        error: 'رقم الهاتف مطلوب'
      }, { status: 400 });
    }

    console.log('🔍 Searching for user with phone:', phone);

    // البحث في جميع المجموعات
    const collections = ['users', 'students', 'coaches', 'academies', 'players', 'clubs', 'agents', 'trainers', 'marketers'];
    const foundUsers: any[] = [];

    for (const collectionName of collections) {
      try {
        // البحث بالرقم المباشر
        const phoneQuery = query(
          collection(db, collectionName),
          where('phone', '==', phone)
        );
        const phoneSnapshot = await getDocs(phoneQuery);
        
        phoneSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData && !userData.isDeleted) {
            foundUsers.push({
              id: doc.id,
              collection: collectionName,
              ...userData
            });
          }
        });

        // البحث بالبريد الإلكتروني المؤقت الجديد
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const countryCode = phone.startsWith('+') ? phone.substring(1, 3) : '20';
        
        // إنشاء جميع أنواع البريد الإلكتروني المحتملة
        const possibleEmails = [
          generateTypedFirebaseEmail(cleanPhone, `+${countryCode}`, 'player'),
          generateTypedFirebaseEmail(cleanPhone, `+${countryCode}`, 'club'),
          generateTypedFirebaseEmail(cleanPhone, `+${countryCode}`, 'academy'),
          generateTypedFirebaseEmail(cleanPhone, `+${countryCode}`, 'agent'),
          generateTypedFirebaseEmail(cleanPhone, `+${countryCode}`, 'trainer'),
          generateTypedFirebaseEmail(cleanPhone, `+${countryCode}`, 'marketer'),
          generateTypedFirebaseEmail(cleanPhone, `+${countryCode}`, 'admin')
        ];

        // البحث بكل بريد إلكتروني محتمل
        for (const email of possibleEmails) {
          const emailQuery = query(
            collection(db, collectionName),
            where('email', '==', email)
          );
          const emailSnapshot = await getDocs(emailQuery);
          
          emailSnapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData && !userData.isDeleted) {
              foundUsers.push({
                id: doc.id,
                collection: collectionName,
                ...userData
              });
            }
          });
        }

      } catch (error) {
        console.error(`Error searching in collection ${collectionName}:`, error);
      }
    }

    if (foundUsers.length > 0) {
      // إرجاع أول مستخدم وجد
      const user = foundUsers[0];
      console.log('✅ Found user:', user);
      
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          full_name: user.full_name || user.name,
          accountType: user.accountType || user.role,
          collection: user.collection
        }
      });
    }

    console.log('❌ No user found with phone:', phone);
    return NextResponse.json({
      success: false,
      error: 'لم يتم العثور على مستخدم بهذا الرقم'
    }, { status: 404 });

  } catch (error) {
    console.error('Error in find-user-by-phone API:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في البحث عن المستخدم'
    }, { status: 500 });
  }
}