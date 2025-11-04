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
        
        // Set fallback data immediately to prevent crashes
        setStudentData({
          name: currentUser?.username || "Student",
          registration_number: currentUser?.username || "N/A",
          college: "MUST",
          department: "Computer Science",
          course_name: "Bachelor of Computer Science",
          course_code: "CS001",
          academic_year: "2024/2025",
          current_semester: 1
        });

        // Try to fetch real data
        const response = await fetch(`${API_BASE_URL}/students`);
        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            const student = result.data.find((s: any) => 
              s.registration_number === currentUser.username
            );
            
            if (student) {
              setStudentData({
                ...student,
                college: student.college || "MUST",
                department: student.department || "Computer Science",
                course_name: student.course_name || "Bachelor of Computer Science",
                course_code: student.course_code || "CS001",
                academic_year: student.academic_year || "2024/2025",
                current_semester: student.current_semester || 1
              });
            }
          }
        }

        // Set mock data for programs and assignments
        setEnrolledCourses([{
          id: 1,
          name: studentData?.course_name || "Bachelor of Computer Science",
          code: studentData?.course_code || "CS001",
          college: studentData?.college || "MUST",
          department: studentData?.department || "Computer Science",
          programs: "Available Programs",
          totalSemesters: studentData?.current_semester || 1,
          description: `${studentData?.college || "MUST"} - ${studentData?.department || "Computer Science"}`
        }]);

        setStudentPrograms([{
          id: 1,
          name: "Computer Science Program",
          description: "Bachelor's degree program in Computer Science",
          lecturer_name: "Dr. Smith",
          total_semesters: 8,
          duration: 4
        }]);

        setAssignments([
          { id: 1, title: "Programming Assignment", status: "pending", dueDate: "2024-12-01" },
          { id: 2, title: "Database Project", status: "completed", dueDate: "2024-11-15" }
        ]);
        
      } catch (error) {
        console.error('Error fetching student data:', error);
        setError("Unable to connect to server. Showing offline data.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [currentUser]);

  // Calculate stats
  const totalPrograms = studentPrograms.length;
  const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const averageGrade = completedAssignments > 0 ? Math.round((completedAssignments / assignments.length) * 100) : 0;

  const recentActivities = [
    { id: 1, title: "New Assignment Posted", time: "2 hours ago", type: "assignment" },
    { id: 2, title: "Grade Updated", time: "1 day ago", type: "grade" },
    { id: 3, title: "Course Material Added", time: "3 days ago", type: "material" }
  ];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {studentData?.name || currentUser?.username || 'Student'}!
          </h1>
          <p className="text-muted-foreground">
            Continue your learning journey at MBEYA University of Science and Technology
          </p>
          {studentData && (
            <div className="mt-2 space-y-1">
              <Badge variant="outline">Registration: {studentData.registration_number}</Badge>
              <Badge variant="secondary" className="ml-2">
                {enrolledCourses[0]?.college || "College Info Loading..."}
              </Badge>
            </div>
          )}
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
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
                <p className="text-xs text-muted-foreground">{studentData.department || "Department not assigned"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {averageGrade > 0 ? `${averageGrade}%` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedAssignments > 0 ? `${completedAssignments} completed` : "No grades yet"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-progress">
              {achievements.filter(a => a.earned).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {achievements.filter(a => a.earned).length} of {achievements.length} earned
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
