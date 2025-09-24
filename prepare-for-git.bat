@echo off
echo تنظيف المشروع قبل رفعه على GitHub...

REM حذف الملفات الكبيرة
echo حذف الملفات الكبيرة...
if exist "node_modules" (
    echo حذف node_modules...
    rmdir /s /q node_modules
)

if exist ".next" (
    echo حذف مجلد البناء...
    rmdir /s /q .next
)

if exist "out" (
    echo حذف مجلد out...
    rmdir /s /q out
)

REM حذف الملفات المؤقتة
echo حذف الملفات المؤقتة...
del /q *.log 2>nul
del /q *.tmp 2>nul

echo تم تنظيف المشروع بنجاح!
echo يمكنك الآن رفع المشروع على GitHub
echo بعد الرفع، قم بتشغيل: npm install

pause
