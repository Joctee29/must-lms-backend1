# LECTURER PORTAL DATA DEBUGGING GUIDE

## 🔍 TATIZO: Data Hazionekani

Kama data bado hazionekani, fanya hivi:

## STEP 1: Check Browser Console

1. **Fungua Lecturer Portal**
2. **Press F12** (Developer Tools)
3. **Click "Console" tab**
4. **Login na lecturer account**
5. **Angalia messages**

### ✅ Expected Console Output (Successful):
```
=== LECTURER LOGIN ATTEMPT ===
Employee ID: MUST/LECT/2024/001
Backend Response: {success: true, data: {...}}
✅ Login successful!
User Data: {id: 1, username: "MUST/LECT/2024/001", ...}

=== DASHBOARD DATA FETCH ===
Current User: {username: "MUST/LECT/2024/001", ...}
Fetching from: https://must-lms-backend.onrender.com/api/lecturers?username=MUST%2FLECT%2F2024%2F001
Lecturer Response Status: 200
✅ Found Lecturer: {id: 1, name: "Dr. John Doe", ...}

Fetching programs from: https://must-lms-backend.onrender.com/api/programs?lecturer_username=...
Programs Response Status: 200
✅ Lecturer Regular Programs: 3
✅ Added Short-Term Programs: 2
📊 FINAL PROGRAMS COUNT: 5
```

### ❌ Problem Scenarios:

#### Scenario 1: Lecturer Not Found
```
❌ Lecturer not found in database
Searched for username: MUST/LECT/2024/001
```
**Solution:** Lecturer account haipo kwenye database. Admin anahitaji kuadd.

#### Scenario 2: No Programs Found
```
✅ Found Lecturer: {...}
⚠️ No regular programs assigned to this lecturer
⚠️ No short-term programs assigned to this lecturer
📊 FINAL PROGRAMS COUNT: 0
```
**Solution:** Lecturer hana programs assigned. Admin anahitaji kuassign programs.

#### Scenario 3: Login Failed
```
Backend Response: {success: false, error: "Invalid username or password"}
```
**Solution:** Check password au employee_id sio sahihi.

---

## STEP 2: Test Backend API Directly

### Test 1: Check if Lecturer Exists
```bash
# Open browser and go to:
https://must-lms-backend.onrender.com/api/lecturers

# Should return list of all lecturers
# Find your lecturer in the list
```

### Test 2: Check Specific Lecturer
```bash
# Replace EMPLOYEE_ID with actual employee_id
https://must-lms-backend.onrender.com/api/lecturers?username=MUST/LECT/2024/001

# Should return:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dr. John Doe",
      "employee_id": "MUST/LECT/2024/001",
      "email": "john.doe@must.ac.tz",
      ...
    }
  ]
}
```

### Test 3: Check Programs for Lecturer
```bash
# Replace with your employee_id
https://must-lms-backend.onrender.com/api/programs?lecturer_username=MUST/LECT/2024/001

# Should return programs assigned to this lecturer
```

---

## STEP 3: Check Database (Admin Only)

### SQL Queries to Run:

```sql
-- 1. Check if lecturer exists
SELECT * FROM lecturers WHERE employee_id = 'MUST/LECT/2024/001';

-- 2. Check all lecturers
SELECT id, name, employee_id, email FROM lecturers;

-- 3. Check programs assigned to lecturer
SELECT * FROM programs WHERE lecturer_name = 'MUST/LECT/2024/001' 
   OR lecturer_id = 1;

-- 4. Check if lecturer_name matches employee_id
SELECT id, name, lecturer_name, lecturer_id FROM programs;
```

---

## STEP 4: Common Problems & Solutions

### Problem 1: Lecturer Account Doesn't Exist
**Symptoms:**
- Login fails
- "Lecturer not found" error

**Solution:**
Admin needs to create lecturer account:
1. Go to Admin Portal
2. Navigate to "Lecturers" section
3. Click "Add New Lecturer"
4. Fill in details:
   - Name
   - Employee ID (e.g., MUST/LECT/2024/001)
   - Email
   - Password
   - Specialization
5. Save

### Problem 2: No Programs Assigned
**Symptoms:**
- Login successful
- Dashboard shows 0 programs
- "No programs assigned" message

**Solution:**
Admin needs to assign programs:
1. Go to Admin Portal
2. Navigate to "Programs" section
3. Edit existing program OR create new one
4. Set "Lecturer Name" = Employee ID (e.g., MUST/LECT/2024/001)
5. OR set "Lecturer ID" = Lecturer's database ID
6. Save

### Problem 3: lecturer_name Field Mismatch
**Symptoms:**
- Lecturer exists
- Programs exist
- But programs don't show for lecturer

**Solution:**
Check if `lecturer_name` in programs table matches `employee_id`:

```sql
-- Check current values
SELECT id, name, lecturer_name, lecturer_id FROM programs;

-- Update if needed
UPDATE programs 
SET lecturer_name = 'MUST/LECT/2024/001' 
WHERE id = 1;
```

### Problem 4: Backend Not Deployed
**Symptoms:**
- Network errors in console
- "Failed to connect to server"
- 404 or 500 errors

**Solution:**
1. Check if backend is running on Render
2. Check backend URL is correct
3. Wait for Render to deploy latest changes (takes 2-5 minutes)

---

## STEP 5: Manual Testing Checklist

- [ ] Backend is deployed and running
- [ ] Lecturer account exists in database
- [ ] Lecturer can login successfully
- [ ] Browser console shows no errors
- [ ] Lecturer info appears on dashboard
- [ ] Programs are assigned to lecturer in database
- [ ] Programs appear on "My Programs" page
- [ ] Students appear (if enrolled in programs)

---

## STEP 6: Create Test Data (If Database is Empty)

### Create Test Lecturer:
```sql
INSERT INTO lecturers (name, employee_id, email, password, specialization, phone)
VALUES (
  'Dr. Test Lecturer',
  'MUST/LECT/2024/001',
  'test.lecturer@must.ac.tz',
  'test123',
  'Computer Science',
  '+255 123 456 789'
);
```

### Create Test Program:
```sql
-- First get the lecturer ID
SELECT id FROM lecturers WHERE employee_id = 'MUST/LECT/2024/001';
-- Let's say it returns id = 1

-- Create program
INSERT INTO programs (name, course_id, lecturer_name, lecturer_id, credits, total_semesters, duration)
VALUES (
  'Introduction to Programming',
  1,  -- Assuming course_id 1 exists
  'MUST/LECT/2024/001',  -- MUST match employee_id
  1,  -- Lecturer ID from above
  3,
  1,
  '14 weeks'
);
```

### Enroll Test Student:
```sql
-- Get program's course_id
SELECT course_id FROM programs WHERE lecturer_name = 'MUST/LECT/2024/001';
-- Let's say it returns course_id = 1

-- Enroll student
INSERT INTO students (name, registration_number, email, password, course_id, academic_year, current_semester)
VALUES (
  'Test Student',
  'MUST/2024/001',
  'test.student@must.ac.tz',
  'test123',
  1,  -- Same course_id as program
  '2024/2025',
  1
);
```

---

## STEP 7: Contact Support

If all above steps fail, provide this information:

1. **Browser Console Logs** (Copy all red errors)
2. **Network Tab** (F12 → Network → Show failed requests)
3. **Employee ID** used for login
4. **Screenshots** of error messages
5. **Backend Response** from test URLs above

---

## Quick Fix Commands

### Clear Browser Cache:
```
Ctrl + Shift + Delete (Windows)
Cmd + Shift + Delete (Mac)
```

### Force Refresh:
```
Ctrl + F5 (Windows)
Cmd + Shift + R (Mac)
```

### Check Backend Status:
```
https://must-lms-backend.onrender.com/api/lecturers
```

---

## Expected Behavior After Fixes:

1. ✅ Login shows welcome message
2. ✅ Dashboard displays lecturer info
3. ✅ Programs count shows correct number
4. ✅ Students count shows enrolled students
5. ✅ My Programs page lists all assigned programs
6. ✅ Students page shows students in lecturer's programs
7. ✅ Content Manager allows uploads
8. ✅ Assessments can be created

---

**Last Updated:** November 6, 2025  
**Status:** Debugging Guide Ready
