# PowerShell Script to Fix All Backend URLs
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIXING BACKEND URLs IN ALL SYSTEMS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$oldUrl = "https://must-lms-backend.onrender.com/api"
$newUrl = "http://localhost:5000/api"
$filesChanged = 0

# Function to replace URLs in files
function Replace-BackendUrl {
    param (
        [string]$Path,
        [string]$SystemName
    )
    
    Write-Host "Updating $SystemName..." -ForegroundColor Yellow
    
    $files = Get-ChildItem -Path $Path -Filter "*.tsx" -Recurse -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($content -match [regex]::Escape($oldUrl)) {
            $newContent = $content -replace [regex]::Escape($oldUrl), $newUrl
            Set-Content -Path $file.FullName -Value $newContent -NoNewline
            Write-Host "  ✓ Updated: $($file.Name)" -ForegroundColor Green
            $script:filesChanged++
        }
    }
}

# Update all systems
Replace-BackendUrl -Path "student-system\src" -SystemName "Student System"
Replace-BackendUrl -Path "lecture-system\src" -SystemName "Lecturer System"
Replace-BackendUrl -Path "admin-system\src" -SystemName "Admin System"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BACKEND URLs UPDATED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total files changed: $filesChanged" -ForegroundColor Yellow
Write-Host "All systems now point to: $newUrl" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start backend: cd backend; node server.js" -ForegroundColor White
Write-Host "2. Start student portal: cd student-system; npm run dev" -ForegroundColor White
Write-Host "3. Start lecturer portal: cd lecture-system; npm run dev" -ForegroundColor White
Write-Host "4. Start admin portal: cd admin-system; npm run dev" -ForegroundColor White
Write-Host ""
