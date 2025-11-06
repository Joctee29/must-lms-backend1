# TATIZO LA DATA KWENYE LECTURE PORTAL - SULUHISHO

## TATIZO LILILOPATIKANA (Issues Found)

Baada ya kuchunguza mfumo, nimeona matatizo yafuatayo:

### 1. **Data Haionyeshwi Vizuri (Data Not Displaying Properly)**
   - Dashboard inaonyesha "No programs assigned" hata kama kuna programs
   - Students hawajionekani au wanaonyeshwa wachache
   - Content Manager haina data
   - Notifications hazifanyi kazi vizuri

### 2. **Sababu Kuu (Root Causes)**

#### A. **Lecturer Profile Haipo Database (Lecturer Not in Database)**
```javascript
// Dashboard.tsx line 75-81
if (!lecturer) {
  console.log('❌ Lecturer not found in database');
  setError('Lecturer profile not found. Please contact admin...');
  return;
}
```
**TATIZO:** Kama lecturer profile haipo kwenye database, hakuna data itakayoonekana.

#### B. **Username Mismatch (Jina Haliolingana)**
```javascript
// Backend server.js line 834-835
'SELECT ... FROM lecturers WHERE employee_id = $1 OR email = $1 OR name = $1'
```
**TATIZO:** Username kwenye localStorage lazima ilingane na `employee_id`, `email`, au `name` kwenye database.

#### C. **Programs Hazijaunganishwa Vizuri (Programs Not Linked Properly)**
```javascript
// Dashboard.tsx line 84-85
const programsUrl = `${API_BASE_URL}/programs?lecturer_username=${encodeURIComponent(currentUser.username)}`;
```
**TATIZO:** Programs zinahitaji kuwa na `lecturer_name` au `lecturer_id` inayolingana na lecturer.

#### D. **Students Filtering Issue**
```javascript
// Students.tsx line 142-144
lecturerStudents = studentsResult.data.filter((student: any) => 
  courseIds.includes(student.course_id)
);
```
**TATIZO:** Kama `course_id` haipo au hailingani, students hawataonekana.

## SULUHISHO (SOLUTIONS)

### HATUA 1: Check Lecturer Profile in Database

**Fungua backend terminal na run:**
```bash
cd backend
node
```

**Ndani ya Node console:**
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Check if lecturer exists
pool.query('SELECT * FROM lecturers', (err, result) => {
  if (err) console.error(err);
  else console.log('ALL LECTURERS:', result.rows);
  process.exit();
});
```

### HATUA 2: Add Lecturer if Missing

**Kama lecturer hapo, add manually:**
```sql
INSERT INTO lecturers (name, employee_id, email, phone, specialization, password)
VALUES (
  'Dr. John Doe',           -- Jina la lecturer
  'EMP001',                 -- Employee ID (hii ndio username)
  'john.doe@must.ac.tz',    -- Email
  '+255712345678',          -- Phone
  'Computer Science',       -- Specialization
  '$2b$10$...'              -- Hashed password
);
```

### HATUA 3: Fix Programs Assignment

**Check programs kwenye database:**
```javascript
pool.query('SELECT * FROM programs', (err, result) => {
  if (err) console.error(err);
  else console.log('ALL PROGRAMS:', result.rows);
  process.exit();
});
```

**Update programs kuunganisha na lecturer:**
```sql
-- Update existing programs
UPDATE programs 
SET lecturer_name = 'EMP001',  -- Employee ID ya lecturer
    lecturer_id = 1            -- ID ya lecturer
WHERE id = 1;  -- Program ID
```

### HATUA 4: Fix Students Data

**Check students kwenye database:**
```javascript
pool.query('SELECT * FROM students', (err, result) => {
  if (err) console.error(err);
  else console.log('ALL STUDENTS:', result.rows);
  process.exit();
});
```

**Ensure students wana correct course_id:**
```sql
-- Update students kuunganisha na courses
UPDATE students 
SET course_id = 1  -- ID ya course
WHERE registration_number = 'STD001';
```

### HATUA 5: Frontend Debugging

**Add console logging kwenye Dashboard:**
```javascript
// Dashboard.tsx - Add after line 51
console.log('=== DASHBOARD DEBUG ===');
console.log('1. Current User:', currentUser);
console.log('2. Username:', currentUser?.username);
console.log('3. API URL:', lecturerUrl);
```

**Check browser console:**
1. Fungua Chrome/Edge DevTools (F12)
2. Nenda kwenye Console tab
3. Angalia errors au warnings
4. Tafuta messages za "DASHBOARD DEBUG"

### HATUA 6: Test API Endpoints Directly

**Test kwenye browser au Postman:**

1. **Test Lecturer Endpoint:**
```
GET https://must-lms-backend.onrender.com/api/lecturers?username=EMP001
```

2. **Test Programs Endpoint:**
```
GET https://must-lms-backend.onrender.com/api/programs?lecturer_username=EMP001
```

3. **Test Students Endpoint:**
```
GET https://must-lms-backend.onrender.com/api/students
```

### HATUA 7: Clear Cache & Reload

**Kwenye browser:**
1. Press `Ctrl + Shift + Delete`
2. Clear "Cached images and files"
3. Clear "Cookies and other site data"
4. Reload page (`Ctrl + F5`)

**Au clear localStorage manually:**
```javascript
// Kwenye browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## QUICK FIX SCRIPT

Tumia script hii ku-fix common issues:

```javascript
// Run kwenye browser console (F12)
(async function debugLecturePortal() {
  console.log('=== LECTURE PORTAL DEBUG ===');
  
  // 1. Check current user
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  console.log('1. Current User:', currentUser);
  
  if (!currentUser.username) {
    console.error('❌ No username found! Please login again.');
    return;
  }
  
  // 2. Test lecturer endpoint
  const lecturerUrl = `https://must-lms-backend.onrender.com/api/lecturers?username=${currentUser.username}`;
  console.log('2. Testing:', lecturerUrl);
  
  const lecturerRes = await fetch(lecturerUrl);
  const lecturerData = await lecturerRes.json();
  console.log('3. Lecturer Data:', lecturerData);
  
  if (!lecturerData.success || lecturerData.data.length === 0) {
    console.error('❌ TATIZO: Lecturer profile not found in database!');
    console.log('SULUHISHO: Contact admin to add your profile with username:', currentUser.username);
    return;
  }
  
  // 3. Test programs endpoint
  const programsUrl = `https://must-lms-backend.onrender.com/api/programs?lecturer_username=${currentUser.username}`;
  console.log('4. Testing:', programsUrl);
  
  const programsRes = await fetch(programsUrl);
  const programsData = await programsRes.json();
  console.log('5. Programs Data:', programsData);
  
  if (!programsData.success || programsData.data.length === 0) {
    console.warn('⚠️ WARNING: No programs assigned to this lecturer!');
    console.log('SULUHISHO: Contact admin to assign programs to you.');
  }
  
  // 4. Test students endpoint
  const studentsUrl = `https://must-lms-backend.onrender.com/api/students`;
  console.log('6. Testing:', studentsUrl);
  
  const studentsRes = await fetch(studentsUrl);
  const studentsData = await studentsRes.json();
  console.log('7. Students Data:', studentsData);
  
  console.log('=== DEBUG COMPLETE ===');
  console.log('Summary:');
  console.log('- Lecturer Found:', lecturerData.success && lecturerData.data.length > 0 ? '✅' : '❌');
  console.log('- Programs Found:', programsData.success && programsData.data.length > 0 ? '✅' : '❌');
  console.log('- Students Found:', studentsData.success && studentsData.data.length > 0 ? '✅' : '❌');
})();
```

## COMMON ERRORS & FIXES

### Error 1: "Lecturer profile not found"
**Suluhisho:** Add lecturer profile kwenye database (angalia HATUA 2)

### Error 2: "No programs assigned"
**Suluhisho:** Update programs na lecturer_name/lecturer_id (angalia HATUA 3)

### Error 3: "No students found"
**Suluhisho:** Check course_id matching (angalia HATUA 4)

### Error 4: "Failed to load dashboard data"
**Suluhisho:** Check backend server is running:
```bash
cd backend
npm start
```

### Error 5: "CORS error"
**Suluhisho:** Backend server.js should have:
```javascript
app.use(cors({
  origin: '*',
  credentials: true
}));
```

## TESTING CHECKLIST

Baada ya ku-fix, test yafuatayo:

- [ ] Dashboard inaonyesha lecturer name
- [ ] Dashboard inaonyesha programs count
- [ ] Dashboard inaonyesha students count
- [ ] "My Programs" page inaonyesha programs
- [ ] "Students" page inaonyesha students
- [ ] "Content Manager" inafanya kazi
- [ ] Notifications zinaonyeshwa
- [ ] Profile page ina correct data

## MAWASILIANO (CONTACT)

Kama bado kuna matatizo:

1. **Check backend logs:**
   ```bash
   cd backend
   npm start
   # Angalia console output
   ```

2. **Check frontend console:**
   - Press F12
   - Angalia Console tab
   - Screenshot errors

3. **Share debug info:**
   - Run quick fix script hapo juu
   - Copy output
   - Share na developer

## NEXT STEPS

1. Run diagnostic script kwenye browser console
2. Fix issues kulingana na output
3. Test kila feature
4. Document any remaining issues

---

**Imeandikwa na:** AI Assistant  
**Tarehe:** 2025-01-06  
**Mfumo:** MUST Learning Management System - Lecture Portal
