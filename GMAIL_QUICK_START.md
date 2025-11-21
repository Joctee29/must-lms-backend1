# 🚀 Quick Start: Enable Password Reset Emails

## What You Need
- Gmail account (create one if needed)
- 2 minutes to setup

## Quick Steps

### 1️⃣ Enable 2-Factor Authentication
```
Go to: https://myaccount.google.com/security
Find: "2-Step Verification"
Click: Enable
Complete: Google's verification process
```

### 2️⃣ Generate App Password
```
Go to: https://myaccount.google.com/apppasswords
Select: Mail + Other (MUST LMS)
Click: Generate
Copy: 16-character password (e.g., abcd efgh ijkl mnop)
Remove spaces: abcdefghijklmnop (16 chars, no spaces)
```

### 3️⃣ Configure Backend (Choose ONE)

**BEST: Use Environment Variables**
```powershell
# PowerShell (Windows)
$env:GMAIL_USER = "mustlms@gmail.com"
$env:GMAIL_APP_PASSWORD = "abcdefghijklmnop"
cd backend
npm start
```

**OR: Edit server.js**
```javascript
// File: backend/server.js, Lines 34-43
let CURRENT_ADMIN_EMAIL = 'mustlms@gmail.com';  // Your Gmail
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'mustlms@gmail.com',         // Your Gmail
    pass: 'abcdefghijklmnop'           // 16-char password (no spaces)
  }
};
```

### 4️⃣ Verify It Works
```
1. Start backend
2. Check console for: "✅ Gmail SMTP configured for: mustlms@gmail.com"
3. Try password reset → Email should arrive in inbox within seconds
```

## That's It! ✅

Password reset emails will now work automatically! 

---

**Need more details?** See `GMAIL_SETUP_FOR_PASSWORD_RESET.md`
