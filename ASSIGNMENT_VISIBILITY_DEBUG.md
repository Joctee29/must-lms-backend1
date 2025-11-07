# Assignment Visibility Debugging Guide

## Tatizo: Assignments hazionekani kwenye portal ya mwanafunzi

### Sababu Zinazowezekana:

1. **Program Name Mismatch** - Jina la program kwenye assignment halifanani na jina la program ya mwanafunzi
2. **Missing program_id** - Assignment haina program_id iliyowekwa
3. **Student Course Not Linked to Programs** - Course ya mwanafunzi haina programs zilizounganishwa
4. **Wrong Student Username** - Username ya mwanafunzi haifanani na ile iliyotumika kufetch assignments

### Hatua za Debugging:

## 1. Angalia Backend Logs

Fungua backend console na uangalie logs wakati mwanafunzi anaingiza portal:

```
=== FETCHING ASSIGNMENTS ===
Student Username: [username]
✅ Student Info Found: { id, name, course_id, course_name }
✅ Student Programs Found: [number]
   Program Names: [list of programs]
   Program IDs: [list of IDs]
📋 Total assignments in database: [number]

🔍 Checking assignment: "[title]"
   Assignment program_id: [id]
   Assignment program_name: [name]
   Comparing: "[student program]" vs "[assignment program]"
   ✅ MATCH via program_id: [id]
   OR
   ❌ NO MATCH - Assignment not visible to this student
```

## 2. Kama Hakuna Programs

Ukiona hii warning:
```
⚠️ WARNING: Student has NO programs assigned to their course!
```

**Suluhisho:**
- Hakikisha course ya mwanafunzi ina programs zilizounganishwa kwenye database
- Angalia kwenye Admin Portal > Programs > Verify course_id

## 3. Kama Hakuna Matches

Ukiona hii warning:
```
⚠️ WARNING: NO ASSIGNMENTS MATCHED!
```

**Angalia:**

### A. Program Names Zinafanana?
- Student program: "Computer Science"
- Assignment program: "computer science" ❌ (case sensitive!)
- Assignment program: "Computer Science" ✅

### B. Program ID Imewekwa?
```sql
-- Check assignments table
SELECT id, title, program_id, program_name FROM assignments;
```

Kama `program_id` ni `NULL`, assignment itatumia name matching tu.

### C. Student ana program sahihi?
```sql
-- Check student's programs
SELECT s.name as student_name, c.name as course_name, p.id as program_id, p.name as program_name
FROM students s
LEFT JOIN courses c ON s.course_id = c.id
LEFT JOIN programs p ON p.course_id = c.id
WHERE s.registration_number = 'STUDENT_REG_NUMBER';
```

## 4. Suluhisho za Haraka

### A. Fix Program ID for Existing Assignments

Tumia endpoint hii kufanya update:
```bash
POST http://localhost:5000/api/assignments/add-program-id
```

### B. Recreate Assignment na Program Sahihi

1. Nenda Lecturer Portal
2. Create assignment mpya
3. Chagua program EXACTLY kama inavyoonekana kwenye dropdown
4. Angalia logs kuona kama program_name inafanana

### C. Verify Student's Course and Programs

```sql
-- Check if student's course has programs
SELECT 
  s.id as student_id,
  s.name as student_name,
  s.course_id,
  c.name as course_name,
  COUNT(p.id) as program_count
FROM students s
LEFT JOIN courses c ON s.course_id = c.id
LEFT JOIN programs p ON p.course_id = c.id
WHERE s.registration_number = 'STUDENT_REG_NUMBER'
GROUP BY s.id, s.name, s.course_id, c.name;
```

Kama `program_count = 0`, ongeza programs kwenye course hiyo.

## 5. Test Assignment Visibility

### Frontend Console (Student Portal)

Fungua browser console kwenye student portal:

```javascript
// Check current user
console.log(JSON.parse(localStorage.getItem('currentUser')));

// Check what assignments are being fetched
// Look for: "✅ Received X filtered assignments from backend"
```

### Backend Test

```bash
# Test assignment fetch for specific student
curl "http://localhost:5000/api/assignments?student_username=STUDENT_USERNAME"
```

## 6. Common Fixes

### Fix 1: Update Assignment Program ID

```sql
-- Find program ID
SELECT id, name FROM programs WHERE name = 'Computer Science';

-- Update assignment
UPDATE assignments 
SET program_id = [PROGRAM_ID]
WHERE program_name = 'Computer Science' AND program_id IS NULL;
```

### Fix 2: Ensure Exact Program Name Match

```sql
-- Check for mismatches
SELECT DISTINCT a.program_name as assignment_program, p.name as actual_program
FROM assignments a
LEFT JOIN programs p ON LOWER(TRIM(a.program_name)) = LOWER(TRIM(p.name));
```

### Fix 3: Add Programs to Course

```sql
-- Add program to course
INSERT INTO programs (name, course_id, lecturer_id, lecturer_name)
VALUES ('Computer Science', [COURSE_ID], [LECTURER_ID], 'Lecturer Name');
```

## 7. Verification Steps

✅ **Backend logs show:**
- Student found
- Programs found (> 0)
- Assignments checked
- Matches found

✅ **Frontend shows:**
- Assignments list populated
- Correct program names displayed

✅ **Database shows:**
- Assignments have program_id OR exact program_name
- Student's course has programs
- Programs match between student and assignments

## 8. Contact Points

Kama bado kuna tatizo:
1. Share backend logs (full output from "=== FETCHING ASSIGNMENTS ===" section)
2. Share student info (username, course_id)
3. Share assignment info (title, program_name, program_id)
4. Share SQL query results from verification steps
