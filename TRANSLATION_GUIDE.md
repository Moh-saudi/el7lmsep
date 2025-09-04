# 🌍 دليل نظام الترجمة - Translation System Guide

## نظرة عامة

تم إضافة نظام ترجمة شامل ومتقدم يدعم اللغتين العربية والإنجليزية بطريقة سهلة ومنظمة. النظام مصمم ليكون سهل الاستخدام وقابل للتوسع.

## 📁 هيكل الملفات

```
src/lib/translations/
├── index.ts          # النظام الرئيسي للترجمة
├── ar.ts             # الترجمات العربية
└── en.ts             # الترجمات الإنجليزية

src/components/shared/
├── LanguageSwitcher.tsx      # مكون تبديل اللغة
└── TranslatedComponent.tsx    # مكون مثال للاستخدام

src/app/test-translation/
└── page.tsx          # صفحة اختبار الترجمة
```

## 🚀 البدء السريع

### 1. استخدام الترجمة في المكونات

```tsx
import { useTranslation } from '@/lib/translations';

export default function MyComponent() {
  const { t, tWithVars, language, direction } = useTranslation();
  
  return (
    <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
      <h1>{t('nav.dashboard')}</h1>
      <button>{t('actions.save')}</button>
      <p>{tWithVars('users.totalUsers', { count: 1500 })}</p>
    </div>
  );
}
```

### 2. إضافة مبدل اللغة

```tsx
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

// في أي مكان في التطبيق
<LanguageSwitcher 
  variant="dropdown" 
  showFlags={true} 
  showNames={true} 
/>
```

## 📚 الدوال المتاحة

### `useTranslation()` Hook

```tsx
const { 
  t,                    // دالة الترجمة الأساسية
  tWithVars,           // دالة الترجمة مع متغيرات
  language,            // اللغة الحالية
  direction,           // اتجاه النص (rtl/ltr)
  setLanguage,         // تغيير اللغة
  formatDate,          // تنسيق التاريخ
  formatNumber,        // تنسيق الأرقام
  formatCurrency       // تنسيق العملة
} = useTranslation();
```

### دوال الترجمة

#### 1. الترجمة البسيطة
```tsx
const title = t('nav.dashboard'); // "لوحة التحكم" أو "Dashboard"
```

#### 2. الترجمة مع متغيرات
```tsx
const message = tWithVars('users.totalUsers', { count: 1500 });
// "إجمالي المستخدمين: 1500" أو "Total Users: 1,500"
```

#### 3. الترجمة مع fallback
```tsx
const text = t('unknown.key', 'النص الافتراضي');
```

### دوال التنسيق

#### تنسيق التاريخ
```tsx
const date = formatDate(new Date());
// العربية: "١٥ يناير ٢٠٢٤"
// الإنجليزية: "January 15, 2024"
```

#### تنسيق الأرقام
```tsx
const number = formatNumber(1234567);
// العربية: "١٬٢٣٤٬٥٦٧"
// الإنجليزية: "1,234,567"
```

#### تنسيق العملة
```tsx
const currency = formatCurrency(5000, 'USD');
// العربية: "٥٬٠٠٠ دولار أمريكي"
// الإنجليزية: "5,000 US Dollar"
```

## 🎨 مكون تبديل اللغة

### الخيارات المتاحة

```tsx
<LanguageSwitcher 
  variant="dropdown"    // "dropdown" | "button" | "minimal"
  showFlags={true}      // إظهار الأعلام
  showNames={true}      // إظهار أسماء اللغات
  className="custom-class"
/>
```

### الأنماط المختلفة

1. **Dropdown (افتراضي)**: قائمة منسدلة أنيقة
2. **Button**: أزرار بسيطة
3. **Minimal**: أزرار صغيرة مع الأعلام فقط

## 📝 إضافة ترجمات جديدة

### 1. إضافة ترجمة في ملف ar.ts

```tsx
// في src/lib/translations/ar.ts
const ar = {
  // ... الترجمات الموجودة
  newSection: {
    title: 'العنوان الجديد',
    description: 'الوصف الجديد',
    button: 'زر جديد'
  }
};
```

### 2. إضافة الترجمة الإنجليزية في ملف en.ts

```tsx
// في src/lib/translations/en.ts
const en = {
  // ... الترجمات الموجودة
  newSection: {
    title: 'New Title',
    description: 'New Description',
    button: 'New Button'
  }
};
```

### 3. استخدام الترجمة الجديدة

```tsx
const { t } = useTranslation();
const title = t('newSection.title');
```

## 🔧 التخصيص المتقدم

### إضافة لغة جديدة

1. إنشاء ملف ترجمة جديد (مثل `fr.ts`)
2. إضافة اللغة في `SUPPORTED_LANGUAGES`
3. تحديث `TranslationProvider`

### تخصيص التنسيق

```tsx
// تنسيق التاريخ المخصص
const customDate = formatDate(new Date(), {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

// تنسيق العملة المخصص
const customCurrency = formatCurrency(1000, 'EUR');
```

## 🧪 الاختبار

### صفحة الاختبار
انتقل إلى `/test-translation` لرؤية النظام في العمل.

### اختبار محلي
```bash
npm run dev
# ثم افتح http://localhost:3000/test-translation
```

## 📋 أفضل الممارسات

### 1. تنظيم الترجمات
- استخدم أسماء منطقية للمفاتيح
- اجمع الترجمات المتعلقة في كائنات
- استخدم تعليقات لتوضيح السياق

### 2. استخدام المتغيرات
```tsx
// جيد
const message = tWithVars('welcome.user', { name: userName });

// سيء
const message = t('welcome.user') + ' ' + userName;
```

### 3. التعامل مع النصوص الطويلة
```tsx
// للترجمات الطويلة، استخدم مفاتيح منفصلة
const longText = t('about.description');
```

### 4. اتجاه النص
```tsx
// استخدم direction لتطبيق الأنماط
<div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
  {t('content.text')}
</div>
```

## 🚨 استكشاف الأخطاء

### مشكلة: الترجمة لا تظهر
1. تأكد من وجود المفتاح في ملفات الترجمة
2. تحقق من صحة مسار المفتاح
3. استخدم fallback للقيم المفقودة

### مشكلة: اتجاه النص خاطئ
1. تأكد من تطبيق `direction` في CSS
2. تحقق من إعدادات اللغة في `SUPPORTED_LANGUAGES`

### مشكلة: مبدل اللغة لا يعمل
1. تأكد من وجود `TranslationProvider` في layout
2. تحقق من استيراد المكونات بشكل صحيح

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع صفحة الاختبار `/test-translation`
2. تحقق من سجلات المتصفح
3. تأكد من صحة ملفات الترجمة

---

## 🎯 ملخص سريع

✅ **سهل الاستخدام**: `const { t } = useTranslation();`

✅ **دعم كامل**: العربية والإنجليزية

✅ **تلقائي**: تغيير الاتجاه والتنسيق

✅ **مرن**: دعم المتغيرات والتخصيص

✅ **جاهز**: مكونات جاهزة للاستخدام

✅ **قابل للتوسع**: إضافة لغات جديدة بسهولة 
