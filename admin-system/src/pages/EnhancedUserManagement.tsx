import { useState, useEffect } from "react";
import { lecturerOperations, studentOperations, courseOperations, initializeDatabase } from "@/lib/database";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Search, Eye, Edit, Trash2 } from "lucide-react";

interface Student {
  id: string;
  name: string;
  registrationNumber: string;
  email: string;
  phone: string;
  academicYear: string;
  currentSemester: number;
  course: string;
  college: string;
  department: string;
  academicLevel: 'certificate' | 'diploma' | 'bachelor' | 'masters' | 'phd';
  programs: string[];
}

interface Lecturer {
  id: string;
  name: string;
  employeeId: string;
  specialization: string;
  email: string;
  phone: string;
  password: string;
  courses: string[];
}

const mockAcademicYears = ["2025/2026", "2024/2025", "2023/2024"];

export const EnhancedUserManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  // Student form state
  const [studentForm, setStudentForm] = useState({
    name: "",
    registrationNumber: "",
    academicYear: "2024/2025",
    courseId: "",
    academicLevel: "bachelor" as 'certificate' | 'diploma' | 'bachelor' | 'masters' | 'phd',
    currentSemester: 1,
    email: "",
    phone: "",
    password: ""
  });

  // Lecturer form state
  const [lecturerForm, setLecturerForm] = useState({
    name: "",
    employeeId: "",
    specialization: "",
    email: "",
    phone: "",
    password: ""
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDatabase();
        await loadStudents();
        await loadLecturers();
        await loadCourses();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const loadStudents = async () => {
    try {
      const dbStudents = await studentOperations.getAll();
      const formattedStudents = dbStudents.map((student: any) => ({
        id: student.id.toString(),
        name: student.name,
        registrationNumber: student.registration_number,
        email: student.email,
        phone: student.phone,
        academicYear: student.academic_year,
        currentSemester: student.current_semester,
        course: student.course_name || "Unknown Course",
        college: "MUST",
        department: "Auto-assigned",
        programs: ["Program 1"]
      }));
      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadLecturers = async () => {
    try {
      const dbLecturers = await lecturerOperations.getAll();
      const formattedLecturers = dbLecturers.map((lecturer: any) => ({
        id: lecturer.id.toString(),
        name: lecturer.name,
        employeeId: lecturer.employee_id,
        specialization: lecturer.specialization,
        email: lecturer.email,
        phone: lecturer.phone,
        password: lecturer.password,
        courses: ["Course 1"]
      }));
      setLecturers(formattedLecturers);
    } catch (error) {
      console.error('Error loading lecturers:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const [dbCourses, dbDepartments, dbColleges, dbPrograms] = await Promise.all([
        courseOperations.getAllCourses(),
        courseOperations.getAllDepartments(),
        courseOperations.getAllColleges(),
        courseOperations.getAllPrograms()
      ]);
      
      setCourses(dbCourses);
      setDepartments(dbDepartments);
      setColleges(dbColleges);
      setPrograms(dbPrograms);
    } catch (error) {
      console.error('Error loading course data:', error);
    }
  };

  // AUTOMATIC LINKING FUNCTION - kama ulivyoeleza
  const getAutomaticStudentInfo = (courseId: string) => {
    const selectedCourse = courses.find(c => c.id.toString() === courseId);
    if (!selectedCourse) return { college: "Unknown", department: "Unknown", programs: [] };

    const department = departments.find(d => d.id === selectedCourse.departmentId);
    const college = colleges.find(c => c.id === department?.collegeId);
    const coursePrograms = programs.filter(p => p.courseId === selectedCourse.id);

    return {
      college: college?.name || "Unknown College",
      department: department?.name || "Unknown Department", 
      programs: coursePrograms.map(p => p.name),
      courseInfo: {
        name: selectedCourse.name,
        code: selectedCourse.code,
        credits: selectedCourse.credits
      }
    };
  };

  const handleAddStudent = async () => {
    // Validation
    if (!studentForm.name.trim()) {
      toast.error("Please enter student name");
      return;
    }
    if (!studentForm.registrationNumber.trim()) {
      toast.error("Please enter registration number");
      return;
    }
    if (!studentForm.email.trim() || !studentForm.email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!studentForm.password.trim() || studentForm.password.length < 6) {
      return;
    }
    if (studentForm.name && studentForm.registrationNumber && studentForm.courseId && studentForm.academicYear) {
      setLoading(true);
      try {
        // AUTOMATIC LINKING - Get student info based on course selection
        const automaticInfo = getAutomaticStudentInfo(studentForm.courseId);
        
        await studentOperations.create({
          name: studentForm.name,
          registrationNumber: studentForm.registrationNumber,
          academicYear: studentForm.academicYear,
          courseId: parseInt(studentForm.courseId),
          currentSemester: studentForm.currentSemester,
          email: studentForm.email,
          phone: studentForm.phone,
          password: studentForm.password,
          // AUTOMATIC LINKING DATA
          college: automaticInfo.college,
          department: automaticInfo.department,
          courseName: automaticInfo.courseInfo.name,
          courseCode: automaticInfo.courseInfo.code,
          programs: automaticInfo.programs.join(", ")
        });
        
        setStudentForm({
          name: "",
          registrationNumber: "",
          academicYear: "2024/2025",
          courseId: "",
          currentSemester: 1,
          email: "",
          phone: "",
          password: ""
        });
        
        await loadStudents();
        toast.success(`Student added successfully! Automatically linked to ${automaticInfo.college} - ${automaticInfo.department}`);
      } catch (error) {
        console.error('Error adding student:', error);
        toast.error("Failed to add student. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  // DELETE FUNCTIONS - kama ulivyoeleza
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      await studentOperations.delete(parseInt(studentId));
      await loadStudents();
      toast.success("Student deleted successfully!");
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error("Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLecturer = async (lecturerId: string) => {
    if (!confirm("Are you sure you want to delete this lecturer? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      await lecturerOperations.delete(parseInt(lecturerId));
      await loadLecturers();
      toast.success("Lecturer deleted successfully!");
    } catch (error) {
      console.error('Error deleting lecturer:', error);
      toast.error("Failed to delete lecturer");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLecturer = async () => {
    // Validation
    if (!lecturerForm.name.trim()) {
      toast.error("Please enter lecturer name");
      return;
    }
    if (!lecturerForm.employeeId.trim()) {
      toast.error("Please enter check number");
      return;
    }
    if (!lecturerForm.email.trim() || !lecturerForm.email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!lecturerForm.password.trim() || lecturerForm.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (lecturerForm.name && lecturerForm.employeeId) {
      setLoading(true);
      try {
        await lecturerOperations.create({
          name: lecturerForm.name,
          employeeId: lecturerForm.employeeId,
          specialization: lecturerForm.specialization,
          email: lecturerForm.email,
          phone: lecturerForm.phone,
          password: lecturerForm.password
        });
        await loadLecturers();
        setLecturerForm({
          name: "",
          employeeId: "",
          specialization: "",
          email: "",
          phone: "",
          password: ""
        });
        toast.success("Lecturer registered successfully!");
      } catch (error) {
        console.error('Error adding lecturer:', error);
        toast.error("Failed to register lecturer. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewLecturer = (lecturer: Lecturer) => {
    setSelectedLecturer(lecturer);
    setShowDetails(true);
    setIsEditing(false);
  };

  const handleEditLecturer = (lecturer: Lecturer) => {
    setSelectedLecturer(lecturer);
    setLecturerForm({
      name: lecturer.name,
      employeeId: lecturer.employeeId,
      specialization: lecturer.specialization,
      email: lecturer.email,
      phone: lecturer.phone,
      password: ""
    });
    setIsEditing(true);
    setShowDetails(true);
  };


  const handleUpdateLecturer = async () => {
    if (!selectedLecturer) return;
    
    try {
      setLoading(true);
      await lecturerOperations.update(selectedLecturer.id, {
        name: lecturerForm.name,
        employeeId: lecturerForm.employeeId,
        specialization: lecturerForm.specialization,
        email: lecturerForm.email,
        phone: lecturerForm.phone,
        ...(lecturerForm.password && { password: lecturerForm.password })
      });
      await loadLecturers();
      setShowDetails(false);
      setIsEditing(false);
      setSelectedLecturer(null);
      toast.success("Lecturer updated successfully");
    } catch (error) {
      console.error('Error updating lecturer:', error);
      toast.error("Failed to update lecturer");
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
    setIsEditing(false);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentForm({
      name: student.name,
      registrationNumber: student.registrationNumber,
      academicYear: student.academicYear,
      courseId: student.course,
      currentSemester: student.currentSemester,
      email: student.email,
      phone: student.phone
    });
    setIsEditing(true);
    setShowStudentDetails(true);
  };


  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;
    
    try {
      setLoading(true);
      await studentOperations.update(selectedStudent.id, {
        name: studentForm.name,
        registrationNumber: studentForm.registrationNumber,
        academicYear: studentForm.academicYear,
        course: studentForm.courseId,
        currentSemester: studentForm.currentSemester,
        email: studentForm.email,
        phone: studentForm.phone
      });
      await loadStudents();
      setShowStudentDetails(false);
      setIsEditing(false);
      setSelectedStudent(null);
      toast.success("Student updated successfully");
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error("Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLecturers = lecturers.filter(lecturer => 
    lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Enhanced User Management</h1>
        <Badge variant="outline" className="text-sm">
          Real Database Integration
        </Badge>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="lecturers">Lecturers</TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Register New Student
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="studentName">Full Name</Label>
                  <Input
                    id="studentName"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={studentForm.registrationNumber}
                    onChange={(e) => setStudentForm({...studentForm, registrationNumber: e.target.value})}
                    placeholder="MUST/2024/001234"
                  />
                </div>
                <div>
                  <Label htmlFor="studentEmail">Email</Label>
                  <Input
                    id="studentEmail"
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                    placeholder="student@must.ac.tz"
                  />
                </div>
                <div>
                  <Label htmlFor="studentPhone">Phone</Label>
                  <Input
                    id="studentPhone"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                    placeholder="+255 712 345 678"
                  />
                </div>
                <div>
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Select value={studentForm.academicYear} onValueChange={(value) => setStudentForm({...studentForm, academicYear: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAcademicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="academicLevel">Academic Level</Label>
                  <Select value={studentForm.academicLevel} onValueChange={(value) => setStudentForm({...studentForm, academicLevel: value as any, courseId: ""})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="certificate">Certificate Level</SelectItem>
                      <SelectItem value="diploma">Diploma Level</SelectItem>
                      <SelectItem value="bachelor">Bachelor Degree</SelectItem>
                      <SelectItem value="masters">Masters Degree</SelectItem>
                      <SelectItem value="phd">PhD Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="courseSelect">Course (filtered by level)</Label>
                  <Select value={studentForm.courseId} onValueChange={(value) => setStudentForm({...studentForm, courseId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses
                        .filter(course => (course.academic_level || course.academicLevel) === studentForm.academicLevel)
                        .map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.name} ({course.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="studentPassword">Password</Label>
                  <Input
                    id="studentPassword"
                    type="password"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
                    placeholder="Enter password"
                  />
                </div>
              </div>
              <Button onClick={handleAddStudent} className="w-full" disabled={loading}>
                <UserPlus className="h-4 w-4 mr-2" />
                {loading ? 'Registering...' : 'Register Student'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registered Students ({filteredStudents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStudents.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No students registered yet</p>
                    <p className="text-sm mt-2">Register students using the form above. Data will be saved to PostgreSQL database.</p>
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <Card key={student.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{student.name}</h3>
                              <Badge variant="secondary">{student.registrationNumber}</Badge>
                              <Badge variant="outline">Semester {student.currentSemester}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <p><span className="font-medium">Academic Year:</span> {student.academicYear}</p>
                              <p><span className="font-medium">College:</span> {student.college}</p>
                              <p><span className="font-medium">Department:</span> {student.department}</p>
                              <p><span className="font-medium">Course:</span> {student.course}</p>
                              <p><span className="font-medium">Email:</span> {student.email}</p>
                              <p><span className="font-medium">Phone:</span> {student.phone}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewStudent(student)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditStudent(student)}
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id)}
                              disabled={loading}
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lecturers Tab */}
        <TabsContent value="lecturers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Register New Lecturer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="lecturerName">Full Name</Label>
                  <Input
                    id="lecturerName"
                    value={lecturerForm.name}
                    onChange={(e) => setLecturerForm({...lecturerForm, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="employeeId">Check Number</Label>
                  <Input
                    id="employeeId"
                    value={lecturerForm.employeeId}
                    onChange={(e) => setLecturerForm({...lecturerForm, employeeId: e.target.value})}
                    placeholder="MUST001"
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={lecturerForm.specialization}
                    onChange={(e) => setLecturerForm({...lecturerForm, specialization: e.target.value})}
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <Label htmlFor="lecturerEmail">Email</Label>
                  <Input
                    id="lecturerEmail"
                    type="email"
                    value={lecturerForm.email}
                    onChange={(e) => setLecturerForm({...lecturerForm, email: e.target.value})}
                    placeholder="lecturer@must.ac.tz"
                  />
                </div>
                <div>
                  <Label htmlFor="lecturerPhone">Phone</Label>
                  <Input
                    id="lecturerPhone"
                    value={lecturerForm.phone}
                    onChange={(e) => setLecturerForm({...lecturerForm, phone: e.target.value})}
                    placeholder="+255 712 345 678"
                  />
                </div>
                <div>
                  <Label htmlFor="lecturerPassword">Password</Label>
                  <Input
                    id="lecturerPassword"
                    type="password"
                    value={lecturerForm.password}
                    onChange={(e) => setLecturerForm({...lecturerForm, password: e.target.value})}
                    placeholder="Enter password"
                  />
                </div>
              </div>
              <Button onClick={handleAddLecturer} className="w-full" disabled={loading}>
                <Users className="h-4 w-4 mr-2" />
                {loading ? 'Registering...' : 'Register Lecturer'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registered Lecturers ({filteredLecturers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLecturers.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No lecturers registered yet</p>
                    <p className="text-sm mt-2">Register lecturers using the form above. Data will be saved to PostgreSQL database.</p>
                  </div>
                ) : (
                  filteredLecturers.map((lecturer) => (
                    <Card key={lecturer.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{lecturer.name}</h3>
                              <Badge variant="secondary">{lecturer.employeeId}</Badge>
                              <Badge variant="outline">{lecturer.specialization}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <p><span className="font-medium">Email:</span> {lecturer.email}</p>
                              <p><span className="font-medium">Phone:</span> {lecturer.phone}</p>
                              <p><span className="font-medium">Specialization:</span> {lecturer.specialization}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewLecturer(lecturer)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditLecturer(lecturer)}
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteLecturer(lecturer.id)}
                              disabled={loading}
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lecturer Details Modal */}
      {showDetails && selectedLecturer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {isEditing ? 'Edit Lecturer' : 'Lecturer Details'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowDetails(false);
                  setIsEditing(false);
                  setSelectedLecturer(null);
                }}
              >
                ×
              </Button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editName">Full Name</Label>
                  <Input
                    id="editName"
                    value={lecturerForm.name}
                    onChange={(e) => setLecturerForm({...lecturerForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editEmployeeId">Employee ID</Label>
                  <Input
                    id="editEmployeeId"
                    value={lecturerForm.employeeId}
                    onChange={(e) => setLecturerForm({...lecturerForm, employeeId: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editSpecialization">Specialization</Label>
                  <Input
                    id="editSpecialization"
                    value={lecturerForm.specialization}
                    onChange={(e) => setLecturerForm({...lecturerForm, specialization: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editEmail">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={lecturerForm.email}
                    onChange={(e) => setLecturerForm({...lecturerForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    value={lecturerForm.phone}
                    onChange={(e) => setLecturerForm({...lecturerForm, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editPassword">New Password (optional)</Label>
                  <Input
                    id="editPassword"
                    type="password"
                    value={lecturerForm.password}
                    onChange={(e) => setLecturerForm({...lecturerForm, password: e.target.value})}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateLecturer} disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <strong>Name:</strong> {selectedLecturer.name}
                </div>
                <div>
                  <strong>Employee ID:</strong> {selectedLecturer.employeeId}
                </div>
                <div>
                  <strong>Email:</strong> {selectedLecturer.email}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedLecturer.phone}
                </div>
                <div>
                  <strong>Specialization:</strong> {selectedLecturer.specialization}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      setShowDetails(false);
                      if (selectedLecturer) {
                        handleDeleteLecturer(selectedLecturer.id);
                      }
                    }}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {isEditing ? 'Edit Student' : 'Student Details'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowStudentDetails(false);
                  setIsEditing(false);
                  setSelectedStudent(null);
                }}
              >
                ×
              </Button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editStudentName">Full Name</Label>
                  <Input
                    id="editStudentName"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editRegNumber">Registration Number</Label>
                  <Input
                    id="editRegNumber"
                    value={studentForm.registrationNumber}
                    onChange={(e) => setStudentForm({...studentForm, registrationNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editStudentEmail">Email</Label>
                  <Input
                    id="editStudentEmail"
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editStudentPhone">Phone</Label>
                  <Input
                    id="editStudentPhone"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editAcademicYear">Academic Year</Label>
                  <Select value={studentForm.academicYear} onValueChange={(value) => setStudentForm({...studentForm, academicYear: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAcademicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateStudent} disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <strong>Name:</strong> {selectedStudent.name}
                </div>
                <div>
                  <strong>Registration Number:</strong> {selectedStudent.registrationNumber}
                </div>
                <div>
                  <strong>Email:</strong> {selectedStudent.email}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedStudent.phone}
                </div>
                <div>
                  <strong>Academic Year:</strong> {selectedStudent.academicYear}
                </div>
                <div>
                  <strong>Course:</strong> {selectedStudent.course}
                </div>
                <div>
                  <strong>Current Semester:</strong> {selectedStudent.currentSemester}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      setShowStudentDetails(false);
                      if (selectedStudent) {
                        handleDeleteStudent(selectedStudent.id);
                      }
                    }}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Export student data as PDF
                      const studentData = `
MUST LMS - Student Information Export

Name: ${selectedStudent.name}
Registration Number: ${selectedStudent.registrationNumber}
Email: ${selectedStudent.email}
Phone: ${selectedStudent.phone}
Academic Year: ${selectedStudent.academicYear}
Course: ${selectedStudent.course}
Current Semester: ${selectedStudent.currentSemester}
College: ${selectedStudent.college}
Department: ${selectedStudent.department}

Export Date: ${new Date().toLocaleDateString()}
                      `;
                      
                      const blob = new Blob([studentData], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${selectedStudent.name}_student_data.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success('Student data exported successfully!');
                    }}
                  >
                    Export Data
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
