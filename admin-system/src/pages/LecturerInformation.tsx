import { useState, useEffect } from "react";
import { lecturerOperations, initializeDatabase } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, BookOpen, Calendar, Mail, Phone, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LecturerInfo {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  department: string;
  college: string;
  specialization: string;
  qualification: string;
  experience: number;
  joinDate: string;
  status: "active" | "inactive" | "on_leave";
  assignedCourses: {
    id: string;
    subjectName: string;
    subjectCode: string;
    program: string;
    semester: number;
    students: number;
  }[];
  officeLocation: string;
  officeHours: string;
}

export const LecturerInformation = () => {
  const [lecturers, setLecturers] = useState<LecturerInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to load lecturers data
  const loadLecturers = async () => {
      try {
        setLoading(true);
        await initializeDatabase();
        const lecturersData = await lecturerOperations.getAll();
        
        console.log('=== LECTURER INFORMATION DATA LOADING ===');
        console.log('Raw Lecturers Data:', lecturersData);
        
        const formattedLecturers: LecturerInfo[] = await Promise.all(lecturersData.map(async (lecturer: any) => {
          console.log('Processing Lecturer:', lecturer);
          
          // Fetch real department and college information for ANY lecturer
          let departmentInfo = null;
          let collegeInfo = null;
          
          // Get department information if department_id exists
          if (lecturer.department_id) {
            try {
              const deptResponse = await fetch(`https://must-lms-backend.onrender.com/api/departments/${lecturer.department_id}`);
              if (deptResponse.ok) {
                const deptResult = await deptResponse.json();
                departmentInfo = deptResult.data;
                console.log(`Department Info for lecturer ${lecturer.name}:`, departmentInfo);
                
                // Get college information from department
                if (departmentInfo?.college_id) {
                  const collegeResponse = await fetch(`https://must-lms-backend.onrender.com/api/colleges/${departmentInfo.college_id}`);
                  if (collegeResponse.ok) {
                    const collegeResult = await collegeResponse.json();
                    collegeInfo = collegeResult.data;
                    console.log(`College Info for lecturer ${lecturer.name}:`, collegeInfo);
                  }
                }
              }
            } catch (err) {
              console.error(`Error fetching department/college info for lecturer ${lecturer.name}:`, err);
            }
          } else {
            // If lecturer doesn't have department_id, try to assign one based on specialization
            console.log(`Lecturer ${lecturer.name} has no department_id, checking specialization: ${lecturer.specialization}`);
            
            // Try to find a matching department based on specialization
            try {
              const allDepartmentsResponse = await fetch(`https://must-lms-backend.onrender.com/api/departments`);
              if (allDepartmentsResponse.ok) {
                const allDepartmentsResult = await allDepartmentsResponse.json();
                if (allDepartmentsResult.success && allDepartmentsResult.data) {
                  // Find department that matches lecturer's specialization
                  const matchingDepartment = allDepartmentsResult.data.find((dept: any) => 
                    dept.name.toLowerCase().includes(lecturer.specialization?.toLowerCase()) ||
                    lecturer.specialization?.toLowerCase().includes(dept.name.toLowerCase().split(' ').pop())
                  );
                  
                  if (matchingDepartment) {
                    console.log(`Found matching department for ${lecturer.name}:`, matchingDepartment);
                    departmentInfo = matchingDepartment;
                    
                    // Get college information from matched department
                    if (departmentInfo?.college_id) {
                      const collegeResponse = await fetch(`https://must-lms-backend.onrender.com/api/colleges/${departmentInfo.college_id}`);
                      if (collegeResponse.ok) {
                        const collegeResult = await collegeResponse.json();
                        collegeInfo = collegeResult.data;
                        console.log(`College Info from matching department:`, collegeInfo);
                      }
                    }
                  }
                }
              }
            } catch (err) {
              console.error(`Error finding matching department for lecturer ${lecturer.name}:`, err);
            }
          }
          
          // Get real assigned courses from database for this specific lecturer
          let assignedCourses = [];
          
          try {
            console.log(`=== FETCHING ASSIGNMENTS FOR LECTURER ${lecturer.name} (ID: ${lecturer.id}) ===`);
            
            // Fetch ALL students ONCE for efficiency (outside the loop)
            let allStudents: any[] = [];
            try {
              const studentsResponse = await fetch(`https://must-lms-backend.onrender.com/api/students`);
              if (studentsResponse.ok) {
                const studentsResult = await studentsResponse.json();
                if (studentsResult.success && studentsResult.data) {
                  allStudents = studentsResult.data;
                  console.log(`Fetched ${allStudents.length} students for counting`);
                }
              }
            } catch (err) {
              console.error('Error fetching all students:', err);
            }
            
            // Use efficient endpoint to fetch ONLY this lecturer's programs
            const programsResponse = await fetch(`https://must-lms-backend.onrender.com/api/programs?lecturer_username=${encodeURIComponent(lecturer.employee_id)}`);
            if (programsResponse.ok) {
              const programsResult = await programsResponse.json();
              console.log('Programs API Response:', programsResult);
              
              if (programsResult.success && programsResult.data) {
                const lecturerPrograms = programsResult.data;
                
                console.log(`Programs found for lecturer ${lecturer.name}:`, lecturerPrograms);
                
                if (lecturerPrograms.length > 0) {
                  // Get real course information and create entries for each semester
                  const assignedCoursesPromises = lecturerPrograms.map(async (program: any) => {
                    let courseInfo = null;
                    let actualStudentCount = 0;
                    
                    console.log(`📊 Processing program:`, program);
                    console.log(`📊 Program course_id:`, program.course_id);
                    
                    // Fetch course details if course_id exists
                    if (program.course_id) {
                      try {
                        const courseResponse = await fetch(`https://must-lms-backend.onrender.com/api/courses/${program.course_id}`);
                        if (courseResponse.ok) {
                          const courseResult = await courseResponse.json();
                          courseInfo = courseResult.data;
                        }
                      } catch (err) {
                        console.error('Error fetching course info:', err);
                      }
                      
                      // Count students enrolled in this course from pre-fetched students
                      // Students have course_id that matches the course_id in the program
                      const matchingStudents = allStudents.filter((student: any) => 
                        student.course_id === program.course_id && student.is_active === true
                      );
                      actualStudentCount = matchingStudents.length;
                      
                      console.log(`📊 Students with course_id ${program.course_id}:`, matchingStudents.length);
                      console.log(`📊 Active students:`, matchingStudents.filter((s: any) => s.is_active).length);
                      console.log(`✅ Real student count for course ${program.course_id} (${courseInfo?.name || program.name}): ${actualStudentCount} active students`);
                    } else {
                      console.warn(`⚠️ Program ${program.name || program.id} has no course_id!`);
                    }
                    
                    // Enhanced semester assignment logic - PRIORITY ORDER
                    let semesterValue = 1; // Default to semester 1
                    
                    console.log(`\n📊 ANALYZING PROGRAM: ${program.name}`);
                    console.log(`   - program.semester: ${program.semester}`);
                    console.log(`   - program.semester_number: ${program.semester_number}`);
                    console.log(`   - program.semesterNumber: ${program.semesterNumber}`);
                    console.log(`   - program.total_semesters: ${program.total_semesters}`);
                    console.log(`   - program.totalSemesters: ${program.totalSemesters}`);
                    
                    // 1. FIRST PRIORITY: Check if program has explicit semester field from database
                    if (program.semester !== undefined && program.semester !== null && program.semester !== '') {
                      const parsedSem = parseInt(program.semester, 10);
                      if (!isNaN(parsedSem) && parsedSem >= 1 && parsedSem <= 2) {
                        semesterValue = parsedSem;
                        console.log(`   ✅ Using explicit semester from DB: ${semesterValue}`);
                      }
                    }
                    // 2. SECOND PRIORITY: Try to extract from program name
                    else if (program.name) {
                      const programName = program.name.toLowerCase();
                      console.log(`   - Checking program name: "${programName}"`);
                      
                      // Check for explicit semester 2 indicators (MUST come first)
                      const semester2Indicators = [
                        'semester 2', 'sem 2', 'second semester', 'semester2',
                        'semester ii', 'semester-2', 'sem-2', 'semester two',
                        'semester two', 'level 2', 'year 2', 'level two', 'year two',
                        'sem2', 'sem-2', 'sem 2', 'semester-2', 'sem 2', 'sem2'
                      ];
                      
                      const hasSem2 = semester2Indicators.some(indicator => programName.includes(indicator));
                      console.log(`   - Has Semester 2 indicators: ${hasSem2}`);
                      
                      if (hasSem2) {
                        semesterValue = 2;
                        console.log(`   ✅ Detected Semester 2 from name indicators`);
                      } else {
                        // Check for semester 1 indicators
                        const semester1Indicators = [
                          'semester 1', 'sem 1', 'first semester', 'semester1',
                          'semester i', 'semester-1', 'sem-1', 'semester one',
                          'sem1', 'sem-1', 'sem 1', 'semester-1'
                        ];
                        
                        const hasSem1 = semester1Indicators.some(indicator => programName.includes(indicator));
                        console.log(`   - Has Semester 1 indicators: ${hasSem1}`);
                        
                        if (hasSem1) {
                          semesterValue = 1;
                          console.log(`   ✅ Detected Semester 1 from name indicators`);
                        } else {
                          console.log(`   ⚠️ No semester indicators found, defaulting to Semester 1`);
                        }
                      }
                    }
                    
                    console.log(`   📊 FINAL SEMESTER ASSIGNMENT: ${semesterValue}\n`);

                    return [{
                      id: `${program.id}-sem${semesterValue}`,
                      subjectName: program.name || courseInfo?.name || 'Program Subject',
                      subjectCode: courseInfo?.code || program.code || 'N/A',
                      program: courseInfo?.name || program.name || 'Program',
                      semester: semesterValue,
                      students: actualStudentCount // Real student count from database
                    }];
                  });
                  
                  const allSemesterEntries = await Promise.all(assignedCoursesPromises);
                  assignedCourses = allSemesterEntries.flat();
                  console.log(`✅ Total assigned courses for ${lecturer.name}: ${assignedCourses.length} entries`);
                } else {
                  // No programs found for this lecturer - keep empty array
                  console.log(`No programs assigned to lecturer ${lecturer.name}`);
                  assignedCourses = [];
                }
              } else {
                console.log('No programs found in API response');
                assignedCourses = [];
              }
            } else {
              console.log(`Programs API call failed for lecturer ${lecturer.name}`);
              assignedCourses = [];
            }
          } catch (err) {
            console.error(`Error fetching programs for lecturer ${lecturer.name}:`, err);
            assignedCourses = [];
          }

          const formattedLecturer = {
            id: lecturer.id.toString(),
            name: lecturer.name,
            employeeId: lecturer.employee_id,
            email: lecturer.email,
            phone: lecturer.phone || "Not provided",
            // Use real department and college information
            department: departmentInfo?.name || lecturer.department || "Unknown Department",
            college: collegeInfo?.name || lecturer.college || "Unknown College",
            specialization: lecturer.specialization || "General Studies",
            qualification: lecturer.qualification || "Master's Degree",
            experience: lecturer.experience || 3,
            joinDate: lecturer.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            // Use real activation status from database
            status: (lecturer.is_active === true ? "active" : "inactive") as "active" | "inactive",
            assignedCourses: assignedCourses,
            officeLocation: lecturer.office_location || `${departmentInfo?.name || 'Department'} Office`,
            officeHours: lecturer.office_hours || "Mon-Fri 10:00-12:00 PM"
          };
          
          console.log('Formatted Lecturer:', formattedLecturer);
          return formattedLecturer;
        }));

        setLecturers(formattedLecturers);
        console.log('✅ Lecturers loaded successfully:', formattedLecturers.length);
      } catch (error) {
        console.error('❌ Error loading lecturers:', error);
        setLecturers([]);
      } finally {
        setLoading(false);
      }
  };

  // Load lecturers on component mount and set up auto-refresh polling
  useEffect(() => {
    // Initial load
    loadLecturers();

    // Set up polling to refresh data every 60 seconds (1 minute)
    // This ensures admin portal shows updated status when lecturers/students register
    const pollInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing lecturer data...');
      loadLecturers();
    }, 60000); // 60 seconds

    // Cleanup interval on component unmount
    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredLecturers = lecturers.filter(lecturer => {
    const matchesSearch = lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lecturer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lecturer.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === "all" || lecturer.department === selectedDepartment;
    const matchesStatus = selectedStatus === "all" || lecturer.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = Array.from(new Set(lecturers.map(l => l.department)));

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lecturer Information</h1>
          <p className="text-muted-foreground">
            View and manage lecturer profiles and assignments
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Real Database Data
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search lecturers by name, ID, email, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lecturers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lecturers.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered in database
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lecturers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lecturers.filter(l => l.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently teaching
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              With assigned lecturers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Load</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lecturers.reduce((total, lecturer) => total + lecturer.assignedCourses.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total course assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lecturers List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Loading lecturers...</div>
            </CardContent>
          </Card>
        ) : filteredLecturers.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                {lecturers.length === 0 ? (
                  <div>
                    <p>No lecturers registered yet</p>
                    <p className="text-sm mt-2">Register lecturers in User Management to see them here</p>
                  </div>
                ) : (
                  <p>No lecturers match your search criteria</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredLecturers.map((lecturer) => (
            <Card key={lecturer.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{lecturer.name}</CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {lecturer.employeeId}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {lecturer.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {lecturer.phone}
                      </span>
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {lecturer.assignedCourses.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">Assigned Courses</h4>
                    <div className="flex flex-wrap gap-2">
                      {lecturer.assignedCourses.map((course) => (
                        <Badge key={course.id} variant="outline" className="text-xs">
                          {course.subjectCode} - {course.subjectName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
