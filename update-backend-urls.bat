@echo off
echo ========================================
echo UPDATING BACKEND URLs TO LIVE SERVER
echo ========================================
echo.
echo Replacing http://localhost:5000 with https://must-lms-backend.onrender.com
echo.

cd /d "%~dp0"

echo Updating Admin System...
powershell -Command "(Get-Content 'admin-system\src\pages\*.tsx' -Raw) -replace 'http://localhost:5000', 'https://must-lms-backend.onrender.com' | Set-Content 'admin-system\src\pages\*.tsx'"

echo Updating Student System...
powershell -Command "Get-ChildItem -Path 'student-system\src' -Recurse -Filter *.tsx | ForEach-Object { (Get-Content $_.FullName -Raw) -replace 'http://localhost:5000', 'https://must-lms-backend.onrender.com' | Set-Content $_.FullName }"
powershell -Command "Get-ChildItem -Path 'student-system\src' -Recurse -Filter *.ts | ForEach-Object { (Get-Content $_.FullName -Raw) -replace 'http://localhost:5000', 'https://must-lms-backend.onrender.com' | Set-Content $_.FullName }"

echo Updating Lecturer System...
powershell -Command "Get-ChildItem -Path 'lecture-system\src' -Recurse -Filter *.tsx | ForEach-Object { (Get-Content $_.FullName -Raw) -replace 'http://localhost:5000', 'https://must-lms-backend.onrender.com' | Set-Content $_.FullName }"
powershell -Command "Get-ChildItem -Path 'lecture-system\src' -Recurse -Filter *.ts | ForEach-Object { (Get-Content $_.FullName -Raw) -replace 'http://localhost:5000', 'https://must-lms-backend.onrender.com' | Set-Content $_.FullName }"

echo.
echo ========================================
echo UPDATE COMPLETE!
echo ========================================
echo.
echo All systems now point to: https://must-lms-backend.onrender.com
echo.
pause
