# 📧 Password Reset Email System - Complete Setup Guide

## Current Status

### What Works ✅
- User anaingia email sahihi → **System akagubika email in database**
- Click "Send Reset Code" → **Backend akagenerate reset code**
- Code saved in database → **Valid for 15 minutes**
- Backend ready to send emails → **Waiting for Gmail credentials**

### What's Missing ❌
- Gmail credentials not configured → **Emails not sent to real Gmail**
- Currently using Ethereal test email → **Users don't receive codes**
- Solution: **Configure Gmail app password**

---

## How Email System Works

### Process Flow
```
1. User enters email → Email validation
2. System verifies email exists in database ✅
3. User clicks "Send Reset Code" ✅
4. Backend generates random code (8 chars, alphanumeric) ✅
5. Code saved in database with 15-min expiry ✅
6. 📧 EMAIL SENT TO USER (NEEDS GMAIL CONFIG)
7. User receives code in Gmail inbox
8. User enters code in form
9. User sets new password
10. Password updated successfully
```

### Current Email Configuration
```javascript
// Backend: server.js (lines 30-60)

EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'your-gmail@gmail.com',      // ← NEEDS TO BE CONFIGURED
    pass: 'your-16-char-app-password'  // ← NEEDS TO BE CONFIGURED
  }
}
```

---

## ⚙️ Setup Instructions

### Option 1: Environment Variables (Best for Production)

#### Windows PowerShell
```powershell
# Set environment variables
$env:GMAIL_USER = "mustlms@gmail.com"
$env:GMAIL_APP_PASSWORD = "abcdefghijklmnop"

# Start backend
cd backend
npm start

# Verify in console
# Should show: ✅ Gmail SMTP configured for: mustlms@gmail.com
```

#### Linux/Mac
```bash
export GMAIL_USER="mustlms@gmail.com"
export GMAIL_APP_PASSWORD="abcdefghijklmnop"

cd backend
npm start
```

### Option 2: Edit server.js (Quick Testing)

File: `backend/server.js` (Lines 34-43)

```javascript
let CURRENT_ADMIN_EMAIL = 'mustlms@gmail.com';
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'mustlms@gmail.com',         // Change this
    pass: 'abcdefghijklmnop'           // Change this (16 chars, no spaces!)
  }
};
```

---

## 📱 How to Get Gmail App Password

### Step 1: Create/Use Gmail Account
- Use existing Gmail or create new one
- Recommended: Create dedicated account (e.g., mustlms@gmail.com)

### Step 2: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Find "2-Step Verification"
3. Click "Enable"
4. Complete Google's verification
5. **Save recovery codes** (important!)

### Step 3: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
   - *Only works if 2FA is enabled*
2. Select:
   - **App:** Mail (or Gmail)
   - **Device:** Other (custom name): "MUST LMS"
3. Click "Generate"
4. Google shows: `xxxx xxxx xxxx xxxx` (16 characters with spaces)
5. **Copy password** and **REMOVE SPACES** before using
   - Example: `abcd efgh ijkl mnop` → `abcdefghijklmnop`

---

## ✅ Verification Checklist

After configuring Gmail, verify:

### Backend Startup
- [ ] Console shows: `✅ Gmail SMTP configured for: mustlms@gmail.com`
- [ ] Console shows: `✅ Real emails will be sent to users' Gmail accounts`
- [ ] No errors about email configuration

### Password Reset Test
1. [ ] Login to student/lecturer portal
2. [ ] Click "Forgot Password"
3. [ ] Enter valid student/lecturer email
4. [ ] Click "Send Reset Code"
5. [ ] ✅ **Email arrives in inbox within 30 seconds**
6. [ ] Email shows:
   - [ ] From: `MUST LMS <mustlms@gmail.com>`
   - [ ] Subject: `Password Reset Code - MUST LMS`
   - [ ] Reset code (large blue numbers, 8 characters)
   - [ ] Expiration: 15 minutes
7. [ ] Copy code from email
8. [ ] Paste code in form → "Code verified"
9. [ ] Set new password → "Password reset successfully"
10. [ ] Can login with new password

---

## 📧 Email Template

Users will receive email like this:

```
FROM: MUST LMS <mustlms@gmail.com>
TO: student@example.com
SUBJECT: Password Reset Code - MUST LMS

[MUST Logo]

PASSWORD RESET REQUEST

Dear John Doe,

You have requested a password reset for your MUST LMS account.

Your verification code is:

    A7K9M2P5    ← 8-character code

This code expires in 15 minutes

Important:
- Do not share this code with anyone
- If you did not request this reset, please ignore this email
- Contact IT Support if you need assistance: +255 25 295 7544

© 2026 Mbeya University of Science and Technology
```

---

## 🔐 Security Considerations

### What's Protected ✅
- Reset codes: 8 random alphanumeric characters
- Valid for: 15 minutes only
- One-time use: Code marked as "used" after password reset
- Database: Codes stored with user_id, email, user_type, timestamps
- Verification: Email must match registered email in database

### Environment Variables ✅
- Gmail credentials stored in environment, not in code
- Not committed to Git
- Different credentials for dev/production
- App passwords: More secure than Gmail password

### Recommendations 🔒
1. Use dedicated Gmail account (not personal)
2. Store environment variables securely
3. Rotate app passwords periodically
4. Monitor failed password reset attempts
5. Enable 2FA on Gmail account

---

## 🆘 Troubleshooting

### "Email not sent" / "Gmail SMTP not configured"

**Check:**
```powershell
# Windows - Verify environment variable is set
$env:GMAIL_USER
$env:GMAIL_APP_PASSWORD

# Restart terminal/PowerShell after setting env vars
# Restart backend after changing env vars
```

### Email goes to spam folder

**Solutions:**
1. Add `mustlms@gmail.com` to contacts
2. Mark email as "Not spam"
3. Check Gmail filters (Settings → Filters and Blocked Addresses)

### "Invalid app password" error

**Check:**
- [ ] 2FA is enabled on Gmail
- [ ] App password is 16 characters
- [ ] No spaces in password
- [ ] Password generated from: https://myaccount.google.com/apppasswords
- [ ] Selected "Mail" and "Other"
- [ ] Generate new password if needed

### Email takes long time to arrive

**Normal:** 5-30 seconds
**If longer:** Check backend console for errors

---

## 📝 Configuration Files

### Backend Files (Modified for email support)
- `backend/server.js` - Email config, send-code endpoint, verify-email endpoint
- Lines 34-43: Email configuration
- Lines 103-180: sendResetCodeEmail() function
- Lines 8130-8170: verify-email endpoint
- Lines 8175-8250: send-code endpoint

### Frontend Files (Ready to display codes)
- `student-system/src/pages/LoginPage.tsx` - Password reset UI
- `lecture-system/src/pages/LoginPage.tsx` - Password reset UI

### Documentation Files (Created)
- `GMAIL_SETUP_FOR_PASSWORD_RESET.md` - Comprehensive guide
- `GMAIL_QUICK_START.md` - Quick reference
- `PASSWORD_RESET_EMAIL_SYSTEM_SETUP.md` - This file

---

## 🎯 Next Steps

1. **Generate Gmail App Password** (5 minutes)
   - Go to: https://myaccount.google.com/apppasswords
   - Select Mail + Other (MUST LMS)
   - Copy 16-character password

2. **Configure Backend** (2 minutes)
   ```powershell
   $env:GMAIL_USER = "your-gmail@gmail.com"
   $env:GMAIL_APP_PASSWORD = "16-character-password-no-spaces"
   cd backend
   npm start
   ```

3. **Test Password Reset** (2 minutes)
   - Try "Forgot Password" flow
   - Verify email arrives
   - Complete password reset

4. **Production Deployment**
   - Set environment variables on server
   - Restart backend
   - Test from production URL

---

## 📞 Support

If emails still not working after setup:
1. Check backend console for error messages
2. Verify Gmail account allows SMTP (usually enabled by default)
3. Check user's email spam folder
4. Verify admin email is set in database (table: admin_settings)
5. Restart backend after changing environment variables

---

**After configuration, password reset will work automatically!** 🎉

Users can reset passwords anytime by:
1. Going to login page
2. Clicking "Forgot Password"
3. Entering their email
4. Receiving reset code in Gmail
5. Setting new password
6. Logging in successfully
