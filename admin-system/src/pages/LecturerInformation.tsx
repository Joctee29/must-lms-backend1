import { useState, useEffect } from "react";
import { lecturerOperations, courseOperations, initializeDatabase } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, BookOpen, Calendar, Mail, Phone, MapPin, Edit, Eye } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<LecturerInfo | null>(null);

  useEffect(() => {
    const loadLecturers = async () => {
      try {
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
            
            // Try to fetch real programs from database where this lecturer is assigned
            const programsResponse = await fetch(`https://must-lms-backend.onrender.com/api/programs`);
            if (programsResponse.ok) {
              const programsResult = await programsResponse.json();
              console.log('Programs API Response:', programsResult);
              
              if (programsResult.success && programsResult.data) {
                // Filter programs assigned to this lecturer
                const lecturerPrograms = programsResult.data.filter((program: any) => 
                  program.lecturer_id === lecturer.id || 
                  program.lecturer_name === lecturer.name
                );
                
                console.log(`Programs found for lecturer ${lecturer.name}:`, lecturerPrograms);
                
                if (lecturerPrograms.length > 0) {
                  // Get real course information and actual student count for each program
                  assignedCourses = await Promise.all(lecturerPrograms.map(async (program: any) => {
                    let courseInfo = null;
                    let actualStudentCount = 0;
                    
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
                    }
                    
                    // Get real student count from students table based on course_id
                    if (program.course_id) {
                      try {
                        const studentsResponse = await fetch(`https://must-lms-backend.onrender.com/api/students`);
                        if (studentsResponse.ok) {
                          const studentsResult = await studentsResponse.json();
                          if (studentsResult.success && studentsResult.data) {
                            // Count students enrolled in this course
                            actualStudentCount = studentsResult.data.filter((student: any) => 
                              student.course_id === program.course_id
                            ).length;
                            console.log(`Real student count for course ${program.course_id}: ${actualStudentCount}`);
                          }
                        }
                      } catch (err) {
                        console.error('Error fetching students count:', err);
                      }
                    }
                    
                    return {
                      id: program.id.toString(),
                      subjectName: program.name || courseInfo?.name || 'Program Subject',
                      subjectCode: courseInfo?.code || program.code || 'N/A',
                      program: courseInfo?.name || program.name || 'Program',
                      semester: program.semester || 1,
                      students: actualStudentCount // Real student count from database
                    };
                  }));
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
            status: "active" as const,
            assignedCourses: assignedCourses,
            officeLocation: lecturer.office_location || `${departmentInfo?.name || 'Department'} Office`,
            officeHours: lecturer.office_hours || "Mon-Fri 10:00-12:00 PM"
          };
          
          console.log('Formatted Lecturer:', formattedLecturer);
          return formattedLecturer;
        }));

        setLecturers(formattedLecturers);
      } catch (error) {
        console.error('Error loading lecturers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLecturers();
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
                      <Badge variant={lecturer.status === "active" ? "default" : "secondary"}>
                        {lecturer.status}
                      </Badge>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedLecturer(lecturer)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Academic Information</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Department:</span>
                        <span>{lecturer.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>College:</span>
                        <span>{lecturer.college}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Specialization:</span>
                        <span>{lecturer.specialization}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
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

      {/* Lecturer Details Modal */}
      {selectedLecturer && (
        <Card className="fixed inset-4 z-50 bg-white shadow-2xl border-2 overflow-auto">
          <CardHeader className="bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Lecturer Details</CardTitle>
                <CardDescription>{selectedLecturer.name} - {selectedLecturer.employeeId}</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSelectedLecturer(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Full Name:</span> {selectedLecturer.name}</p>
                      <p><span className="font-medium">Employee ID:</span> {selectedLecturer.employeeId}</p>
                      <p><span className="font-medium">Email:</span> {selectedLecturer.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedLecturer.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Academic Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Department:</span> {selectedLecturer.department}</p>
                      <p><span className="font-medium">College:</span> {selectedLecturer.college}</p>
                      <p><span className="font-medium">Specialization:</span> {selectedLecturer.specialization}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teaching Load by Semester */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Teaching Load by Semester</h3>
                
                {/* Semester 1 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Semester 1 - Subjects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedLecturer.assignedCourses.filter(course => course.semester === 1).length > 0 ? (
                        selectedLecturer.assignedCourses.filter(course => course.semester === 1).map((course, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded border">
                            <div className="flex items-center gap-3">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium text-blue-900">{course.subjectName}</p>
                                <p className="text-sm text-blue-700">Code: {course.subjectCode} | Program: {course.program}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary">{course.students} Students</Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No subjects assigned for Semester 1</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Semester 2 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Semester 2 - Subjects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedLecturer.assignedCourses.filter(course => course.semester === 2).length > 0 ? (
                        selectedLecturer.assignedCourses.filter(course => course.semester === 2).map((course, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded border">
                            <div className="flex items-center gap-3">
                              <BookOpen className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium text-green-900">{course.subjectName}</p>
                                <p className="text-sm text-green-700">Code: {course.subjectCode} | Program: {course.program}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary">{course.students} Students</Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No subjects assigned for Semester 2</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
