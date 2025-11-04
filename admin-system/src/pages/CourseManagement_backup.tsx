import { useState, useEffect } from "react";
import { courseOperations, lecturerOperations, initializeDatabase } from "@/lib/database";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building, BookOpen, GraduationCap, Users, Plus, Edit, Trash2 } from "lucide-react";

interface College {
  id: string;
  name: string;
  shortName: string;
  description: string;
  established: string;
}

interface Department {
  id: string;
  name: string;
  collegeId: string;
  description: string;
  headOfDepartment: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  duration: number;
  description: string;
}

interface Program {
  id: string;
  name: string;
  courseId: string;
  credits: number;
  lecturerName: string;
  totalSemesters: number;
  description: string;
}

export const CourseManagement = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Detailed view states
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);

  // College form state
  const [collegeForm, setCollegeForm] = useState({
    name: "",
    shortName: "",
    description: "",
    established: ""
  });

  // Department form state
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    collegeId: "",
    description: "",
    headOfDepartment: ""
  });

  // Course form state
  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    duration: 0,
    description: ""
  });

  // Program form state
  const [programForm, setProgramForm] = useState({
    name: "",
    courseId: "",
    credits: 0,
    lecturerName: "",
    totalSemesters: 0,
    description: ""
  });

  // Initialize and load data
  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDatabase();
        await loadAllData();
      } catch (error) {
    };
    setLoading(true);
    try {
      await courseOperations.createCollege({
        name: collegeForm.name,
        shortName: collegeForm.shortName,
        description: collegeForm.description,
        established: collegeForm.established
      });
      await loadAllData();
      setCollegeForm({ name: "", shortName: "", description: "", established: "" });
      toast.success("College added successfully!");
    } catch (error) {
      console.error('Error adding college:', error);
      toast.error("Failed to add college. Please try again.");
    } finally {
      setLoading(false);
    }
          description: collegeForm.description,
          established: collegeForm.established
        });
        await loadAllData();
        setCollegeForm({ name: "", shortName: "", description: "", established: "" });
        toast.success("College added successfully!");
      } catch (error) {
        console.error('Error adding college:', error);
        toast.error("Failed to add college. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddDepartment = async () => {
    if (departmentForm.name && departmentForm.collegeId) {
      setLoading(true);
      try {
        await courseOperations.createDepartment({
          name: departmentForm.name,
          collegeId: parseInt(departmentForm.collegeId),
          description: departmentForm.description,
          headOfDepartment: departmentForm.headOfDepartment
        });
        await loadAllData();
        setDepartmentForm({ name: "", collegeId: "", description: "", headOfDepartment: "" });
        toast.success("Department added successfully!");
      } catch (error) {
        console.error('Error adding department:', error);
        toast.error("Failed to add department. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddCourse = async () => {
    if (courseForm.name && courseForm.code) {
      setLoading(true);
      try {
        await courseOperations.createCourse({
          name: courseForm.name,
          code: courseForm.code,
          duration: courseForm.duration,
          description: courseForm.description
        });
        await loadAllData();
        setCourseForm({ name: "", code: "", duration: 0, description: "" });
        toast.success("Course added successfully!");
      } catch (error) {
        console.error('Error adding course:', error);
        toast.error("Failed to add course. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddProgram = async () => {
    if (programForm.name && programForm.courseId && programForm.lecturerName) {
      setLoading(true);
      try {
        await courseOperations.createProgram({
          name: programForm.name,
          courseId: parseInt(programForm.courseId),
          lecturerId: parseInt(programForm.lecturerName),
          credits: programForm.credits,
          totalSemesters: programForm.totalSemesters,
          description: programForm.description
        });
        await loadAllData();
        setProgramForm({ name: "", courseId: "", credits: 0, lecturerName: "", totalSemesters: 0, description: "" });
        toast.success("Program added successfully!");
      } catch (error) {
        console.error('Error adding program:', error);
        toast.error("Failed to add program. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const getCollegeName = (collegeId: string) => {
    return colleges.find(c => c.id === collegeId)?.name || "Unknown";
  };

  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || "Unknown";
  };

  const getCourseName = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.name || "Unknown";
  };

  const getLecturerName = (lecturerId: string) => {
    const lecturer = lecturers.find(l => l.id.toString() === lecturerId);
    return lecturer ? lecturer.name : "Unknown Lecturer";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">Manage colleges, departments, courses, and programs</p>
        </div>
      </div>

      <Tabs defaultValue="colleges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colleges">Colleges</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        {/* Colleges Tab */}
        <TabsContent value="colleges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Add New College
              </CardTitle>
              <CardDescription>Register a new college in the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="collegeName">College Name</Label>
                  <Input
                    id="collegeName"
                    value={collegeForm.name}
                    onChange={(e) => setCollegeForm({...collegeForm, name: e.target.value})}
                    placeholder="e.g., College of Engineering and Technology"
                  />
                </div>
                <div>
                  <Label htmlFor="collegeShort">Short Name</Label>
                  <Input
                    id="collegeShort"
                    value={collegeForm.shortName}
                    onChange={(e) => setCollegeForm({...collegeForm, shortName: e.target.value})}
                    placeholder="e.g., CET"
                  />
                </div>
                <div>
                  <Label htmlFor="established">Established Year</Label>
                  <Input
                    id="established"
                    value={collegeForm.established}
                    onChange={(e) => setCollegeForm({...collegeForm, established: e.target.value})}
                    placeholder="e.g., 2010"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="collegeDesc">Description</Label>
                <Textarea
                  id="collegeDesc"
                  value={collegeForm.description}
                  onChange={(e) => setCollegeForm({...collegeForm, description: e.target.value})}
                  placeholder="Brief description of the college"
                />
              </div>
              <Button onClick={handleAddCollege} className="w-full" disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                {loading ? 'Adding...' : 'Add College'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registered Colleges ({colleges.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {colleges.map((college) => (
                  <Card key={college.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{college.shortName}</Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{college.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{college.description}</p>
                      <p className="text-xs text-muted-foreground">Established: {college.established}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Add New Department
              </CardTitle>
              <CardDescription>Add departments to registered colleges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deptName">Department Name</Label>
                  <Input
                    id="deptName"
                    value={departmentForm.name}
                    onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
                    placeholder="e.g., Civil Engineering"
                  />
                </div>
                <div>
                  <Label htmlFor="deptCollege">Select College</Label>
                  <Select value={departmentForm.collegeId} onValueChange={(value) => setDepartmentForm({...departmentForm, collegeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college.id} value={college.id}>
                          {college.shortName} - {college.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="headOfDept">Head of Department</Label>
                  <Input
                    id="headOfDept"
                    value={departmentForm.headOfDepartment}
                    onChange={(e) => setDepartmentForm({...departmentForm, headOfDepartment: e.target.value})}
                    placeholder="e.g., Prof. John Doe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="deptDesc">Description</Label>
                <Textarea
                  id="deptDesc"
                  value={departmentForm.description}
                  onChange={(e) => setDepartmentForm({...departmentForm, description: e.target.value})}
                  placeholder="Brief description of the department"
                />
              </div>
              <Button onClick={handleAddDepartment} className="w-full" disabled={colleges.length === 0 || loading}>
                <Plus className="h-4 w-4 mr-2" />
                {loading ? 'Adding...' : 'Add Department'}
              </Button>
              {colleges.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">Please add colleges first</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registered Departments ({departments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((department) => (
                  <Card key={department.id} className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{getCollegeName(department.collegeId)}</Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{department.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{department.description}</p>
                      <p className="text-xs text-muted-foreground">HOD: {department.headOfDepartment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Add New Course
              </CardTitle>
              <CardDescription>Add courses to registered departments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input
                    id="courseName"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                    placeholder="e.g., Bachelor of Engineering in Civil Engineering"
                  />
                </div>
                <div>
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({...courseForm, code: e.target.value})}
                    placeholder="e.g., BECE"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (Years)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({...courseForm, duration: parseInt(e.target.value) || 0})}
                    placeholder="e.g., 4"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="courseDesc">Description</Label>
                <Textarea
                  id="courseDesc"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                  placeholder="Brief description of the course"
                />
              </div>
              <Button onClick={handleAddCourse} className="w-full" disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                {loading ? 'Adding...' : 'Add Course'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registered Courses ({courses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{course.code}</Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                      <p className="text-xs text-muted-foreground">Duration: {course.duration} years</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Add New Program
              </CardTitle>
              <CardDescription>Add programs with academic years and semesters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="programName">Program Name</Label>
                  <Input
                    id="programName"
                    value={programForm.name}
                    onChange={(e) => setProgramForm({...programForm, name: e.target.value})}
                    placeholder="e.g., Civil Engineering Year 1"
                  />
                </div>
                <div>
                  <Label htmlFor="programCourse">Select Course</Label>
                  <Select value={programForm.courseId} onValueChange={(value) => setProgramForm({...programForm, courseId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="credits">Total Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={programForm.credits}
                    onChange={(e) => setProgramForm({...programForm, credits: parseInt(e.target.value) || 0})}
                    placeholder="e.g., 120"
                  />
                </div>
                <div>
                  <Label htmlFor="lecturerName">Select Lecturer</Label>
                  <Select value={programForm.lecturerName} onValueChange={(value) => setProgramForm({...programForm, lecturerName: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lecturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {lecturers.map((lecturer) => (
                        <SelectItem key={lecturer.id} value={lecturer.id.toString()}>
                          {lecturer.name} - {lecturer.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="semesters">Total Semesters</Label>
                  <Select value={programForm.totalSemesters.toString()} onValueChange={(value) => setProgramForm({...programForm, totalSemesters: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="programDesc">Description</Label>
                <Textarea
                  id="programDesc"
                  value={programForm.description}
                  onChange={(e) => setProgramForm({...programForm, description: e.target.value})}
                  placeholder="Brief description of the program"
                />
              </div>
              <Button onClick={handleAddProgram} className="w-full" disabled={courses.length === 0 || loading}>
                <Plus className="h-4 w-4 mr-2" />
                {loading ? 'Adding...' : 'Add Program'}
              </Button>
              {courses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">Please add courses first</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registered Programs ({programs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.map((program) => (
                  <Card key={program.id} className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{program.credits} Credits</Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{program.description}</p>
                      <p className="text-xs text-muted-foreground">Course: {getCourseName(program.courseId)}</p>
                      <p className="text-xs text-muted-foreground">Lecturer: {getLecturerName(program.lecturerName)}</p>
                      <p className="text-xs text-muted-foreground">Semesters: {program.totalSemesters}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
