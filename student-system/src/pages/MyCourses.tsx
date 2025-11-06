import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building, BookOpen, GraduationCap, User, Star, FileText, ClipboardList, Video, MessageSquare, Calendar, Play, CheckCircle, Clock } from "lucide-react";

// Database operations
const API_BASE_URL = 'https://must-lms-backend.onrender.com/api';

interface MyCoursesProps {
  onNavigate?: (section: string) => void;
}

export const MyCourses = ({ onNavigate }: MyCoursesProps = {}) => {
  // Real student data from localStorage
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [enrolledPrograms, setEnrolledPrograms] = useState<any[]>([]);
  const [shortTermPrograms, setShortTermPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
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
        
        // Fetch student info using secure endpoint (only current student's data)
        const studentResponse = await fetch(`${API_BASE_URL}/students/me?username=${encodeURIComponent(currentUser.username)}`);
        const studentResult = await studentResponse.json();
        
        let student = null;
        if (studentResult.success && studentResult.data) {
          student = studentResult.data;
          setStudentData(student);
          
          if (student) {
            // Fetch programs using secure endpoint (backend filters by student)
            const programsResponse = await fetch(`${API_BASE_URL}/students/${student.id}/programs`);
            const programsResult = await programsResponse.json();
            
            if (programsResult.success) {
              // Programs already filtered by backend - no need for frontend filtering
              setEnrolledPrograms(programsResult.data || []);
            } else {
              setEnrolledPrograms([]);
            }
          } else {
            setEnrolledPrograms([]);
          }
        } else {
          setEnrolledPrograms([]);
        }

        // Fetch courses
        const coursesResponse = await fetch(`${API_BASE_URL}/courses`);
        const coursesResult = await coursesResponse.json();
        
        if (coursesResult.success) {
          setCourses(coursesResult.data);
        }

        // Fetch short-term programs using student-specific endpoint (backend handles filtering)
        const shortTermResponse = await fetch(`${API_BASE_URL}/short-term-programs/student?student_username=${encodeURIComponent(currentUser.username)}`);
        const shortTermResult = await shortTermResponse.json();
        
        if (shortTermResult.success) {
          console.log('=== SHORT-TERM PROGRAMS DEBUG ===');
          console.log('Filtered Short-Term Programs from Backend:', shortTermResult.data);
          
          // Programs are already filtered by backend based on student's targeting
          // Backend already checked: college, department, course, program matching
          // We just need to verify they're still active
          const eligibleShortTermPrograms = shortTermResult.data.filter((program: any) => {
            const now = new Date();
            const endDate = new Date(program.end_date);
            if (now > endDate) {
              console.log(`❌ Program "${program.title}" expired`);
              return false;
            }
            console.log(`✅ Program "${program.title}" is active and eligible`);
            return true;
          });
          
          console.log('Eligible Short-Term Programs:', eligibleShortTermPrograms);
          setShortTermPrograms(eligibleShortTermPrograms);
        } else {
          console.log('No short-term programs data or student not found');
          setShortTermPrograms([]);
        }

        // Fetch lecturers
        const lecturersResponse = await fetch(`${API_BASE_URL}/lecturers`);
        const lecturersResult = await lecturersResponse.json();
        
        if (lecturersResult.success) {
          setLecturers(lecturersResult.data);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const studentInfo = {
    name: studentData?.name || currentUser?.username || "Student",
    registrationNumber: studentData?.registration_number || currentUser?.username || "Not logged in",
    academicYear: studentData?.academic_year || studentData?.academicYear || "2024/2025",
    currentSemester: studentData?.current_semester || studentData?.currentSemester || 1,
    college: studentData?.college || "MUST",
    department: studentData?.department || studentData?.department_name || "Computer Science Department",
    course: studentData?.course_name || studentData?.courseName || "BACHELOR OF ARCHITECTURE"
  };


  // Helper function to get course name
  const getCourseName = (courseId: string | number) => {
    const course = courses.find(c => c.id.toString() === courseId.toString());
    return course ? course.name : "Unknown Course";
  };

  // Helper function to get lecturer name for a program
  const getLecturerName = (lecturerName: string) => {
    const lecturer = lecturers.find(l => l.name === lecturerName || l.employee_id === lecturerName);
    return lecturer ? lecturer.name : lecturerName || "To be assigned";
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Programs</h1>
          <p className="text-muted-foreground">
            View your enrolled courses and track your academic progress
          </p>
        </div>
      </div>

      {/* Student Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{studentInfo.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
              <p className="text-lg font-semibold">{studentInfo.registrationNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Academic Year</p>
              <p className="text-lg font-semibold">{studentInfo.academicYear}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Semester</p>
              <p className="text-lg font-semibold">{studentInfo.currentSemester}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Institution</p>
              <p className="text-lg font-semibold">{studentInfo.college}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Course</p>
              <p className="text-lg font-semibold">{studentInfo.course}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Short-Term Programs Section */}
      {shortTermPrograms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-orange-600" />
              Available Short-Term Programs
            </CardTitle>
            <CardDescription>
              Special programs you're eligible to join based on your academic profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {shortTermPrograms.map((program) => (
                <div key={program.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{program.title}</h3>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">Short-Term</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{program.description}</p>
                  
                  <p className="text-sm text-muted-foreground">
                    Duration: {program.duration_value} {program.duration_unit} • Lecturer: {program.lecturer_name || "TBA"} • Target: {program.target_type === 'all' ? 'All Students' : `${program.target_type.charAt(0).toUpperCase() + program.target_type.slice(1)}: ${program.target_value || 'Not specified'}`}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Enrolled Programs
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading programs...</div>
            </div>
          ) : enrolledPrograms.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Programs Available</h3>
              <p className="mt-2 text-muted-foreground">
                Programs will appear here once they are created by the administration.
              </p>
              <Button className="mt-4" onClick={() => onNavigate?.('dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {enrolledPrograms.map((program) => (
                <div key={program.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{program.name}</h3>
                    <Badge variant="default">Available</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{program.description}</p>
                  
                  <p className="text-sm text-muted-foreground">
                    Course: {getCourseName(program.course_id)} • {program.total_semesters || program.totalSemesters || 1} Semesters • Lecturer: {program.lecturer_name || program.lecturerName || "TBA"}
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
