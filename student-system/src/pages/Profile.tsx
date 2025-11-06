import { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, BookOpen, GraduationCap, MapPin, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API_BASE_URL = 'https://must-lms-backend.onrender.com/api';

export const Profile = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Fetch ONLY student's own data - kama ulivyoeleza
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!currentUser?.username) return;
      
      try {
        setLoading(true);
        
        // Fetch ONLY this student's data using secure endpoint
        const response = await fetch(`${API_BASE_URL}/students/me?username=${encodeURIComponent(currentUser.username)}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const foundStudent = result.data;
          
          if (foundStudent) {
            setStudentData(foundStudent);
            setEditForm({
              name: foundStudent.name || "",
              email: foundStudent.email || "",
              phone: foundStudent.phone || ""
            });
          }
        }
        
      } catch (error) {
        console.error('Error fetching student data:', error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!studentData) return;
    
    try {
      setLoading(true);
      
      // Update student profile
      const response = await fetch(`${API_BASE_URL}/students/${studentData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone
        }),
      });
      
      if (response.ok) {
        setStudentData({
          ...studentData,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone
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

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading your profile...</div>
        </div>
      </div>
    );
  }

  if (!studentData) {
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
            Manage your personal information and academic details
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
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Name:</span>
                  <span>{studentData.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{studentData.email || "Not provided"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span>{studentData.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Registration:</span>
                  <Badge variant="outline">{studentData.registration_number}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Academic Information - AUTOMATIC LINKING DATA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">College:</span>
              <Badge variant="secondary">{studentData.college || "Not assigned"}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Department:</span>
              <span>{studentData.department || "Not assigned"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Course:</span>
              <span>{studentData.course_name || studentData.courseName || "Not assigned"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Programs:</span>
              <span>{studentData.programs || "No programs assigned"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Academic Year:</span>
              <Badge>{studentData.academic_year || studentData.academicYear || "Not set"}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Current Semester:</span>
              <Badge variant="outline">{studentData.current_semester || studentData.currentSemester || 1}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
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
              <Badge variant="secondary" className="ml-2">Student</Badge>
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
