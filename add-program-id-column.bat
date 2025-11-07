@echo off
echo ========================================
echo Adding program_id Column to Assignments
echo ========================================
echo.
echo This will add the missing program_id column
echo without deleting existing data.
echo.
echo Make sure backend is running on port 5000!
echo.
pause

echo.
echo Adding column via API...
echo.

curl -X POST http://localhost:5000/api/assignments/add-program-id

echo.
echo.
echo ========================================
echo Done! Check the output above.
echo ========================================
echo.
pause
