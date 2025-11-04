# Gmail Email Setup Guide - Real Password Reset Emails

## Issue Solved: Students na Lecturers Hawapati Reset Codes

### Problem:
- Students na lecturers wanapata "Please check your email" message
- Lakini hawapati actual reset codes kwenye Gmail zao
- System ilikuwa simulation mode tu

### Solution: Real Gmail Integration

## Step 1: Setup Gmail Account

### 1.1 Enable 2-Factor Authentication
1. **Go to Gmail Settings:**
   - Open Gmail → Click profile picture → "Manage your Google Account"
   - Go to "Security" tab

2. **Enable 2-Step Verification:**
   - Click "2-Step Verification"
   - Follow the setup process
   - Verify with phone number

### 1.2 Generate App Password
1. **Go to App Passwords:**
   - Visit: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → App passwords

2. **Create New App Password:**
   - Select app: "Mail"
   - Select device: "Other (custom name)"
   - Enter name: "MUST LMS"
   - Click "Generate"

3. **Copy the 16-character password:**
   - Example: `abcd efgh ijkl mnop`
   - **IMPORTANT:** Save this password securely!

## Step 2: Configure Backend

### 2.1 Update Email Configuration
Open `backend/server.js` and find this section:

```javascript
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'admin@must.ac.tz', // Replace with your Gmail address
    pass: 'your-app-password' // Replace with generated app password
  }
};
```

### 2.2 Replace with Real Values:
```javascript
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-gmail@gmail.com', // Your actual Gmail address
    pass: 'abcd efgh ijkl mnop'    // Your 16-character app password
  }
};
```

### 2.3 Example Configuration:
```javascript
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'mustlms2024@gmail.com',
    pass: 'xyzw abcd efgh ijkl'
  }
};
```

## Step 3: Update Admin Email in Database

### 3.1 Set Admin Email to Match Gmail:
1. **Open Admin Portal:** http://localhost:3000
2. **Go to:** Password Management → Automatic Password Reset
3. **Click:** "Edit" button next to admin email
4. **Enter:** Your Gmail address (same as EMAIL_CONFIG.auth.user)
5. **Click:** "Save"

### 3.2 Example:
- If EMAIL_CONFIG.auth.user = 'mustlms2024@gmail.com'
- Then admin email should also be: 'mustlms2024@gmail.com'

## Step 4: Test Real Email Sending

### 4.1 Test Student Password Reset:
1. **Open Student Portal:** http://localhost:3001
2. **Click:** "Reset here" (Forgot password)
3. **Enter:** Student email address
4. **Click:** "Send Reset Code"
5. **Check:** Student's Gmail inbox for reset code

### 4.2 Test Lecturer Password Reset:
1. **Open Lecturer Portal:** http://localhost:3002
2. **Click:** "Reset here" (Forgot password)
3. **Enter:** Lecturer email address
4. **Click:** "Send Reset Code"
5. **Check:** Lecturer's Gmail inbox for reset code

## Step 5: Verify Email Delivery

### 5.1 Check Server Logs:
```
✅ Email sent successfully: <message-id>
✅ Reset code sent to user email: user@example.com
```

### 5.2 Check Gmail Inbox:
- **Subject:** "Password Reset Code - MUST LMS"
- **From:** "MUST LMS <your-gmail@gmail.com>"
- **Content:** Professional HTML email with reset code

## Troubleshooting

### Issue 1: "Invalid login" Error
**Solution:**
- Make sure 2-factor authentication is enabled
- Generate new app password
- Use the exact 16-character password (with spaces)

### Issue 2: Emails Still Simulated
**Check:**
- EMAIL_CONFIG.auth.pass is not 'your-app-password'
- Gmail address matches admin email in database
- Server restarted after configuration changes

### Issue 3: Emails Go to Spam
**Solution:**
- Check spam/junk folder
- Add sender to contacts
- Mark as "Not Spam"

## Security Best Practices

### 1. App Password Security:
- Never share app password
- Use different app password for each application
- Revoke unused app passwords

### 2. Email Security:
- Use strong Gmail password
- Keep 2-factor authentication enabled
- Monitor account activity

### 3. System Security:
- Don't commit app passwords to version control
- Use environment variables for production
- Regularly rotate app passwords

## Production Deployment

### Environment Variables:
```bash
# .env file
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-char-password
ADMIN_EMAIL=admin@must.ac.tz
```

### Updated Configuration:
```javascript
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER || 'admin@must.ac.tz',
    pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
  }
};
```

## Testing Checklist

- [ ] Gmail 2-factor authentication enabled
- [ ] App password generated and saved
- [ ] EMAIL_CONFIG updated with real credentials
- [ ] Admin email in database matches Gmail address
- [ ] Server restarted after configuration
- [ ] Student password reset test successful
- [ ] Lecturer password reset test successful
- [ ] Reset codes received in Gmail inbox
- [ ] Reset codes work for password reset

## Result

### ✅ **Real Email Delivery:**
- Students receive actual reset codes in Gmail
- Lecturers receive actual reset codes in Gmail
- Professional HTML email templates
- Secure 15-minute code expiration

### ✅ **Complete Workflow:**
1. User requests password reset
2. System generates 6-digit code
3. **Real email sent to user's Gmail**
4. User receives email with reset code
5. User enters code and sets new password
6. Confirmation email sent

### ✅ **Security Features:**
- No reset codes displayed in browser
- Codes sent directly to user emails
- Professional branded emails
- Secure SMTP authentication

**System now sends REAL emails to users' Gmail accounts for password reset!**
