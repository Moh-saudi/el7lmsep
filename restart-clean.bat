@echo off
echo تنظيف وإعادة تشغيل الخادم مع الإعدادات المحسنة...

REM تنظيف cache
echo تنظيف cache...
rmdir /s /q .next 2>nul
rmdir /s /q node_modules\.cache 2>nul

REM إعادة تشغيل الخادم
echo إعادة تشغيل الخادم...
npm run dev

pause
