# تنظيف المشروع قبل رفعه على GitHub
Write-Host "تنظيف المشروع قبل رفعه على GitHub..." -ForegroundColor Green

# حذف الملفات الكبيرة
Write-Host "حذف الملفات الكبيرة..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Host "حذف node_modules..." -ForegroundColor Red
    Remove-Item -Recurse -Force "node_modules"
}

if (Test-Path ".next") {
    Write-Host "حذف مجلد البناء..." -ForegroundColor Red
    Remove-Item -Recurse -Force ".next"
}

if (Test-Path "out") {
    Write-Host "حذف مجلد out..." -ForegroundColor Red
    Remove-Item -Recurse -Force "out"
}

# حذف الملفات المؤقتة
Write-Host "حذف الملفات المؤقتة..." -ForegroundColor Yellow
Get-ChildItem -Filter "*.log" | Remove-Item -Force
Get-ChildItem -Filter "*.tmp" | Remove-Item -Force

Write-Host "تم تنظيف المشروع بنجاح!" -ForegroundColor Green
Write-Host "يمكنك الآن رفع المشروع على GitHub" -ForegroundColor Cyan
Write-Host "بعد الرفع، قم بتشغيل: npm install" -ForegroundColor Cyan
