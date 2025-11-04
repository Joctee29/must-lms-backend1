import { useState, useEffect } from "react";
import { lecturerOperations, studentOperations, courseOperations, initializeDatabase } from "@/lib/database";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users } from "lucide-react";

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

export const SimpleUserManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Student form state
  const [studentForm, setStudentForm] = useState({
    name: "",
    registrationNumber: "",
    academicYear: "2024/2025",
    courseId: "",
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
      const dbCourses = await courseOperations.getAllCourses();
      setCourses(dbCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const handleAddStudent = async () => {
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
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    if (studentForm.name && studentForm.registrationNumber && studentForm.courseId && studentForm.academicYear) {
      setLoading(true);
      try {
        await studentOperations.create({
          name: studentForm.name,
          registrationNumber: studentForm.registrationNumber,
          academicYear: studentForm.academicYear,
          courseId: parseInt(studentForm.courseId),
          currentSemester: studentForm.currentSemester,
          email: studentForm.email,
          phone: studentForm.phone,
          password: studentForm.password
        });
        await loadStudents();
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
        toast.success("Student registered successfully!");
      } catch (error) {
        console.error('Error adding student:', error);
        toast.error("Failed to register student. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddLecturer = async () => {
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Badge variant="outline" className="text-sm">
          Real Database Integration
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Register Student
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="courseSelect">Course</Label>
                <Select value={studentForm.courseId} onValueChange={(value) => setStudentForm({...studentForm, courseId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
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

        {/* Lecturer Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Register Lecturer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      {/* Display registered users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Students ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No students registered yet</p>
                  <p className="text-sm mt-2">Register students using the form above. Data will be saved to PostgreSQL database.</p>
                </div>
              ) : (
                students.map((student) => (
                  <Card key={student.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{student.name}</h3>
                            <Badge variant="secondary">{student.registrationNumber}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                          <p className="text-sm text-muted-foreground">{student.course}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lecturers List */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Lecturers ({lecturers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lecturers.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No lecturers registered yet</p>
                  <p className="text-sm mt-2">Register lecturers using the form above. Data will be saved to PostgreSQL database.</p>
                </div>
              ) : (
                lecturers.map((lecturer) => (
                  <Card key={lecturer.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{lecturer.name}</h3>
                            <Badge variant="secondary">{lecturer.employeeId}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{lecturer.email}</p>
                          <p className="text-sm text-muted-foreground">{lecturer.specialization}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
