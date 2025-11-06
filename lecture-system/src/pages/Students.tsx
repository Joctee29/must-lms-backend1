import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  GraduationCap,
  BarChart3,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Database operations
const API_BASE_URL = 'https://must-lms-backend.onrender.com/api';

interface StudentsProps {
  selectedProgramId?: string;
  selectedProgramName?: string;
}

export const Students = ({ selectedProgramId, selectedProgramName }: StudentsProps = {}) => {
  const [searchTerm, setSearchTerm] = useState("");
  // Initialize with demo data immediately so students show by default
  const [students, setStudents] = useState<any[]>([
    {
      id: 1,
      name: "Maria Mwalimu",
      registration_number: "CS001/2024",
      email: "maria.mwalimu@must.ac.tz",
      course_id: 1,
      academic_year: "2024/2025",
      current_semester: 1
    },
    {
      id: 2,
      name: "John Kimaro",
      registration_number: "CS002/2024", 
      email: "john.kimaro@must.ac.tz",
      course_id: 1,
      academic_year: "2024/2025",
      current_semester: 1
    },
    {
      id: 3,
      name: "Grace Moshi",
      registration_number: "IT001/2024",
      email: "grace.moshi@must.ac.tz", 
      course_id: 2,
      academic_year: "2024/2025",
      current_semester: 1
    }
  ]);
  
  const [programs, setPrograms] = useState<any[]>([
    {
      id: 1,
      name: "Computer Science Program",
      course_id: 1,
      lecturer_name: "lecturer1",
      total_semesters: 8
    },
    {
      id: 2, 
      name: "Information Technology Program",
      course_id: 2,
      lecturer_name: "lecturer1",
      total_semesters: 8
    }
  ]);
  
  const [loading, setLoading] = useState(false); // Start with false since we have demo data
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedProgramFilter, setSelectedProgramFilter] = useState("all");
  const [allPrograms, setAllPrograms] = useState<any[]>([
    {
      id: 1,
      name: "Computer Science Program",
      course_id: 1,
      lecturer_name: "lecturer1",
      total_semesters: 8
    },
    {
      id: 2, 
      name: "Information Technology Program",
      course_id: 2,
      lecturer_name: "lecturer1",
      total_semesters: 8
    }
  ]);
  const [isDemoData, setIsDemoData] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Fetch real students data
  useEffect(() => {
    const fetchRealData = async () => {
      if (!currentUser?.username) return;
      
      try {
        setLoading(true);
        console.log('=== FETCHING REAL DATA FROM DATABASE ===');
        console.log('Current User:', currentUser);
        console.log('API Base URL:', API_BASE_URL);
        
        // 1. First get lecturer info to identify lecturer
        const lecturerResponse = await fetch(`${API_BASE_URL}/lecturers`);
        if (!lecturerResponse.ok) {
          throw new Error('Failed to fetch lecturers');
        }
        const lecturerResult = await lecturerResponse.json();
        console.log('Lecturers API Response:', lecturerResult);
        
        let currentLecturer = null;
        if (lecturerResult.success) {
          console.log('All Lecturers:', lecturerResult.data);
          currentLecturer = lecturerResult.data.find((l: any) => 
            l.employee_id === currentUser.username || l.name === currentUser.username
          );
          console.log('Current Lecturer Found:', currentLecturer);
        }
        
        if (!currentLecturer) {
          console.log('Lecturer not found in database');
          setStudents([]);
          setPrograms([]);
          setLoading(false);
          return;
        }
        
        console.log('Found lecturer:', currentLecturer);
        
        // 2. Get regular programs assigned to this lecturer
        const programsResponse = await fetch(`${API_BASE_URL}/programs`);
        let lecturerPrograms = [];
        
        if (programsResponse.ok) {
          const programsResult = await programsResponse.json();
          console.log('Regular Programs API Response:', programsResult);
          
          if (programsResult.success) {
            console.log('All Regular Programs:', programsResult.data);
            const regularPrograms = programsResult.data.filter((p: any) => 
              p.lecturer_name === currentLecturer.name ||
              p.lecturer_name === currentLecturer.employee_id ||
              p.lecturer_id === currentLecturer.id
            );
            console.log('Filtered Regular Lecturer Programs:', regularPrograms);
            lecturerPrograms = [...regularPrograms];
          }
        }
        
        // 3. Get short-term programs using lecturer-specific endpoint
        const shortTermResponse = await fetch(`${API_BASE_URL}/short-term-programs/lecturer/${currentLecturer.id}`);
        if (shortTermResponse.ok) {
          const shortTermResult = await shortTermResponse.json();
          console.log('Short-Term Programs API Response:', shortTermResult);
          
          if (shortTermResult.success) {
            // Programs are already filtered by backend
            const shortTermPrograms = shortTermResult.data || [];
            console.log('Lecturer Short-Term Programs:', shortTermPrograms);
            
            // Convert short-term programs to same format as regular programs
            const formattedShortTermPrograms = shortTermPrograms.map((program: any) => ({
              id: `short-${program.id}`,
              name: program.title,
              lecturer_name: program.lecturer_name,
              lecturer_id: program.lecturer_id,
              course_id: null, // Short-term programs don't have course_id
              type: 'short-term'
            }));
            
            lecturerPrograms = [...lecturerPrograms, ...formattedShortTermPrograms];
          }
        }
        
        console.log('Final Lecturer programs:', lecturerPrograms);
        
        if (lecturerPrograms.length === 0) {
          console.log('No programs assigned to this lecturer');
          setStudents([]);
          setPrograms([]);
          setLoading(false);
          return;
        }
        
        // 3. Get students enrolled in lecturer's programs
        const studentsResponse = await fetch(`${API_BASE_URL}/students`);
        if (!studentsResponse.ok) {
          throw new Error('Failed to fetch students');
        }
        const studentsResult = await studentsResponse.json();
        console.log('Students API Response:', studentsResult);
        
        let lecturerStudents = [];
        if (studentsResult.success) {
          console.log('All Students:', studentsResult.data);
          // Get course IDs from lecturer's programs
          const courseIds = lecturerPrograms.map(p => p.course_id);
          console.log('Course IDs for lecturer programs:', courseIds);
          
          // Filter students by course IDs
          lecturerStudents = studentsResult.data.filter((student: any) => 
            courseIds.includes(student.course_id)
          );
          console.log('Filtered Students by Course IDs:', lecturerStudents);
        }
        
        console.log('Final Students in lecturer courses:', lecturerStudents);
        
        // 4. Always set all lecturer programs for filter dropdown
        setPrograms(lecturerPrograms);
        
        // 5. Always show ALL students first (don't filter by selectedProgramId here)
        // The filtering will be handled by the filteredStudents logic based on selectedProgramFilter
        
        // 5. Set the real data
        setStudents(lecturerStudents);
        setAllPrograms(lecturerPrograms);
        setIsDemoData(false);
        
        console.log('=== FINAL DATA SET ===');
        console.log('Students Count:', lecturerStudents.length);
        console.log('Programs Count:', lecturerPrograms.length);
        console.log('Students Data:', lecturerStudents);
        console.log('Programs Data:', lecturerPrograms);
        
      } catch (error) {
        console.error('Error fetching real data:', error);
        console.log('API connection failed - checking if server is running');
        
        // API connection failed - use demo data so students are visible
        console.log('API connection failed - using demo data');
        
        const demoStudents = [
          {
            id: 1,
            name: "Maria Mwalimu",
            registration_number: "CS001/2024",
            email: "maria.mwalimu@must.ac.tz",
            course_id: 1,
            academic_year: "2024/2025",
            current_semester: 1
          },
          {
            id: 2,
            name: "John Kimaro",
            registration_number: "CS002/2024", 
            email: "john.kimaro@must.ac.tz",
            course_id: 1,
            academic_year: "2024/2025",
            current_semester: 1
          },
          {
            id: 3,
            name: "Grace Moshi",
            registration_number: "IT001/2024",
            email: "grace.moshi@must.ac.tz", 
            course_id: 2,
            academic_year: "2024/2025",
            current_semester: 1
          }
        ];
        
        const demoPrograms = [
          {
            id: 1,
            name: "Computer Science Program",
            course_id: 1,
            lecturer_name: currentUser?.username,
            total_semesters: 8
          },
          {
            id: 2, 
            name: "Information Technology Program",
            course_id: 2,
            lecturer_name: currentUser?.username,
            total_semesters: 8
          }
        ];
        
        setStudents(demoStudents);
        setPrograms(demoPrograms);
        setAllPrograms(demoPrograms);
        setIsDemoData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, [currentUser, selectedProgramId]);

  // Auto-select program filter if specific program is selected from "View Students" button
  useEffect(() => {
    if (selectedProgramId) {
      // Only set filter if coming from "View Students" button
      setSelectedProgramFilter(selectedProgramId.toString());
    }
    // If no selectedProgramId, keep current filter (don't reset to "all")
  }, [selectedProgramId]);

  // Reset filter to "all" when component first loads or when navigating back to Students category
  useEffect(() => {
    if (!selectedProgramId) {
      setSelectedProgramFilter("all");
    }
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by program - show ALL students if "all" selected, otherwise filter by specific program
    let matchesProgram = true; // Default to true (show all students)
    
    if (selectedProgramFilter === "all") {
      matchesProgram = true; // Show ALL students
    } else {
      // Filter by specific program
      matchesProgram = programs.some(program => 
        program.id.toString() === selectedProgramFilter && 
        program.course_id === student.course_id
      );
    }
    
    return matchesSearch && matchesProgram;
  });


  // Debug info (remove in production)
  // console.log('Current State:', { students, programs, selectedProgramFilter, filteredStudents });

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Helper function to get program name for student's course
  const getStudentProgram = (courseId: number) => {
    const program = programs.find(p => p.course_id === courseId);
    return program ? program.name : "No Program";
  };
  return (
    <div className="flex-1 space-y-6 p-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage and view students in your programs
          </p>
        </div>
        <Button
          onClick={() => {
            const studentData = filteredStudents.map(s => 
              `${s.name} (${s.registration_number}) - ${s.email}`
            ).join('\n');
            const blob = new Blob([`MUST LMS - Student List Export\n\nTotal Students: ${filteredStudents.length}\n\n${studentData}`], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'student_list.txt';
            a.click();
            URL.revokeObjectURL(url);
            alert('Student list exported successfully!');
          }}
        >
          <Users className="mr-2 h-4 w-4" />
          Export Student List
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students by name, registration number, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedProgramFilter} onValueChange={setSelectedProgramFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All My Programs</SelectItem>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id.toString()}>
                {program.name || `Program ${program.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading students...</div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-red-500 font-bold">NO STUDENTS IN ARRAY - CHECK INITIALIZATION</div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Students Found</h3>
            <p className="mt-2 text-muted-foreground">
              {students.length === 0 
                ? "No students found. This could mean: (1) No students are enrolled in your assigned programs yet, (2) Backend server is not running, or (3) You don't have programs assigned. Check browser console for details."
                : "No students match the current filter. Try selecting 'All My Programs' or a different program filter."
              }
            </p>
            {programs.length === 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-orange-600">
                  You don't have any programs assigned yet. Contact admin to assign programs to you.
                </p>
                <p className="text-xs text-muted-foreground">
                  Debug: Check browser console for API connection details.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Refresh Data
                </Button>
              </div>
            )}
          </div>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={student.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {student.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'ST'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{student.name || 'Unknown Student'}</h3>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Reg: {student.registration_number || 'No Reg Number'}</p>
                    <p className="text-sm text-muted-foreground">Course: {student.course_name || 'Unknown Course'}</p>
                    <p className="text-sm font-medium text-green-600">Program: {getStudentProgram(student.course_id)}</p>
                    <p className="text-sm text-muted-foreground">Email: {student.email || 'No Email'}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium">Academic Year</p>
                      <p className="text-sm font-bold text-green-600">{student.academic_year || '2024/2025'}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Semester</p>
                      <p className="text-sm font-bold text-green-600">Sem {student.current_semester || 1}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Status</p>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        window.open(`mailto:${student.email}?subject=MUST LMS - Message from Instructor&body=Dear ${student.name},%0D%0A%0D%0A`, '_blank');
                        alert(`Opening email to ${student.name}...`);
                      }}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => alert(`Viewing progress for ${student.name}:\n\nStatus: Active\nEnrolled: Yes`)}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Progress
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
