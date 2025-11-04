import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Search, BookOpen, GraduationCap } from "lucide-react";

const API_BASE_URL = 'https://must-lms-backend.onrender.com/api';

interface Enrollment {
  id: string;
  student_id: string;
  program_id: string;
  enrollment_date: string;
  student_name?: string;
  program_name?: string;
}

interface LecturerAssignment {
  id: string;
  lecturer_id: string;
  program_id: string;
  assignment_date: string;
  lecturer_name?: string;
  program_name?: string;
}

export const EnrollmentManagement = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [lecturerAssignments, setLecturerAssignments] = useState<LecturerAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  // Student enrollment form
  const [enrollmentForm, setEnrollmentForm] = useState({
    student_id: "",
    program_id: ""
  });

  // Lecturer assignment form
  const [assignmentForm, setAssignmentForm] = useState({
    lecturer_id: "",
    program_id: ""
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load students
      const studentsResponse = await fetch(`${API_BASE_URL}/students`);
      const studentsResult = await studentsResponse.json();
      if (studentsResult.success) {
        setStudents(studentsResult.data);
      }

      // Load lecturers
      const lecturersResponse = await fetch(`${API_BASE_URL}/lecturers`);
      const lecturersResult = await lecturersResponse.json();
      if (lecturersResult.success) {
        setLecturers(lecturersResult.data);
      }

      // Load programs
      const programsResponse = await fetch(`${API_BASE_URL}/programs`);
      const programsResult = await programsResponse.json();
      if (programsResult.success) {
        setPrograms(programsResult.data);
      }

      // Load enrollments (mock for now)
      setEnrollments([]);
      setLecturerAssignments([]);

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStudent = async () => {
    if (!enrollmentForm.student_id || !enrollmentForm.program_id) {
      toast.error("Please select both student and program");
      return;
    }

    try {
      setLoading(true);
      
      // For now, add to local state (replace with API call)
      const newEnrollment: Enrollment = {
        id: Date.now().toString(),
        student_id: enrollmentForm.student_id,
        program_id: enrollmentForm.program_id,
        enrollment_date: new Date().toISOString(),
        student_name: students.find(s => s.id === enrollmentForm.student_id)?.name,
        program_name: programs.find(p => p.id.toString() === enrollmentForm.program_id)?.name
      };

      setEnrollments(prev => [...prev, newEnrollment]);
      setEnrollmentForm({ student_id: "", program_id: "" });
      toast.success("Student enrolled successfully!");

    } catch (error) {
      console.error('Error enrolling student:', error);
      toast.error("Failed to enroll student");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLecturer = async () => {
    if (!assignmentForm.lecturer_id || !assignmentForm.program_id) {
      toast.error("Please select both lecturer and program");
      return;
    }

    try {
      setLoading(true);
      
      // For now, add to local state (replace with API call)
      const newAssignment: LecturerAssignment = {
        id: Date.now().toString(),
        lecturer_id: assignmentForm.lecturer_id,
        program_id: assignmentForm.program_id,
        assignment_date: new Date().toISOString(),
        lecturer_name: lecturers.find(l => l.id === assignmentForm.lecturer_id)?.name,
        program_name: programs.find(p => p.id.toString() === assignmentForm.program_id)?.name
      };

      setLecturerAssignments(prev => [...prev, newAssignment]);
      setAssignmentForm({ lecturer_id: "", program_id: "" });
      toast.success("Lecturer assigned successfully!");

    } catch (error) {
      console.error('Error assigning lecturer:', error);
      toast.error("Failed to assign lecturer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enrollment Management</h1>
        <p className="text-muted-foreground">
          Manage student enrollments and lecturer assignments
        </p>
      </div>

      <Tabs defaultValue="student-enrollment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="student-enrollment">Student Enrollment</TabsTrigger>
          <TabsTrigger value="lecturer-assignment">Lecturer Assignment</TabsTrigger>
        </TabsList>

        <TabsContent value="student-enrollment" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Enroll Student Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Enroll Student
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="student">Select Student</Label>
                  <Select value={enrollmentForm.student_id} onValueChange={(value) => setEnrollmentForm({...enrollmentForm, student_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.registration_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="program">Select Program</Label>
                  <Select value={enrollmentForm.program_id} onValueChange={(value) => setEnrollmentForm({...enrollmentForm, program_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id.toString()}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleEnrollStudent} className="w-full" disabled={loading}>
                  <Users className="h-4 w-4 mr-2" />
                  {loading ? 'Enrolling...' : 'Enroll Student'}
                </Button>
              </CardContent>
            </Card>

            {/* Current Enrollments */}
            <Card>
              <CardHeader>
                <CardTitle>Current Enrollments ({enrollments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrollments.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No enrollments yet</p>
                      <p className="text-sm mt-2">Enroll students to see them here</p>
                    </div>
                  ) : (
                    enrollments.map((enrollment) => (
                      <Card key={enrollment.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold">{enrollment.student_name}</h3>
                              <p className="text-sm text-muted-foreground">{enrollment.program_name}</p>
                              <Badge variant="secondary">
                                Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                              </Badge>
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
        </TabsContent>

        <TabsContent value="lecturer-assignment" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Assign Lecturer Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Assign Lecturer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="lecturer">Select Lecturer</Label>
                  <Select value={assignmentForm.lecturer_id} onValueChange={(value) => setAssignmentForm({...assignmentForm, lecturer_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a lecturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {lecturers.map((lecturer) => (
                        <SelectItem key={lecturer.id} value={lecturer.id}>
                          {lecturer.name} ({lecturer.employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="program">Select Program</Label>
                  <Select value={assignmentForm.program_id} onValueChange={(value) => setAssignmentForm({...assignmentForm, program_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id.toString()}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAssignLecturer} className="w-full" disabled={loading}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  {loading ? 'Assigning...' : 'Assign Lecturer'}
                </Button>
              </CardContent>
            </Card>

            {/* Current Assignments */}
            <Card>
              <CardHeader>
                <CardTitle>Lecturer Assignments ({lecturerAssignments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lecturerAssignments.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No assignments yet</p>
                      <p className="text-sm mt-2">Assign lecturers to see them here</p>
                    </div>
                  ) : (
                    lecturerAssignments.map((assignment) => (
                      <Card key={assignment.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold">{assignment.lecturer_name}</h3>
                              <p className="text-sm text-muted-foreground">{assignment.program_name}</p>
                              <Badge variant="secondary">
                                Assigned: {new Date(assignment.assignment_date).toLocaleDateString()}
                              </Badge>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
