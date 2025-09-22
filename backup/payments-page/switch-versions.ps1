# PowerShell Script for switching between payments page versions
# Switch between different versions of payments page

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("original", "simplified")]
    [string]$Version
)

$backupPath = "backup/payments-page"
$targetPath = "src/app/dashboard/admin/payments/page.tsx"

Write-Host "Switching payments page version..." -ForegroundColor Cyan

switch ($Version) {
    "original" {
        $sourceFile = "$backupPath/page-original-with-all-features.tsx"
        Write-Host "Copying original version (with all features)..." -ForegroundColor Yellow
        Write-Host "WARNING: This version contains errors and may not work!" -ForegroundColor Red
    }
    "simplified" {
        $sourceFile = "$backupPath/page-simplified-working.tsx"
        Write-Host "Copying simplified version (working)..." -ForegroundColor Green
        Write-Host "This version works perfectly!" -ForegroundColor Green
    }
}

if (Test-Path $sourceFile) {
    Copy-Item $sourceFile $targetPath -Force
    Write-Host "File copied successfully!" -ForegroundColor Green
    Write-Host "Target file: $targetPath" -ForegroundColor Gray
    
    Write-Host "`nTo restart the server, use:" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor White
    
    Write-Host "`nNotes:" -ForegroundColor Cyan
    if ($Version -eq "original") {
        Write-Host "   - Original version contains all advanced features" -ForegroundColor Yellow
        Write-Host "   - May need error fixes before use" -ForegroundColor Yellow
        Write-Host "   - Check README.md for details" -ForegroundColor Yellow
    } else {
        Write-Host "   - Simplified version works without errors" -ForegroundColor Green
        Write-Host "   - Contains basic features only" -ForegroundColor Green
        Write-Host "   - Can be built upon gradually" -ForegroundColor Green
    }
} else {
    Write-Host "ERROR: Source file not found!" -ForegroundColor Red
    Write-Host "   $sourceFile" -ForegroundColor Gray
    exit 1
}

Write-Host "`nDone!" -ForegroundColor Green