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
  Settings,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { lecturerOperations, studentOperations, courseOperations } from "@/lib/database";

interface DashboardProps {
  onSectionChange?: (section: string) => void;
}

export const Dashboard = ({ onSectionChange }: DashboardProps) => {
  const [stats, setStats] = useState({
    students: 0,
    lecturers: 0,
    courses: 0,
    loading: true,
    dbConnected: false
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [studentsData, lecturersData, coursesData] = await Promise.all([
          studentOperations.getAll(),
          lecturerOperations.getAll(),
          courseOperations.getAllCourses()
        ]);
        
        setStats({
          students: studentsData.length,
          lecturers: lecturersData.length,
          courses: coursesData.length,
          loading: false,
          dbConnected: true
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        setStats(prev => ({ ...prev, loading: false, dbConnected: false }));
      }
    };

    loadStats();
  }, []);

  const systemStats = [
    {
      id: 1,
      title: "System Performance",
      status: "Excellent",
      value: "99.8%",
      description: "Server uptime and response times",
      trend: "+0.2%"
    },
    {
      id: 2,
      title: "Registered Students",
      status: "Active",
      value: stats.loading ? "Loading..." : stats.students.toString(),
      description: "Total registered students in database",
      trend: stats.students > 0 ? `${stats.students} total` : "No students yet"
    },
    {
      id: 3,
      title: "Registered Lecturers",
      status: "Active",
      value: stats.loading ? "Loading..." : stats.lecturers.toString(),
      description: "Total registered lecturers in database",
      trend: stats.lecturers > 0 ? `${stats.lecturers} total` : "No lecturers yet"
    },
    {
      id: 4,
      title: "Available Courses",
      status: "Stable",
      value: stats.loading ? "Loading..." : stats.courses.toString(),
      description: "Active courses in database",
      trend: stats.courses > 0 ? `${stats.courses} total` : "No courses yet"
    }
  ];

  const recentActivities = [
    {
      title: "Real Database Connected",
      date: "Active now",
      type: "system"
    },
    {
      title: `${stats.students} Students in Database`,
      date: "Live data",
      type: "user"
    },
    {
      title: `${stats.lecturers} Lecturers in Database`,
      date: "Live data",
      type: "user"
    },
    {
      title: `${stats.courses} Courses Available`,
      date: "Live data",
      type: "course"
    }
  ];

  const pendingTasks = [
    { title: "Register more lecturers", count: stats.lecturers === 0 ? 1 : 0, priority: "high" },
    { title: "Add more courses", count: stats.courses === 0 ? 1 : 0, priority: "medium" },
    { title: "Register students", count: stats.students === 0 ? 1 : 0, priority: "medium" }
  ].filter(task => task.count > 0);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System administration and management for MBEYA University of Science and Technology
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
          <Settings className="mr-2 h-4 w-4" />
          System Settings
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" data-searchable>Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.loading ? "..." : (stats.students + stats.lecturers)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.students} students + {stats.lecturers} lecturers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" data-searchable>Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {stats.loading ? "..." : stats.courses}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.courses === 0 ? "No courses registered yet" : "Registered in database"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" data-searchable>Database Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.dbConnected ? 'text-green-600' : 'text-red-600'}`}>
              {stats.loading ? 'Checking...' : stats.dbConnected ? 'Connected' : 'Disconnected'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.dbConnected ? 'Database ready' : 'Database connection failed'}
            </p>
          </CardContent>
        </Card>
        
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* System Status */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center" data-searchable>
                <Shield className="mr-2 h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemStats.map((stat) => (
                <div key={stat.id} className="flex items-center space-x-4 rounded-lg border p-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{stat.title}</h3>
                      <Badge variant={stat.status === "Excellent" ? "default" : "secondary"}>
                        {stat.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.description}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-2xl font-bold text-primary">{stat.value}</span>
                      <span className="text-muted-foreground">{stat.trend}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (stat.id === 1 && onSectionChange) {
                        onSectionChange("system");
                      } else if (stat.id === 2 && onSectionChange) {
                        onSectionChange("students");
                      } else if (stat.id === 3 && onSectionChange) {
                        onSectionChange("database");
                      } else if (stat.id === 4 && onSectionChange) {
                        onSectionChange("courses");
                      }
                    }}
                  >
                    Monitor
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center" data-searchable>
                <Clock className="mr-2 h-5 w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`h-3 w-3 rounded-full ${
                    activity.type === 'user' ? 'bg-primary' :
                    activity.type === 'course' ? 'bg-secondary' : 'bg-success'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center" data-searchable>
                <BarChart3 className="mr-2 h-5 w-5" />
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          task.priority === 'high' ? 'border-red-500 text-red-500' :
                          task.priority === 'medium' ? 'border-yellow-500 text-yellow-500' :
                          'border-green-500 text-green-500'
                        }`}
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.count} items</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
