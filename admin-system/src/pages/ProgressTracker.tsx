import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  FileText, 
  Video, 
  Search,
  ChevronRight,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  GraduationCap,
  Building,
  Briefcase
} from "lucide-react";

export const ProgressTracker = () => {
  const [activeTab, setActiveTab] = useState("students");
  
  // Student filters
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  
  const [students, setStudents] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [lecturerProgress, setLecturerProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch('https://must-lms-backend.onrender.com/api/colleges');
        if (response.ok) {
          const result = await response.json();
          setColleges(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching colleges:', error);
      }
    };
    fetchColleges();
  }, []);

  // Fetch departments when college is selected
  useEffect(() => {
    if (!selectedCollege) {
      setDepartments([]);
      setSelectedDepartment("");
      return;
    }

    const fetchDepartments = async () => {
      try {
        const response = await fetch('https://must-lms-backend.onrender.com/api/departments');
        if (response.ok) {
          const result = await response.json();
          const filteredDepts = result.data?.filter(dept => dept.college_id === parseInt(selectedCollege)) || [];
          setDepartments(filteredDepts);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, [selectedCollege]);

  // Fetch courses when department is selected
  useEffect(() => {
    if (!selectedDepartment) {
      setCourses([]);
      setSelectedCourse("");
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch('https://must-lms-backend.onrender.com/api/courses');
        if (response.ok) {
          const result = await response.json();
          const filteredCourses = result.data?.filter(course => course.department_id === parseInt(selectedDepartment)) || [];
          setCourses(filteredCourses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, [selectedDepartment]);

  // Fetch programs when course is selected
  useEffect(() => {
    if (!selectedCourse) {
      setPrograms([]);
      setSelectedProgram("");
      return;
    }

    const fetchPrograms = async () => {
      try {
        const response = await fetch('https://must-lms-backend.onrender.com/api/programs');
        if (response.ok) {
          const result = await response.json();
          const filteredPrograms = result.data?.filter(program => program.course_id === parseInt(selectedCourse)) || [];
          setPrograms(filteredPrograms);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };
    fetchPrograms();
  }, [selectedCourse]);

  // Fetch students based on filters
  useEffect(() => {
    if (!selectedProgram) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://must-lms-backend.onrender.com/api/progress/students?program_name=${encodeURIComponent(selectedProgram)}`
        );
        
        if (response.ok) {
          const result = await response.json();
          setStudents(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedProgram]);

  // Fetch all lecturers
  useEffect(() => {
    if (activeTab !== "lecturers") return;

    const fetchLecturers = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://must-lms-backend.onrender.com/api/lecturers');
        if (response.ok) {
          const result = await response.json();
          setLecturers(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching lecturers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLecturers();
  }, [activeTab]);

  // Fetch individual student progress
  const handleViewStudentProgress = async (student) => {
    setSelectedStudent(student);
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://must-lms-backend.onrender.com/api/progress/student/${student.student.id}?program_name=${encodeURIComponent(selectedProgram)}`
      );
      
      if (response.ok) {
        const result = await response.json();
        setStudentProgress(result.data);
      }
    } catch (error) {
      console.error('Error fetching student progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch individual lecturer progress
  const handleViewLecturerProgress = async (lecturer) => {
    setSelectedLecturer(lecturer);
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://must-lms-backend.onrender.com/api/progress/lecturer/${lecturer.id}`
      );
      
      if (response.ok) {
        const result = await response.json();
        setLecturerProgress(result.data);
      }
    } catch (error) {
      console.error('Error fetching lecturer progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (level) => {
    switch (level) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      case 'Very Active': return 'bg-green-100 text-green-800';
      case 'Active': return 'bg-blue-100 text-blue-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const filteredStudents = students.filter(student =>
    student.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLecturers = lecturers.filter(lecturer =>
    lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Progress Tracker</h1>
        <p className="text-muted-foreground">Monitor student and lecturer performance across the institution</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="lecturers">
            <GraduationCap className="h-4 w-4 mr-2" />
            Lecturers
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          {!selectedStudent && (
            <>
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Filter Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* College Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">College</label>
                      <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select College" />
                        </SelectTrigger>
                        <SelectContent>
                          {colleges.map((college) => (
                            <SelectItem key={college.id} value={college.id.toString()}>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {college.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Department Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Department</label>
                      <Select 
                        value={selectedDepartment} 
                        onValueChange={setSelectedDepartment}
                        disabled={!selectedCollege}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                {dept.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Course Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Course</label>
                      <Select 
                        value={selectedCourse} 
                        onValueChange={setSelectedCourse}
                        disabled={!selectedDepartment}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                {course.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Program Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Program</label>
                      <Select 
                        value={selectedProgram} 
                        onValueChange={setSelectedProgram}
                        disabled={!selectedCourse}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Program" />
                        </SelectTrigger>
                        <SelectContent>
                          {programs.map((program) => (
                            <SelectItem key={program.id} value={program.name}>
                              {program.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Search */}
              {selectedProgram && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students by name or registration number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}

              {/* Students Grid */}
              {selectedProgram && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <Card 
                      key={student.student.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleViewStudentProgress(student)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{student.student.name}</h3>
                            <p className="text-sm text-muted-foreground">{student.student.registration_number}</p>
                          </div>
                          <Badge className={getPerformanceColor(student.overall.performance_level)}>
                            {student.overall.performance_level}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="font-semibold">{student.overall.participation_rate}%</span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${student.overall.participation_rate}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2">
                            <div className="text-center">
                              <FileText className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                              <p className="text-xs text-muted-foreground">Assessments</p>
                              <p className="text-sm font-semibold">{student.assessments.submitted}/{student.assessments.total}</p>
                            </div>
                            <div className="text-center">
                              <BookOpen className="h-4 w-4 mx-auto text-green-600 mb-1" />
                              <p className="text-xs text-muted-foreground">Assignments</p>
                              <p className="text-sm font-semibold">{student.assignments.submitted}/{student.assignments.total}</p>
                            </div>
                            <div className="text-center">
                              <Video className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                              <p className="text-xs text-muted-foreground">Live Classes</p>
                              <p className="text-sm font-semibold">{student.live_classes.attended}/{student.live_classes.total}</p>
                            </div>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" className="w-full mt-3">
                          View Details <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {selectedProgram && filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No students found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms" : "No students enrolled in this program yet"}
                  </p>
                </div>
              )}

              {!selectedProgram && (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select Filters</h3>
                  <p className="text-muted-foreground">
                    Please select College, Department, Course, and Program to view student progress
                  </p>
                </div>
              )}
            </>
          )}

          {/* Detailed Student Progress View */}
          {selectedStudent && studentProgress && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => {
                  setSelectedStudent(null);
                  setStudentProgress(null);
                }}>
                  ← Back to Students
                </Button>
              </div>

              {/* Student Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{studentProgress.student.name}</h2>
                      <p className="text-muted-foreground">{studentProgress.student.registration_number}</p>
                      <p className="text-sm text-muted-foreground">{studentProgress.student.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getPerformanceColor(studentProgress.overall.performance_level)} text-lg px-4 py-2`}>
                        {studentProgress.overall.performance_level}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">Overall Performance</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-2xl font-bold">{studentProgress.overall.participation_rate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-primary h-4 rounded-full transition-all"
                        style={{ width: `${studentProgress.overall.participation_rate}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Assessments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Assessments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Participation Rate</span>
                      <span className="text-2xl font-bold">{studentProgress.assessments.participation_rate}%</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Submitted
                        </span>
                        <span className="font-semibold">{studentProgress.assessments.submitted}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          Not Submitted
                        </span>
                        <span className="font-semibold">{studentProgress.assessments.not_submitted}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-600" />
                          Average Score
                        </span>
                        <span className="font-semibold">{studentProgress.assessments.average_score}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assignments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      Assignments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Participation Rate</span>
                      <span className="text-2xl font-bold">{studentProgress.assignments.participation_rate}%</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Submitted
                        </span>
                        <span className="font-semibold">{studentProgress.assignments.submitted}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          Not Submitted
                        </span>
                        <span className="font-semibold">{studentProgress.assignments.not_submitted}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-600" />
                          Average Grade
                        </span>
                        <span className="font-semibold">{studentProgress.assignments.average_grade}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Classes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-purple-600" />
                      Live Classes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Attendance Rate</span>
                      <span className="text-2xl font-bold">{studentProgress.live_classes.attendance_rate}%</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Attended
                        </span>
                        <span className="font-semibold">{studentProgress.live_classes.attended}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          Not Attended
                        </span>
                        <span className="font-semibold">{studentProgress.live_classes.not_attended}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          Total Classes
                        </span>
                        <span className="font-semibold">{studentProgress.live_classes.total}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Lecturers Tab */}
        <TabsContent value="lecturers" className="space-y-6">
          {!selectedLecturer && (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lecturers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Lecturers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLecturers.map((lecturer) => (
                  <Card 
                    key={lecturer.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleViewLecturerProgress(lecturer)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{lecturer.name}</h3>
                          <p className="text-sm text-muted-foreground">{lecturer.email}</p>
                          {lecturer.specialization && (
                            <p className="text-xs text-muted-foreground mt-1">{lecturer.specialization}</p>
                          )}
                        </div>
                        <GraduationCap className="h-8 w-8 text-primary" />
                      </div>

                      <Button variant="ghost" size="sm" className="w-full mt-3">
                        View Progress <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredLecturers.length === 0 && (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No lecturers found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms" : "No lecturers registered yet"}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Detailed Lecturer Progress View */}
          {selectedLecturer && lecturerProgress && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => {
                  setSelectedLecturer(null);
                  setLecturerProgress(null);
                }}>
                  ← Back to Lecturers
                </Button>
              </div>

              {/* Lecturer Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{lecturerProgress.lecturer.name}</h2>
                      <p className="text-muted-foreground">{lecturerProgress.lecturer.email}</p>
                      {lecturerProgress.lecturer.department && (
                        <p className="text-sm text-muted-foreground">{lecturerProgress.lecturer.department}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className={`${getPerformanceColor(lecturerProgress.overall.activity_level)} text-lg px-4 py-2`}>
                        {lecturerProgress.overall.activity_level}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">Activity Level</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Total Activities Created</span>
                      <span className="text-2xl font-bold">{lecturerProgress.overall.total_activities}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Assessments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Assessments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{lecturerProgress.assessments.total_created}</p>
                      <p className="text-sm text-muted-foreground">Total Created</p>
                    </div>
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Active</span>
                        <span className="font-semibold">{lecturerProgress.assessments.active}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Completed</span>
                        <span className="font-semibold">{lecturerProgress.assessments.completed}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assignments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      Assignments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{lecturerProgress.assignments.total_created}</p>
                      <p className="text-sm text-muted-foreground">Total Created</p>
                    </div>
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Active</span>
                        <span className="font-semibold">{lecturerProgress.assignments.active}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Completed</span>
                        <span className="font-semibold">{lecturerProgress.assignments.completed}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Classes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-purple-600" />
                      Live Classes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">{lecturerProgress.live_classes.total_created}</p>
                      <p className="text-sm text-muted-foreground">Total Created</p>
                    </div>
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Active</span>
                        <span className="font-semibold">{lecturerProgress.live_classes.active}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Completed</span>
                        <span className="font-semibold">{lecturerProgress.live_classes.completed}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Announcements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      Announcements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-600">{lecturerProgress.announcements.total_created}</p>
                      <p className="text-sm text-muted-foreground">Total Created</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
