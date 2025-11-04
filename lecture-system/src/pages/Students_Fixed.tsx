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

// Database operations
const API_BASE_URL = 'https://must-lms-backend.onrender.com/api';

export const Students = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Fetch real students data
  useEffect(() => {
    const fetchStudents = async () => {
      if (!currentUser?.username) return;
      
      try {
        setLoading(true);
        
        // Fetch all students
        const studentsResponse = await fetch(`${API_BASE_URL}/students`);
        const studentsResult = await studentsResponse.json();
        
        if (studentsResult.success) {
          // For now, show limited students (in real system, this would be based on lecturer's courses)
          const lecturerStudents = studentsResult.data.slice(0, 5); // Limit to 5 students
          setStudents(lecturerStudents);
        }
        
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [currentUser]);

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            View and manage students enrolled in your courses
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          variant="outline"
          onClick={() => alert('Filter functionality - coming soon!')}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading students...</div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Students Found</h3>
            <p className="mt-2 text-muted-foreground">
              No students enrolled in your courses yet.
            </p>
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
                    <p className="text-sm text-muted-foreground">{student.registration_number || 'No Reg Number'}</p>
                    <p className="text-sm text-muted-foreground">{student.email || 'No Email'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium">Enrolled</p>
                      <p className="text-2xl font-bold text-primary">✓</p>
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
