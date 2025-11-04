import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Clock,
  Check,
  X,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Advanced Mathematics",
      code: "MATH301",
      students: 45,
      status: "Active",
      semester: "Fall 2024",
      schedule: "Mon, Wed, Fri 10:00-11:30",
      progress: 65,
    },
    {
      id: 2,
      title: "Physics Laboratory",
      code: "PHYS201",
      students: 32,
      status: "Active",
      semester: "Fall 2024",
      schedule: "Tue, Thu 14:00-16:00",
      progress: 45,
    },
    {
      id: 3,
      title: "Computer Science Fundamentals",
      code: "CS101",
      students: 78,
      status: "Completed",
      semester: "Spring 2024",
      schedule: "Mon, Wed, Fri 08:00-09:30",
      progress: 100,
    },
  ]);

  const [editingCourse, setEditingCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({
    title: "",
    code: "",
    semester: "",
    schedule: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCourse = () => {
    if (newCourse.title && newCourse.code) {
      const course = {
        id: courses.length + 1,
        ...newCourse,
        students: 0,
        status: "Active",
        progress: 0,
      };
      setCourses([...courses, course]);
      setNewCourse({ title: "", code: "", semester: "", schedule: "" });
      setShowAddForm(false);
      alert('Course added successfully!');
    } else {
      alert('Please fill in all required fields (Title and Code)');
    }
  };

  const handleDeleteCourse = (id) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      setCourses(courses.filter(course => course.id !== id));
      alert('Course deleted successfully!');
    }
  };

  const handleEditCourse = (id, updatedCourse) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, ...updatedCourse } : course
    ));
    setEditingCourse(null);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">
            Manage your courses and track student progress
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-primary to-secondary text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      {/* Add Course Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Course Title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
              />
              <Input
                placeholder="Course Code"
                value={newCourse.code}
                onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
              />
              <Input
                placeholder="Semester"
                value={newCourse.semester}
                onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})}
              />
              <Input
                placeholder="Schedule"
                value={newCourse.schedule}
                onChange={(e) => setNewCourse({...newCourse, schedule: e.target.value})}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddCourse} className="bg-green-600 text-white">
                <Check className="mr-2 h-4 w-4" />
                Add Course
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{course.code}</p>
                </div>
                <Badge variant={course.status === "Active" ? "default" : "secondary"}>
                  {course.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{course.semester}</span>
                </div>
                <div className="flex items-center col-span-2">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{course.schedule}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => setEditingCourse(course.id)}
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => alert(`Viewing students for ${course.title}:\n\nEnrolled: ${course.students} students\nStatus: ${course.status}\nProgress: ${course.progress}%`)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Students
                </Button>
                <Button 
                  onClick={() => handleDeleteCourse(course.id)}
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
