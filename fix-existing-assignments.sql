-- ================================================================
-- SQL SCRIPT: FIX EXISTING ASSIGNMENTS
-- Purpose: Update existing assignments to have correct program_id
-- ================================================================

-- Step 1: Check current state of assignments
SELECT 
    id, 
    title, 
    program_name, 
    program_id,
    CASE 
        WHEN program_id IS NULL THEN '❌ Missing program_id'
        ELSE '✅ Has program_id'
    END as status
FROM assignments
ORDER BY created_at DESC;

-- Step 2: Update assignments that have program_name but no program_id
-- This matches program_name (case-insensitive) with programs table
UPDATE assignments a
SET program_id = p.id
FROM programs p
WHERE LOWER(TRIM(a.program_name)) = LOWER(TRIM(p.name))
AND a.program_id IS NULL;

-- Step 3: Verify the update
SELECT 
    a.id, 
    a.title, 
    a.program_name, 
    a.program_id,
    p.name as matched_program_name,
    CASE 
        WHEN a.program_id IS NULL THEN '❌ Still missing program_id'
        WHEN a.program_id = p.id THEN '✅ Correctly matched'
        ELSE '⚠️ Mismatch'
    END as verification_status
FROM assignments a
LEFT JOIN programs p ON a.program_id = p.id
ORDER BY a.created_at DESC;

-- Step 4: Find assignments that still don't have program_id
-- These need manual intervention
SELECT 
    a.id, 
    a.title, 
    a.program_name,
    a.lecturer_name,
    'No matching program found - needs manual fix' as issue
FROM assignments a
WHERE a.program_id IS NULL;

-- Step 5: List all available programs (for manual matching reference)
SELECT 
    id, 
    name, 
    course_id,
    lecturer_id,
    lecturer_name
FROM programs
ORDER BY name;

-- ================================================================
-- MANUAL FIX EXAMPLES (if needed)
-- ================================================================

-- Example 1: If assignment has program_name "Comp Sci" but database has "Computer Science"
-- UPDATE assignments 
-- SET program_id = (SELECT id FROM programs WHERE name = 'Computer Science' LIMIT 1)
-- WHERE program_name = 'Comp Sci';

-- Example 2: Delete assignments that have invalid program_name
-- DELETE FROM assignments WHERE program_id IS NULL AND program_name NOT IN (SELECT name FROM programs);

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Count assignments by program
SELECT 
    p.name as program_name,
    COUNT(a.id) as assignment_count
FROM programs p
LEFT JOIN assignments a ON p.id = a.program_id
GROUP BY p.id, p.name
ORDER BY assignment_count DESC;

-- Check if any student will see assignments from wrong program
-- This should return 0 rows
SELECT 
    a.id as assignment_id,
    a.title as assignment_title,
    a.program_name as assignment_program,
    s.name as student_name,
    s.registration_number,
    c.name as student_course,
    'CROSS-PROGRAM LEAKAGE DETECTED!' as issue
FROM assignments a
CROSS JOIN students s
LEFT JOIN courses c ON s.course_id = c.id
WHERE a.program_id NOT IN (
    SELECT p.id FROM programs p WHERE p.course_id = s.course_id
)
AND a.program_id IS NOT NULL;

-- ================================================================
-- FINAL SUMMARY
-- ================================================================

SELECT 
    COUNT(*) as total_assignments,
    COUNT(program_id) as assignments_with_program_id,
    COUNT(*) - COUNT(program_id) as assignments_without_program_id,
    ROUND(100.0 * COUNT(program_id) / COUNT(*), 2) as percentage_fixed
FROM assignments;
