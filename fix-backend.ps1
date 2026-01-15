# Fix backend server.js - Add college_name and department_name to student queries

$filePath = "backend\server.js"
$content = Get-Content $filePath -Raw

# Pattern 1: Simple student query without college/department
$oldPattern = @'
SELECT s.*, c.name as course_name
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        WHERE s.id = $1
'@

$newPattern = @'
SELECT s.*, 
               c.name as course_name,
               d.name as department_name,
               col.name as college_name
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN departments d ON c.department_id = d.id
        LEFT JOIN colleges col ON d.college_id = col.id
        WHERE s.id = $1
'@

# Replace all occurrences
$content = $content -replace [regex]::Escape($oldPattern), $newPattern

# Pattern 2: Student query with username/email/name
$oldPattern2 = @'
SELECT s.*, c.name as course_name
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        WHERE s.registration_number = $1 OR s.email = $1 OR s.name = $1
'@

$newPattern2 = @'
SELECT s.*, 
               c.name as course_name,
               d.name as department_name,
               col.name as college_name
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN departments d ON c.department_id = d.id
        LEFT JOIN colleges col ON d.college_id = col.id
        WHERE s.registration_number = $1 OR s.email = $1 OR s.name = $1
'@

$content = $content -replace [regex]::Escape($oldPattern2), $newPattern2

# Save the file
$content | Set-Content $filePath -NoNewline

Write-Host "Backend server.js updated successfully!"
