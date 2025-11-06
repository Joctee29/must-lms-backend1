# ASSIGNMENT WORKFLOW DEBUGGING GUIDE

## 🔍 TATIZO: Assignments Hazifiki kwa Student Portal

### SULUHISHO LILILOTEKELEZWA

Nimeongeza **FLEXIBLE PROGRAM MATCHING** ambayo inalinganisha program names kwa njia **NANE (4)**:

1. **Exact Match** - Jina sawa kabisa (case-insensitive)
2. **Contains Match** - Assignment program ina student program
3. **Reverse Contains** - Student program ina assignment program  
4. **Word Match** - Maneno muhimu yanafanana (2+ words)

---

## 📊 JINSI YA KUCHUNGUZA TATIZO

### Step 1: Angalia Backend Logs

Wakati student anaangalia assignments, backend inapaswa kuonyesha:

```
=== STUDENT ASSIGNMENTS QUERY RESULT ===
Active assignments for students found: 3
Assignments: [
  { id: 1, title: 'Math Assignment', program: 'Computer Science', ... },
  { id: 2, title: 'Programming Task', program: 'Software Engineering', ... }
]

=== ALL ASSIGNMENTS IN DATABASE ===
Total assignments: 5
  - [active] Math Assignment (Computer Science) - Deadline: 2025-11-10
  - [active] Programming Task (Software Engineering) - Deadline: 2025-11-12
  - [expired] Old Assignment (IT) - Deadline: 2025-10-01
```

**Angalia**:
- ✅ Je, kuna assignments kwenye database?
- ✅ Je, status ni 'active'?
- ✅ Je, deadline haijapita?
- ✅ Je, program_name iko?

### Step 2: Angalia Student Portal Console

Wakati student anaangalia assignments, browser console inapaswa kuonyesha:

```javascript
=== FETCHING ASSIGNMENTS ===
Current User: { username: 'student123', ... }
Students data: { success: true, data: [...] }
Found student data: { name: 'John Doe', course_id: 1, ... }
Student programs: [
  { id: 1, name: 'Computer Science', course_id: 1 },
  { id: 2, name: 'Software Engineering', course_id: 1 }
]
Student program names: ['Computer Science', 'Software Engineering']

All published assessments: [...]
All traditional assignments: [
  { id: 1, title: 'Math Assignment', program_name: 'Computer Science', status: 'active' }
]

✅ EXACT MATCH: "Computer Science" === "Computer Science"
Assignment "Math Assignment": Program=Computer Science, MatchesProgram=true, Status=active, Active=true

=== FINAL COMBINED ASSIGNMENTS ===
Total assignments found: 1
Student programs: ['Computer Science', 'Software Engineering']
✅ SUCCESS: Found 1 assignments
  - Math Assignment (Computer Science)
```

**Angalia**:
- ✅ Je, student data imepatikana?
- ✅ Je, student programs zimepatikana?
- ✅ Je, program names ni sahihi?
- ✅ Je, kuna program matching?

### Step 3: Angalia Program Name Matching

**Mfano wa Matching**:

| Assignment Program | Student Program | Match Type | Result |
|-------------------|-----------------|------------|--------|
| "Computer Science" | "Computer Science" | Exact | ✅ Match |
| "computer science" | "Computer Science" | Exact (case-insensitive) | ✅ Match |
| "Computer Science 101" | "Computer Science" | Contains | ✅ Match |
| "Computer Science" | "BSc Computer Science" | Reverse Contains | ✅ Match |
| "Software Engineering" | "Software Development" | Word Match (Software) | ✅ Match |
| "Mathematics" | "Computer Science" | No Match | ❌ No Match |

---

## 🛠️ JINSI YA KUTATUA MATATIZO MAALUM

### Tatizo 1: "Hakuna Assignments Zinaonyeshwa"

**Chunguza**:
```javascript
// Browser console
=== FINAL COMBINED ASSIGNMENTS ===
Total assignments found: 0
⚠️ NO ASSIGNMENTS FOUND!
Student programs: ['Computer Science']
```

**Sababu Zinazowezekana**:

1. **Hakuna assignments kwenye database**
   ```sql
   -- Angalia database
   SELECT * FROM assignments WHERE status = 'active';
   ```
   - Kama hakuna matokeo: Lecturer hajawahi kuunda assignment
   - Suluhisho: Lecturer aunde assignment

2. **Assignments zote zimeisha (expired)**
   ```sql
   SELECT * FROM assignments WHERE deadline > NOW();
   ```
   - Kama hakuna matokeo: Deadline zimepita
   - Suluhisho: Lecturer aunde assignments mpya

3. **Program names hazilingani**
   ```sql
   -- Angalia program names kwenye assignments
   SELECT DISTINCT program_name FROM assignments;
   -- Result: ['computer science', 'Software Eng']
   
   -- Angalia program names kwenye programs table
   SELECT DISTINCT name FROM programs;
   -- Result: ['Computer Science', 'Software Engineering']
   ```
   - Mismatch: 'computer science' vs 'Computer Science'
   - Suluhisho: **TAYARI IMETATULIWA** - Flexible matching inashughulikia hii!

4. **Student hajajiandikisha kwenye program**
   ```sql
   SELECT p.* FROM programs p
   JOIN students s ON p.course_id = s.course_id
   WHERE s.username = 'student123';
   ```
   - Kama hakuna matokeo: Student hana program
   - Suluhisho: Admin aongeze student kwenye course

### Tatizo 2: "Baadhi ya Assignments Zinaonyeshwa, Zingine Hapana"

**Chunguza Console**:
```javascript
Assignment "Math Assignment": Program=Computer Science, MatchesProgram=true ✅
Assignment "Physics Assignment": Program=Physics, MatchesProgram=false ❌
```

**Sababu**: Student hana program ya Physics

**Suluhisho**:
- Kama student anapaswa kuona: Admin aongeze program
- Kama assignment ni ya program nyingine: Lecturer arekebishe program name

### Tatizo 3: "Lecturer Anaona Assignment, Student Haoni"

**Chunguza**:
1. **Status**: Je, status ni 'active'?
   ```sql
   SELECT id, title, status FROM assignments WHERE id = 123;
   ```
   - Kama status = 'draft' au 'expired': Haionekani kwa students
   - Suluhisho: Lecturer abadilishe status kuwa 'active'

2. **Deadline**: Je, deadline haijapita?
   ```sql
   SELECT id, title, deadline FROM assignments WHERE id = 123;
   ```
   - Kama deadline < NOW(): Haionekani
   - Suluhisho: Lecturer abadilishe deadline

3. **Program Name**: Je, program name inalingana?
   ```javascript
   // Console log
   ❌ NO MATCH: "Computer Science 101" vs "Computer Science"
   ```
   - Suluhisho: **TAYARI IMETATULIWA** - Flexible matching inashughulikia!

---

## 🧪 TESTING CHECKLIST

### Test 1: Create Assignment (Lecturer)

1. **Login kama Lecturer**
2. **Nenda Assignments → Create New**
3. **Jaza**:
   - Title: "Test Assignment 1"
   - Program: Chagua kutoka dropdown
   - Deadline: Tarehe ya baadaye
   - Description: "This is a test"
4. **Bonyeza "Send Assignment to Students"**
5. **Angalia**:
   - ✅ Alert "Assignment created successfully!"
   - ✅ Assignment inaonyeshwa kwenye list

### Test 2: View Assignment (Student)

1. **Login kama Student** (wa program ile ile)
2. **Nenda Assignments**
3. **Angalia Browser Console** (F12):
   ```javascript
   === FETCHING ASSIGNMENTS ===
   Student programs: ['Computer Science']
   All traditional assignments: [...]
   ✅ EXACT MATCH: "Computer Science" === "Computer Science"
   ✅ SUCCESS: Found 1 assignments
   ```
4. **Angalia UI**:
   - ✅ Assignment "Test Assignment 1" inaonyeshwa
   - ✅ Program name inalingana
   - ✅ Deadline inaonyeshwa
   - ✅ "Submit" button iko

### Test 3: Program Name Variations

**Test Case 1: Exact Match**
- Lecturer: Chagua "Computer Science"
- Database: program_name = "Computer Science"
- Student: Program = "Computer Science"
- **Result**: ✅ MATCH

**Test Case 2: Case Mismatch**
- Lecturer: Chagua "computer science"
- Database: program_name = "computer science"
- Student: Program = "Computer Science"
- **Result**: ✅ MATCH (case-insensitive)

**Test Case 3: Partial Match**
- Lecturer: Chagua "Computer Science 101"
- Database: program_name = "Computer Science 101"
- Student: Program = "Computer Science"
- **Result**: ✅ MATCH (contains)

**Test Case 4: Word Match**
- Lecturer: Chagua "Software Engineering"
- Database: program_name = "Software Engineering"
- Student: Program = "Software Development"
- **Result**: ✅ MATCH (word: Software)

---

## 📝 SQL QUERIES ZA DEBUGGING

### Query 1: Angalia Assignments Zote
```sql
SELECT 
  id,
  title,
  program_name,
  status,
  deadline,
  lecturer_name,
  created_at
FROM assignments
ORDER BY created_at DESC;
```

### Query 2: Angalia Active Assignments
```sql
SELECT 
  id,
  title,
  program_name,
  deadline
FROM assignments
WHERE status = 'active' 
  AND deadline > NOW()
ORDER BY deadline ASC;
```

### Query 3: Angalia Student Programs
```sql
SELECT 
  s.username,
  s.name,
  c.name as course_name,
  p.name as program_name
FROM students s
JOIN courses c ON s.course_id = c.id
JOIN programs p ON p.course_id = c.id
WHERE s.username = 'STUDENT_USERNAME';
```

### Query 4: Angalia Program Name Mismatches
```sql
-- Program names kwenye assignments
SELECT DISTINCT program_name FROM assignments;

-- Program names kwenye programs table
SELECT DISTINCT name FROM programs;

-- Compare manually
```

### Query 5: Angalia Assignment Details
```sql
SELECT 
  a.*,
  COUNT(s.id) as submission_count
FROM assignments a
LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
WHERE a.id = ASSIGNMENT_ID
GROUP BY a.id;
```

---

## 🔧 QUICK FIXES

### Fix 1: Badilisha Assignment Status
```sql
UPDATE assignments 
SET status = 'active' 
WHERE id = ASSIGNMENT_ID;
```

### Fix 2: Badilisha Deadline
```sql
UPDATE assignments 
SET deadline = '2025-12-31 23:59:59' 
WHERE id = ASSIGNMENT_ID;
```

### Fix 3: Badilisha Program Name
```sql
UPDATE assignments 
SET program_name = 'Computer Science' 
WHERE id = ASSIGNMENT_ID;
```

### Fix 4: Ongeza Student kwenye Program
```sql
-- First, get course_id for the program
SELECT course_id FROM programs WHERE name = 'Computer Science';

-- Then update student
UPDATE students 
SET course_id = COURSE_ID 
WHERE username = 'STUDENT_USERNAME';
```

---

## 🎯 EXPECTED BEHAVIOR

### Lecturer Side:
1. ✅ Anaona programs zake kwenye dropdown
2. ✅ Anaweza kuunda assignment
3. ✅ Assignment inahifadhiwa na status 'active'
4. ✅ Anaona assignment kwenye list yake

### Student Side:
1. ✅ Anaona assignments za programs zake
2. ✅ Program matching inafanya kazi (flexible)
3. ✅ Anaweza kuwasilisha assignment
4. ✅ Submission inahifadhiwa

### Backend:
1. ✅ Assignments zinahifadhiwa kwenye database
2. ✅ Status = 'active' kwa assignments mpya
3. ✅ Deadline inachecked
4. ✅ Program names zinachecked (flexible)

---

## 🚨 COMMON MISTAKES

### Mistake 1: Wrong Status
```javascript
// ❌ Wrong
status: 'draft'  // Students can't see

// ✅ Correct
status: 'active'  // Students can see
```

### Mistake 2: Past Deadline
```javascript
// ❌ Wrong
deadline: '2025-01-01'  // Past date

// ✅ Correct
deadline: '2025-12-31'  // Future date
```

### Mistake 3: Wrong Program Name
```javascript
// ❌ Might not match
program_name: 'CS'  // Too short

// ✅ Better
program_name: 'Computer Science'  // Full name
```

### Mistake 4: Student Not Enrolled
```sql
-- ❌ Student has no course_id
SELECT * FROM students WHERE username = 'student123';
-- Result: course_id = NULL

-- ✅ Student enrolled
SELECT * FROM students WHERE username = 'student123';
-- Result: course_id = 1
```

---

## 📞 ESCALATION

### Level 1: Check Console Logs
- Browser console (F12)
- Backend server logs
- Look for errors or warnings

### Level 2: Check Database
- Run SQL queries above
- Verify data exists
- Check relationships

### Level 3: Contact Support
- Provide console logs
- Provide database query results
- Describe exact steps to reproduce

---

**Last Updated**: November 5, 2025
**Version**: 3.0
**Status**: ✅ FLEXIBLE MATCHING ENABLED
