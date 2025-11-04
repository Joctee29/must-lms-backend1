@echo off
echo Installing email dependencies for password reset functionality...
echo.

cd backend
echo Installing nodemailer...
npm install nodemailer@^6.9.8

echo.
echo ✅ Email dependencies installed successfully!
echo.
echo IMPORTANT: To enable real email sending, update the EMAIL_CONFIG in backend/server.js:
echo 1. Replace 'your-app-password' with your actual Gmail app password
echo 2. Or configure your own SMTP server settings
echo.
echo For Gmail setup:
echo 1. Enable 2-factor authentication on your Gmail account
echo 2. Generate an app password: https://myaccount.google.com/apppasswords
echo 3. Use the app password in the EMAIL_CONFIG
echo.
pause
