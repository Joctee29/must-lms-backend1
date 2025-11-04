import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, Calendar, Clock, CheckCircle, Play, FileText, MessageSquare, BarChart3 } from "lucide-react";

// Database operations
const API_BASE_URL = 'https://must-lms-backend.onrender.com/api';

interface LecturerCourse {
  id: string;
  subjectName: string;
  subjectCode: string;
  college: string;
  department: string;
  course: string;
  program: string;
  semester: number;
  credits: number;
  enrolledStudents: number;
  totalLessons: number;
  completedLessons: number;
  nextLesson: string;
  schedule: string;
  status: "Active" | "Completed" | "Upcoming";
  progress: number;
}

interface MyCoursesProps {
  onNavigate?: (section: string, courseId?: string, courseName?: string) => void;
}

export const MyCourses = ({ onNavigate }: MyCoursesProps = {}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [lecturerData, setLecturerData] = useState<any>(null);
  const [shortTermPrograms, setShortTermPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.username) return;
      
      try {
        setLoading(true);
        
        // Fetch lecturer info first
        const lecturerResponse = await fetch(`${API_BASE_URL}/lecturers`);
        const lecturerResult = await lecturerResponse.json();
        
        let lecturer = null;
        if (lecturerResult.success) {
          lecturer = lecturerResult.data.find((l: any) => 
            l.employee_id === currentUser.username
          );
          setLecturerData(lecturer);
        }

        // Fetch programs after lecturer data is available
        const programsResponse = await fetch(`${API_BASE_URL}/programs`);
        const programsResult = await programsResponse.json();
        
        if (programsResult.success) {
          // Filter programs assigned to this lecturer - REAL FILTERING
          const assignedPrograms = programsResult.data.filter((p: any) => {
            // Check against lecturer data from database
            const isAssigned = p.lecturer_name === currentUser.username || 
                              p.lecturer_name === lecturer?.name ||
                              p.lecturer_name === lecturer?.employee_id ||
                              p.lecturerName === currentUser.username || 
                              p.lecturerName === lecturer?.name ||
                              p.lecturerName === lecturer?.employee_id;
            
            return isAssigned;
          });
          
          setPrograms(assignedPrograms);
        }

        // Fetch short-term programs assigned to this lecturer
        const shortTermResponse = await fetch(`${API_BASE_URL}/short-term-programs`);
        const shortTermResult = await shortTermResponse.json();
        
        if (shortTermResult.success) {
          const assignedShortTermPrograms = shortTermResult.data.filter((p: any) => {
            return p.lecturer_name === currentUser.username || 
                   p.lecturer_name === lecturer?.name ||
                   p.lecturer_name === lecturer?.employee_id;
          });
          setShortTermPrograms(assignedShortTermPrograms);
        }

        // Fetch courses
        const coursesResponse = await fetch(`${API_BASE_URL}/courses`);
        const coursesResult = await coursesResponse.json();
        
        if (coursesResult.success) {
          setCourses(coursesResult.data);
        }

        // Fetch students
        const studentsResponse = await fetch(`${API_BASE_URL}/students`);
        const studentsResult = await studentsResponse.json();
        
        if (studentsResult.success) {
          setStudents(studentsResult.data);
        }

        // Fetch departments
        const departmentsResponse = await fetch(`${API_BASE_URL}/departments`);
        const departmentsResult = await departmentsResponse.json();
        
        if (departmentsResult.success) {
          setDepartments(departmentsResult.data);
        }

        // Fetch colleges
        const collegesResponse = await fetch(`${API_BASE_URL}/colleges`);
        const collegesResult = await collegesResponse.json();
        
        if (collegesResult.success) {
          setColleges(collegesResult.data);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Real data - from database
  const lecturerCourses = programs;

  const totalStudents = 0; // Will be calculated from actual enrollments
  const activeCourses = programs.length;
  const completedCourses = 0; // Will be calculated from program completion

  // Helper functions
  const getCourseName = (courseId: string | number) => {
    if (!courseId) return "Unknown Course";
    const course = courses.find(c => c.id.toString() === courseId.toString());
    return course ? course.name : "Unknown Course";
  };

  const getCourseInfo = (courseId: string | number) => {
    if (!courseId) return null;
    const course = courses.find(c => c.id.toString() === courseId.toString());
    if (!course) return null;
    
    // Get department name
    const department = departments.find(d => d.id === course.department_id);
    return {
      ...course,
      department: department?.name || "Unknown Department"
    };
  };

  const getStudentCount = (programId: string | number) => {
    // Count real students enrolled in this program's course
    const program = programs.find(p => p.id == programId);
    if (!program) return 0;
    
    // Count students in the same course as this program
    const studentsInCourse = students.filter(student => 
      student.course_id == program.course_id
    );
    return studentsInCourse.length;
  };

  const getCollegeName = (courseId: string | number) => {
    if (!courseId) return "Unknown College";
    const course = courses.find(c => c.id.toString() === courseId.toString());
    if (!course) return "Unknown College";
    
    const department = departments.find(d => d.id === course.department_id);
    if (!department) return "Unknown College";
    
    const college = colleges.find(col => col.id === department.college_id);
    return college ? college.name : "Unknown College";
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Programs</h1>
          <p className="text-muted-foreground">
            Manage your assigned programs and track student progress
          </p>
        </div>
      </div>

      {/* Lecturer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Lecturer Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{lecturerData?.name || currentUser?.username || "Lecturer"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
              <p className="text-lg font-semibold">{lecturerData?.employee_id || currentUser?.username || "Not logged in"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg font-semibold">{lecturerData?.email || "To be updated"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Specialization</p>
              <p className="text-lg font-semibold">{lecturerData?.specialization || "To be updated"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.length}</div>
            <p className="text-xs text-muted-foreground">Assigned programs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Short-Term Programs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shortTermPrograms.length}</div>
            <p className="text-xs text-muted-foreground">Active short programs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : programs.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {programs.length === 0 ? "No programs assigned" : `${programs.length} programs assigned`}
            </p>
          </CardContent>
        </Card>
        
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lecturer Status</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {lecturerData ? "Active" : "Pending"}
            </div>
            <p className="text-xs text-muted-foreground">
              {lecturerData ? "Registered lecturer" : "Registration needed"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Short-Term Programs Section */}
      {shortTermPrograms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Short-Term Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {shortTermPrograms.map((program) => (
                <div key={program.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{program.title}</h3>
                    <Badge variant={new Date(program.end_date) > new Date() ? "default" : "destructive"}>
                      {new Date(program.end_date) > new Date() ? "Active" : "Expired"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{program.description}</p>
                  
                  <p className="text-sm text-muted-foreground">
                    Duration: {program.duration_value} {program.duration_unit} • Target: {program.target_type === 'all' ? 'All Students' : `${program.target_type.charAt(0).toUpperCase() + program.target_type.slice(1)}: ${program.target_value || 'Not specified'}`} • Period: {new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regular Programs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Regular Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading regular programs...</div>
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Programs Assigned</h3>
              <p className="mt-2 text-muted-foreground">
                You haven't been assigned any programs yet. Contact the administration for program assignments.
              </p>
              <Button className="mt-4" onClick={() => onNavigate?.('dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {programs.map((program) => program && (
                <div key={program.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{program?.name || 'Unknown Program'}</h3>
                    <Badge variant="default">Available</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{program?.description || 'No description available'}</p>
                  
                  <p className="text-sm text-muted-foreground">
                    Course: {getCourseName(program?.course_id)} • {program?.totalSemesters || program?.total_semesters || 1} Semesters • Students: {getStudentCount(program?.id)} • College: {getCollegeName(program?.course_id) || "Unknown College"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
