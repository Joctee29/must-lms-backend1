@echo off
title MUST LMS - Manual Installation
color 0E

echo.
echo ========================================
echo    MUST LMS - Manual Installation
echo ========================================
echo.

cd /d "%~dp0"

echo Choose installation method:
echo.
echo 1. Standard installation (recommended)
echo 2. Force installation (if standard fails)
echo 3. Clean install (removes everything first)
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto standard
if "%choice%"=="2" goto force
if "%choice%"=="3" goto clean
goto standard

:standard
echo.
echo [STANDARD INSTALLATION]
echo.
call :install_system "lecture-system" "Lecture System"
call :install_system "student-system" "Student System"
call :install_system "admin-system" "Admin System"
goto done

:force
echo.
echo [FORCE INSTALLATION]
echo.
call :force_install "lecture-system" "Lecture System"
call :force_install "student-system" "Student System"
call :force_install "admin-system" "Admin System"
goto done

:clean
echo.
echo [CLEAN INSTALLATION]
echo.
call :clean_install "lecture-system" "Lecture System"
call :clean_install "student-system" "Student System"
call :clean_install "admin-system" "Admin System"
goto done

:install_system
echo Installing %~2...
cd %~1
npm install
if %errorlevel% neq 0 (
    echo   [ERROR] Failed to install %~2
    cd ..
    exit /b 1
)
echo   ✓ %~2 installed successfully
cd ..
exit /b 0

:force_install
echo Force installing %~2...
cd %~1
npm install --force --legacy-peer-deps
if %errorlevel% neq 0 (
    echo   [ERROR] Failed to force install %~2
    cd ..
    exit /b 1
)
echo   ✓ %~2 force installed successfully
cd ..
exit /b 0

:clean_install
echo Clean installing %~2...
cd %~1
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo   [WARNING] Retrying with --force...
    npm install --force
    if %errorlevel% neq 0 (
        echo   [ERROR] Failed to clean install %~2
        cd ..
        exit /b 1
    )
)
echo   ✓ %~2 clean installed successfully
cd ..
exit /b 0

:done
echo.
echo ========================================
echo    Installation Complete!
echo ========================================
echo.
echo All systems are ready. You can now run:
echo   quick-start.bat
echo.
pause
