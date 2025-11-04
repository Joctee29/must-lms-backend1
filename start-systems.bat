@echo off
echo ========================================
echo MUST LMS - Starting All Three Systems
echo ========================================
echo.

REM Change to the main directory
cd /d "%~dp0"

echo Installing dependencies for all systems...
echo.

REM Install dependencies for Lecture System
echo [1/3] Installing Lecture System dependencies...
cd lecture-system
call npm install
if %errorlevel% neq 0 (
    echo Error installing lecture system dependencies!
    pause
    exit /b 1
)
cd ..

REM Install dependencies for Student System
echo [2/3] Installing Student System dependencies...
cd student-system
call npm install
if %errorlevel% neq 0 (
    echo Error installing student system dependencies!
    pause
    exit /b 1
)
cd ..

REM Install dependencies for Admin System
echo [3/3] Installing Admin System dependencies...
cd admin-system
call npm install
if %errorlevel% neq 0 (
    echo Error installing admin system dependencies!
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo All dependencies installed successfully!
echo Starting all three systems...
echo ========================================
echo.

REM Start Lecture System (Port 3000)
echo Starting Lecture System on http://localhost:3000
start "MUST LMS - Lecture System" cmd /k "cd /d %~dp0\lecture-system && npm run dev"

REM Wait a moment before starting next system
timeout /t 3 /nobreak >nul

REM Start Student System (Port 3001)
echo Starting Student System on http://localhost:3001
start "MUST LMS - Student System" cmd /k "cd /d %~dp0\student-system && npm run dev"

REM Wait a moment before starting next system
timeout /t 3 /nobreak >nul

REM Start Admin System (Port 3002)
echo Starting Admin System on http://localhost:3002
start "MUST LMS - Admin System" cmd /k "cd /d %~dp0\admin-system && npm run dev"

REM Wait for systems to start up
echo.
echo Waiting for systems to start up...
timeout /t 10 /nobreak >nul

REM Open browsers for all three systems
echo.
echo Opening web browsers...
echo.

echo Opening Lecture System (http://localhost:3000)...
start "" "http://localhost:3000"

timeout /t 2 /nobreak >nul

echo Opening Student System (http://localhost:3001)...
start "" "http://localhost:3001"

timeout /t 2 /nobreak >nul

echo Opening Admin System (http://localhost:3002)...
start "" "http://localhost:3002"

echo.
echo ========================================
echo All systems are now running!
echo ========================================
echo.
echo Lecture System: http://localhost:3000
echo Student System: http://localhost:3001
echo Admin System:   http://localhost:3002
echo.
echo Press any key to stop all systems...
pause >nul

REM Stop all systems
echo.
echo Stopping all systems...
taskkill /f /im node.exe 2>nul
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq MUST LMS*" 2>nul

echo All systems stopped.
echo Press any key to exit...
pause >nul
