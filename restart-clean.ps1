# تنظيف وإعادة تشغيل الخادم مع الإعدادات المحسنة
Write-Host "تنظيف وإعادة تشغيل الخادم مع الإعدادات المحسنة..." -ForegroundColor Green

# تنظيف cache
Write-Host "تنظيف cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
}

# إعادة تشغيل الخادم
Write-Host "إعادة تشغيل الخادم..." -ForegroundColor Green
npm run dev
