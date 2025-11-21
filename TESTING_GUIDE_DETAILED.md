# 🧪 TESTING GUIDE - JINSI YA KUJARIBU MABADILIKO

## TATIZO #1: ACADEMIC SETTINGS - DATA PERSISTENCE TEST

### TEST CASE 1.1: Basic Save & Refresh

**Precondition:** Admin is logged in and can access Admin Portal

**Steps:**
1. Navigate to **Academic Settings** page
2. In the "Academic Year & Semester" section:
   - Enter Academic Year Name: `2025/2026`
   - Enter Start Date: `2025-01-15`
   - Enter End Date: `2025-12-31`
   - ✅ Check: "Set as active academic year" checkbox

3. Click **"Add Academic Year"** button
   - ⏳ Wait for success alert
   - Alert message: `✅ Academic year "2025/2026" added and activated`

4. Now for Semester:
   - Select Semester: `Semester 1` (from dropdown)
   - Select Academic Year: `2025/2026` (from dropdown) ← **IMPORTANT**
   - Enter Start Date: `2025-01-15`
   - Enter End Date: `2025-05-31`
   - ✅ Check: "Set as active semester" checkbox

5. Click **"Add Semester"** button
   - ⏳ Wait for success alert
   - Alert message: `✅ Semester "Semester 1" added successfully`

6. **CRITICAL TEST:** Click **Refresh Page** (F5 or Ctrl+R)
   - ⏳ Wait for page to reload

**Expected Results:**
- ✅ Academic year dropdown should show: `2025/2026` (NOT "Select academic year")
- ✅ Semester dropdown should show: `Semester 1`
- ✅ Selected academic year visible in the Academic Year & Semester form

**If this works:** ✅ FIX #1 IS SUCCESSFUL

---

### TEST CASE 1.2: Multiple Year Changes

**Steps:**
1. In Academic Settings, add another academic year:
   - Academic Year: `2026/2027`
   - Check: "Set as active academic year"
   - Click Add

2. Observe dropdown - should show `2026/2027`

3. Add semester for this year
4. **Refresh page**

**Expected Results:**
- ✅ Dropdown still shows `2026/2027` after refresh
- ✅ Multiple academic years visible in list with correct active badge

---

### TEST CASE 1.3: Verify Database Persistence

**Steps:**
1. Add academic year as per Test 1.1
2. Save & refresh successfully
3. Open browser Developer Tools (F12)
4. Go to **Console** tab
5. Type: `console.log('Check network tab for GET request to /api/academic-periods/active')`

6. Watch Network tab:
   - Look for request: `/api/academic-periods/active`
   - Response should contain: `academic_year: "2025/2026"` and `is_active: true`

**Expected Results:**
- ✅ API response shows correct saved data
- ✅ No duplicate records in response

---

## TATIZO #2: REPORTS - TOTAL STUDENTS DISPLAY TEST

### TEST CASE 2.1: Basic Load & Display

**Precondition:** Admin is logged in, database contains at least 5 students

**Steps:**
1. Navigate to **Reports & Analytics** page
2. ⏳ Wait for data to load (should see "Loading real data from database..." initially)
3. Look at the grid showing stats cards

**Expected Results:**
- ✅ "Total Students" card shows: **NUMBER > 0** (not 0!)
- ✅ "Total Lecturers" card shows: **NUMBER > 0**
- ✅ "Active Courses" card shows: **NUMBER > 0**
- ✅ "Total Programs" card shows: **NUMBER > 0**
- ✅ Example: Total Students might show `45` or similar actual count

**If numbers are greater than 0:** ✅ FIX #2 IS SUCCESSFUL

---

### TEST CASE 2.2: Verify Auth Token Usage

**Steps:**
1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Navigate to Reports page (if not already there)
4. Look for console messages:
   - Should see: `=== FETCHING REAL REPORTS DATA ===`
   - Should see: `Auth token available: true`
   - Should see: `Students: [number] Active: [number]`

5. Go to **Network** tab
6. Look for requests:
   - `/api/students?user_type=admin`
   - `/api/lecturers`
   - `/api/courses`
   - `/api/programs`

7. Click on each request, go to **Headers**:
   - Look for: `Authorization: Bearer [token...]`
   - Should be PRESENT

**Expected Results:**
- ✅ Auth token logged as available
- ✅ Authorization header present in all API requests
- ✅ Requests return 200 OK (not 401 Unauthorized)
- ✅ Data loads successfully

---

### TEST CASE 2.3: Cross-Check with Database

**Steps (requires database access):**
1. Open your database client (pgAdmin, DBeaver, etc.)
2. Run query: `SELECT COUNT(*) as total FROM students WHERE is_active = true;`
3. Note the number
4. Go back to Reports page in Admin Portal
5. Check "User Activity" section - "Students" card
6. Check the "Active Students" number

**Expected Results:**
- ✅ Database count matches Reports display count
- ✅ Numbers are consistent

---

## DEBUGGING - IF TESTS FAIL

### Problem: Academic Settings - Dropdown Still Shows "Select academic year" After Refresh

**Debug Steps:**
1. Open browser Console (F12)
2. Check for errors - should see none
3. Look for log: `Error loading active academic period:`
4. If present, note the error message

**Likely Causes:**
- Backend `/api/academic-periods/active` endpoint not responding
- Database table `academic_periods` is empty
- No active academic period set in database

**Solution:**
- Add academic year first
- Click "Add Academic Year" button
- Ensure checkbox "Set as active academic year" is checked
- Click button and wait for alert

---

### Problem: Reports Page Shows 0 for All Counts

**Debug Steps:**
1. Open browser Console (F12)
2. Look for log: `Auth token available: true` or `Auth token available: false`
3. If `false`: User not properly logged in or token not in localStorage

**Check Auth Token:**
```javascript
// In browser console:
const user = JSON.parse(localStorage.getItem('currentUser'));
console.log('Current user:', user);
console.log('Token present:', !!user.token || !!user.jwt);
```

4. Look for errors starting with `Error fetching reports data:`
5. Check Network tab:
   - API requests showing 401 Unauthorized?
   - Response error messages?

**Likely Causes:**
- User not logged in (logout and login again)
- Token expired (refresh page and login again)
- localStorage cleared
- Backend endpoint not responding

**Solution:**
- Logout and login again
- Ensure you're logged in as **Admin** (not student/lecturer)
- Clear browser cache and refresh

---

## REGRESSION TESTS

### Ensure Existing Features Still Work

**Test 1: Login Still Works**
- Login as Admin
- ✅ Should redirect to dashboard
- ✅ No errors

**Test 2: Navigation Still Works**
- Click on "Academic Settings"
- ✅ Should load page
- Click on "Reports & Analytics"
- ✅ Should load page

**Test 3: Other Features Unchanged**
- Test Student Information page
- ✅ Should work as before
- Test Lecturer Information page
- ✅ Should work as before

---

## PERFORMANCE TESTS

### Test 1: Page Load Time

**Academic Settings:**
- Load time should be < 3 seconds
- Data fetch should be < 2 seconds

**Reports:**
- Initial load: < 4 seconds
- Data fetch: < 3 seconds
- All API calls should complete successfully

---

## FINAL CHECKLIST

- [ ] Academic Settings dropdown retains value after refresh
- [ ] Academic Settings data matches database
- [ ] Reports Total Students shows correct count (not 0)
- [ ] Reports all cards show data
- [ ] Auth token properly retrieved and sent
- [ ] No console errors
- [ ] No network errors (401, 500, etc.)
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] Existing features unaffected

---

## DEPLOYMENT VERIFICATION

After deployment to production:

**Step 1: Clear Browser Cache**
```
Ctrl+Shift+Delete (Windows)
Cmd+Shift+Delete (Mac)
```

**Step 2: Test Academic Settings**
- Login → Academic Settings
- Add year and semester
- Refresh page
- ✅ Values should persist

**Step 3: Test Reports**
- Login → Reports & Analytics
- ✅ Counts should be > 0
- ✅ Console should show auth token available

**Step 4: Verify No Errors**
- Press F12 for console
- ✅ No red error messages
- ✅ Only normal logs

---

## SUCCESS CRITERIA

✅ **All tests pass** = Fixes are working correctly  
✅ **No errors** = Code is clean  
✅ **Data persists** = Database integration working  
✅ **Numbers display** = Auth working  

**If all above are true, you are ready for production!**

---

*Testing Guide v1.0 - November 19, 2025*
