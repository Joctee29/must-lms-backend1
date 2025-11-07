@echo off
echo ========================================
echo Initializing Assignment Tables
echo ========================================
echo.

curl -X POST http://localhost:5000/api/assignments/init
echo.
echo.
echo ========================================
echo Assignment tables initialized!
echo ========================================
pause
