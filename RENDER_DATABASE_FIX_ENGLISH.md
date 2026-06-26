# 🔧 Render Database Connection Error Fix

## ❌ The Problem
```
❌ Error in automatic scheduler: getaddrinfo ENOTFOUND dpg-d5hlo7pr0fns73dnvvq0-a
```

This error occurs when:
- DATABASE_URL contains an internal Render hostname that cannot be resolved
- DNS lookup fails because the hostname is incorrect

---

## ✅ SOLUTION: Use External Database URL

### Step 1: Access Render Dashboard
1. Go to https://dashboard.render.com
2. Click on your **PostgreSQL database**

### Step 2: Get External Database URL
1. In the database dashboard, find the **"Connections"** section
2. You'll see two types of URLs:
   - **Internal Database URL** (hostname like `dpg-xxxxx-a`) ❌ DON'T USE THIS
   - **External Database URL** (hostname like `dpg-xxxxx-a.oregon-postgres.render.com`) ✅ USE THIS

### Step 3: Copy External Database URL
The External URL looks like this:
```
postgresql://username:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/database_name
```

**IMPORTANT:** Make sure the URL has:
- Full hostname with domain (`.oregon-postgres.render.com` or `.frankfurt-postgres.render.com`)
- Port number (`:5432`)

### Step 4: Update Environment Variable in Backend Service
1. Go to your **Backend Service** (must-lms-backend)
2. Click the **"Environment"** tab
3. Find the **DATABASE_URL** variable
4. Click **"Edit"** and paste the External Database URL
5. Click **"Save Changes"**

### Step 5: Redeploy Service
1. The service will automatically redeploy after changing the environment variable
2. Or click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🔍 How to Verify Success

After deployment, check the logs for:
```
✅ Connected to PostgreSQL database: LMS_MUST_DB_ORG
```

Instead of:
```
❌ Error in automatic scheduler: getaddrinfo ENOTFOUND dpg-xxxxx-a
```

---

## 📋 Checklist

- [ ] I got the External Database URL from Render dashboard
- [ ] I updated DATABASE_URL in backend service environment variables
- [ ] Service has started redeploying
- [ ] Logs show "Connected to PostgreSQL database"
- [ ] No "ENOTFOUND" errors

---

## 🆘 If You Still Have Issues

### Issue 1: Database URL Not Found
**Solution:** Create a new database on Render:
1. Dashboard → New → PostgreSQL
2. Fill in details and create
3. Copy External Database URL

### Issue 2: Connection Timeout
**Solution:** Make sure:
- Database is in the same region as backend service (e.g., Oregon)
- Database status is "Available" (not "Suspended")

### Issue 3: Authentication Failed
**Solution:** 
- Copy DATABASE_URL again from Render (password may have changed)
- Paste without modifying anything

---

## 💡 Technical Details

### Difference Between Internal and External URL

**Internal URL** (`dpg-xxxxx-a`):
- Only works for services within Render's internal network
- Cannot be accessed from outside
- DNS fails for external services

**External URL** (`dpg-xxxxx-a.oregon-postgres.render.com`):
- Accessible from anywhere
- Has SSL/TLS encryption
- Works for all services

### Why Code Was Changed?

I modified the code to:
1. **Handle ENOTFOUND error** - Scheduler won't spam error messages
2. **Add connection timeout settings** - Make connections more stable
3. **Add helpful error messages** - Guide you on how to fix the issue

---

## 📊 Code Changes Made

### 1. Enhanced Error Handling in Scheduler
```javascript
const client = await pool.connect().catch(err => {
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    console.log('⚠️  Database connection unavailable, skipping scheduler check');
    return null;
  }
  throw err;
});
```

### 2. Better Connection Pool Configuration
```javascript
const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000, // 10 seconds
      idleTimeoutMillis: 30000, // 30 seconds
      max: 20, // Maximum pool size
    }
  : { /* local config */ };
```

### 3. Improved Error Messages
```javascript
if (err.code === 'ENOTFOUND') {
  console.error('⚠️  DNS Error: Database hostname cannot be resolved');
  console.error('💡 Solution: Check your DATABASE_URL in Render dashboard');
  console.error('💡 Make sure you are using the EXTERNAL database URL, not internal');
}
```

---

## 📞 Need More Help?

If you need assistance, provide:
1. Screenshot of Render database dashboard (Connections section)
2. Screenshot of Backend service environment variables
3. Copy of logs from Render backend service

---

**Created: April 21, 2026**
**Author: Kiro AI Assistant**
