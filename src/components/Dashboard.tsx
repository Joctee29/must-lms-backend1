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

export const Dashboard = () => {
  const enrolledCourses = [
    {
      id: 1,
      title: "Advanced Mathematics",
      instructor: "Dr. Sarah Johnson",
      progress: 75,
      nextLesson: "Calculus Integration",
      dueDate: "2024-01-25",
      status: "In Progress"
    },
    {
      id: 2,
      title: "Physics Laboratory",
      instructor: "Prof. Michael Chen",
      progress: 45,
      nextLesson: "Quantum Mechanics Lab",
      dueDate: "2024-01-28",
      status: "In Progress"
    },
    {
      id: 3,
      title: "Computer Science Fundamentals",
      instructor: "Dr. Emily Rodriguez",
      progress: 100,
      nextLesson: "Course Completed",
      dueDate: "Completed",
      status: "Completed"
    }
  ];

  const upcomingEvents = [
    {
      title: "Live Session: Data Structures",
      date: "Today, 2:00 PM",
      type: "live"
    },
    {
      title: "Assignment Due: Research Paper",
      date: "Tomorrow",
      type: "assignment"
    },
    {
      title: "Exam: Advanced Mathematics",
      date: "Jan 30, 2024",
      type: "exam"
    }
  ];

  const achievements = [
    { title: "First Course Completed", icon: GraduationCap, earned: true },
    { title: "Perfect Attendance", icon: Calendar, earned: true },
    { title: "Top Performer", icon: Award, earned: false },
    { title: "Quick Learner", icon: TrendingUp, earned: true }
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, John!</h1>
          <p className="text-muted-foreground">
            Continue your learning journey at MBEYA University of Science and Technology
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
          <BookOpen className="mr-2 h-4 w-4" />
          Browse Courses
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">6</div>
            <p className="text-xs text-muted-foreground">2 completed this semester</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">47.5</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">85.2%</div>
            <p className="text-xs text-muted-foreground">Above class average</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-progress">3</div>
            <p className="text-xs text-muted-foreground">2 pending completion</p>
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
              {enrolledCourses.map((course) => (
                <div key={course.id} className="flex items-center space-x-4 rounded-lg border p-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{course.title}</h3>
                      <Badge variant={course.status === "Completed" ? "default" : "secondary"}>
                        {course.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{course.instructor}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Next: {course.nextLesson}</span>
                      <span className="text-muted-foreground">Due: {course.dueDate}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Continue
                  </Button>
                </div>
              ))}
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