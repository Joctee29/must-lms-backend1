import { useState, useEffect } from "react";
import { courseOperations, studentOperations, initializeDatabase } from "@/lib/database";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  Building, 
  GraduationCap,
  Plus,
  ArrowLeft
} from "lucide-react";

interface College {
  id: string;
  name: string;
  shortName: string;
}

interface Department {
  id: string;
  name: string;
  collegeId: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  duration: number;
  academicLevel: 'certificate' | 'diploma' | 'bachelor' | 'masters' | 'phd';
}

export const StudentRegistration = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    phone: "",
    registrationNumber: "",
    academicYear: "",
    collegeId: "",
    departmentId: "",
    courseId: "",
    academicLevel: "bachelor" as 'certificate' | 'diploma' | 'bachelor' | 'masters' | 'phd',
    yearOfStudy: 1
  });

  // Search states
  const [collegeSearch, setCollegeSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDatabase();
        
        // Load colleges
        const collegesData = await courseOperations.getAllColleges();
        setColleges(collegesData || []);
        
        // Load departments
        const departmentsData = await courseOperations.getAllDepartments();
        setDepartments(departmentsData || []);
        
        // Load courses
        const coursesData = await courseOperations.getAllCourses();
        setCourses(coursesData || []);
        
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error("Failed to load registration data");
      }
    };
    
    loadData();
  }, []);

  // Auto-generate registration number
  useEffect(() => {
    if (studentForm.courseId && studentForm.academicYear) {
      const selectedCourse = courses.find(c => c.id === studentForm.courseId);
      if (selectedCourse) {
        const courseCode = selectedCourse.code.toUpperCase();
        const year = studentForm.academicYear;
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const regNumber = `${courseCode}${randomNum}/${year}`;
        setStudentForm(prev => ({ ...prev, registrationNumber: regNumber }));
      }
    }
  }, [studentForm.courseId, studentForm.academicYear, courses]);

  // Auto-set academic level when course is selected
  useEffect(() => {
    if (studentForm.courseId) {
      const selectedCourse = courses.find(c => c.id === studentForm.courseId);
      if (selectedCourse) {
        setStudentForm(prev => ({ 
          ...prev, 
          academicLevel: selectedCourse.academicLevel 
        }));
      }
    }
  }, [studentForm.courseId, courses]);

  // Filter departments by selected college
  const filteredDepartments = departments.filter(dept => 
    dept.collegeId === studentForm.collegeId &&
    dept.name.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  // Filter courses by selected department and academic level
  const filteredCourses = courses.filter(course => 
    course.departmentId === studentForm.departmentId &&
    (course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
     course.code.toLowerCase().includes(courseSearch.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentForm.name || !studentForm.email || !studentForm.courseId) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setLoading(true);
      
      // Get selected course details
      const selectedCourse = courses.find(c => c.id === studentForm.courseId);
      const selectedDepartment = departments.find(d => d.id === studentForm.departmentId);
      const selectedCollege = colleges.find(c => c.id === studentForm.collegeId);
      
      const studentData = {
        name: studentForm.name,
        email: studentForm.email,
        phone: studentForm.phone,
        registration_number: studentForm.registrationNumber,
        academic_year: studentForm.academicYear,
        course_id: parseInt(studentForm.courseId),
        course_name: selectedCourse?.name || "",
        department_name: selectedDepartment?.name || "",
        college_name: selectedCollege?.name || "",
        academic_level: studentForm.academicLevel,
        year_of_study: studentForm.yearOfStudy,
        current_semester: 1,
        status: 'active'
      };
      
      await studentOperations.create(studentData);
      
      toast.success("Student registered successfully!");
      
      // Reset form
      setStudentForm({
        name: "",
        email: "",
        phone: "",
        registrationNumber: "",
        academicYear: "",
        collegeId: "",
        departmentId: "",
        courseId: "",
        academicLevel: "bachelor",
        yearOfStudy: 1
      });
      
    } catch (error) {
      console.error('Error registering student:', error);
      toast.error("Failed to register student");
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'certificate': return 'secondary';
      case 'diploma': return 'outline';
      case 'bachelor': return 'default';
      case 'masters': return 'destructive';
      case 'phd': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Registration</h1>
          <p className="text-muted-foreground">Register new students with academic level selection</p>
        </div>
        <Badge 
          variant={getLevelBadgeVariant(studentForm.academicLevel)}
          className="text-sm px-3 py-1"
        >
          {studentForm.academicLevel.toUpperCase()} LEVEL
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
          <CardDescription>
            Fill in the student details and select their academic program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student-name">Full Name *</Label>
                <Input
                  id="student-name"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                  placeholder="Enter student's full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="student-email">Email Address *</Label>
                <Input
                  id="student-email"
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                  placeholder="student@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="student-phone">Phone Number</Label>
                <Input
                  id="student-phone"
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                  placeholder="+255 XXX XXX XXX"
                />
              </div>
              <div>
                <Label htmlFor="academic-year">Academic Year *</Label>
                <Select value={studentForm.academicYear} onValueChange={(value) => setStudentForm({...studentForm, academicYear: value})}>
                  <SelectTrigger id="academic-year">
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year-of-study">Year of Study *</Label>
                <Select value={studentForm.yearOfStudy.toString()} onValueChange={(value) => setStudentForm({...studentForm, yearOfStudy: parseInt(value)})}>
                  <SelectTrigger id="year-of-study">
                    <SelectValue placeholder="Select year of study" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Year</SelectItem>
                    <SelectItem value="2">Second Year</SelectItem>
                    <SelectItem value="3">Third Year</SelectItem>
                    <SelectItem value="4">Fourth Year</SelectItem>
                    <SelectItem value="5">Fifth Year</SelectItem>
                    <SelectItem value="6">Sixth Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Program Selection
              </h3>
              
              {/* College Selection */}
              <div>
                <Label htmlFor="college">College *</Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      placeholder="Search colleges..."
                      value={collegeSearch}
                      onChange={(e) => setCollegeSearch(e.target.value)}
                      className="text-sm pr-8"
                    />
                    {collegeSearch && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setCollegeSearch("")}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                  <Select value={studentForm.collegeId} onValueChange={(value) => setStudentForm({...studentForm, collegeId: value, departmentId: "", courseId: ""})}>
                    <SelectTrigger id="college">
                      <SelectValue placeholder="Select college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges
                        .filter(college => 
                          college.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
                          college.shortName?.toLowerCase().includes(collegeSearch.toLowerCase())
                        )
                        .map((college) => (
                          <SelectItem key={college.id} value={college.id}>
                            {college.name} {college.shortName ? `(${college.shortName})` : ''}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Department Selection */}
              {studentForm.collegeId && (
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        placeholder="Search departments..."
                        value={departmentSearch}
                        onChange={(e) => setDepartmentSearch(e.target.value)}
                        className="text-sm pr-8"
                      />
                      {departmentSearch && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => setDepartmentSearch("")}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                    <Select value={studentForm.departmentId} onValueChange={(value) => setStudentForm({...studentForm, departmentId: value, courseId: ""})}>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDepartments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Course Selection */}
              {studentForm.departmentId && (
                <div>
                  <Label htmlFor="course">Course *</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        placeholder="Search courses..."
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        className="text-sm pr-8"
                      />
                      {courseSearch && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => setCourseSearch("")}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                    <Select value={studentForm.courseId} onValueChange={(value) => setStudentForm({...studentForm, courseId: value})}>
                      <SelectTrigger id="course">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            <div className="flex items-center gap-2">
                              <span>{course.name} ({course.code})</span>
                              <Badge 
                                variant={getLevelBadgeVariant(course.academicLevel)}
                                className="text-xs"
                              >
                                {course.academicLevel.toUpperCase()}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Auto-generated Registration Number */}
              {studentForm.registrationNumber && (
                <div>
                  <Label htmlFor="reg-number">Registration Number (Auto-generated)</Label>
                  <Input
                    id="reg-number"
                    value={studentForm.registrationNumber}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              )}

              {/* Academic Level Display */}
              {studentForm.courseId && (
                <div>
                  <Label>Academic Level (Auto-selected)</Label>
                  <div className="mt-2">
                    <Badge 
                      variant={getLevelBadgeVariant(studentForm.academicLevel)}
                      className="text-sm px-3 py-2"
                    >
                      {studentForm.academicLevel.toUpperCase()} LEVEL
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Register Student
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
