import { useState } from "react";
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  Filter,
  Download,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CourseSchedule {
  id: number;
  courseTitle: string;
  courseCode: string;
  instructor: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  type: "Lecture" | "Lab" | "Tutorial" | "Exam";
  credits: number;
  enrolled: boolean;
  conflicts: string[];
}

export const StudentTimetable = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<CourseSchedule[]>([
    {
      id: 1,
      courseTitle: "Advanced Mathematics",
      courseCode: "MATH301",
      instructor: "Dr. Sarah Johnson",
      day: "Monday",
      startTime: "08:00",
      endTime: "09:30",
      room: "A101",
      type: "Lecture",
      credits: 3,
      enrolled: true,
      conflicts: [],
    },
    {
      id: 2,
      courseTitle: "Advanced Mathematics",
      courseCode: "MATH301",
      instructor: "Dr. Sarah Johnson",
      day: "Wednesday",
      startTime: "08:00",
      endTime: "09:30",
      room: "A101",
      type: "Lecture",
      credits: 3,
      enrolled: true,
      conflicts: [],
    },
    {
      id: 3,
      courseTitle: "Physics Laboratory",
      courseCode: "PHYS201",
      instructor: "Prof. Michael Chen",
      day: "Tuesday",
      startTime: "14:00",
      endTime: "16:00",
      room: "Physics Lab 1",
      type: "Lab",
      credits: 2,
      enrolled: true,
      conflicts: [],
    },
    {
      id: 4,
      courseTitle: "Computer Science",
      courseCode: "CS101",
      instructor: "Dr. Emily Rodriguez",
      day: "Monday",
      startTime: "10:00",
      endTime: "11:30",
      room: "Computer Lab 2",
      type: "Lecture",
      credits: 4,
      enrolled: true,
      conflicts: ["Overlaps with MATH302 Tutorial"],
    },
    {
      id: 5,
      courseTitle: "English Literature",
      courseCode: "ENG201",
      instructor: "Prof. James Wilson",
      day: "Thursday",
      startTime: "09:00",
      endTime: "10:30",
      room: "B205",
      type: "Lecture",
      credits: 3,
      enrolled: true,
      conflicts: [],
    },
  ]);

  const [availableCourses, setAvailableCourses] = useState<CourseSchedule[]>([
    {
      id: 6,
      courseTitle: "Chemistry Basics",
      courseCode: "CHEM101",
      instructor: "Dr. Lisa Anderson",
      day: "Friday",
      startTime: "13:00",
      endTime: "14:30",
      room: "Chemistry Lab",
      type: "Lab",
      credits: 3,
      enrolled: false,
      conflicts: [],
    },
    {
      id: 7,
      courseTitle: "History of Science",
      courseCode: "HIST301",
      instructor: "Prof. Robert Brown",
      day: "Tuesday",
      startTime: "11:00",
      endTime: "12:30",
      room: "C102",
      type: "Lecture",
      credits: 2,
      enrolled: false,
      conflicts: [],
    },
  ]);

  const [selectedDay, setSelectedDay] = useState<string>("All");
  const days = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const enrollInCourse = (courseId: number) => {
    const course = availableCourses.find(c => c.id === courseId);
    if (course) {
      // Check for time conflicts
      const conflicts = detectTimeConflicts(course);
      
      if (conflicts.length > 0) {
        alert(`Warning: This course conflicts with:\n${conflicts.join('\n')}\n\nDo you want to enroll anyway?`);
      }
      
      const updatedCourse = { ...course, enrolled: true, conflicts };
      setEnrolledCourses([...enrolledCourses, updatedCourse]);
      setAvailableCourses(availableCourses.filter(c => c.id !== courseId));
      alert(`Successfully enrolled in ${course.courseTitle}!`);
    }
  };

  const dropCourse = (courseId: number) => {
    const course = enrolledCourses.find(c => c.id === courseId);
    if (course) {
      if (confirm(`Are you sure you want to drop ${course.courseTitle}?`)) {
        const updatedCourse = { ...course, enrolled: false, conflicts: [] };
        setAvailableCourses([...availableCourses, updatedCourse]);
        setEnrolledCourses(enrolledCourses.filter(c => c.id !== courseId));
        alert(`Dropped ${course.courseTitle} successfully!`);
      }
    }
  };

  const detectTimeConflicts = (newCourse: CourseSchedule) => {
    const conflicts: string[] = [];
    
    enrolledCourses.forEach(course => {
      if (
        course.day === newCourse.day &&
        isTimeOverlap(course.startTime, course.endTime, newCourse.startTime, newCourse.endTime)
      ) {
        conflicts.push(`${course.courseCode} (${course.startTime}-${course.endTime})`);
      }
    });
    
    return conflicts;
  };

  const isTimeOverlap = (start1: string, end1: string, start2: string, end2: string) => {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);
    
    return s1 < e2 && s2 < e1;
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getFilteredCourses = () => {
    if (selectedDay === "All") return enrolledCourses;
    return enrolledCourses.filter(course => course.day === selectedDay);
  };

  const getTotalCredits = () => {
    return enrolledCourses.reduce((total, course) => total + course.credits, 0);
  };

  const exportTimetable = () => {
    const timetableData = enrolledCourses.map(course => ({
      course: course.courseTitle,
      code: course.courseCode,
      instructor: course.instructor,
      day: course.day,
      time: `${course.startTime}-${course.endTime}`,
      room: course.room,
      type: course.type,
      credits: course.credits
    }));
    
    const csvContent = [
      'Course,Code,Instructor,Day,Time,Room,Type,Credits',
      ...timetableData.map(row => 
        `"${row.course}","${row.code}","${row.instructor}","${row.day}","${row.time}","${row.room}","${row.type}",${row.credits}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_timetable.csv';
    a.click();
    URL.revokeObjectURL(url);
    alert('Timetable exported successfully!');
  };

  const optimizeTimetable = () => {
    // Simple optimization: suggest better time slots for conflicting courses
    const conflictingCourses = enrolledCourses.filter(course => course.conflicts.length > 0);
    
    if (conflictingCourses.length === 0) {
      alert('Your timetable is already optimized with no conflicts!');
      return;
    }
    
    const suggestions = conflictingCourses.map(course => 
      `${course.courseCode}: Consider alternative sections or contact instructor`
    );
    
    alert(`Optimization suggestions:\n${suggestions.join('\n')}`);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Timetable</h1>
          <p className="text-muted-foreground">
            Manage your course schedule and enrollments
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={optimizeTimetable} variant="outline">
            <CheckCircle className="mr-2 h-4 w-4" />
            Optimize
          </Button>
          <Button onClick={exportTimetable} className="bg-gradient-to-r from-primary to-secondary text-white">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            </div>
            <p className="text-xs text-muted-foreground">Enrolled Courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{getTotalCredits()}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Credits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <div className="text-2xl font-bold">
                {enrolledCourses.filter(c => c.conflicts.length > 0).length}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Conflicts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{availableCourses.length}</div>
            </div>
            <p className="text-xs text-muted-foreground">Available Courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4" />
        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
        >
          {days.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>

      {/* Enrolled Courses */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Enrolled Courses</h2>
        <div className="grid gap-4">
          {getFilteredCourses().map((course) => (
            <Card key={course.id} className={course.conflicts.length > 0 ? "border-red-200" : ""}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <h3 className="font-semibold">{course.courseTitle}</h3>
                      <Badge variant="outline">{course.courseCode}</Badge>
                      <Badge variant={course.type === "Lab" ? "secondary" : "default"}>
                        {course.type}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{course.instructor}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{course.day}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{course.startTime} - {course.endTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{course.room}</span>
                      </div>
                      <span>{course.credits} credits</span>
                    </div>
                    {course.conflicts.length > 0 && (
                      <div className="text-sm text-red-600">
                        <AlertCircle className="inline h-3 w-3 mr-1" />
                        Conflicts: {course.conflicts.join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => alert(`Viewing details for ${course.courseTitle}`)}
                      variant="outline"
                      size="sm"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => dropCourse(course.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                    >
                      Drop Course
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Available Courses */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Courses</h2>
        <div className="grid gap-4">
          {availableCourses.map((course) => (
            <Card key={course.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <h3 className="font-semibold">{course.courseTitle}</h3>
                      <Badge variant="outline">{course.courseCode}</Badge>
                      <Badge variant={course.type === "Lab" ? "secondary" : "default"}>
                        {course.type}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{course.instructor}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{course.day}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{course.startTime} - {course.endTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{course.room}</span>
                      </div>
                      <span>{course.credits} credits</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => alert(`Viewing details for ${course.courseTitle}`)}
                      variant="outline"
                      size="sm"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => enrollInCourse(course.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      Enroll
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
