import { useState, useEffect } from "react";
import { studentOperations, initializeDatabase } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  BookOpen,
  Building,
  Users,
  FileText
} from "lucide-react";

interface StudentInfo {
  id: string;
  name: string;
  registrationNumber: string;
  email: string;
  phone: string;
  academicYear: string;
  currentSemester: number;
  course: string;
  college: string;
  department: string;
  academicLevel: 'certificate' | 'diploma' | 'bachelor' | 'masters' | 'phd';
  yearOfStudy: number;
  gpa: number;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
  enrollmentDate: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  nationality: string;
}


export const StudentInformation = () => {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [studentPrograms, setStudentPrograms] = useState<any>({});
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Advanced filtering states
  const [colleges, setColleges] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Function to load students and filtering data from database
  const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        await initializeDatabase();
        
        // Load colleges, departments, and courses for filtering
        console.log('=== LOADING STUDENT INFORMATION FILTER DATA ===');
        
        // Load colleges
        const collegesResponse = await fetch('https://must-lms-backend.onrender.com/api/colleges');
        if (collegesResponse.ok) {
          const collegesResult = await collegesResponse.json();
          setColleges(collegesResult.data || []);
          console.log('Colleges loaded:', collegesResult.data?.length || 0);
        }
        
        // Load departments
        const departmentsResponse = await fetch('https://must-lms-backend.onrender.com/api/departments');
        if (departmentsResponse.ok) {
          const departmentsResult = await departmentsResponse.json();
          setDepartments(departmentsResult.data || []);
          console.log('Departments loaded:', departmentsResult.data?.length || 0);
        }
        
        // Load courses
        const coursesResponse = await fetch('https://must-lms-backend.onrender.com/api/courses');
        if (coursesResponse.ok) {
          const coursesResult = await coursesResponse.json();
          setCourses(coursesResult.data || []);
          console.log('Courses loaded:', coursesResult.data?.length || 0);
        }
        
        // Load students
        const dbStudents = await studentOperations.getAll();
        
        console.log('=== LOADING STUDENT INFORMATION DATA ===');
        console.log('Raw Students Data:', dbStudents);
        
        // Fetch real data for each student from database
        const formattedStudents = await Promise.all(dbStudents.map(async (student: any) => {
          console.log('Processing Student:', student);
          
          // Initialize with empty data - no fake fallbacks
          let courseInfo = null;
          let departmentInfo = null;
          let collegeInfo = null;
          
          // Try to get complete course details from database if course_id exists
          if (student.course_id) {
            try {
              const courseResponse = await fetch(`https://must-lms-backend.onrender.com/api/courses/${student.course_id}`);
              if (courseResponse.ok) {
                const courseResult = await courseResponse.json();
                courseInfo = courseResult.data;
                console.log('Course Info:', courseInfo);
                
                // Get department information from course
                if (courseInfo?.department_id) {
                  const deptResponse = await fetch(`https://must-lms-backend.onrender.com/api/departments/${courseInfo.department_id}`);
                  if (deptResponse.ok) {
                    const deptResult = await deptResponse.json();
                    departmentInfo = deptResult.data;
                    console.log('Department Info:', departmentInfo);
                    
                    // Get college information from department
                    if (departmentInfo?.college_id) {
                      const collegeResponse = await fetch(`https://must-lms-backend.onrender.com/api/colleges/${departmentInfo.college_id}`);
                      if (collegeResponse.ok) {
                        const collegeResult = await collegeResponse.json();
                        collegeInfo = collegeResult.data;
                        console.log('College Info:', collegeInfo);
                      }
                    }
                  }
                }
              }
            } catch (err) {
              console.error('Error fetching student course/department/college info:', err);
            }
          }

          // Determine academic level from course data
          let academicLevel: 'certificate' | 'diploma' | 'bachelor' | 'masters' | 'phd' = 'bachelor';
          
          if (courseInfo?.academic_level || courseInfo?.academicLevel) {
            academicLevel = courseInfo.academic_level || courseInfo.academicLevel;
          } else if (courseInfo?.name) {
            const courseName = courseInfo.name.toLowerCase();
            if (courseName.includes('certificate')) {
              academicLevel = 'certificate';
            } else if (courseName.includes('diploma')) {
              academicLevel = 'diploma';
            } else if (courseName.includes('bachelor')) {
              academicLevel = 'bachelor';
            } else if (courseName.includes('master')) {
              academicLevel = 'masters';
            } else if (courseName.includes('phd') || courseName.includes('doctorate')) {
              academicLevel = 'phd';
            }
          }

          const formattedStudent = {
            id: student.id.toString(),
            name: student.name,
            registrationNumber: student.registration_number,
            email: student.email,
            phone: student.phone || "Not provided",
            academicYear: student.academic_year || "2024/2025",
            currentSemester: student.current_semester || 1,
            // Use real data from database - no fake fallbacks
            course: courseInfo?.name || student.course_name || "Unknown Course",
            college: collegeInfo?.name || student.college_name || "Unknown College",
            department: departmentInfo?.name || student.department_name || "Unknown Department",
            academicLevel: academicLevel,
            // Use real activation status from database
            status: (student.is_active === true ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
            enrollmentDate: student.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            // Remove fake data fields - keep minimal real data only
            gpa: 0.0,
            guardianName: "",
            guardianPhone: "",
            address: "",
            dateOfBirth: "",
            gender: 'Male' as const,
            nationality: ""
          };
          
          console.log('Formatted Student:', formattedStudent);
          return formattedStudent;
        }));
        
        setStudents(formattedStudents);
        
        // Fetch real programs for each specific student from database - NO FAKE DATA
        const programsData: any = {};
        for (const student of formattedStudents) {
          try {
            console.log(`=== FETCHING PROGRAMS FOR STUDENT ${student.name} (ID: ${student.id}) ===`);
            
            // Get the original student record to find course_id
            const originalStudent = dbStudents.find((s: any) => s.id.toString() === student.id);
            
            if (!originalStudent?.course_id) {
              console.log(`No course_id for student ${student.name}`);
              programsData[student.id] = [];
              continue;
            }
            
            // Use efficient endpoint to fetch programs for this student's course
            const programsResponse = await fetch(`https://must-lms-backend.onrender.com/api/programs?user_type=student&student_id=${originalStudent.id}`);
            if (programsResponse.ok) {
              const programsResult = await programsResponse.json();
              console.log('Programs API Response:', programsResult);
              
              if (programsResult.success && programsResult.data) {
                const studentPrograms = programsResult.data;
                
                console.log(`Programs found for student ${student.name}:`, studentPrograms);
                
                if (studentPrograms.length > 0) {
                  // Organize programs by semester
                  const programsBySemester: any[] = [];
                  
                  studentPrograms.forEach((program: any) => {
                    const totalSemesters = program.total_semesters || program.totalSemesters || 1;
                    
                    // Create entry for each semester
                    for (let sem = 1; sem <= totalSemesters; sem++) {
                      programsBySemester.push({
                        id: `${program.id}-sem${sem}`,
                        name: program.name,
                        semester: sem,
                        lecturer_name: program.lecturer_name || 'Lecturer Not Assigned'
                      });
                    }
                  });
                  
                  programsData[student.id] = programsBySemester;
                } else {
                  // No programs found - keep empty array (no fake data)
                  programsData[student.id] = [];
                  console.log(`No programs found for student ${student.name}`);
                }
              } else {
                programsData[student.id] = [];
              }
            } else {
              programsData[student.id] = [];
            }
          } catch (err) {
            console.error(`Error fetching programs for student ${student.name}:`, err);
            // Keep empty array on error - no fake data
            programsData[student.id] = [];
          }
        }
        setStudentPrograms(programsData);
        console.log('✅ Students loaded successfully:', formattedStudents.length);
        
      } catch (error) {
        console.error('❌ Error loading students:', error);
        setError('Failed to load student data. Please try again.');
        setStudents([]);
      } finally {
        setLoading(false);
      }
  };

  // Load students on component mount and set up auto-refresh polling
  useEffect(() => {
    // Initial load
    loadData();

    // Set up polling to refresh data every 60 seconds (1 minute)
    // This ensures admin portal shows updated status when students register
    const pollInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing student data...');
      loadData();
    }, 60000); // 60 seconds

    // Cleanup interval on component unmount
    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);

  // Advanced filtering functions
  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    // Reset other filters when level changes
    setSelectedCollege("all");
    setSelectedDepartment("all");
    setSelectedCourse("all");
  };

  const handleCollegeChange = (collegeId: string) => {
    setSelectedCollege(collegeId);
    // Reset dependent filters
    setSelectedDepartment("all");
    setSelectedCourse("all");
  };

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    // Reset dependent filters
    setSelectedCourse("all");
  };

  // Get filtered departments based on selected college
  const getFilteredDepartments = () => {
    if (selectedCollege === "all") return departments;
    return departments.filter(dept => dept.college_id?.toString() === selectedCollege);
  };

  // Get filtered courses based on selected department and level
  const getFilteredCourses = () => {
    let filtered = courses;
    
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(course => course.department_id?.toString() === selectedDepartment);
    }
    
    if (selectedLevel !== "all") {
      filtered = filtered.filter(course => (course.academic_level || course.academicLevel) === selectedLevel);
    }
    
    return filtered;
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || student.status.toLowerCase() === filterStatus.toLowerCase();
    
    const matchesLevel = selectedLevel === "all" || student.academicLevel === selectedLevel;
    
    const matchesYear = selectedYear === "all" || student.yearOfStudy?.toString() === selectedYear;
    
    // Advanced filtering by college, department, and course
    const matchesCollege = selectedCollege === "all" || student.college.toLowerCase().includes(
      colleges.find(c => c.id.toString() === selectedCollege)?.name?.toLowerCase() || ""
    );
    
    const matchesDepartment = selectedDepartment === "all" || student.department.toLowerCase().includes(
      departments.find(d => d.id.toString() === selectedDepartment)?.name?.toLowerCase() || ""
    );
    
    const matchesCourse = selectedCourse === "all" || student.course.toLowerCase().includes(
      courses.find(c => c.id.toString() === selectedCourse)?.name?.toLowerCase() || ""
    );
    
    return matchesSearch && matchesStatus && matchesLevel && matchesYear && matchesCollege && matchesDepartment && matchesCourse;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Graduated': return 'bg-blue-100 text-blue-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.7) return 'text-green-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading student data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Information</h1>
          <p className="text-muted-foreground">Comprehensive student records and academic information</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, registration number, email, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Advanced Filtering Section */}
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filtering - Separate Data by Level & Year
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Academic Level Filter */}
              <div>
                <Label className="text-xs text-muted-foreground">Academic Level</Label>
                <Select value={selectedLevel} onValueChange={handleLevelChange}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="bachelor">Bachelor</SelectItem>
                    <SelectItem value="masters">Masters</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year of Study Filter */}
              <div>
                <Label className="text-xs text-muted-foreground">Year of Study</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="1">First Year</SelectItem>
                    <SelectItem value="2">Second Year</SelectItem>
                    <SelectItem value="3">Third Year</SelectItem>
                    <SelectItem value="4">Fourth Year</SelectItem>
                    <SelectItem value="5">Fifth Year</SelectItem>
                    <SelectItem value="6">Sixth Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* College Filter */}
              <div>
                <Label className="text-xs text-muted-foreground">College</Label>
                <Select value={selectedCollege} onValueChange={handleCollegeChange}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="All Colleges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colleges</SelectItem>
                    {colleges.map((college) => (
                      <SelectItem key={college.id} value={college.id.toString()}>
                        {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department Filter */}
              <div>
                <Label className="text-xs text-muted-foreground">Department</Label>
                <Select 
                  value={selectedDepartment} 
                  onValueChange={handleDepartmentChange}
                  disabled={selectedCollege === "all"}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {getFilteredDepartments().map((department) => (
                      <SelectItem key={department.id} value={department.id.toString()}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course Filter */}
              <div>
                <Label className="text-xs text-muted-foreground">Course</Label>
                <Select 
                  value={selectedCourse} 
                  onValueChange={setSelectedCourse}
                  disabled={selectedDepartment === "all"}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {getFilteredCourses().map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Filter Summary */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredStudents.length} of {students.length} students
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedLevel("all");
                  setSelectedCollege("all");
                  setSelectedDepartment("all");
                  setSelectedCourse("all");
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Level Filter Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Levels</CardTitle>
          <CardDescription>Filter students by their academic level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedLevel === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLevel("all")}
            >
              All Levels ({students.length})
            </Button>
            <Button
              variant={selectedLevel === "certificate" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLevel("certificate")}
            >
              Certificate ({students.filter(s => s.academicLevel === 'certificate').length})
            </Button>
            <Button
              variant={selectedLevel === "diploma" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLevel("diploma")}
            >
              Diploma ({students.filter(s => s.academicLevel === 'diploma').length})
            </Button>
            <Button
              variant={selectedLevel === "bachelor" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLevel("bachelor")}
            >
              Bachelor ({students.filter(s => s.academicLevel === 'bachelor').length})
            </Button>
            <Button
              variant={selectedLevel === "masters" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLevel("masters")}
            >
              Masters ({students.filter(s => s.academicLevel === 'masters').length})
            </Button>
            <Button
              variant={selectedLevel === "phd" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLevel("phd")}
            >
              PhD ({students.filter(s => s.academicLevel === 'phd').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{students.filter(s => s.status === 'Active').length}</p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{new Set(students.map(s => s.course)).size}</p>
                <p className="text-sm text-muted-foreground">Different Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{students.filter(s => selectedLevel === "all" ? true : s.academicLevel === selectedLevel).length}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedLevel === "all" ? "All Levels" : 
                   selectedLevel === "certificate" ? "Certificate" :
                   selectedLevel === "diploma" ? "Diploma" :
                   selectedLevel === "bachelor" ? "Bachelor" :
                   selectedLevel === "masters" ? "Masters" :
                   selectedLevel === "phd" ? "PhD" : "Selected Level"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Records ({filteredStudents.length})</CardTitle>
          <CardDescription>
            Detailed information about all registered students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
              <p className="text-muted-foreground">
                {students.length === 0 
                  ? "No students registered in the system yet."
                  : "No students match your current filters. Try adjusting your search criteria."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
              <Card key={student.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      {/* Student Basic Info */}
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{student.name}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary">{student.registrationNumber}</Badge>
                            <Badge className={getStatusColor(student.status)}>
                              {student.status}
                            </Badge>
                            <Badge variant="outline">
                              Semester {student.currentSemester}
                            </Badge>
                            <Badge variant="default" className="bg-blue-600">
                              Year {student.yearOfStudy || 1}
                            </Badge>
                            <Badge 
                              variant={
                                student.academicLevel === 'certificate' ? 'secondary' :
                                student.academicLevel === 'diploma' ? 'outline' :
                                student.academicLevel === 'bachelor' ? 'default' :
                                student.academicLevel === 'masters' ? 'destructive' :
                                'secondary'
                              }
                              className="text-xs font-medium"
                            >
                              {student.academicLevel?.toUpperCase() || 'BACHELOR'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Academic Information - Real Data */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Course:</span>
                          </div>
                          <p className="text-muted-foreground ml-6">{student.course}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">College:</span>
                          </div>
                          <p className="text-muted-foreground ml-6">{student.college}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Academic Year:</span>
                          </div>
                          <p className="text-muted-foreground ml-6">{student.academicYear}</p>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{student.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Modal/Card */}
      {selectedStudent && (
        <Card className="fixed inset-4 z-50 bg-white shadow-2xl border-2 overflow-auto">
          <CardHeader className="bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Student Details</CardTitle>
                <CardDescription>{selectedStudent.name} - {selectedStudent.registrationNumber}</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSelectedStudent(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="academic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="academic">Academic Info</TabsTrigger>
              </TabsList>

              <TabsContent value="academic" className="space-y-6">
                {/* Basic Academic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Registration Number</Label>
                      <p className="text-lg font-semibold">{selectedStudent.registrationNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Academic Year</Label>
                      <p className="text-lg">{selectedStudent.academicYear}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Current Semester</Label>
                      <p className="text-lg">Semester {selectedStudent.currentSemester}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge className={getStatusColor(selectedStudent.status)}>
                        {selectedStudent.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Course</Label>
                      <p className="text-lg">{selectedStudent.course}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">College</Label>
                      <p className="text-lg">{selectedStudent.college}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Department</Label>
                      <p className="text-lg">{selectedStudent.department}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Enrollment Date</Label>
                      <p className="text-lg">{selectedStudent.enrollmentDate}</p>
                    </div>
                  </div>
                </div>

                {/* Student Programs for All Semesters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Academic Programs by Semester
                  </h3>
                  
                  {/* Semester 1 Programs */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Semester 1 - Programs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {studentPrograms[selectedStudent.id]?.filter((program: any) => program.semester === 1).length > 0 ? (
                          studentPrograms[selectedStudent.id]?.filter((program: any) => program.semester === 1).map((program: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded border">
                              <div className="flex items-center gap-3">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                <div>
                                  <p className="font-medium text-blue-900">{program.name}</p>
                                  <p className="text-sm text-blue-700">Lecturer: {program.lecturer_name}</p>
                                </div>
                              </div>
                              <Badge variant="secondary">Semester 1</Badge>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                            <BookOpen className="h-5 w-5 text-yellow-600" />
                            <div>
                              <p className="font-medium text-yellow-900">No Programs Assigned</p>
                              <p className="text-sm text-yellow-700">No programs have been assigned for Semester 1 yet.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Semester 2 Programs */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Semester 2 - Programs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {studentPrograms[selectedStudent.id]?.filter((program: any) => program.semester === 2).length > 0 ? (
                          studentPrograms[selectedStudent.id]?.filter((program: any) => program.semester === 2).map((program: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded border">
                              <div className="flex items-center gap-3">
                                <BookOpen className="h-5 w-5 text-green-600" />
                                <div>
                                  <p className="font-medium text-green-900">{program.name}</p>
                                  <p className="text-sm text-green-700">Lecturer: {program.lecturer_name}</p>
                                </div>
                              </div>
                              <Badge variant="secondary">Semester 2</Badge>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                            <BookOpen className="h-5 w-5 text-yellow-600" />
                            <div>
                              <p className="font-medium text-yellow-900">No Programs Assigned</p>
                              <p className="text-sm text-yellow-700">No programs have been assigned for Semester 2 yet.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
