import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: number;
  title: string;
  code: string;
  students: number;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
    room: string;
  }[];
  instructor: string;
  conflicts: string[];
}

export const CourseScheduler = () => {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: "Advanced Mathematics",
      code: "MATH301",
      students: 45,
      schedule: [
        { day: "Monday", startTime: "08:00", endTime: "09:30", room: "A101" },
        { day: "Wednesday", startTime: "08:00", endTime: "09:30", room: "A101" },
        { day: "Friday", startTime: "08:00", endTime: "09:30", room: "A101" },
      ],
      instructor: "Dr. Sarah Johnson",
      conflicts: [],
    },
    {
      id: 2,
      title: "Physics Laboratory",
      code: "PHYS201",
      students: 32,
      schedule: [
        { day: "Tuesday", startTime: "14:00", endTime: "16:00", room: "Physics Lab 1" },
        { day: "Thursday", startTime: "14:00", endTime: "16:00", room: "Physics Lab 1" },
      ],
      instructor: "Prof. Michael Chen",
      conflicts: [],
    },
    {
      id: 3,
      title: "Computer Science",
      code: "CS101",
      students: 78,
      schedule: [
        { day: "Monday", startTime: "10:00", endTime: "11:30", room: "Computer Lab 2" },
        { day: "Wednesday", startTime: "10:00", endTime: "11:30", room: "Computer Lab 2" },
      ],
      instructor: "Dr. Emily Rodriguez",
      conflicts: ["Room conflict with MATH302 on Monday 10:00-11:30"],
    },
  ]);

  const [editingCourse, setEditingCourse] = useState<number | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    day: "",
    startTime: "",
    endTime: "",
    room: "",
  });

  const detectConflicts = (courseId: number, schedule: any[]) => {
    const conflicts: string[] = [];
    const otherCourses = courses.filter(c => c.id !== courseId);
    
    schedule.forEach(slot => {
      otherCourses.forEach(course => {
        course.schedule.forEach(otherSlot => {
          if (
            slot.day === otherSlot.day &&
            slot.room === otherSlot.room &&
            isTimeOverlap(slot.startTime, slot.endTime, otherSlot.startTime, otherSlot.endTime)
          ) {
            conflicts.push(`Room conflict with ${course.code} on ${slot.day} ${slot.startTime}-${slot.endTime}`);
          }
        });
      });
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

  const addScheduleSlot = (courseId: number) => {
    if (newSchedule.day && newSchedule.startTime && newSchedule.endTime && newSchedule.room) {
      setCourses(courses.map(course => {
        if (course.id === courseId) {
          const updatedSchedule = [...course.schedule, newSchedule];
          const conflicts = detectConflicts(courseId, updatedSchedule);
          return { ...course, schedule: updatedSchedule, conflicts };
        }
        return course;
      }));
      setNewSchedule({ day: "", startTime: "", endTime: "", room: "" });
      alert('Schedule slot added successfully!');
    } else {
      alert('Please fill in all schedule fields');
    }
  };

  const removeScheduleSlot = (courseId: number, slotIndex: number) => {
    setCourses(courses.map(course => {
      if (course.id === courseId) {
        const updatedSchedule = course.schedule.filter((_, index) => index !== slotIndex);
        const conflicts = detectConflicts(courseId, updatedSchedule);
        return { ...course, schedule: updatedSchedule, conflicts };
      }
      return course;
    }));
    alert('Schedule slot removed successfully!');
  };

  const optimizeSchedule = () => {
    // Simple optimization: try to resolve conflicts by suggesting alternative times
    const optimizedCourses = courses.map(course => {
      if (course.conflicts.length > 0) {
        // Suggest alternative times (simplified logic)
        const suggestedTimes = [
          "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
        ];
        
        return {
          ...course,
          conflicts: [...course.conflicts, "Suggested alternative times: " + suggestedTimes.join(", ")]
        };
      }
      return course;
    });
    
    setCourses(optimizedCourses);
    alert('Schedule optimization completed! Check conflict suggestions.');
  };

  const generateTimetable = () => {
    const timetableData = courses.map(course => ({
      course: course.title,
      code: course.code,
      instructor: course.instructor,
      students: course.students,
      schedule: course.schedule.map(s => `${s.day} ${s.startTime}-${s.endTime} (${s.room})`).join(', ')
    }));
    
    const csvContent = [
      'Course,Code,Instructor,Students,Schedule',
      ...timetableData.map(row => `"${row.course}","${row.code}","${row.instructor}",${row.students},"${row.schedule}"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course_timetable.csv';
    a.click();
    URL.revokeObjectURL(url);
    alert('Timetable exported successfully!');
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Scheduler</h1>
          <p className="text-muted-foreground">
            Manage course schedules and resolve conflicts
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={optimizeSchedule} variant="outline">
            <CheckCircle className="mr-2 h-4 w-4" />
            Optimize Schedule
          </Button>
          <Button onClick={generateTimetable} className="bg-gradient-to-r from-primary to-secondary text-white">
            <Calendar className="mr-2 h-4 w-4" />
            Export Timetable
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {courses.map((course) => (
          <Card key={course.id} className={course.conflicts.length > 0 ? "border-red-200" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>{course.title} ({course.code})</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {course.instructor} • {course.students} students
                  </p>
                </div>
                {course.conflicts.length > 0 && (
                  <Badge variant="destructive" className="flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{course.conflicts.length} Conflicts</span>
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Schedule */}
              <div>
                <h4 className="font-medium mb-2">Current Schedule:</h4>
                <div className="grid gap-2">
                  {course.schedule.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="font-medium">{slot.day}</span>
                        <span>{slot.startTime} - {slot.endTime}</span>
                        <span className="text-muted-foreground">{slot.room}</span>
                      </div>
                      <Button
                        onClick={() => removeScheduleSlot(course.id, index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Schedule Slot */}
              {editingCourse === course.id && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Add Schedule Slot:</h4>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newSchedule.day}
                      onChange={(e) => setNewSchedule({...newSchedule, day: e.target.value})}
                    >
                      <option value="">Select Day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                    </select>
                    <Input
                      type="time"
                      placeholder="Start Time"
                      value={newSchedule.startTime}
                      onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                    />
                    <Input
                      type="time"
                      placeholder="End Time"
                      value={newSchedule.endTime}
                      onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                    />
                    <Input
                      placeholder="Room"
                      value={newSchedule.room}
                      onChange={(e) => setNewSchedule({...newSchedule, room: e.target.value})}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => addScheduleSlot(course.id)} size="sm">
                      <Save className="mr-2 h-3 w-3" />
                      Add Slot
                    </Button>
                    <Button onClick={() => setEditingCourse(null)} variant="outline" size="sm">
                      <X className="mr-2 h-3 w-3" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Conflicts */}
              {course.conflicts.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2 text-red-600">Conflicts:</h4>
                  <div className="space-y-1">
                    {course.conflicts.map((conflict, index) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        <AlertTriangle className="inline h-3 w-3 mr-1" />
                        {conflict}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-2 border-t">
                <Button
                  onClick={() => setEditingCourse(editingCourse === course.id ? null : course.id)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="mr-2 h-3 w-3" />
                  {editingCourse === course.id ? 'Cancel Edit' : 'Edit Schedule'}
                </Button>
                <Button
                  onClick={() => alert(`Viewing detailed schedule for ${course.title}`)}
                  variant="outline"
                  size="sm"
                >
                  <Calendar className="mr-2 h-3 w-3" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
