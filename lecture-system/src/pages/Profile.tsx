import { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, BookOpen, GraduationCap, MapPin, Edit, Save, X, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API_BASE_URL = 'https://must-lms-backend.onrender.com/api';

export const Profile = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lecturerData, setLecturerData] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: ""
  });

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Fetch ONLY lecturer's own data using efficient endpoints
  useEffect(() => {
    const fetchLecturerData = async () => {
      if (!currentUser?.username) return;
      
      try {
        setLoading(true);
        
        console.log('=== PROFILE DATA FETCH ===');
        console.log('Current User:', currentUser);
        
        // Fetch lecturer info using efficient endpoint
        const lecturerResponse = await fetch(`${API_BASE_URL}/lecturers?username=${encodeURIComponent(currentUser.username)}`);
        const lecturerResult = await lecturerResponse.json();
        console.log('Lecturer Response:', lecturerResult);
        
        let lecturer = null;
        if (lecturerResult.success && lecturerResult.data.length > 0) {
          lecturer = lecturerResult.data[0];
          console.log('Found Lecturer:', lecturer);
          setLecturerData(lecturer);
          setEditForm({
            name: lecturer.name || "",
            email: lecturer.email || "",
            phone: lecturer.phone || "",
            specialization: lecturer.specialization || ""
          });
        }
        
        if (!lecturer) {
          console.log('Lecturer not found in database');
          setLoading(false);
          return;
        }
        
        // Fetch only THIS lecturer's programs using efficient endpoint
        const programsResponse = await fetch(`${API_BASE_URL}/programs?lecturer_username=${encodeURIComponent(currentUser.username)}`);
        const programsResult = await programsResponse.json();
        console.log('Programs Response:', programsResult);
        
        let allPrograms = [];
        if (programsResult.success) {
          allPrograms = [...programsResult.data];
          console.log('Lecturer Regular Programs:', allPrograms.length);
        }
        
        // Fetch only THIS lecturer's short-term programs using efficient endpoint
        const shortTermResponse = await fetch(`${API_BASE_URL}/short-term-programs?lecturer_username=${encodeURIComponent(currentUser.username)}`);
        const shortTermResult = await shortTermResponse.json();
        console.log('Short-Term Programs Response:', shortTermResult);
        
        if (shortTermResult.success) {
          // Convert short-term programs to same format as regular programs
          const formattedShortTermPrograms = shortTermResult.data.map((program: any) => ({
            id: `short-${program.id}`,
            name: program.title,
            lecturerName: program.lecturer_name,
            lecturer_id: program.lecturer_id,
            type: 'short-term',
            courseId: null // Short-term programs don't have course_id
          }));
          
          allPrograms = [...allPrograms, ...formattedShortTermPrograms];
          console.log('Total Programs (Regular + Short-Term):', allPrograms.length);
        }
        
        setPrograms(allPrograms);
        
        // Fetch courses
        const coursesResponse = await fetch(`${API_BASE_URL}/courses`);
        const coursesResult = await coursesResponse.json();
        
        if (coursesResult.success) {
          setCourses(coursesResult.data);
        }
        
      } catch (error) {
        console.error('Error fetching lecturer data:', error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchLecturerData();
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!lecturerData) return;
    
    try {
      setLoading(true);
      
      // Update lecturer profile
      const response = await fetch(`${API_BASE_URL}/lecturers/${lecturerData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          specialization: editForm.specialization
        }),
      });
      
      if (response.ok) {
        setLecturerData({
          ...lecturerData,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          specialization: editForm.specialization
        });
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get lecturer's programs and courses
  const lecturerPrograms = programs.filter(p => 
    p.lecturerName === currentUser?.username || 
    p.lecturerName === lecturerData?.name ||
    p.lecturerName === lecturerData?.employee_id
  );

  const lecturerCourses = courses.filter(c => 
    lecturerPrograms.some(p => p.courseId === c.id)
  );

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading your profile...</div>
        </div>
      </div>
    );
  }

  if (!lecturerData) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center py-8">
          <div className="text-red-500">Profile data not found. Please contact admin.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and teaching assignments
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSaveProfile} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label>Specialization</Label>
                  <Input
                    value={editForm.specialization}
                    onChange={(e) => setEditForm({...editForm, specialization: e.target.value})}
                    placeholder="Enter your specialization"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Name:</span>
                  <span>{lecturerData.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{lecturerData.email || "Not provided"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span>{lecturerData.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Employee ID:</span>
                  <Badge variant="outline">{lecturerData.employee_id}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Specialization:</span>
                  <Badge variant="secondary">{lecturerData.specialization || "General"}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Teaching Assignments - LECTURER'S OWN DATA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Teaching Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Programs:</span>
              <Badge variant="default">{lecturerPrograms.length}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Courses:</span>
              <Badge variant="secondary">{lecturerCourses.length}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Estimated Students:</span>
              <Badge variant="outline">{lecturerPrograms.length * 25}</Badge>
            </div>
            
            {lecturerPrograms.length > 0 && (
              <div className="mt-4">
                <span className="font-medium text-sm">Your Programs:</span>
                <div className="mt-2 space-y-1">
                  {lecturerPrograms.map((program) => (
                    <div key={program.id} className="text-sm p-2 bg-gray-50 rounded">
                      <span className="font-medium">{program.name}</span>
                      <div className="text-xs text-muted-foreground">
                        Duration: {program.duration} years • Semesters: {program.totalSemesters}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <span className="font-medium">Login Status:</span>
              <Badge variant="default" className="ml-2">Active</Badge>
            </div>
            <div>
              <span className="font-medium">Account Type:</span>
              <Badge variant="secondary" className="ml-2">Lecturer</Badge>
            </div>
            <div>
              <span className="font-medium">Data Source:</span>
              <Badge variant="outline" className="ml-2">Real Database</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
