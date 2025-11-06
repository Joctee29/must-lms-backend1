# QUICK FIX REFERENCE CARD

## 🚨 COMMON ISSUES & INSTANT SOLUTIONS

### Issue: "Students Can't See Assignments"

**Quick Check**:
```javascript
// Open browser console (F12) on student portal
// Look for this log:
"Total assignments found: 0"  // ❌ Problem!
"Total assignments found: 5"  // ✅ Working!
```

**Instant Fix**:
1. Check if lecturer created assignment with correct program name
2. Check if assignment deadline hasn't passed
3. Check if assignment status is 'active' or 'published'
4. Verify student is enrolled in the program

**Database Check**:
```sql
-- Quick check for active assignments
SELECT id, title, program_name, deadline, status 
FROM assignments 
WHERE status = 'active' AND deadline > NOW();

-- Check assessments
SELECT id, title, program_name, end_date, status 
FROM assessments 
WHERE status = 'published';
```

---

### Issue: "Materials Not Loading After Logout"

**Quick Check**:
```javascript
// Open browser console (F12)
// Look for:
"Full URL: https://must-lms-backend.onrender.com/uploads/file.pdf"  // ✅ Good!
"Full URL: blob:http://..."  // ❌ Old system (won't work after logout)
```

**Instant Fix**:
✅ **ALREADY FIXED** in latest code!
- Materials now use permanent backend URLs
- No more blob URLs
- Works across sessions

**Test**:
1. Login → View material → Logout
2. Login again → View same material
3. Should work! ✅

---

### Issue: "Assignment Shows But Wrong Program"

**Quick Fix**:
```sql
-- Check program names match exactly
SELECT DISTINCT program_name FROM assignments;
SELECT DISTINCT name FROM programs;

-- They must match EXACTLY (case-sensitive)
-- Wrong: "Computer science" vs "Computer Science"
-- Right: "Computer Science" vs "Computer Science"
```

---

### Issue: "Video Won't Play"

**Quick Checks**:
1. ✅ File format: MP4 works best
2. ✅ File size: Large files take time to load
3. ✅ Backend URL: Must be accessible
4. ✅ CORS: Must allow video streaming

**Test Direct URL**:
```
https://must-lms-backend.onrender.com/uploads/video.mp4
```
Should play or download.

---

### Issue: "Office Documents Won't Open"

**Current Behavior**:
- Uses Google Docs Viewer
- Requires publicly accessible URL
- May not work for very large files

**Alternative**:
- Click "Download" instead
- Open locally on computer

---

## 🔧 QUICK DIAGNOSTIC COMMANDS

### Check Assignment System
```sql
-- Count active assignments
SELECT COUNT(*) FROM assignments WHERE status = 'active';

-- Count published assessments
SELECT COUNT(*) FROM assessments WHERE status = 'published';

-- Check specific student's programs
SELECT p.name FROM programs p
JOIN courses c ON p.course_id = c.id
JOIN students s ON s.course_id = c.id
WHERE s.username = 'STUDENT_USERNAME';
```

### Check Material System
```sql
-- Count materials
SELECT COUNT(*) FROM content;

-- Check file URLs
SELECT id, title, file_url FROM content LIMIT 10;

-- Verify files exist
-- Run on server: ls backend/uploads/
```

### Check Student Enrollment
```sql
-- Get student's course and programs
SELECT 
  s.username,
  s.course_id,
  c.name as course_name,
  (SELECT COUNT(*) FROM programs WHERE course_id = s.course_id) as program_count
FROM students s
JOIN courses c ON s.course_id = c.id
WHERE s.username = 'STUDENT_USERNAME';
```

---

## 📊 SYSTEM STATUS INDICATORS

### Healthy Assignment System
```
✅ Assignments API returns data
✅ Assessments API returns data
✅ Student sees combined list
✅ Count matches database
✅ Filtering works by program
✅ Submissions save successfully
```

### Healthy Material System
```
✅ Materials list loads
✅ File URLs start with /uploads/
✅ View button opens files
✅ Download button works
✅ Works after logout/login
✅ No blob URL errors
```

---

## 🎯 QUICK TESTING CHECKLIST

### Test Assignment Flow (5 minutes)
1. [ ] Lecturer creates assignment → Check database
2. [ ] Student logs in → Sees assignment
3. [ ] Student submits → Check submissions table
4. [ ] Lecturer sees submission → Verify data

### Test Material Flow (3 minutes)
1. [ ] Upload PDF → Check uploads folder
2. [ ] Student views → Opens in browser
3. [ ] Logout → Login → View again
4. [ ] Should work! ✅

---

## 🚀 EMERGENCY FIXES

### "Nothing Works!"
```bash
# Restart backend server
cd backend
npm start

# Clear browser cache
# Ctrl+Shift+Delete → Clear all

# Check database connection
# Verify DATABASE_URL in .env
```

### "Database Issues"
```sql
-- Reinitialize assignment tables
-- Run: POST /api/assignments/init

-- Reinitialize assessment tables  
-- Run: POST /api/assessments/init

-- Check table structure
\d assignments
\d assessments
\d content
```

### "File Upload Issues"
```bash
# Check uploads directory exists
mkdir -p backend/uploads

# Check permissions
chmod 755 backend/uploads

# Check disk space
df -h
```

---

## 📞 ESCALATION PATH

### Level 1: Self-Service (Try First)
- Check this reference card
- Check browser console
- Check database queries
- Clear cache and retry

### Level 2: Documentation
- Read `ASSIGNMENT_AND_MATERIAL_FIXES.md`
- Read `SULUHISHO_LA_ASSIGNMENT_NA_MATERIAL.md`
- Check system logs

### Level 3: Technical Support
- Provide console logs
- Provide database query results
- Provide screenshots
- Describe exact steps to reproduce

---

## 💡 PRO TIPS

### For Lecturers
- Use exact program names (check dropdown)
- Set realistic deadlines
- Test with student account first
- Check submissions regularly

### For Students
- Refresh page if assignments don't show
- Check you're enrolled in program
- Submit before deadline
- Download materials for offline use

### For Admins
- Monitor backend logs
- Check database regularly
- Backup uploads folder
- Test both assignment systems

---

## 🎓 KEY CONCEPTS

### Two Assignment Systems
1. **Assessments** (New) - Full quiz system with auto-grading
2. **Assignments** (Traditional) - Simple submission system

**Both work together!** Students see both types in one list.

### Material URLs
- **Old**: `blob:http://...` (temporary, lost after logout)
- **New**: `https://backend.com/uploads/file.pdf` (permanent)

### Program Matching
- Must match EXACTLY
- Case-sensitive
- No extra spaces
- Check database for exact names

---

**Quick Reference Version**: 1.0
**Last Updated**: November 5, 2025
**Print This**: Keep handy for troubleshooting!
