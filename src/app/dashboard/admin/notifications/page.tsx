'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where, doc, updateDoc, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import toast from 'react-hot-toast';
import { openWhatsAppShare, testWhatsAppShare } from '@/lib/utils/whatsapp-share';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      const notificationsRef = collection(db, 'admin_notifications');
      let q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(100));
      
      if (filter === 'unread') {
        q = query(notificationsRef, where('isRead', '==', false), orderBy('createdAt', 'desc'), limit(100));
      } else if (filter === 'read') {
        q = query(notificationsRef, where('isRead', '==', true), orderBy('createdAt', 'desc'), limit(100));
      }
      
      const snapshot = await getDocs(q);
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()['createdAt']?.toDate?.() || new Date()
      }));
      
      setNotifications(notificationsData);
      console.log(`تم جلب ${notificationsData.length} إشعار`);
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
      toast.error('خطأ في جلب الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'admin_notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: new Date()
      });
      
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true, readAt: new Date() }
          : notif
      ));
      
      toast.success('تم تمييز الإشعار كمقروء');
    } catch (error) {
      console.error('خطأ في تحديث الإشعار:', error);
      toast.error('خطأ في تحديث الإشعار');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      for (const notification of unreadNotifications) {
        const notificationRef = doc(db, 'admin_notifications', notification.id);
        await updateDoc(notificationRef, {
          isRead: true,
          readAt: new Date()
        });
      }
      
      setNotifications(prev => prev.map(notif => ({
        ...notif,
        isRead: true,
        readAt: new Date()
      })));
      
      toast.success(`تم تمييز ${unreadNotifications.length} إشعار كمقروء`);
    } catch (error) {
      console.error('خطأ في تحديث الإشعارات:', error);
      toast.error('خطأ في تحديث الإشعارات');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_payment':
        return '💰';
      case 'payment_update':
        return '🔄';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-50';
    
    switch (type) {
      case 'new_payment':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'payment_update':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'system':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // إرسال إشعار عبر WhatsApp
  const sendNotificationViaWhatsApp = (notification) => {
    if (!notification.paymentData?.playerPhone) {
      toast.error('رقم الهاتف غير متوفر');
      return;
    }

    const message = `📢 إشعار من El7lm Platform\n\n${notification.title}\n\n${notification.message}`;
    
    const result = openWhatsAppShare(notification.paymentData.playerPhone, message);
    
    if (result.success) {
      toast.success('تم فتح WhatsApp بنجاح!');
    } else {
      toast.error(result.error || 'فشل في فتح WhatsApp');
    }
  };

  // اختبار WhatsApp Share
  const testWhatsAppShareFeature = () => {
    const result = testWhatsAppShare('اختبار إشعارات WhatsApp من El7lm Platform');
    
    if (result.success) {
      toast.success('تم فتح WhatsApp للاختبار!');
    } else {
      toast.error(result.error || 'فشل في اختبار WhatsApp');
    }
  };

  // اختبار رقم المستخدم الحالي مع محتوى الرسالة الفعلية
  const testUserPhone = () => {
    if (!selectedNotification) {
      toast.error('يرجى اختيار إشعار أولاً');
      return;
    }

    if (!selectedNotification.paymentData?.playerPhone) {
      toast.error('رقم الهاتف غير متوفر في هذا الإشعار');
      return;
    }

    console.log(`🔍 اختبار رقم المستخدم الحالي: "${selectedNotification.paymentData.playerPhone}"`);
    
    // إنشاء رسالة شاملة من بيانات الإشعار
    const message = `📢 إشعار من El7lm Platform

${selectedNotification.title}

${selectedNotification.message}

تفاصيل إضافية:
- نوع الإشعار: ${selectedNotification.type || 'عام'}
- تاريخ الإشعار: ${formatDate(selectedNotification.createdAt)}
- حالة الدفع: ${selectedNotification.paymentData?.status || 'غير محدد'}
- مبلغ الدفع: ${selectedNotification.paymentData?.amount || 'غير محدد'} ${selectedNotification.paymentData?.currency || 'ج.م'}

شكراً لاستخدامك منصة العلم.

مع تحيات فريق العمل`;

    console.log(`📝 الرسالة المستخدمة: "${message}"`);
    console.log(`📏 طول الرسالة: ${message.length} حرف`);

    const result = openWhatsAppShare(selectedNotification.paymentData.playerPhone, message);
    
    if (result.success) {
      toast.success('تم فتح WhatsApp برقم المستخدم مع الرسالة الفعلية!');
      console.log(`✅ تم فتح WhatsApp برقم المستخدم مع الرسالة الفعلية!`);
    } else {
      toast.error(result.error || 'فشل في فتح WhatsApp');
      console.error(`❌ فشل في فتح WhatsApp:`, result.error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">📢 الإشعارات</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">إدارة إشعارات النظام</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {unreadCount > 0 && (
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {unreadCount} غير مقروء
                </div>
              )}
              <button
                onClick={testWhatsAppShareFeature}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
                title="اختبار WhatsApp Share برقم ثابت"
              >
                🧪 اختبار WhatsApp
              </button>
              
              <button
                onClick={testUserPhone}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
                title="اختبار WhatsApp برقم المستخدم الحالي مع الرسالة الفعلية"
                disabled={!selectedNotification}
              >
                📱 اختبار رقم المستخدم
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
                >
                  تمييز الكل كمقروء
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              غير مقروء ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'read' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              مقروء ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">جاري تحميل الإشعارات...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">لا توجد إشعارات</h3>
              <p className="text-gray-600">لم يتم العثور على أي إشعارات</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${getNotificationColor(notification.type, notification.isRead)}`}
                  onClick={() => {
                    setSelectedNotification(notification);
                    setShowDetailsDialog(true);
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      {notification.paymentData && (
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            💰 {notification.paymentData.amount?.toLocaleString()} {notification.paymentData.currency} | 
                            👤 {notification.paymentData.playerName} | 
                            📱 {notification.paymentData.playerPhone}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sendNotificationViaWhatsApp(notification);
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                            title="إرسال عبر WhatsApp"
                          >
                            📱 WhatsApp
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification Details Modal */}
      {showDetailsDialog && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {getNotificationIcon(selectedNotification.type)} {selectedNotification.title}
              </h2>
              <button
                onClick={() => setShowDetailsDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedNotification.message}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                <p className="text-gray-900">
                  {formatDate(selectedNotification.createdAt)}
                </p>
              </div>
              
              {selectedNotification.paymentData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تفاصيل المدفوعة</label>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">العميل:</span>
                      <span className="font-medium">{selectedNotification.paymentData.playerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المبلغ:</span>
                      <span className="font-medium">{selectedNotification.paymentData.amount?.toLocaleString()} {selectedNotification.paymentData.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم الهاتف:</span>
                      <span className="font-medium">{selectedNotification.paymentData.playerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المصدر:</span>
                      <span className="font-medium">{selectedNotification.paymentData.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحالة:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedNotification.paymentData.status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedNotification.paymentData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedNotification.paymentData.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              {selectedNotification.paymentData?.playerPhone && (
                <>
                  <button
                    onClick={() => sendNotificationViaWhatsApp(selectedNotification)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    📱 إرسال عبر WhatsApp
                  </button>
                  <button
                    onClick={testUserPhone}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    title="اختبار WhatsApp برقم المستخدم مع الرسالة الفعلية"
                  >
                    📱 اختبار رقم المستخدم
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDetailsDialog(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}