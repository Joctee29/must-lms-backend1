import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  Clock
} from "lucide-react";

export const ProgressTracker = () => {
  const [selectedProgram, setSelectedProgram] = useState("");
  const [programs, setPrograms] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch lecturer's programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Fetch regular programs
        const programsResponse = await fetch('https://must-lms-backend.onrender.com/api/programs');
        if (programsResponse.ok) {
          const programsResult = await programsResponse.json();
          const lecturerPrograms = programsResult.data?.filter(program => 
            program.lecturer_name === currentUser.username || program.lecturer_id === currentUser.id
          ) || [];
          
          setPrograms(lecturerPrograms);
          
          if (lecturerPrograms.length > 0) {
            setSelectedProgram(lecturerPrograms[0].name);
          }
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };

    fetchPrograms();
  }, []);

  // Fetch students when program is selected
  useEffect(() => {
    if (!selectedProgram) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        const response = await fetch(
          `https://must-lms-backend.onrender.com/api/progress/students?program_name=${encodeURIComponent(selectedProgram)}&lecturer_id=${currentUser.id}`
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

  const getPerformanceColor = (level) => {
    switch (level) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const filteredStudents = students.filter(student =>
    student.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && students.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Loading Progress Data...</h3>
            <p className="text-muted-foreground">Fetching student progress information</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Student Progress Tracker</h1>
        <p className="text-muted-foreground">Monitor individual student performance and participation</p>
      </div>

      {/* Program Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Program</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedProgram} onValueChange={setSelectedProgram}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.name}>
                  {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Student List View */}
      {!selectedStudent && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students by name or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Students Grid */}
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

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : "No students enrolled in this program yet"}
              </p>
            </div>
          )}
        </div>
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
    </div>
  );
};
