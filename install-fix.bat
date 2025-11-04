@echo off
title MUST LMS - Installation Fix
color 0C

echo.
echo ========================================
echo    MUST LMS - Installation Fix
echo ========================================
echo.

cd /d "%~dp0"

echo [INFO] Fixing npm installation issues...
echo.

REM Clear npm cache completely
echo [1/6] Clearing npm cache...
call npm cache clean --force
call npm cache verify

REM Set npm configuration for better compatibility
echo [2/6] Setting npm configuration...
call npm config set legacy-peer-deps true
call npm config set audit false
call npm config set fund false

REM Install Lecture System
echo [3/6] Installing Lecture System...
cd lecture-system
if exist node_modules (
    echo   Removing old node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo   Removing package-lock.json...
    del package-lock.json
)
echo   Installing dependencies...
call npm install --legacy-peer-deps --no-audit --no-fund
if %errorlevel% neq 0 (
    echo   [WARNING] Retrying with --force flag...
    call npm install --force
)
echo   ✓ Lecture System installed
cd ..

REM Install Student System
echo [4/6] Installing Student System...
cd student-system
if exist node_modules (
    echo   Removing old node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo   Removing package-lock.json...
    del package-lock.json
)
echo   Installing dependencies...
call npm install --legacy-peer-deps --no-audit --no-fund
if %errorlevel% neq 0 (
    echo   [WARNING] Retrying with --force flag...
    call npm install --force
)
echo   ✓ Student System installed
cd ..

REM Install Admin System
echo [5/6] Installing Admin System...
cd admin-system
if exist node_modules (
    echo   Removing old node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo   Removing package-lock.json...
    del package-lock.json
)
echo   Installing dependencies...
call npm install --legacy-peer-deps --no-audit --no-fund
if %errorlevel% neq 0 (
    echo   [WARNING] Retrying with --force flag...
    call npm install --force
)
echo   ✓ Admin System installed
cd ..

echo [6/6] Installation complete!
echo.
echo ========================================
echo    All systems ready to run!
echo ========================================
echo.
echo You can now run: quick-start.bat
echo.
pause
