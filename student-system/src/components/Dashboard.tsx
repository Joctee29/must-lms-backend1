import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  BarChart3,
  Award,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Database operations
const API_BASE_URL = 'https://must-lms-backend.onrender.com/api';

export const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [studentPrograms, setStudentPrograms] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState<string>("2024/2025");
  const [activeSemester, setActiveSemester] = useState<number>(1);

  useEffect(() => {
    // Get current user from localStorage
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!currentUser?.username) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Initialize with empty data - no fake data
        setStudentData(null);

        console.log('=== STUDENT DASHBOARD DATA FETCH ===');
        console.log('Current User:', currentUser);
        
        // Fetch active academic period so student dashboard follows Academic Settings
        let semesterFilter = 1;
        try {
          const periodResponse = await fetch(`${API_BASE_URL}/academic-periods/active`);
          if (periodResponse.ok) {
            const periodResult = await periodResponse.json();
            console.log('Academic Period Response (student):', periodResult);
            const period = periodResult.data || periodResult;
            if (period && period.academic_year) {
              const year = period.academic_year as string;
              const sem = (period.semester as number) || 1;
              semesterFilter = sem;
              setActiveAcademicYear(year);
              setActiveSemester(sem);
            }
          }
        } catch (periodError) {
          console.error('Error fetching academic period for student dashboard:', periodError);
        }

        // Use the dedicated /api/students/me endpoint for students
        const response = await fetch(`${API_BASE_URL}/students/me?username=${encodeURIComponent(currentUser.username)}`);
        if (response.ok) {
          const result = await response.json();
          console.log('Student API Response:', result);
          
          if (result.success && result.data) {
            const student = result.data;
            
            console.log('Found Student:', student);
            
            if (student) {
              // Fetch complete course information
              let courseInfo = null;
              if (student.course_id) {
                try {
                  const courseResponse = await fetch(`${API_BASE_URL}/courses/${student.course_id}`);
                  if (courseResponse.ok) {
                    const courseResult = await courseResponse.json();
                    courseInfo = courseResult.data;
                    console.log('Course Info:', courseInfo);
                  }
                } catch (err) {
                  console.error('Error fetching course info:', err);
                }
              }
              
              // Fetch department information
              let departmentInfo = null;
              if (courseInfo?.department_id) {
                try {
                  const deptResponse = await fetch(`${API_BASE_URL}/departments/${courseInfo.department_id}`);
                  if (deptResponse.ok) {
                    const deptResult = await deptResponse.json();
                    departmentInfo = deptResult.data;
                    console.log('Department Info:', departmentInfo);
                  }
                } catch (err) {
                  console.error('Error fetching department info:', err);
                }
              }
              
              // Fetch college information
              let collegeInfo = null;
              if (departmentInfo?.college_id) {
                try {
                  const collegeResponse = await fetch(`${API_BASE_URL}/colleges/${departmentInfo.college_id}`);
                  if (collegeResponse.ok) {
                    const collegeResult = await collegeResponse.json();
                    collegeInfo = collegeResult.data;
                    console.log('College Info:', collegeInfo);
                  }
                } catch (err) {
                  console.error('Error fetching college info:', err);
                }
              }
              
              // Set complete student data with real information
              const completeStudentData = {
                ...student,
                // Real course information
                course_name: courseInfo?.name || student.course_name || 'Unknown Course',
                course_code: courseInfo?.code || student.course_code || 'N/A',
                // Real department information
                department: departmentInfo?.name || student.department_name || student.department || 'Unknown Department',
                // Real college information
                college: collegeInfo?.name || student.college_name || student.college || 'Unknown College',
                // Academic information
                academic_year: activeAcademicYear || student.academic_year || '2024/2025',
                current_semester: activeSemester || student.current_semester || 1,
                // Academic level from course
                academic_level: courseInfo?.academic_level || courseInfo?.academicLevel || 'bachelor'
              };
              
              console.log('Complete Student Data:', completeStudentData);
              setStudentData(completeStudentData);
              
              // Fetch programs and assignments immediately after setting student data
              await fetchProgramsAndAssignments(completeStudentData);
              
            } else {
              console.log('No student found matching current user');
              setError('Student record not found. Please contact administrator.');
            }
          }
        } else {
          console.error('Failed to fetch students:', response.status);
          setError('Failed to load student data. Please try again.');
        }
        
      } catch (error) {
        console.error('Error fetching student data:', error);
        setError("Unable to connect to server. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Separate function for fetching programs and assignments
    const fetchProgramsAndAssignments = async (studentInfo: any) => {
      if (!studentInfo) return;
      
      try {
        console.log('=== FETCHING PROGRAMS AND ASSIGNMENTS ===');
        console.log('Student Data for Programs:', studentInfo);
        
        // Pass user_type and student_id for proper authorization
        const programsResponse = await fetch(`${API_BASE_URL}/programs?user_type=student&student_id=${studentInfo.id}`);
        
        if (programsResponse.ok) {
          const programsResult = await programsResponse.json();
          console.log('Programs API Response:', programsResult);
          
          if (programsResult.success && programsResult.data) {
            console.log('Student Programs Found:', programsResult.data);

            // Filter programs by active semester when semester field is set
            const filteredPrograms = programsResult.data.filter((program: any) => {
              if (program.semester == null) return true;
              return program.semester === (activeSemester || semesterFilter);
            });

            setStudentPrograms(filteredPrograms);
            
            // Now fetch assignments based on found programs - pass student_id for filtering
            const assignmentsResponse = await fetch(`${API_BASE_URL}/assignments?user_type=student&student_id=${studentInfo.id}`);
            
            if (assignmentsResponse.ok) {
              const assignmentsResult = await assignmentsResponse.json();
              console.log('Assignments API Response:', assignmentsResult);
              
              if (assignmentsResult.success && assignmentsResult.data) {
                console.log('Student Assignments Found:', assignmentsResult.data);
                setAssignments(assignmentsResult.data);
              }
            } else {
              console.log('No assignments endpoint available');
              setAssignments([]);
            }
          } else {
            console.log('No programs found in API response');
            setStudentPrograms([]);
            setAssignments([]);
          }
        } else {
          console.log('Programs API call failed');
          setStudentPrograms([]);
          setAssignments([]);
        }
      } catch (err) {
        console.error('Error fetching programs/assignments:', err);
        // Keep arrays empty if error - no fake data
        setStudentPrograms([]);
        setAssignments([]);
      }
    };

    
    fetchStudentData();
  }, [currentUser]);

  // Calculate stats
  const totalPrograms = studentPrograms.length;
  const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const averageGrade = completedAssignments > 0 ? Math.round((completedAssignments / assignments.length) * 100) : 0;

  const recentActivities: any[] = []; // No fake activities - keep empty

  const achievements = [
    { title: "Student Registered", icon: GraduationCap, earned: !!studentData },
    { title: "First Login", icon: Calendar, earned: !!currentUser },
    { title: "Program Explorer", icon: Award, earned: totalPrograms > 0 },
    { title: "Assignment Ready", icon: TrendingUp, earned: assignments.length > 0 }
  ];

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">
            Welcome back, {studentData?.name || currentUser?.username || 'Student'}!
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Continue your learning journey at MBEYA University of Science and Technology
          </p>
          {studentData && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs md:text-sm">Registration: {studentData.registration_number}</Badge>
              <Badge variant="secondary" className="text-xs md:text-sm">
                {studentData.college_name || studentData.college || "College of Informatics and Virtual Education"}
              </Badge>
            </div>
          )}
        </div>
        <Button className="w-full md:w-auto bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
          <BookOpen className="mr-2 h-4 w-4" />
          Browse Courses
        </Button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-800">⚠️ {error}</div>
        </div>
      )}

      {/* Current Course Information */}
      {studentData && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <GraduationCap className="mr-2 h-5 w-5" />
              Current Course Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-semibold text-blue-700">Course</h4>
                <p className="text-sm">{studentData.course_name || "Course not assigned"}</p>
                <p className="text-xs text-muted-foreground">Code: {studentData.course_code || "N/A"}</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700">Academic Details</h4>
                <p className="text-sm">Year: {studentData.academic_year || "Not set"}</p>
                <p className="text-sm">Semester: {studentData.current_semester || 1}</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700">Institution</h4>
                <p className="text-sm">MUST</p>
                <p className="text-xs text-muted-foreground">{studentData.department_name || studentData.department || "Department of Computer Science"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalPrograms}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalPrograms === 0 ? "No programs enrolled yet" : `${totalPrograms} programs available`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {assignments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingAssignments > 0 ? `${pendingAssignments} pending` : "All up to date"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Programs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                My Programs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading programs...</div>
                </div>
              ) : studentPrograms.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Programs Yet</h3>
                  <p className="mt-2 text-muted-foreground">
                    Available programs will appear here once you're enrolled.
                  </p>
                </div>
              ) : (
                studentPrograms.map((program) => (
                  <div key={program.id} className="flex items-center space-x-4 rounded-lg border p-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{program.name}</h3>
                        <Badge variant="default">Enrolled</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{program.description || "Program description"}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Semesters</span>
                          <span>{program.total_semesters || program.totalSemesters || 1} semesters</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lecturer: {program.lecturer_name || program.lecturerName || "TBA"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No upcoming events</p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement, index) => {
                const IconComponent = achievement.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      achievement.earned ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className={`text-sm font-medium ${
                      achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {achievement.title}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
