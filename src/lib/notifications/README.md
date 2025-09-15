# Interaction Notifications Service

## نظرة عامة
خدمة إدارة الإشعارات التفاعلية التي تتعامل مع إرسال وتتبع الإشعارات المختلفة في النظام.

## المشكلة التي تم حلها
كانت الدالة `checkRecentNotification` ترجع دائماً `null`، مما يعني أنها لا تقوم بأي فحص حقيقي للإشعارات الحديثة. هذا جعل الدالة غير مفيدة وتسبب مشكلة في الكود.

## التحسينات المطبقة

### 1. إصلاح دالة `checkRecentNotification`
- **قبل**: كانت ترجع دائماً `null`
- **بعد**: تقوم بفحص حقيقي في قاعدة البيانات للبحث عن الإشعارات الحديثة
- **الفوائد**: منع الإشعارات المكررة وتحسين تجربة المستخدم

### 2. إضافة ذاكرة تخزين مؤقت (Cache)
- **الهدف**: تحسين الأداء وتقليل استعلامات قاعدة البيانات
- **المدة**: 5 دقائق
- **الوظائف**:
  - `checkCacheForRecentNotification()`: فحص الذاكرة المؤقتة
  - `updateCache()`: تحديث الذاكرة المؤقتة
  - `cleanupCache()`: تنظيف العناصر القديمة

### 3. تحسين منطق منع الإشعارات المكررة
- **مفتاح فريد**: `userId_viewerId_type`
- **نافذة زمنية**: قابلة للتخصيص لكل نوع إشعار
- **معالجة الأخطاء**: السماح بإرسال الإشعار في حالة فشل الفحص

### 4. إضافة فهرسة Firestore
تم إضافة الفهارس التالية لتحسين أداء الاستعلامات:

```json
{
  "collectionGroup": "interaction_notifications",
  "fields": [
    {"fieldPath": "userId", "order": "ASCENDING"},
    {"fieldPath": "viewerId", "order": "ASCENDING"},
    {"fieldPath": "type", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```

### 5. تحسين إدارة الإشعارات
- **تنظيف الإشعارات منتهية الصلاحية**: دالة `cleanupExpiredNotifications()`
- **إحصائيات الذاكرة المؤقتة**: دالة `getCacheStats()`
- **مسح الذاكرة المؤقتة**: دالة `clearCache()`

## أنواع الإشعارات المدعومة

1. **مشاهدة الملف الشخصي** (`profile_view`)
2. **نتيجة البحث** (`search_result`)
3. **طلب تواصل** (`connection_request`)
4. **رسالة جديدة** (`message_sent`)
5. **إعجاب بالفيديو** (`video_like`)
6. **تعليق على الفيديو** (`video_comment`)
7. **مشاركة الفيديو** (`video_share`)
8. **مشاهدة الفيديو** (`video_view`)

## الاستخدام

```typescript
import { interactionNotificationService } from '@/lib/notifications/interaction-notifications';

// إرسال إشعار مشاهدة الملف الشخصي
const notificationId = await interactionNotificationService.sendProfileViewNotification(
  'profileOwnerId',
  'viewerId',
  'viewerName',
  'viewerType',
  'viewerAccountType',
  'player'
);

// إحصائيات الذاكرة المؤقتة
const stats = interactionNotificationService.getCacheStats();
console.log(`حجم الذاكرة المؤقتة: ${stats.size}`);

// تنظيف الإشعارات منتهية الصلاحية
await interactionNotificationService.cleanupExpiredNotifications();
```

## الأداء

### قبل التحسين
- ❌ فحص الإشعارات المكررة: غير فعال
- ❌ استعلامات قاعدة البيانات: غير محسنة
- ❌ إدارة الذاكرة: غير موجودة

### بعد التحسين
- ✅ فحص الإشعارات المكررة: فعال مع ذاكرة تخزين مؤقت
- ✅ استعلامات قاعدة البيانات: محسنة مع فهرسة
- ✅ إدارة الذاكرة: تلقائية مع تنظيف دوري
- ✅ معالجة الأخطاء: محسنة مع fallback

## الصيانة

### تنظيف دوري
يُنصح بتشغيل `cleanupExpiredNotifications()` بشكل دوري (يومياً) لحذف الإشعارات منتهية الصلاحية.

### مراقبة الأداء
استخدم `getCacheStats()` لمراقبة أداء الذاكرة المؤقتة وتحديد الحاجة لضبط المدة.

## الأمان
- جميع العمليات محمية بمعالجة الأخطاء
- في حالة فشل الفحص، يتم السماح بإرسال الإشعار لتجنب فقدان الإشعارات المهمة
- الفهرسة محسنة لتجنب استعلامات بطيئة
