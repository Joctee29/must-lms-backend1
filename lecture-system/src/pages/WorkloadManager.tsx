import { useState } from "react";
import {
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  User,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TeacherWorkload {
  id: number;
  name: string;
  email: string;
  department: string;
  courses: {
    id: number;
    title: string;
    code: string;
    students: number;
    hoursPerWeek: number;
    type: "Lecture" | "Lab" | "Tutorial";
  }[];
  totalHours: number;
  maxHours: number;
  overloaded: boolean;
  efficiency: number;
}

export const WorkloadManager = () => {
  const [teachers, setTeachers] = useState<TeacherWorkload[]>([
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@must.ac.tz",
      department: "Mathematics",
      courses: [
        { id: 1, title: "Advanced Mathematics", code: "MATH301", students: 45, hoursPerWeek: 6, type: "Lecture" },
        { id: 2, title: "Calculus II", code: "MATH201", students: 38, hoursPerWeek: 4, type: "Lecture" },
        { id: 3, title: "Math Tutorial", code: "MATH101T", students: 25, hoursPerWeek: 2, type: "Tutorial" },
      ],
      totalHours: 12,
      maxHours: 16,
      overloaded: false,
      efficiency: 85,
    },
    {
      id: 2,
      name: "Prof. Michael Chen",
      email: "michael.chen@must.ac.tz",
      department: "Physics",
      courses: [
        { id: 4, title: "Physics Laboratory", code: "PHYS201", students: 32, hoursPerWeek: 8, type: "Lab" },
        { id: 5, title: "Quantum Physics", code: "PHYS301", students: 28, hoursPerWeek: 6, type: "Lecture" },
        { id: 6, title: "Mechanics", code: "PHYS101", students: 55, hoursPerWeek: 4, type: "Lecture" },
      ],
      totalHours: 18,
      maxHours: 16,
      overloaded: true,
      efficiency: 92,
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      email: "emily.rodriguez@must.ac.tz",
      department: "Computer Science",
      courses: [
        { id: 7, title: "Computer Science", code: "CS101", students: 78, hoursPerWeek: 6, type: "Lecture" },
        { id: 8, title: "Programming Lab", code: "CS101L", students: 40, hoursPerWeek: 4, type: "Lab" },
      ],
      totalHours: 10,
      maxHours: 16,
      overloaded: false,
      efficiency: 78,
    },
    {
      id: 4,
      name: "Prof. James Wilson",
      email: "james.wilson@must.ac.tz",
      department: "English",
      courses: [
        { id: 9, title: "English Literature", code: "ENG201", students: 42, hoursPerWeek: 4, type: "Lecture" },
        { id: 10, title: "Creative Writing", code: "ENG301", students: 20, hoursPerWeek: 3, type: "Tutorial" },
        { id: 11, title: "Academic Writing", code: "ENG101", students: 65, hoursPerWeek: 4, type: "Lecture" },
      ],
      totalHours: 11,
      maxHours: 16,
      overloaded: false,
      efficiency: 88,
    },
  ]);

  const [availableCourses] = useState([
    { id: 12, title: "Statistics", code: "STAT201", students: 35, hoursPerWeek: 4, type: "Lecture" as const },
    { id: 13, title: "Chemistry Lab", code: "CHEM101L", students: 30, hoursPerWeek: 6, type: "Lab" as const },
    { id: 14, title: "History Tutorial", code: "HIST101T", students: 15, hoursPerWeek: 2, type: "Tutorial" as const },
  ]);

  const assignCourse = (teacherId: number, courseId: number) => {
    const course = availableCourses.find(c => c.id === courseId);
    if (!course) return;

    setTeachers(teachers.map(teacher => {
      if (teacher.id === teacherId) {
        const newTotalHours = teacher.totalHours + course.hoursPerWeek;
        const newOverloaded = newTotalHours > teacher.maxHours;
        
        if (newOverloaded) {
          alert(`Warning: Assigning this course will overload ${teacher.name} (${newTotalHours}/${teacher.maxHours} hours)`);
        }
        
        return {
          ...teacher,
          courses: [...teacher.courses, course],
          totalHours: newTotalHours,
          overloaded: newOverloaded,
        };
      }
      return teacher;
    }));
    
    alert(`Course ${course.code} assigned to teacher successfully!`);
  };

  const removeCourse = (teacherId: number, courseId: number) => {
    setTeachers(teachers.map(teacher => {
      if (teacher.id === teacherId) {
        const courseToRemove = teacher.courses.find(c => c.id === courseId);
        if (!courseToRemove) return teacher;
        
        const newCourses = teacher.courses.filter(c => c.id !== courseId);
        const newTotalHours = teacher.totalHours - courseToRemove.hoursPerWeek;
        
        return {
          ...teacher,
          courses: newCourses,
          totalHours: newTotalHours,
          overloaded: newTotalHours > teacher.maxHours,
        };
      }
      return teacher;
    }));
    
    alert('Course removed successfully!');
  };

  const balanceWorkload = () => {
    // Simple load balancing algorithm
    const overloadedTeachers = teachers.filter(t => t.overloaded);
    const underloadedTeachers = teachers.filter(t => t.totalHours < t.maxHours - 2);
    
    if (overloadedTeachers.length === 0) {
      alert('All teachers have balanced workloads!');
      return;
    }
    
    let suggestions = [];
    
    overloadedTeachers.forEach(overloaded => {
      const excessHours = overloaded.totalHours - overloaded.maxHours;
      const coursesToMove = overloaded.courses.filter(c => c.hoursPerWeek <= excessHours);
      
      coursesToMove.forEach(course => {
        const suitableTeacher = underloadedTeachers.find(t => 
          t.totalHours + course.hoursPerWeek <= t.maxHours &&
          t.department === overloaded.department
        );
        
        if (suitableTeacher) {
          suggestions.push(`Move ${course.code} from ${overloaded.name} to ${suitableTeacher.name}`);
        }
      });
    });
    
    if (suggestions.length > 0) {
      alert(`Workload balancing suggestions:\n${suggestions.join('\n')}`);
    } else {
      alert('No suitable workload redistributions found. Consider hiring additional staff.');
    }
  };

  const generateReport = () => {
    const reportData = teachers.map(teacher => ({
      name: teacher.name,
      department: teacher.department,
      courses: teacher.courses.length,
      totalHours: teacher.totalHours,
      maxHours: teacher.maxHours,
      utilization: Math.round((teacher.totalHours / teacher.maxHours) * 100),
      overloaded: teacher.overloaded ? 'Yes' : 'No',
      efficiency: teacher.efficiency
    }));
    
    const csvContent = [
      'Name,Department,Courses,Total Hours,Max Hours,Utilization %,Overloaded,Efficiency %',
      ...reportData.map(row => 
        `"${row.name}","${row.department}",${row.courses},${row.totalHours},${row.maxHours},${row.utilization},"${row.overloaded}",${row.efficiency}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teacher_workload_report.csv';
    a.click();
    URL.revokeObjectURL(url);
    alert('Workload report exported successfully!');
  };

  const getWorkloadColor = (hours: number, maxHours: number) => {
    const percentage = (hours / maxHours) * 100;
    if (percentage > 100) return "text-red-600";
    if (percentage > 80) return "text-yellow-600";
    return "text-green-600";
  };

  const getOverallStats = () => {
    const totalTeachers = teachers.length;
    const overloadedCount = teachers.filter(t => t.overloaded).length;
    const avgEfficiency = Math.round(teachers.reduce((sum, t) => sum + t.efficiency, 0) / totalTeachers);
    const totalCourses = teachers.reduce((sum, t) => sum + t.courses.length, 0);
    
    return { totalTeachers, overloadedCount, avgEfficiency, totalCourses };
  };

  const stats = getOverallStats();

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Workload Manager</h1>
          <p className="text-muted-foreground">
            Manage and balance teaching assignments across faculty
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={balanceWorkload} variant="outline">
            <TrendingUp className="mr-2 h-4 w-4" />
            Balance Workload
          </Button>
          <Button onClick={generateReport} className="bg-gradient-to-r from-primary to-secondary text-white">
            <BarChart3 className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Teachers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div className="text-2xl font-bold text-red-600">{stats.overloadedCount}</div>
            </div>
            <p className="text-xs text-muted-foreground">Overloaded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{stats.avgEfficiency}%</div>
            </div>
            <p className="text-xs text-muted-foreground">Avg Efficiency</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Workload Cards */}
      <div className="grid gap-6">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className={teacher.overloaded ? "border-red-200" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>{teacher.name}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {teacher.department} • {teacher.email}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {teacher.overloaded && (
                    <Badge variant="destructive" className="flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Overloaded</span>
                    </Badge>
                  )}
                  <Badge variant="outline">
                    Efficiency: {teacher.efficiency}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Workload Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Workload</span>
                  <span className={`text-sm font-medium ${getWorkloadColor(teacher.totalHours, teacher.maxHours)}`}>
                    {teacher.totalHours}/{teacher.maxHours} hours
                  </span>
                </div>
                <Progress 
                  value={(teacher.totalHours / teacher.maxHours) * 100} 
                  className="h-2"
                />
              </div>

              {/* Assigned Courses */}
              <div>
                <h4 className="font-medium mb-2">Assigned Courses ({teacher.courses.length}):</h4>
                <div className="space-y-2">
                  {teacher.courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="font-medium">{course.title}</span>
                          <span className="text-muted-foreground ml-2">({course.code})</span>
                        </div>
                        <Badge variant={course.type === "Lab" ? "secondary" : "default"}>
                          {course.type}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {course.students} students • {course.hoursPerWeek}h/week
                        </div>
                      </div>
                      <Button
                        onClick={() => removeCourse(teacher.id, course.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Courses to Assign */}
              <div>
                <h4 className="font-medium mb-2">Available Courses:</h4>
                <div className="space-y-2">
                  {availableCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-2 border rounded bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="font-medium">{course.title}</span>
                          <span className="text-muted-foreground ml-2">({course.code})</span>
                        </div>
                        <Badge variant={course.type === "Lab" ? "secondary" : "default"}>
                          {course.type}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {course.students} students • {course.hoursPerWeek}h/week
                        </div>
                      </div>
                      <Button
                        onClick={() => assignCourse(teacher.id, course.id)}
                        variant="outline"
                        size="sm"
                        className="text-green-600"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2 border-t">
                <Button
                  onClick={() => alert(`Viewing detailed schedule for ${teacher.name}`)}
                  variant="outline"
                  size="sm"
                >
                  <Calendar className="mr-2 h-3 w-3" />
                  View Schedule
                </Button>
                <Button
                  onClick={() => alert(`Sending workload summary to ${teacher.email}`)}
                  variant="outline"
                  size="sm"
                >
                  <Clock className="mr-2 h-3 w-3" />
                  Send Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
