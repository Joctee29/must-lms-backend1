# 🔧 CODE CHANGES - EXACT MODIFICATIONS

## FILE 1: admin-system/src/pages/AcademicSettings.tsx

### CHANGE 1: Add State Variables (Lines ~45-52)

**BEFORE:**
```tsx
  // Semester form state
  const [semesterForm, setSemesterForm] = useState({
    name: "",
    academicYearId: "",
    startDate: "",
    endDate: "",
    isActive: false
  });

  // Load active academic period from backend for reality integration
  useEffect(() => {
```

**AFTER:**
```tsx
  // Semester form state
  const [semesterForm, setSemesterForm] = useState({
    name: "",
    academicYearId: "",
    startDate: "",
    endDate: "",
    isActive: false
  });

  // Track selected active year and semester IDs for Select components
  const [selectedActiveYearId, setSelectedActiveYearId] = useState<string>("");
  const [selectedActiveSemesterId, setSelectedActiveSemesterId] = useState<string>("");
  const [selectedYearForDisplay, setSelectedYearForDisplay] = useState<string>("");

  // Load active academic period from backend for reality integration
  useEffect(() => {
```

---

### CHANGE 2: Update useEffect Hook (Lines ~53-90)

**BEFORE:**
```tsx
  useEffect(() => {
    const loadActivePeriod = async () => {
      try {
        const active = await academicPeriodOperations.getActive();
        if (active && active.academic_year && active.semester) {
          // Ensure there is at least one academic year in the list marked as active
          const yearId = Date.now().toString();
          const activeYear: AcademicYear = {
            id: yearId,
            name: active.academic_year,
            startDate: "",
            endDate: "",
            isActive: true,
          };
          setAcademicYears([activeYear]);

          // Ensure there is at least one semester in the list marked as active
          const semId = (Date.now() + 1).toString();
          const activeSemester: Semester = {
            id: semId,
            name: `Semester ${active.semester}`,
            academicYearId: yearId,
            startDate: "",
            endDate: "",
            isActive: true,
          };
          setSemesters([activeSemester]);
        }
      } catch (error) {
        console.error("Error loading active academic period:", error);
      }
    };

    loadActivePeriod();
  }, []);
```

**AFTER:**
```tsx
  useEffect(() => {
    const loadActivePeriod = async () => {
      try {
        const active = await academicPeriodOperations.getActive();
        if (active && active.academic_year && active.semester) {
          // Ensure there is at least one academic year in the list marked as active
          const yearId = Date.now().toString();
          const activeYear: AcademicYear = {
            id: yearId,
            name: active.academic_year,
            startDate: "",
            endDate: "",
            isActive: true,
          };
          setAcademicYears([activeYear]);
          setSelectedActiveYearId(yearId); // Track selected year for Select component
          setSelectedYearForDisplay(active.academic_year); // Track for display in dropdowns

          // Ensure there is at least one semester in the list marked as active
          const semId = (Date.now() + 1).toString();
          const activeSemester: Semester = {
            id: semId,
            name: `Semester ${active.semester}`,
            academicYearId: yearId,
            startDate: "",
            endDate: "",
            isActive: true,
          };
          setSemesters([activeSemester]);
          setSelectedActiveSemesterId(semId); // Track selected semester for Select component
          
          // Also update the semester form to show semester number in dropdown
          setSemesterForm(prev => ({
            ...prev,
            name: `Semester ${active.semester}`,
            academicYearId: yearId
          }));
        }
      } catch (error) {
        console.error("Error loading active academic period:", error);
      }
    };

    loadActivePeriod();
  }, []);
```

---

### CHANGE 3: Update handleAddAcademicYear Function (Lines ~103-139)

**BEFORE:**
```tsx
  const handleAddAcademicYear = async () => {
    if (!yearForm.name || !yearForm.startDate || !yearForm.endDate) {
      alert("Please fill in all academic year fields (name, start date, end date)");
      return;
    }

    try {
      setSaving(true);
      
      const newYear: AcademicYear = {
        id: Date.now().toString(),
        ...yearForm,
        // Automatically mark first added year as active
        isActive: academicYears.length === 0 ? true : yearForm.isActive,
      };
      
      const updatedYears = [...academicYears, newYear];
      setAcademicYears(updatedYears);
      
      // Auto-populate semester form with the newly added year
      setSemesterForm(prev => ({
        ...prev,
        academicYearId: newYear.id
      }));
      
      setYearForm({ name: "", startDate: "", endDate: "", isActive: false });

      // If marked as active, save to backend
      if (newYear.isActive) {
        const success = await handleSaveBoth(updatedYears, semesters);
        if (!success) {
          // Revert if save failed
          setAcademicYears(academicYears);
          alert("Failed to add academic year. Please try again.");
        } else {
          alert(`✅ Academic year "${newYear.name}" added and activated`);
        }
      } else {
        alert(`✅ Academic year "${newYear.name}" added`);
      }
    } catch (error) {
      console.error("Error adding academic year:", error);
      alert(`❌ Error adding academic year: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };
```

**AFTER:**
```tsx
  const handleAddAcademicYear = async () => {
    if (!yearForm.name || !yearForm.startDate || !yearForm.endDate) {
      alert("Please fill in all academic year fields (name, start date, end date)");
      return;
    }

    try {
      setSaving(true);
      
      const newYear: AcademicYear = {
        id: Date.now().toString(),
        ...yearForm,
        // Automatically mark first added year as active
        isActive: academicYears.length === 0 ? true : yearForm.isActive,
      };
      
      const updatedYears = [...academicYears, newYear];
      setAcademicYears(updatedYears);
      setSelectedYearForDisplay(newYear.name); // Update display selection
      
      // Auto-populate semester form with the newly added year
      setSemesterForm(prev => ({
        ...prev,
        academicYearId: newYear.id
      }));
      
      setYearForm({ name: "", startDate: "", endDate: "", isActive: false });

      // If marked as active, save to backend
      if (newYear.isActive) {
        const success = await handleSaveBoth(updatedYears, semesters);
        if (!success) {
          // Revert if save failed
          setAcademicYears(academicYears);
          setSelectedYearForDisplay("");
          alert("Failed to add academic year. Please try again.");
        } else {
          alert(`✅ Academic year "${newYear.name}" added and activated`);
        }
      } else {
        alert(`✅ Academic year "${newYear.name}" added`);
      }
    } catch (error) {
      console.error("Error adding academic year:", error);
      alert(`❌ Error adding academic year: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };
```

---

## FILE 2: admin-system/src/pages/Reports.tsx

### CHANGE 1: Add Auth Helper Functions (Lines ~16-46)

**BEFORE:**
```tsx
export const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [studentsCount, setStudentsCount] = useState(0);
  const [lecturersCount, setLecturersCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [programsCount, setProgramsCount] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [activeLecturers, setActiveLecturers] = useState(0);
  const [coursePerformance, setCoursePerformance] = useState<any[]>([]);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);
        console.log('=== FETCHING REAL REPORTS DATA ===');

        // Fetch students
        const studentsResponse = await fetch('https://must-lms-backend.onrender.com/api/students');
        const studentsResult = await studentsResponse.json();
        const students = studentsResult.success ? studentsResult.data : [];
```

**AFTER:**
```tsx
export const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [studentsCount, setStudentsCount] = useState(0);
  const [lecturersCount, setLecturersCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [programsCount, setProgramsCount] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [activeLecturers, setActiveLecturers] = useState(0);
  const [coursePerformance, setCoursePerformance] = useState<any[]>([]);

  // Helper function to get auth token
  const getAuthToken = () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return null;
    try {
      const user = JSON.parse(currentUser);
      return user.token || user.jwt || null;
    } catch (e) {
      console.error('Failed to parse currentUser:', e);
      return null;
    }
  };

  // Helper function to fetch with auth
  const fetchWithAuth = async (url: string) => {
    const token = getAuthToken();
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  };

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);
        console.log('=== FETCHING REAL REPORTS DATA ===');

        // Get auth token
        const token = getAuthToken();
        console.log('Auth token available:', !!token);

        // Fetch students with auth
        const studentsResult = await fetchWithAuth('https://must-lms-backend.onrender.com/api/students?user_type=admin');
        const students = studentsResult.success ? studentsResult.data : (Array.isArray(studentsResult) ? studentsResult : []);
```

---

### CHANGE 2: Update useEffect Hook for Auth Fetch (Lines ~37-95)

**BEFORE:**
```tsx
        // Fetch lecturers
        const lecturersResponse = await fetch('https://must-lms-backend.onrender.com/api/lecturers');
        const lecturersResult = await lecturersResponse.json();
        const lecturers = lecturersResult.success ? lecturersResult.data : [];
        setLecturersCount(lecturers.length);
        setActiveLecturers(lecturers.filter((l: any) => l.is_active).length);
        console.log('Lecturers:', lecturers.length, 'Active:', lecturers.filter((l: any) => l.is_active).length);

        // Fetch courses
        const coursesResponse = await fetch('https://must-lms-backend.onrender.com/api/courses');
        const coursesResult = await coursesResponse.json();
        const courses = coursesResult.success ? coursesResult.data : [];
        setCoursesCount(courses.length);
        console.log('Courses:', courses.length);

        // Fetch programs
        const programsResponse = await fetch('https://must-lms-backend.onrender.com/api/programs');
        const programsResult = await programsResponse.json();
        const programs = programsResult.success ? programsResult.data : [];
        setProgramsCount(programs.length);
        console.log('Programs:', programs.length);

        // Calculate course performance from real data
        const performanceData = courses.slice(0, 5).map((course: any) => {
          const enrolledStudents = students.filter((s: any) => s.course_id === course.id);
          const enrollments = enrolledStudents.length;
          // Simulate completions (70-90% of enrollments)
          const completions = Math.floor(enrollments * (0.7 + Math.random() * 0.2));
          // Simulate average grade (75-95)
          const avgGrade = Math.floor(75 + Math.random() * 20);
          
          return {
            course: course.name,
            enrollments,
            completions,
            avgGrade
          };
        }).filter((p: any) => p.enrollments > 0);

        setCoursePerformance(performanceData);
        console.log('Course Performance:', performanceData);

      } catch (error) {
        console.error('Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);
```

**AFTER:**
```tsx
        // Fetch lecturers with auth
        const lecturersResult = await fetchWithAuth('https://must-lms-backend.onrender.com/api/lecturers');
        const lecturers = lecturersResult.success ? lecturersResult.data : (Array.isArray(lecturersResult) ? lecturersResult : []);
        setLecturersCount(lecturers.length);
        setActiveLecturers(lecturers.filter((l: any) => l.is_active).length);
        console.log('Lecturers:', lecturers.length, 'Active:', lecturers.filter((l: any) => l.is_active).length);

        // Fetch courses with auth
        const coursesResult = await fetchWithAuth('https://must-lms-backend.onrender.com/api/courses');
        const courses = coursesResult.success ? coursesResult.data : (Array.isArray(coursesResult) ? coursesResult : []);
        setCoursesCount(courses.length);
        console.log('Courses:', courses.length);

        // Fetch programs with auth
        const programsResult = await fetchWithAuth('https://must-lms-backend.onrender.com/api/programs');
        const programs = programsResult.success ? programsResult.data : (Array.isArray(programsResult) ? programsResult : []);
        setProgramsCount(programs.length);
        console.log('Programs:', programs.length);

        // Calculate course performance from real data
        const performanceData = courses.slice(0, 5).map((course: any) => {
          const enrolledStudents = students.filter((s: any) => s.course_id === course.id);
          const enrollments = enrolledStudents.length;
          // Simulate completions (70-90% of enrollments)
          const completions = Math.floor(enrollments * (0.7 + Math.random() * 0.2));
          // Simulate average grade (75-95)
          const avgGrade = Math.floor(75 + Math.random() * 20);
          
          return {
            course: course.name,
            enrollments,
            completions,
            avgGrade
          };
        }).filter((p: any) => p.enrollments > 0);

        setCoursePerformance(performanceData);
        console.log('Course Performance:', performanceData);

      } catch (error) {
        console.error('Error fetching reports data:', error);
        // Set default empty values on error
        setStudentsCount(0);
        setLecturersCount(0);
        setCoursesCount(0);
        setProgramsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);
```

---

## SUMMARY OF CHANGES

### File: AcademicSettings.tsx
- **Lines Added:** ~3 new state declarations + 8 state update calls
- **Lines Modified:** ~25 lines in useEffect and handleAddAcademicYear
- **Total Changes:** ~35 lines
- **Type:** State management enhancement

### File: Reports.tsx
- **Lines Added:** ~30 new helper functions
- **Lines Modified:** ~15 lines in useEffect
- **Lines Added:** ~5 error handling lines
- **Total Changes:** ~50 lines
- **Type:** Auth integration + error handling

---

## BUILD VERIFICATION

```
✓ AcademicSettings.tsx compiles: YES
✓ Reports.tsx compiles: YES
✓ TypeScript errors: ZERO
✓ Lint warnings: NONE
✓ Build succeeds: YES
```

---

**All changes are minimal, focused, and follow existing code patterns.**
