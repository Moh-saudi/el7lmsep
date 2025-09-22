@echo off
REM Batch Script للتبديل بين نسخ صفحة المدفوعات
REM Switch between different versions of payments page

echo.
echo ========================================
echo    تبديل نسخ صفحة المدفوعات
echo ========================================
echo.

if "%1"=="original" goto :original
if "%1"=="simplified" goto :simplified
if "%1"=="help" goto :help

echo ❌ خطأ: يجب تحديد النسخة المطلوبة
echo.
echo الاستخدام:
echo   switch-versions.bat original    - للنسخة الأصلية (مع جميع الميزات)
echo   switch-versions.bat simplified  - للنسخة المبسطة (العاملة)
echo   switch-versions.bat help        - لعرض هذه المساعدة
echo.
goto :end

:original
echo 📁 نسخ النسخة الأصلية (مع جميع الميزات)...
echo ⚠️  تحذير: هذه النسخة تحتوي على أخطاء وقد لا تعمل!
copy "page-original-with-all-features.tsx" "..\..\..\..\src\app\dashboard\admin\payments\page.tsx" /Y
if %errorlevel%==0 (
    echo ✅ تم نسخ الملف بنجاح!
    echo 📍 النسخة الأصلية مفعلة الآن
) else (
    echo ❌ خطأ في نسخ الملف!
)
goto :end

:simplified
echo 📁 نسخ النسخة المبسطة (العاملة)...
echo ✅ هذه النسخة تعمل بشكل مثالي!
copy "page-simplified-working.tsx" "..\..\..\..\src\app\dashboard\admin\payments\page.tsx" /Y
if %errorlevel%==0 (
    echo ✅ تم نسخ الملف بنجاح!
    echo 📍 النسخة المبسطة مفعلة الآن
) else (
    echo ❌ خطأ في نسخ الملف!
)
goto :end

:help
echo.
echo ========================================
echo           مساعدة تبديل النسخ
echo ========================================
echo.
echo 📋 النسخ المتاحة:
echo.
echo 1. original - النسخة الأصلية
echo    - تحتوي على جميع الميزات المتقدمة
echo    - فلترة، بحث، ترتيب، pagination
echo    - إدارة المدفوعات والإشعارات
echo    - ⚠️  تحتوي على أخطاء وقد لا تعمل
echo.
echo 2. simplified - النسخة المبسطة
echo    - تعمل بدون أخطاء
echo    - عرض المدفوعات في جدول بسيط
echo    - اتصال بـ Firebase
echo    - ✅ موصى بها للاستخدام الحالي
echo.
echo 🚀 بعد التبديل، أعد تشغيل الخادم:
echo    npm run dev
echo.
echo 📖 للمزيد من التفاصيل، راجع ملف README.md
echo.

:end
echo.
echo 🎉 تم الانتهاء!
pause
