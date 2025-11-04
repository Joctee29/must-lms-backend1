@echo off
echo ========================================
echo DEPLOYING TO RENDER
echo ========================================

REM Configure git if not already done
git config user.name "MUST LMS" 2>nul
git config user.email "admin@must.ac.tz" 2>nul

REM Add all changes
echo Adding files...
git add .

REM Commit changes
echo Committing changes...
git commit -m "Fix database connection errors"

REM Check if remote exists
git remote get-url render >nul 2>&1
if errorlevel 1 (
    echo.
    echo ========================================
    echo SETUP REQUIRED
    echo ========================================
    echo.
    echo Please add your Render Git URL:
    echo 1. Go to Render Dashboard
    echo 2. Click on your backend service
    echo 3. Go to "Settings" tab
    echo 4. Find "Git Repository" section
    echo 5. Copy the Git URL
    echo 6. Run this command:
    echo    git remote add render YOUR_GIT_URL
    echo.
    pause
) else (
    echo Pushing to Render...
    git push render main
    echo.
    echo ========================================
    echo DEPLOYMENT COMPLETE!
    echo ========================================
    echo.
    echo Your changes will be live in 2-3 minutes.
    echo Check Render logs to verify deployment.
    echo.
    pause
)
