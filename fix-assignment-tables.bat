@echo off
echo ========================================
echo Fixing Assignment Tables Schema
echo ========================================
echo.
echo WARNING: This will delete all existing assignments!
echo Press Ctrl+C to cancel, or
pause
echo.

curl -X POST http://localhost:5000/api/assignments/fix
echo.
echo.
echo ========================================
echo Assignment tables fixed successfully!
echo ========================================
echo.
echo The tables now include:
echo - program_id column for precise targeting
echo - All other required columns
echo.
pause
