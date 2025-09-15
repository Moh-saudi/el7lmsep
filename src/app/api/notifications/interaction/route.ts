import { NextRequest, NextResponse } from 'next/server';
import { interactionNotificationService } from '@/lib/notifications/interaction-notifications';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: NextRequest) {
  try {
    console.group('📢 [API] استلام طلب إشعار جديد');
    console.log('🕐 وقت الطلب:', new Date().toISOString());
    
    const body = await request.json();
    console.log('📦 بيانات الطلب الكاملة:', body);
    
    const { 
      type, 
      profileOwnerId, 
      viewerId, 
      viewerName, 
      viewerType,
      viewerAccountType,
      searchTerm,
      rank,
      profileType,
      messagePreview,
      videoId,
      commentText
    } = body;

    console.log('🔍 الحقول المستخرجة:', { 
      type, 
      profileOwnerId, 
      viewerId, 
      viewerName,
      viewerType,
      viewerAccountType,
      profileType
    });

    // تحقق من صحة البيانات
    console.log('✅ فحص صحة البيانات:', {
      hasProfileOwnerId: !!profileOwnerId,
      hasViewerId: !!viewerId,
      hasViewerName: !!viewerName,
      hasViewerType: !!viewerType,
      hasViewerAccountType: !!viewerAccountType,
      isValidType: type === 'profile_view'
    });

    let notificationId: string;

    switch (type) {
      case 'profile_view':
        if (!profileOwnerId || !viewerId || !viewerName || !viewerType || !viewerAccountType) {
          console.error('❌ حقول مطلوبة مفقودة:', {
            profileOwnerId: !!profileOwnerId,
            viewerId: !!viewerId,
            viewerName: !!viewerName,
            viewerType: !!viewerType,
            viewerAccountType: !!viewerAccountType
          });
          console.groupEnd();
          return NextResponse.json(
            { error: 'Missing required fields for profile view notification' },
            { status: 400 }
          );
        }
        
        console.log('🚀 استدعاء خدمة الإشعارات...');
        notificationId = await interactionNotificationService.sendProfileViewNotification(
          profileOwnerId,
          viewerId,
          viewerName,
          viewerType,
          viewerAccountType,
          profileType || 'player'
        );
        console.log('✅ تم إنشاء الإشعار بمعرف:', notificationId);
        
        // إرسال SMS إشعار لصاحب الملف
        try {
          console.log('📱 بدء إرسال SMS إشعار...');
          
          // الحصول على رقم هاتف صاحب الملف
          const profileOwnerDoc = await getDoc(doc(db, 'users', profileOwnerId));
          if (profileOwnerDoc.exists()) {
            const profileOwnerData = profileOwnerDoc.data();
            const phoneNumber = profileOwnerData.phone;
            
            if (phoneNumber) {
              console.log('📱 إرسال SMS إلى:', phoneNumber);
              
              // إنشاء رسائل SMS مختلفة حسب نوع الحساب
              const getSMSMessagesByType = (accountType: string) => {
                const baseMessages = {
                  'admin': [
                    `🔥 ${viewerName} من الإدارة يشاهد ملفك! استعد للفرصة!`,
                    `⚡ ${viewerName} من الإدارة مهتم بك! أظهر موهبتك!`,
                    `🚀 ${viewerName} من الإدارة يراقبك! كن جاهزاً!`,
                    `⭐ ${viewerName} من الإدارة يتابعك! استعد للانطلاق!`,
                    `💪 ${viewerName} من الإدارة يبحث عنك! أظهر قوتك!`
                  ],
                  'coach': [
                    `🔥 المدرب ${viewerName} يشاهد ملفك! استعد للفرصة!`,
                    `⚡ المدرب ${viewerName} مهتم بك! أظهر موهبتك!`,
                    `🚀 المدرب ${viewerName} يراقبك! كن جاهزاً!`,
                    `⭐ المدرب ${viewerName} يتابعك! استعد للانطلاق!`,
                    `💪 المدرب ${viewerName} يبحث عنك! أظهر قوتك!`
                  ],
                  'player': [
                    `🔥 اللاعب ${viewerName} يشاهد ملفك! استعد للفرصة!`,
                    `⚡ اللاعب ${viewerName} مهتم بك! أظهر موهبتك!`,
                    `🚀 اللاعب ${viewerName} يراقبك! كن جاهزاً!`,
                    `⭐ اللاعب ${viewerName} يتابعك! استعد للانطلاق!`,
                    `💪 اللاعب ${viewerName} يبحث عنك! أظهر قوتك!`
                  ],
                  'scout': [
                    `🔥 الكشاف ${viewerName} يشاهد ملفك! استعد للفرصة!`,
                    `⚡ الكشاف ${viewerName} مهتم بك! أظهر موهبتك!`,
                    `🚀 الكشاف ${viewerName} يراقبك! كن جاهزاً!`,
                    `⭐ الكشاف ${viewerName} يتابعك! استعد للانطلاق!`,
                    `💪 الكشاف ${viewerName} يبحث عنك! أظهر قوتك!`
                  ],
                  'club': [
                    `🔥 نادي ${viewerName} يشاهد ملفك! استعد للفرصة!`,
                    `⚡ نادي ${viewerName} مهتم بك! أظهر موهبتك!`,
                    `🚀 نادي ${viewerName} يراقبك! كن جاهزاً!`,
                    `⭐ نادي ${viewerName} يتابعك! استعد للانطلاق!`,
                    `💪 نادي ${viewerName} يبحث عنك! أظهر قوتك!`
                  ],
                  'club_detailed': [
                    `🔥 نادي ${viewerName} يشاهد ملفك! استعد للفرصة!`,
                    `⚡ نادي ${viewerName} مهتم بك! أظهر موهبتك!`,
                    `🚀 نادي ${viewerName} يراقبك! كن جاهزاً!`,
                    `⭐ نادي ${viewerName} يتابعك! استعد للانطلاق!`,
                    `💪 نادي ${viewerName} يبحث عنك! أظهر قوتك!`
                  ],
                  'detailed': [
                    `🔥 ${viewerName} يشاهد ملفك! استعد للفرصة!`,
                    `⚡ ${viewerName} مهتم بك! أظهر موهبتك!`,
                    `🚀 ${viewerName} يراقبك! كن جاهزاً!`,
                    `⭐ ${viewerName} يتابعك! استعد للانطلاق!`,
                    `💪 ${viewerName} يبحث عنك! أظهر قوتك!`
                  ]
                };
                
                return baseMessages[accountType] || baseMessages['player'];
              };
              
              const smsMessages = getSMSMessagesByType(viewerAccountType);
              
              const randomSMSMessage = smsMessages[Math.floor(Math.random() * smsMessages.length)];
              
              console.log('📱 نوع الحساب المشاهد:', viewerAccountType);
              console.log('📱 الرسالة المختارة:', randomSMSMessage);
              console.log('📱 طول الرسالة:', randomSMSMessage.length, 'حرف');
              
              // إرسال SMS باستخدام النظام الموجود
              const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/beon/sms`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  singlePhone: phoneNumber,
                  message: randomSMSMessage
                })
              });
              
              if (smsResponse.ok) {
                const smsResult = await smsResponse.json();
                console.log('✅ تم إرسال SMS بنجاح:', smsResult);
              } else {
                console.error('❌ فشل في إرسال SMS:', smsResponse.status);
              }
            } else {
              console.log('⚠️ صاحب الملف ليس لديه رقم هاتف');
            }
          } else {
            console.log('⚠️ لم يتم العثور على بيانات صاحب الملف');
          }
        } catch (smsError) {
          console.error('❌ خطأ في إرسال SMS:', smsError);
        }
        break;

      case 'search_result':
        if (!profileOwnerId || !viewerId || !viewerName || !viewerType || !viewerAccountType || !searchTerm || !rank) {
          return NextResponse.json(
            { error: 'Missing required fields for search result notification' },
            { status: 400 }
          );
        }
        notificationId = await interactionNotificationService.sendSearchResultNotification(
          profileOwnerId,
          viewerId,
          viewerName,
          viewerType,
          viewerAccountType,
          searchTerm,
          rank
        );
        break;

      case 'connection_request':
        if (!profileOwnerId || !viewerId || !viewerName || !viewerType || !viewerAccountType) {
          return NextResponse.json(
            { error: 'Missing required fields for connection request notification' },
            { status: 400 }
          );
        }
        notificationId = await interactionNotificationService.sendConnectionRequestNotification(
          profileOwnerId,
          viewerId,
          viewerName,
          viewerType,
          viewerAccountType
        );
        break;

      case 'message_sent':
        if (!profileOwnerId || !viewerId || !viewerName || !viewerType || !viewerAccountType || !messagePreview) {
          return NextResponse.json(
            { error: 'Missing required fields for message notification' },
            { status: 400 }
          );
        }
        notificationId = await interactionNotificationService.sendMessageNotification(
          profileOwnerId,
          viewerId,
          viewerName,
          viewerType,
          viewerAccountType,
          messagePreview
        );
        break;

      case 'video_like':
        if (!profileOwnerId || !viewerId || !viewerName || !viewerType || !viewerAccountType || !videoId) {
          return NextResponse.json(
            { error: 'Missing required fields for video like notification' },
            { status: 400 }
          );
        }
        notificationId = await interactionNotificationService.sendVideoLikeNotification(
          profileOwnerId,
          viewerId,
          viewerName,
          viewerType,
          viewerAccountType,
          videoId
        );
        break;

      case 'video_comment':
        if (!profileOwnerId || !viewerId || !viewerName || !viewerType || !viewerAccountType || !videoId || !commentText) {
          return NextResponse.json(
            { error: 'Missing required fields for video comment notification' },
            { status: 400 }
          );
        }
        notificationId = await interactionNotificationService.sendVideoCommentNotification(
          profileOwnerId,
          viewerId,
          viewerName,
          viewerType,
          viewerAccountType,
          videoId,
          commentText
        );
        break;

      case 'video_share':
        if (!profileOwnerId || !viewerId || !viewerName || !viewerType || !viewerAccountType || !videoId) {
          return NextResponse.json(
            { error: 'Missing required fields for video share notification' },
            { status: 400 }
          );
        }
        notificationId = await interactionNotificationService.sendVideoShareNotification(
          profileOwnerId,
          viewerId,
          viewerName,
          viewerType,
          viewerAccountType,
          videoId
        );
        break;

      case 'video_view':
        if (!profileOwnerId || !viewerId || !viewerName || !viewerType || !viewerAccountType || !videoId) {
          return NextResponse.json(
            { error: 'Missing required fields for video view notification' },
            { status: 400 }
          );
        }
        notificationId = await interactionNotificationService.sendVideoViewNotification(
          profileOwnerId,
          viewerId,
          viewerName,
          viewerType,
          viewerAccountType,
          videoId
        );
        break;

      default:
        console.error('❌ نوع إشعار غير صالح:', type);
        console.groupEnd();
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    const response = {
      success: true,
      notificationId,
      message: 'Notification sent successfully'
    };
    
    console.log('✅ نجح إرسال الإشعار:', response);
    console.groupEnd();
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ خطأ في API الإشعارات التفاعلية:', error);
    console.groupEnd();
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing notification ID' },
        { status: 400 }
      );
    }

    await interactionNotificationService.markAsRead(notificationId);

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
} 
