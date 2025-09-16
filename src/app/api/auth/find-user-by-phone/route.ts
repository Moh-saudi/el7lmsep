import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { generateTypedFirebaseEmail } from '@/lib/utils/firebase-email-generator';
import { safeExecute, createResponseHandler, validateInput } from '@/lib/utils/complexity-reducer';

// إعدادات البحث
const SEARCH_COLLECTIONS = ['users', 'students', 'coaches', 'academies', 'players', 'clubs', 'agents', 'trainers', 'marketers'];
const ACCOUNT_TYPES = ['player', 'club', 'academy', 'agent', 'trainer', 'marketer', 'admin'];

// معالج الاستجابة
const responseHandler = createResponseHandler();

// قواعد التحقق من البيانات
const validationRules = {
  phone: (phone: string) => phone && phone.trim().length > 0
};

// إنشاء البريد الإلكتروني المحتمل
function generatePossibleEmails(phone: string): string[] {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const countryCode = phone.startsWith('+') ? phone.substring(1, 3) : '20';
  
  return ACCOUNT_TYPES.map(type => 
    generateTypedFirebaseEmail(cleanPhone, `+${countryCode}`, type)
  );
}

// البحث في مجموعة واحدة
async function searchInCollection(collectionName: string, phone: string, possibleEmails: string[]): Promise<any[]> {
  const foundUsers: any[] = [];
  
  try {
    // البحث بالرقم المباشر
    const phoneQuery = query(
      collection(db, collectionName),
      where('phone', '==', phone)
    );
    const phoneSnapshot = await getDocs(phoneQuery);
    
    phoneSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData && !userData['isDeleted']) {
        foundUsers.push({
          id: doc.id,
          collection: collectionName,
          ...userData
        });
      }
    });

    // البحث بالبريد الإلكتروني المحتمل
    for (const email of possibleEmails) {
      const emailQuery = query(
        collection(db, collectionName),
        where('email', '==', email)
      );
      const emailSnapshot = await getDocs(emailQuery);
      
      emailSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData && !userData['isDeleted']) {
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
  
  return foundUsers;
}

// البحث في جميع المجموعات
async function searchAllCollections(phone: string): Promise<any[]> {
  const possibleEmails = generatePossibleEmails(phone);
  const allFoundUsers: any[] = [];
  
  for (const collectionName of SEARCH_COLLECTIONS) {
    const foundUsers = await searchInCollection(collectionName, phone, possibleEmails);
    allFoundUsers.push(...foundUsers);
  }
  
  return allFoundUsers;
}

// تنسيق بيانات المستخدم
function formatUserData(user: any) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    full_name: user.full_name || user.name,
    accountType: user.accountType || user.role,
    collection: user.collection
  };
}

// الدالة الرئيسية
export async function POST(request: NextRequest) {
  return safeExecute(async () => {
    const { phone } = await request.json();
    
    console.log('🔍 Searching for user with phone:', phone);

    // التحقق من البيانات المطلوبة
    const validation = validateInput({ phone }, validationRules);
    if (!validation.isValid) {
      return NextResponse.json(
        responseHandler.error(validation.error || 'رقم الهاتف مطلوب'),
        { status: 400 }
      );
    }

    // البحث في جميع المجموعات
    const foundUsers = await searchAllCollections(phone);

    if (foundUsers.length > 0) {
      // إرجاع أول مستخدم وجد
      const user = foundUsers[0];
      console.log('✅ Found user:', user);
      
      return NextResponse.json(responseHandler.success(
        formatUserData(user),
        'User found successfully'
      ));
    }

    console.log('❌ No user found with phone:', phone);
    return NextResponse.json(
      responseHandler.error('لم يتم العثور على مستخدم بهذا الرقم'),
      { status: 404 }
    );

  }, 'Find User by Phone API').then(result => {
    if (result.success) {
      return result.data;
    } else {
      return NextResponse.json(
        responseHandler.error(result.error || 'حدث خطأ في البحث عن المستخدم'),
        { status: 500 }
      );
    }
  });
}