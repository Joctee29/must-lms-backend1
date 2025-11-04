import { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  BarChart3,
  Clock,
  Calendar,
  TrendingUp,
  Award,
  MessageSquare,
  FileText,
  Plus,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Database operations
const API_BASE_URL = 'https://must-lms-backend.onrender.com/api';

export const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lecturerData, setLecturerData] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get current user from localStorage
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
        
        // Fetch lecturer info
        const lecturerResponse = await fetch(`${API_BASE_URL}/lecturers`);
        const lecturerResult = await lecturerResponse.json();
        
        let lecturer = null;
        if (lecturerResult.success) {
          lecturer = lecturerResult.data.find((l: any) => 
            l.employee_id === currentUser.username
          );
          setLecturerData(lecturer);
        }

        // Fetch programs
        const programsResponse = await fetch(`${API_BASE_URL}/programs`);
        const programsResult = await programsResponse.json();
        
        if (programsResult.success) {
          // Filter programs assigned to this lecturer - REAL FILTERING
          const assignedPrograms = programsResult.data.filter((p: any) => {
            // Check against lecturer data from database
            return p.lecturerName === currentUser.username || 
                   p.lecturerName === lecturer?.name ||
                   p.lecturerName === lecturer?.employee_id;
          });
          
          console.log(`Lecturer ${currentUser.username} has ${assignedPrograms.length} assigned programs:`, assignedPrograms);
          setPrograms(assignedPrograms);
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
        
      } catch (error) {
        console.error('Error fetching lecturer dashboard data:', error);
        setError('Failed to load dashboard data');
        // Set empty data on error to prevent crashes
        setPrograms([]);
        setCourses([]);
        setStudents([]);
        setLecturerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Mock data for display (will be replaced with real data from enrollment system)
  const upcomingEvents = [
    {
      title: "System Setup Required",
      date: "Enrollment system needed",
      type: "system"
    }
  ];

  const achievements = [
    { title: "First Course Completed", icon: GraduationCap, earned: true },
    { title: "Perfect Attendance", icon: Calendar, earned: true },
    { title: "Top Performer", icon: Award, earned: false },
    { title: "Quick Learner", icon: TrendingUp, earned: true }
  ];

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center py-8">
          <div className="text-red-500">{error}</div>
          <Button 
            onClick={() => {
              setError(null);
              setLoading(true);
              // Retry loading
              const user = localStorage.getItem('currentUser');
              if (user) {
                setCurrentUser(JSON.parse(user));
              }
            }}
            className="mt-4"
          >
            Retry
          </Button>
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
            Welcome back, {lecturerData?.name || currentUser?.username || 'Lecturer'}!
          </h1>
          <p className="text-muted-foreground">
            Manage your courses and students at MBEYA University of Science and Technology
          </p>
          {currentUser && (
            <Badge variant="outline" className="mt-2">
              Logged in with real database credentials
            </Badge>
          )}
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
          <BookOpen className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {programs?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {programs?.length === 0 ? "No programs assigned" : `${programs?.length || 0} programs assigned`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {students?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {students?.length === 0 ? "No students registered" : `${students?.length || 0} students in database`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {courses?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {courses?.length === 0 ? "No courses available" : `${courses?.length || 0} courses in database`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lecturer Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Courses */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                My Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading programs...</div>
                </div>
              ) : (programs?.length || 0) === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Programs Assigned</h3>
                  <p className="mt-2 text-muted-foreground">
                    You haven't been assigned any programs yet.
                  </p>
                </div>
              ) : (
                programs?.map((program, index) => (
                  <div key={program?.id || index} className="flex items-center space-x-4 rounded-lg border p-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{program?.name || 'Unknown Program'}</h3>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{program?.description || 'No description'}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Program Status</span>
                          <span>Available</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Semesters: {program?.totalSemesters || 'N/A'}</span>
                        <span className="text-muted-foreground">Real Data</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
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
                Upcoming Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`h-3 w-3 rounded-full ${
                    event.type === 'live' ? 'bg-success' :
                    event.type === 'assignment' ? 'bg-secondary' : 'bg-progress'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Teaching Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements?.map((achievement, index) => {
                const IconComponent = achievement.icon;
                if (!IconComponent) return null;
                
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${achievement.earned ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className={`text-sm ${achievement.earned ? 'font-medium' : 'text-muted-foreground'}`}>
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
