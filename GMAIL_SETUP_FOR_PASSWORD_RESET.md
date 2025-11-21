# 📧 Gmail Setup for Password Reset Emails

## Problem
Reset codes are not being sent to user emails. Backend is using test email (Ethereal) instead of real Gmail.

## Solution: Configure Gmail App Password

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to: https://myaccount.google.com/security
2. Look for "2-Step Verification" 
3. Click "Enable"
4. Follow Google's verification process
5. **SAVE** your recovery codes safely!

### Step 2: Generate Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
   - *Note: This link only works if 2FA is enabled*
2. Select:
   - **App:** Mail
   - **Device:** Other (MUST LMS)
3. Click "Generate"
4. Google will show 16-character password: `xxxx xxxx xxxx xxxx`
5. **COPY** this password (without spaces)

### Step 3: Configure Backend

#### Option A: Environment Variables (Recommended)
Set these before starting the backend:

```bash
# Windows PowerShell
$env:GMAIL_USER = "your-gmail@gmail.com"
$env:GMAIL_APP_PASSWORD = "xxxxxxxxxxxx"  # 16 chars without spaces
npm start
```

```bash
# Linux/Mac
export GMAIL_USER="your-gmail@gmail.com"
export GMAIL_APP_PASSWORD="xxxxxxxxxxxx"  # 16 chars without spaces
npm start
```

#### Option B: Update server.js Directly
Edit `backend/server.js` line 34-43:

```javascript
let CURRENT_ADMIN_EMAIL = 'your-gmail@gmail.com';  // Change this
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-gmail@gmail.com',           // Change this
    pass: 'xxxxxxxxxxxx'                     // Change this (16 chars, no spaces)
  }
};
```

### Step 4: Test Email Sending

1. Start backend:
```bash
cd backend
npm start
```

2. Watch console for message:
```
✅ Gmail SMTP configured for: your-gmail@gmail.com
✅ Real emails will be sent to users' Gmail accounts
```

3. Try password reset:
   - Login page → "Forgot Password"
   - Enter student/lecturer email
   - Click "Send Reset Code"
   - Check if email arrives in their Gmail inbox

### Step 5: Verify Email Delivery

Check:
- ✅ **Email arrives in user's inbox** (not spam)
- ✅ **From address:** `MUST LMS <your-gmail@gmail.com>`
- ✅ **Subject:** `Password Reset Code - MUST LMS`
- ✅ **Reset code is visible** (large blue text)
- ✅ **Code expires in 15 minutes**

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Gmail SMTP not configured" | Check if GMAIL_USER/GMAIL_APP_PASSWORD env vars are set correctly |
| Email goes to spam | Add `noreply@must.ac.tz` to contacts; check Gmail filters |
| "Invalid app password" | Generate new password, remove spaces, ensure 16 characters |
| 2FA not enabled | Cannot generate app password - enable 2FA first |

### Important Security Notes

⚠️ **DO NOT:**
- Share Gmail credentials with others
- Commit credentials to Git
- Use personal Gmail accounts in production (create dedicated account)
- Store passwords in plain text files

✅ **DO:**
- Use environment variables for credentials
- Use dedicated Gmail account for MUST LMS only
- Rotate app passwords periodically
- Monitor failed login attempts

### After Configuration

Once Gmail is configured:
1. ✅ Reset codes sent to real user emails automatically
2. ✅ Emails sent from admin's Gmail address
3. ✅ Users receive code within seconds
4. ✅ Code is valid for 15 minutes
5. ✅ Users can reset password successfully

### Support

If emails still not arriving:
1. Check backend console for errors
2. Verify Gmail account settings allow SMTP
3. Check user's email spam folder
4. Verify admin email is set correctly in database

---

**Once configured, password reset will work automatically!** 🎉
