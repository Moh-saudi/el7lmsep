# تعليمات رفع المشروع على GitHub

## 🚨 **مهم جداً: لا ترفع الملفات الكبيرة!**

### الملفات التي يجب عدم رفعها:
- `node_modules/` (1.01 GB)
- `next-swc.win32-x64-msvc.node` (129 MB)
- `.next/` (ملفات البناء)
- `out/`, `dist/`, `build/`

## 📋 **خطوات رفع المشروع:**

### 1. تنظيف المشروع:
```bash
# للويندوز
prepare-for-git.bat

# أو للـ PowerShell
powershell -ExecutionPolicy Bypass -File prepare-for-git.ps1
```

### 2. إضافة الملفات:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 3. بعد الرفع، على الجهاز الجديد:
```bash
git clone <repository-url>
cd el7lm25-main
npm install
```

## ✅ **ما سيحدث تلقائياً:**

1. **npm install** سيقوم بتحميل `node_modules` تلقائياً
2. **Next.js** سيقوم بتحميل `next-swc` تلقائياً
3. **الملفات الكبيرة** ستكون متوفرة بدون رفعها

## 🔧 **إعدادات Git:**

### .gitignore (تم إعداده):
```
node_modules/
.next/
*.node
```

### .gitattributes (تم إعداده):
```
*.node filter=lfs diff=lfs merge=lfs -text
node_modules/ export-ignore
```

## ⚠️ **تحذيرات:**

1. **لا تحذف .gitignore** - سيؤدي إلى رفع ملفات كبيرة
2. **تأكد من تشغيل prepare-for-git** قبل كل رفع
3. **اختبر المشروع** بعد `npm install` على جهاز جديد

## 🎯 **النتيجة:**

- **حجم Repository:** ~50-100 MB بدلاً من 1+ GB
- **سرعة Clone:** أسرع بكثير
- **سهولة التطوير:** أي شخص يمكنه clone وتشغيل المشروع

## 🚀 **للبدء:**

```bash
# 1. تنظيف المشروع
prepare-for-git.bat

# 2. رفع على GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

## 📞 **في حالة المشاكل:**

إذا واجهت مشكلة في رفع ملف كبير:
```bash
# إزالة الملف من Git
git rm --cached <filename>
git commit -m "Remove large file"
git push origin main
```
