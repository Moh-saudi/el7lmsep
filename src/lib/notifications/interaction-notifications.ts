import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface InteractionNotification {
  id?: string;
  userId: string; // صاحب الملف الشخصي
  viewerId: string; // المشاهد
  viewerName: string;
  viewerType: string;
  viewerAccountType: string;
  type: 'profile_view' | 'search_result' | 'connection_request' | 'message_sent' | 'follow' | 'video_like' | 'video_comment' | 'video_share' | 'video_view';
  title: string;
  message: string;
  emoji: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: {
    viewCount?: number;
    searchTerm?: string;
    searchRank?: number;
    profileType?: string;
    interactionTime?: number;
    videoId?: string;
    commentText?: string;
  };
  createdAt: any;
  expiresAt?: any;
}

class InteractionNotificationService {
  // ذاكرة تخزين مؤقت للتحقق من الإشعارات الحديثة
  private recentNotificationsCache = new Map<string, { timestamp: number; notificationId: string }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق
  // إرسال إشعار مشاهدة الملف الشخصي
  async sendProfileViewNotification(
    profileOwnerId: string,
    viewerId: string,
    viewerName: string,
    viewerType: string,
    viewerAccountType: string,
    profileType: string = 'player'
  ): Promise<string> {
    try {
      console.log('📢 بدء إرسال إشعار مشاهدة الملف الشخصي:', {
        profileOwnerId,
        viewerId,
        viewerName,
        viewerType,
        viewerAccountType,
        profileType
      });
      
      // التحقق من عدم إرسال إشعار لنفس الشخص
      if (profileOwnerId === viewerId) {
        console.log('⚠️ تخطي الإشعار - نفس الشخص');
        return '';
      }

      // التحقق من عدم إرسال إشعار مكرر في آخر 5 دقائق
      const recentNotification = await this.checkRecentNotification(
        profileOwnerId,
        viewerId,
        'profile_view',
        5 * 60 * 1000 // 5 دقائق
      );

      if (recentNotification) {
        return recentNotification;
      }

      const messages = [
        {
          title: 'شخص مهتم بك! 👀',
          message: `${this.getAccountTypeLabel(viewerAccountType)} يطلع عليك! أمامك خطوة للاحتراف 🚀`,
          emoji: '👀'
        },
        {
          title: 'مشاهدة جديدة! ⭐',
          message: `${this.getAccountTypeLabel(viewerAccountType)} اكتشف موهبتك! تميزك واضح ⭐`,
          emoji: '⭐'
        },
        {
          title: 'فرصة ذهبية! 🔥',
          message: `${this.getAccountTypeLabel(viewerAccountType)} يتابعك! خطوة للاحتراف 🏆`,
          emoji: '🔥'
        },
        {
          title: 'انتباه احترافي! ✨',
          message: `${this.getAccountTypeLabel(viewerAccountType)} معجب بك! النجاح قريب ✨`,
          emoji: '✨'
        },
        {
          title: 'اهتمام متزايد! 🏆',
          message: `${this.getAccountTypeLabel(viewerAccountType)} شاهد ملفك! خطوة للقمة 🚀`,
          emoji: '🏆'
        }
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      const notification: Omit<InteractionNotification, 'id' | 'createdAt'> = {
        userId: profileOwnerId,
        viewerId,
        viewerName,
        viewerType,
        viewerAccountType,
        type: 'profile_view',
        title: randomMessage.title,
        message: randomMessage.message,
        emoji: randomMessage.emoji,
        isRead: false,
        priority: 'medium',
        actionUrl: `/dashboard/${profileType}/profile`,
        metadata: {
          profileType,
          interactionTime: Date.now()
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 يوم
      };

      console.log('📢 إضافة الإشعار إلى قاعدة البيانات...');
      
      const docRef = await addDoc(collection(db, 'interaction_notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });

      console.log('✅ تم إرسال إشعار مشاهدة الملف الشخصي:', {
        profileOwnerId,
        viewerId,
        viewerName,
        notificationId: docRef.id
      });

      // تحديث الذاكرة المؤقتة
      this.updateCache(profileOwnerId, viewerId, 'profile_view', docRef.id);

      return docRef.id;
    } catch (error) {
      console.error('❌ خطأ في إرسال إشعار مشاهدة الملف الشخصي:', error);
      throw error;
    }
  }

  private async sendVideoInteraction(
    type: 'video_like' | 'video_comment' | 'video_share' | 'video_view',
    videoOwnerId: string,
    actorId: string,
    actorName: string,
    actorType: string,
    actorAccountType: string,
    videoId: string,
    commentText?: string
  ): Promise<string> {
    const titles: Record<string, string> = {
      video_like: 'إعجاب جديد على فيديوك ❤️',
      video_comment: 'تعليق جديد على فيديوك 💬',
      video_share: 'تمت مشاركة فيديوك 🔗',
      video_view: 'شخص شاهد فيديوك 👀',
    };

    const messages: Record<string, string> = {
      video_like: `${actorName} (${this.getAccountTypeLabel(actorAccountType)}) أعجب بفيديوك`,
      video_comment: `${actorName} (${this.getAccountTypeLabel(actorAccountType)}) علّق: "${(commentText || '').substring(0, 50)}"`,
      video_share: `${actorName} (${this.getAccountTypeLabel(actorAccountType)}) شارك فيديوك`,
      video_view: `${actorName} (${this.getAccountTypeLabel(actorAccountType)}) شاهد فيديوك`,
    };

    const notification: Omit<InteractionNotification, 'id' | 'createdAt'> = {
      userId: videoOwnerId,
      viewerId: actorId,
      viewerName: actorName,
      viewerType: actorType,
      viewerAccountType: actorAccountType,
      type,
      title: titles[type],
      message: messages[type],
      emoji: type === 'video_like' ? '❤️' : type === 'video_comment' ? '💬' : type === 'video_share' ? '🔗' : '👀',
      isRead: false,
      priority: type === 'video_comment' ? 'high' : 'medium',
      actionUrl: `/dashboard/shared/videos`,
      metadata: {
        videoId,
        commentText,
        interactionTime: Date.now(),
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    const docRef = await addDoc(collection(db, 'interaction_notifications'), {
      ...notification,
      createdAt: serverTimestamp(),
    });

    // تحديث الذاكرة المؤقتة
    this.updateCache(videoOwnerId, actorId, type, docRef.id);

    return docRef.id;
  }

  async sendVideoLikeNotification(
    videoOwnerId: string,
    actorId: string,
    actorName: string,
    actorType: string,
    actorAccountType: string,
    videoId: string,
  ): Promise<string> {
    return this.sendVideoInteraction('video_like', videoOwnerId, actorId, actorName, actorType, actorAccountType, videoId);
  }

  async sendVideoCommentNotification(
    videoOwnerId: string,
    actorId: string,
    actorName: string,
    actorType: string,
    actorAccountType: string,
    videoId: string,
    commentText: string,
  ): Promise<string> {
    return this.sendVideoInteraction('video_comment', videoOwnerId, actorId, actorName, actorType, actorAccountType, videoId, commentText);
  }

  async sendVideoShareNotification(
    videoOwnerId: string,
    actorId: string,
    actorName: string,
    actorType: string,
    actorAccountType: string,
    videoId: string,
  ): Promise<string> {
    return this.sendVideoInteraction('video_share', videoOwnerId, actorId, actorName, actorType, actorAccountType, videoId);
  }

  async sendVideoViewNotification(
    videoOwnerId: string,
    actorId: string,
    actorName: string,
    actorType: string,
    actorAccountType: string,
    videoId: string,
  ): Promise<string> {
    return this.sendVideoInteraction('video_view', videoOwnerId, actorId, actorName, actorType, actorAccountType, videoId);
  }
  // إرسال إشعار نتيجة البحث
  async sendSearchResultNotification(
    profileOwnerId: string,
    viewerId: string,
    viewerName: string,
    viewerType: string,
    viewerAccountType: string,
    searchTerm: string,
    rank: number
  ): Promise<string> {
    try {
      // التحقق من عدم إرسال إشعار مكرر في آخر 10 دقائق
      const recentNotification = await this.checkRecentNotification(
        profileOwnerId,
        viewerId,
        'search_result',
        10 * 60 * 1000 // 10 دقائق
      );

      if (recentNotification) {
        return recentNotification;
      }

      const messages = [
        {
          title: 'تم العثور عليك! 🔍',
          message: `شخص يبحث عن '${searchTerm}' وجدك في المرتبة ${rank}! تميزك يجعلك فريداً! ⭐`,
          emoji: '🔍'
        },
        {
          title: 'نتيجة بحث مميزة! 🎯',
          message: `أنت في المرتبة ${rank} لبحث '${searchTerm}'. مهاراتك تتحدث عن نفسها! 🏆`,
          emoji: '🎯'
        },
        {
          title: 'اكتشاف جديد! 💎',
          message: `${viewerName} يبحث عن '${searchTerm}' ووجدك! قيمتك الحقيقية تتجلى للجميع! ✨`,
          emoji: '💎'
        },
        {
          title: 'تميز في البحث! 🌟',
          message: `أنت من أفضل النتائج لبحث '${searchTerm}'. احترافيتك واضحة للجميع! 🚀`,
          emoji: '🌟'
        }
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      const notification: Omit<InteractionNotification, 'id' | 'createdAt'> = {
        userId: profileOwnerId,
        viewerId,
        viewerName,
        viewerType,
        viewerAccountType,
        type: 'search_result',
        title: randomMessage.title,
        message: randomMessage.message,
        emoji: randomMessage.emoji,
        isRead: false,
        priority: 'high',
        actionUrl: `/dashboard/player/search`,
        metadata: {
          searchTerm,
          searchRank: rank,
          interactionTime: Date.now()
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 يوم
      };

      const docRef = await addDoc(collection(db, 'interaction_notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });

      console.log('✅ تم إرسال إشعار نتيجة البحث:', {
        profileOwnerId,
        viewerId,
        searchTerm,
        rank,
        notificationId: docRef.id
      });

      // تحديث الذاكرة المؤقتة
      this.updateCache(profileOwnerId, viewerId, 'search_result', docRef.id);

      return docRef.id;
    } catch (error) {
      console.error('❌ خطأ في إرسال إشعار نتيجة البحث:', error);
      throw error;
    }
  }

  // إرسال إشعار طلب تواصل
  async sendConnectionRequestNotification(
    targetUserId: string,
    requesterId: string,
    requesterName: string,
    requesterType: string,
    requesterAccountType: string
  ): Promise<string> {
    try {
      const messages = [
        {
          title: 'طلب تواصل جديد! 🤝',
          message: `${requesterName} من ${this.getAccountTypeLabel(requesterAccountType)} يريد التواصل معك. فرصة ذهبية للتعاون! 🚀`,
          emoji: '🤝'
        },
        {
          title: 'اهتمام احترافي! 💼',
          message: `${requesterName} يبحث عن التعاون معك. احترافيتك تجذب الانتباه! ⭐`,
          emoji: '💼'
        },
        {
          title: 'فرصة جديدة! 🌟',
          message: `${requesterName} يريد التواصل معك. سرعة تقدمك مذهلة! 💎`,
          emoji: '🌟'
        }
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      const notification: Omit<InteractionNotification, 'id' | 'createdAt'> = {
        userId: targetUserId,
        viewerId: requesterId,
        viewerName: requesterName,
        viewerType: requesterType,
        viewerAccountType: requesterAccountType,
        type: 'connection_request',
        title: randomMessage.title,
        message: randomMessage.message,
        emoji: randomMessage.emoji,
        isRead: false,
        priority: 'high',
        actionUrl: `/dashboard/messages`,
        metadata: {
          interactionTime: Date.now()
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 يوم
      };

      const docRef = await addDoc(collection(db, 'interaction_notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });

      console.log('✅ تم إرسال إشعار طلب تواصل:', {
        targetUserId,
        requesterId,
        requesterName,
        notificationId: docRef.id
      });

      // تحديث الذاكرة المؤقتة
      this.updateCache(targetUserId, requesterId, 'connection_request', docRef.id);

      return docRef.id;
    } catch (error) {
      console.error('❌ خطأ في إرسال إشعار طلب تواصل:', error);
      throw error;
    }
  }

  // إرسال إشعار رسالة جديدة
  async sendMessageNotification(
    receiverId: string,
    senderId: string,
    senderName: string,
    senderType: string,
    senderAccountType: string,
    messagePreview: string
  ): Promise<string> {
    try {
      const messages = [
        {
          title: 'رسالة جديدة! 💬',
          message: `${senderName} من ${this.getAccountTypeLabel(senderAccountType)} أرسل لك رسالة: "${messagePreview.substring(0, 30)}..."`,
          emoji: '💬'
        },
        {
          title: 'تواصل جديد! 📱',
          message: `رسالة من ${senderName}: "${messagePreview.substring(0, 30)}..."`,
          emoji: '📱'
        },
        {
          title: 'اهتمام مباشر! ⭐',
          message: `${senderName} يتواصل معك مباشرة. فرصة للتعاون! 🚀`,
          emoji: '⭐'
        }
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      const notification: Omit<InteractionNotification, 'id' | 'createdAt'> = {
        userId: receiverId,
        viewerId: senderId,
        viewerName: senderName,
        viewerType: senderType,
        viewerAccountType: senderAccountType,
        type: 'message_sent',
        title: randomMessage.title,
        message: randomMessage.message,
        emoji: randomMessage.emoji,
        isRead: false,
        priority: 'high',
        actionUrl: `/dashboard/messages`,
        metadata: {
          messagePreview,
          interactionTime: Date.now()
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 يوم
      };

      const docRef = await addDoc(collection(db, 'interaction_notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });

      console.log('✅ تم إرسال إشعار رسالة جديدة:', {
        receiverId,
        senderId,
        senderName,
        notificationId: docRef.id
      });

      // تحديث الذاكرة المؤقتة
      this.updateCache(receiverId, senderId, 'message_sent', docRef.id);

      return docRef.id;
    } catch (error) {
      console.error('❌ خطأ في إرسال إشعار رسالة جديدة:', error);
      throw error;
    }
  }

  // إنشاء مفتاح فريد للتحقق من الإشعارات المكررة
  private createNotificationKey(userId: string, viewerId: string, type: string): string {
    return `${userId}_${viewerId}_${type}`;
  }

  // التحقق من الذاكرة المؤقتة أولاً
  private checkCacheForRecentNotification(
    userId: string,
    viewerId: string,
    type: string,
    timeWindow: number
  ): string | null {
    const key = this.createNotificationKey(userId, viewerId, type);
    const cached = this.recentNotificationsCache.get(key);
    
    if (cached && (Date.now() - cached.timestamp) < timeWindow) {
      console.log('📋 تم العثور على إشعار حديث في الذاكرة المؤقتة:', {
        notificationId: cached.notificationId,
        timeDiff: Date.now() - cached.timestamp
      });
      return cached.notificationId;
    }
    
    return null;
  }

  // تحديث الذاكرة المؤقتة
  private updateCache(userId: string, viewerId: string, type: string, notificationId: string): void {
    const key = this.createNotificationKey(userId, viewerId, type);
    this.recentNotificationsCache.set(key, {
      timestamp: Date.now(),
      notificationId
    });
    
    // تنظيف الذاكرة المؤقتة من العناصر القديمة
    this.cleanupCache();
  }

  // تنظيف الذاكرة المؤقتة
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.recentNotificationsCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.recentNotificationsCache.delete(key);
      }
    }
  }

  // التحقق من الإشعارات الحديثة لتجنب التكرار
  private async checkRecentNotification(
    userId: string,
    viewerId: string,
    type: string,
    timeWindow: number
  ): Promise<string | null> {
    try {
      console.log('🔍 فحص الإشعارات الحديثة:', {
        userId,
        viewerId,
        type,
        timeWindow: `${timeWindow / 1000 / 60} دقيقة`
      });

      // التحقق من الذاكرة المؤقتة أولاً
      const cachedResult = this.checkCacheForRecentNotification(userId, viewerId, type, timeWindow);
      if (cachedResult) {
        return cachedResult;
      }

      // حساب الوقت المحدد للبحث
      const cutoffTime = new Date(Date.now() - timeWindow);
      
      // إنشاء استعلام للبحث عن الإشعارات الحديثة
      const notificationsRef = collection(db, 'interaction_notifications');
      const recentQuery = query(
        notificationsRef,
        where('userId', '==', userId),
        where('viewerId', '==', viewerId),
        where('type', '==', type),
        where('createdAt', '>=', Timestamp.fromDate(cutoffTime)),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(recentQuery);
      
      if (!querySnapshot.empty) {
        const recentNotification = querySnapshot.docs[0];
        const notificationId = recentNotification.id;
        
        console.log('⚠️ تم العثور على إشعار حديث في قاعدة البيانات:', {
          notificationId,
          createdAt: recentNotification.data().createdAt,
          timeDiff: Date.now() - recentNotification.data().createdAt.toMillis()
        });
        
        // تحديث الذاكرة المؤقتة
        this.updateCache(userId, viewerId, type, notificationId);
        
        // إرجاع معرف الإشعار الموجود بدلاً من إنشاء إشعار جديد
        return notificationId;
      }

      console.log('✅ لا توجد إشعارات حديثة - يمكن إرسال إشعار جديد');
      return null;
    } catch (error) {
      console.error('❌ خطأ في التحقق من الإشعارات الحديثة:', error);
      
      // في حالة حدوث خطأ، نسمح بإرسال الإشعار لتجنب فقدان الإشعارات المهمة
      console.warn('⚠️ السماح بإرسال الإشعار رغم وجود خطأ في الفحص');
      return null;
    }
  }

  // الحصول على تسمية نوع الحساب
  private getAccountTypeLabel(accountType: string): string {
    const labels: Record<string, string> = {
      'club': 'نادي',
      'academy': 'أكاديمية',
      'agent': 'وكيل',
      'trainer': 'مدرب',
      'player': 'لاعب',
      'admin': 'مشرف',
      'marketer': 'مسوق'
    };

    return labels[accountType] || accountType;
  }

  // تحديث حالة قراءة الإشعار
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'interaction_notifications', notificationId), {
        isRead: true
      });
      console.log('✅ تم تحديث حالة قراءة الإشعار:', notificationId);
    } catch (error) {
      console.error('❌ خطأ في تحديث حالة قراءة الإشعار:', error);
      throw error;
    }
  }

  // حذف الإشعارات منتهية الصلاحية
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      console.log('🧹 بدء تنظيف الإشعارات منتهية الصلاحية...');
      
      const now = new Date();
      const notificationsRef = collection(db, 'interaction_notifications');
      const expiredQuery = query(
        notificationsRef,
        where('expiresAt', '<=', now),
        limit(100) // معالجة 100 إشعار في كل مرة لتجنب timeout
      );

      const querySnapshot = await getDocs(expiredQuery);
      
      if (!querySnapshot.empty) {
        const batch = [];
        querySnapshot.docs.forEach((doc) => {
          batch.push(doc.ref);
        });

        // حذف الإشعارات منتهية الصلاحية
        for (const docRef of batch) {
          await docRef.delete();
        }

        console.log(`✅ تم حذف ${batch.length} إشعار منتهي الصلاحية`);
      } else {
        console.log('✅ لا توجد إشعارات منتهية الصلاحية');
      }
    } catch (error) {
      console.error('❌ خطأ في تنظيف الإشعارات منتهية الصلاحية:', error);
    }
  }

  // إحصائيات الذاكرة المؤقتة
  getCacheStats(): { size: number; entries: Array<{ key: string; timestamp: number; age: number }> } {
    const entries = Array.from(this.recentNotificationsCache.entries()).map(([key, value]) => ({
      key,
      timestamp: value.timestamp,
      age: Date.now() - value.timestamp
    }));

    return {
      size: this.recentNotificationsCache.size,
      entries
    };
  }

  // مسح الذاكرة المؤقتة يدوياً
  clearCache(): void {
    this.recentNotificationsCache.clear();
    console.log('🧹 تم مسح الذاكرة المؤقتة للإشعارات');
  }
}

export const interactionNotificationService = new InteractionNotificationService(); 
