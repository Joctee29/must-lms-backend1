@echo off
echo ========================================
echo FIXING BACKEND URLs IN ALL SYSTEMS
echo ========================================
echo.
echo This will change all backend URLs from:
echo   https://must-lms-backend.onrender.com/api
echo to:
echo   http://localhost:5000/api
echo.
pause

echo.
echo Updating all systems...
echo.

powershell -ExecutionPolicy Bypass -File fix-all-backend-urls.ps1

echo.
echo ========================================
echo DONE!
echo ========================================
echo.
pause
