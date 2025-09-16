import { NextRequest, NextResponse } from 'next/server';
import { interactionNotificationService } from '@/lib/notifications/interaction-notifications';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { safeExecute, createResponseHandler, validateInput } from '@/lib/utils/complexity-reducer';

// معالج الاستجابة
const responseHandler = createResponseHandler();

// قواعد التحقق من البيانات
const validationRules = {
  type: (type: any) => type && typeof type === 'string',
  profileOwnerId: (id: any) => id && typeof id === 'string',
  viewerId: (id: any) => id && typeof id === 'string',
  viewerName: (name: any) => name && typeof name === 'string',
  viewerType: (type: any) => type && typeof type === 'string',
  viewerAccountType: (type: any) => type && typeof type === 'string'
};

// رسائل SMS حسب نوع الحساب
const SMS_MESSAGES_BY_TYPE = {
  'admin': [
    '🔥 {viewerName} من الإدارة يشاهد ملفك! استعد للفرصة!',
    '⚡ {viewerName} من الإدارة مهتم بك! أظهر موهبتك!',
    '🚀 {viewerName} من الإدارة يراقبك! كن جاهزاً!',
    '⭐ {viewerName} من الإدارة يتابعك! استعد للانطلاق!',
    '💪 {viewerName} من الإدارة يبحث عنك! أظهر قوتك!'
  ],
  'coach': [
    '🔥 المدرب {viewerName} يشاهد ملفك! استعد للفرصة!',
    '⚡ المدرب {viewerName} مهتم بك! أظهر موهبتك!',
    '🚀 المدرب {viewerName} يراقبك! كن جاهزاً!',
    '⭐ المدرب {viewerName} يتابعك! استعد للانطلاق!',
    '💪 المدرب {viewerName} يبحث عنك! أظهر قوتك!'
  ],
  'player': [
    '🔥 اللاعب {viewerName} يشاهد ملفك! استعد للفرصة!',
    '⚡ اللاعب {viewerName} مهتم بك! أظهر موهبتك!',
    '🚀 اللاعب {viewerName} يراقبك! كن جاهزاً!',
    '⭐ اللاعب {viewerName} يتابعك! استعد للانطلاق!',
    '💪 اللاعب {viewerName} يبحث عنك! أظهر قوتك!'
  ],
  'scout': [
    '🔥 الكشاف {viewerName} يشاهد ملفك! استعد للفرصة!',
    '⚡ الكشاف {viewerName} مهتم بك! أظهر موهبتك!',
    '🚀 الكشاف {viewerName} يراقبك! كن جاهزاً!',
    '⭐ الكشاف {viewerName} يتابعك! استعد للانطلاق!',
    '💪 الكشاف {viewerName} يبحث عنك! أظهر قوتك!'
  ],
  'club': [
    '🔥 نادي {viewerName} يشاهد ملفك! استعد للفرصة!',
    '⚡ نادي {viewerName} مهتم بك! أظهر موهبتك!',
    '🚀 نادي {viewerName} يراقبك! كن جاهزاً!',
    '⭐ نادي {viewerName} يتابعك! استعد للانطلاق!',
    '💪 نادي {viewerName} يبحث عنك! أظهر قوتك!'
  ],
  'club_detailed': [
    '🔥 نادي {viewerName} يشاهد ملفك! استعد للفرصة!',
    '⚡ نادي {viewerName} مهتم بك! أظهر موهبتك!',
    '🚀 نادي {viewerName} يراقبك! كن جاهزاً!',
    '⭐ نادي {viewerName} يتابعك! استعد للانطلاق!',
    '💪 نادي {viewerName} يبحث عنك! أظهر قوتك!'
  ],
  'detailed': [
    '🔥 {viewerName} يشاهد ملفك! استعد للفرصة!',
    '⚡ {viewerName} مهتم بك! أظهر موهبتك!',
    '🚀 {viewerName} يراقبك! كن جاهزاً!',
    '⭐ {viewerName} يتابعك! استعد للانطلاق!',
    '💪 {viewerName} يبحث عنك! أظهر قوتك!'
  ]
};

// الحصول على رسائل SMS حسب نوع الحساب
function getSMSMessagesByType(accountType: string): string[] {
  return SMS_MESSAGES_BY_TYPE[accountType as keyof typeof SMS_MESSAGES_BY_TYPE] || SMS_MESSAGES_BY_TYPE['player'];
}

// اختيار رسالة SMS عشوائية
function selectRandomSMSMessage(messages: string[], viewerName: string): string {
  if (messages.length === 0) return 'رسالة افتراضية';
  const randomIndex = Math.floor(Math.random() * messages.length);
  return (messages[randomIndex] || 'رسالة افتراضية').replace('{viewerName}', viewerName);
}

// الحصول على رقم هاتف صاحب الملف
async function getProfileOwnerPhone(profileOwnerId: string): Promise<string | null> {
  try {
    const profileOwnerDoc = await getDoc(doc(db, 'users', profileOwnerId));
    if (profileOwnerDoc.exists()) {
      const profileOwnerData = profileOwnerDoc.data();
      return profileOwnerData['phone'] || null;
    }
    return null;
  } catch (error) {
    console.error('❌ خطأ في الحصول على رقم الهاتف:', error);
    return null;
  }
}

// إرسال SMS إشعار
async function sendSMSNotification(phoneNumber: string, viewerName: string, viewerAccountType: string) {
  try {
    console.log('📱 إرسال SMS إلى:', phoneNumber);
    
    const smsMessages = getSMSMessagesByType(viewerAccountType);
    const selectedMessage = selectRandomSMSMessage(smsMessages, viewerName);
    
    console.log('📱 الرسالة المختارة:', selectedMessage);
    
    // إرسال SMS
    const smsResponse = await fetch('/api/sms/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
        message: selectedMessage,
        useTemplate: false
      })
    });
    
    if (smsResponse.ok) {
      console.log('✅ تم إرسال SMS بنجاح');
    } else {
      console.error('❌ فشل في إرسال SMS:', await smsResponse.text());
    }
  } catch (error) {
    console.error('❌ خطأ في إرسال SMS:', error);
  }
}

// معالجة إشعار مشاهدة الملف
async function handleProfileViewNotification(body: any) {
  const { profileOwnerId, viewerId, viewerName, viewerType, viewerAccountType, profileType } = body;
  
  console.log('🚀 استدعاء خدمة الإشعارات...');
  const notificationId = await interactionNotificationService.sendProfileViewNotification(
    profileOwnerId,
    viewerId,
    viewerName,
    viewerType,
    viewerAccountType,
    profileType || 'player'
  );
  console.log('✅ تم إنشاء الإشعار بمعرف:', notificationId);
  
  // إرسال SMS إشعار
  const phoneNumber = await getProfileOwnerPhone(profileOwnerId);
  if (phoneNumber) {
    await sendSMSNotification(phoneNumber, viewerName, viewerAccountType);
  }
  
  return notificationId;
}

// معالجة إشعار تفاعل الفيديو
async function handleVideoInteractionNotification(body: any) {
  const { profileOwnerId, viewerId, viewerName, viewerType, videoId, commentText } = body;
  
  const notificationId = await interactionNotificationService.sendVideoInteraction(
    profileOwnerId,
    viewerId,
    viewerName,
    viewerType,
    videoId,
    commentText
  );
  
  return notificationId;
}

// معالجة إشعار نتائج البحث
async function handleSearchResultNotification(body: any) {
  const { profileOwnerId, viewerId, viewerName, viewerType, searchTerm, rank } = body;
  
  const notificationId = await interactionNotificationService.sendSearchResultNotification(
    profileOwnerId,
    viewerId,
    viewerName,
    viewerType,
    searchTerm,
    rank
  );
  
  return notificationId;
}

// معالجة إشعار طلب الاتصال
async function handleConnectionRequestNotification(body: any) {
  const { profileOwnerId, viewerId, viewerName, viewerType } = body;
  
  const notificationId = await interactionNotificationService.sendConnectionRequestNotification(
    profileOwnerId,
    viewerId,
    viewerName,
    viewerType
  );
  
  return notificationId;
}

// معالجة إشعار الرسالة
async function handleMessageNotification(body: any) {
  const { profileOwnerId, viewerId, viewerName, viewerType, messagePreview } = body;
  
  const notificationId = await interactionNotificationService.sendMessageNotification(
    profileOwnerId,
    viewerId,
    viewerName,
    viewerType,
    messagePreview
  );
  
  return notificationId;
}

// معالجة الإشعارات حسب النوع
async function processNotificationByType(type: string, body: any): Promise<string> {
  switch (type) {
    case 'profile_view':
      return await handleProfileViewNotification(body);
    case 'video_interaction':
      return await handleVideoInteractionNotification(body);
    case 'search_result':
      return await handleSearchResultNotification(body);
    case 'connection_request':
      return await handleConnectionRequestNotification(body);
    case 'message':
      return await handleMessageNotification(body);
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}

// الدالة الرئيسية
export async function POST(request: NextRequest) {
  return safeExecute(async () => {
    console.group('📢 [API] استلام طلب إشعار جديد');
    console.log('🕐 وقت الطلب:', new Date().toISOString());
    
    const body = await request.json();
    console.log('📦 بيانات الطلب الكاملة:', body);
    
    const { type, profileOwnerId, viewerId, viewerName, viewerType, viewerAccountType } = body;

    console.log('🔍 الحقول المستخرجة:', { 
      type, 
      profileOwnerId, 
      viewerId, 
      viewerName,
      viewerType,
      viewerAccountType
    });

    // التحقق من صحة البيانات
    const validation = validateInput(body, validationRules);
    if (!validation.isValid) {
      console.error('❌ حقول مطلوبة مفقودة:', validation.error);
      console.groupEnd();
      return NextResponse.json(
        responseHandler.error(validation.error || 'Missing required fields'),
        { status: 400 }
      );
    }

    console.log('✅ فحص صحة البيانات:', {
      hasProfileOwnerId: !!profileOwnerId,
      hasViewerId: !!viewerId,
      hasViewerName: !!viewerName,
      hasViewerType: !!viewerType,
      hasViewerAccountType: !!viewerAccountType,
      isValidType: type === 'profile_view'
    });

    // معالجة الإشعار حسب النوع
    const notificationId = await processNotificationByType(type, body);
    
    console.log('✅ تم إنشاء الإشعار بنجاح:', notificationId);
    console.groupEnd();
    
    return NextResponse.json(responseHandler.success({
      notificationId,
      type,
      success: true
    }, 'Notification created successfully'));

  }, 'Interaction Notification API').then(result => {
    if (result.success) {
      return result.data;
    } else {
      console.groupEnd();
      return NextResponse.json(
        responseHandler.error(result.error || 'خطأ في إنشاء الإشعار'),
        { status: 500 }
      );
    }
  });
}