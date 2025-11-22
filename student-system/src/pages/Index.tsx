import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { CourseCatalog } from "@/components/CourseCatalog";
import { MyCourses } from "@/pages/MyCourses";
import { Assignments } from "@/pages/Assignments";
import { StudentAssignments } from "@/pages/StudentAssignments";
import { Grades } from "@/pages/Grades";
import { Schedule } from "@/pages/Schedule";
import { Discussions } from "./Discussions";
import { AnnouncementsNews } from "./AnnouncementsNews";
import { TakeAssessment } from "./TakeAssessment";
import { AssessmentResults } from "./AssessmentResults";
import { Games } from "./Games";
import { JedaNetworksCredit } from "@/components/JedaNetworksCredit";
import { StudentLiveClass } from "@/pages/StudentLiveClass";
import Timetable from "@/pages/Timetable";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Video, Image, Download, Trash2, Eye, Search } from "lucide-react";

// Materials Component
const MaterialsComponent = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;
        
        const user = JSON.parse(currentUser);
        
        // Get current student information
        const studentsResponse = await fetch(`https://must-lms-backend.onrender.com/api/students/me?username=${encodeURIComponent(user.username)}`);
        let currentStudent = null;
        
        if (studentsResponse.ok) {
          const studentsResult = await studentsResponse.json();
          currentStudent = studentsResult.data;
        }
        
        if (!currentStudent) {
          setMaterials([]);
          return;
        }
        
        // Fetch all content from database
        const contentResponse = await fetch('https://must-lms-backend.onrender.com/api/content');
        if (!contentResponse.ok) {
          setMaterials([]);
          return;
        }
        
        const contentResult = await contentResponse.json();
        if (!contentResult.success || !contentResult.data) {
          setMaterials([]);
          return;
        }
        
        // Get student's enrolled programs - pass user_type and student_id for authorization
        const programsResponse = await fetch(`https://must-lms-backend.onrender.com/api/programs?user_type=student&student_id=${currentStudent.id}`);
        let studentPrograms = [];
        
        if (programsResponse.ok) {
          const programsResult = await programsResponse.json();
          if (programsResult.success) {
            // Backend already filters by student's course
            studentPrograms = programsResult.data;
          }
        }
        
        // Get short-term programs that student is eligible for
        const shortTermResponse = await fetch('https://must-lms-backend.onrender.com/api/short-term-programs');
        let eligibleShortTermPrograms = [];
        
        if (shortTermResponse.ok) {
          const shortTermResult = await shortTermResponse.json();
          if (shortTermResult.success) {
            console.log('=== MATERIALS SHORT-TERM PROGRAMS DEBUG ===');
            console.log('All Short-Term Programs for Materials:', shortTermResult.data);
            console.log('Current Student for Materials:', currentStudent);
            
            eligibleShortTermPrograms = shortTermResult.data.filter((program) => {
              console.log(`\n--- Materials: Checking Program: ${program.title} ---`);
              console.log('Program Target Type:', program.target_type);
              console.log('Program Target Value:', program.target_value);
              
              // Check if program is active (not expired)
              const now = new Date();
              const endDate = new Date(program.end_date);
              if (now > endDate) {
                console.log('❌ Materials: Program expired');
                return false;
              }
              
              // Check targeting - FIXED TO INCLUDE ALL TARGET TYPES
              if (program.target_type === 'all') {
                console.log('✅ Materials: Matches all students');
                return true;
              }
              if (program.target_type === 'college' && program.target_value === currentStudent.college_name) {
                console.log('✅ Materials: Matches college targeting');
                return true;
              }
              if (program.target_type === 'department' && program.target_value === currentStudent.department_name) {
                console.log('✅ Materials: Matches department targeting');
                return true;
              }
              if (program.target_type === 'course' && program.target_value === currentStudent.course_name) {
                console.log('✅ Materials: Matches course targeting');
                return true;
              }
              
              // For program targeting, check if student's programs match
              if (program.target_type === 'program') {
                const programMatch = studentPrograms.some(p => p.name === program.target_value);
                if (programMatch) {
                  console.log('✅ Materials: Matches program targeting');
                  return true;
                } else {
                  console.log('❌ Materials: No program match');
                  return false;
                }
              }
              
              console.log('❌ Materials: No match found');
              return false;
            });
            
            console.log('Eligible Short-Term Programs for Materials:', eligibleShortTermPrograms);
          }
        }
        
        // Filter content for student's programs and eligible short-term programs
        const allEligiblePrograms = [
          ...studentPrograms.map(p => p.name),
          ...eligibleShortTermPrograms.map(p => p.title)
        ];
        
        const studentMaterials = contentResult.data.filter(content => 
          allEligiblePrograms.includes(content.program_name)
        );
        
        // Format materials for display
        const formattedMaterials = studentMaterials.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          content_type: item.content_type,
          program_name: item.program_name,
          file_size: item.file_size || 'N/A',
          file_url: item.file_url,
          lecturer_name: item.lecturer_name || 'Unknown Lecturer',
          upload_date: item.upload_date
        }));
        
        setMaterials(formattedMaterials);
      } catch (error) {
        console.error('Error fetching materials:', error);
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const handleDeleteMaterial = async (contentId) => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) return;
      
      const user = JSON.parse(currentUser);
      const response = await fetch(`https://must-lms-backend.onrender.com/api/content/${contentId}/student/${user.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove from local state
        setMaterials(materials.filter(m => m.id !== contentId));
      }
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const getFileIcon = (contentType) => {
    switch (contentType) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading materials...</div>;
  }

  // Filter materials based on search term
  const filteredMaterials = materials.filter(material =>
    material.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.program_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.lecturer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search materials by title, description, program, or lecturer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* No materials message */}
      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? `No materials found matching "${searchTerm}"` : "No materials available yet"}
          </p>
          {searchTerm && (
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm("")}
              className="mt-2"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Materials Grid */}
      {filteredMaterials.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {filteredMaterials.map((material) => (
        <Card key={material.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3 px-4 md:px-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {getFileIcon(material.content_type)}
                <CardTitle className="text-base md:text-lg truncate">{material.title}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteMaterial(material.id)}
                className="text-red-500 hover:text-red-700 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{material.description}</p>
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">{material.program_name}</Badge>
                <span className="text-xs text-muted-foreground">{material.file_size}</span>
              </div>
              <div className="flex items-center justify-end text-xs text-muted-foreground">
                <span>{material.upload_date ? new Date(material.upload_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                className="flex-1" 
                variant="outline"
                onClick={() => {
                  console.log('=== VIEW MATERIAL DEBUG ===');
                  console.log('Material:', material);
                  console.log('File URL:', material.file_url);
                  
                  // Validate file URL
                  if (!material.file_url) {
                    alert('Error: File URL is missing. Please contact your lecturer.');
                    console.error('Missing file_url for material:', material);
                    return;
                  }
                  
                  // Handle different file types for viewing
                  const fileExtension = material.file_url?.split('.').pop()?.toLowerCase();
                  console.log('File Extension:', fileExtension);
                  
                  const viewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'txt', 'html'];
                  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
                  
                  const fullUrl = `https://must-lms-backend.onrender.com${material.file_url}`;
                  console.log('Full URL:', fullUrl);
                  
                  if (viewableTypes.includes(fileExtension)) {
                    // Open directly in browser for viewable files
                    console.log('Opening viewable file:', fullUrl);
                    window.open(fullUrl, '_blank');
                  } else if (videoTypes.includes(fileExtension)) {
                    // Open video directly in new tab with native browser player
                    console.log('Opening video file:', fullUrl);
                    window.open(fullUrl, '_blank');
                  } else {
                    // For non-viewable files (DOC, PPT, Excel), try Google Docs Viewer or download
                    console.log('Opening non-viewable file:', fullUrl);
                    
                    // Try to use Google Docs Viewer for office documents
                    const officeTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
                    if (officeTypes.includes(fileExtension)) {
                      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
                      window.open(viewerUrl, '_blank');
                    } else {
                      // For other file types, trigger download
                      const link = document.createElement('a');
                      link.href = fullUrl;
                      link.download = material.file_name || material.title;
                      link.target = '_blank';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => window.open(`https://must-lms-backend.onrender.com${material.file_url}`, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
        </div>
      )}
    </div>
  );
};

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          if (user && user.id) {
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('currentUser');
        }
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveSection("dashboard");
  };

  const handleShowLogin = () => {
    console.log("handleShowLogin called!");
    setShowLogin(true);
  };

  const handleBackToLanding = () => {
    setShowLogin(false);
  };

  console.log("Current state:", { isLoggedIn, showLogin });

  // Show login page if showLogin is true
  if (showLogin && !isLoggedIn) {
    console.log("Showing login page");
    return <LoginPage onLogin={handleLogin} onBack={handleBackToLanding} />;
  }

  // Show landing page if not logged in
  if (!isLoggedIn) {
    console.log("Showing landing page");
    return <LandingPage onShowLogin={handleShowLogin} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "courses":
        return <MyCourses onNavigate={setActiveSection} />;
      case "materials":
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Course Materials</h1>
            <MaterialsComponent />
          </div>
        );
      case "catalog":
        return <CourseCatalog />;
      case "grades":
        return <Grades />;
      case "old-schedule":
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold">My Schedule</h1>
            <div className="mt-6 grid gap-6">
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Weekly Class Schedule</h2>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center font-medium p-2 bg-blue-100 rounded">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => (
                    <div key={i} className="h-20 border rounded p-1 text-sm">
                      {i < 31 ? i + 1 : ''}
                      {i === 8 && (
                        <div className="bg-green-100 text-green-800 text-xs p-1 rounded mt-1">
                          Math 8AM
                        </div>
                      )}
                      {i === 15 && (
                        <div className="bg-purple-100 text-purple-800 text-xs p-1 rounded mt-1">
                          Physics 10AM
                        </div>
                      )}
                      {i === 22 && (
                        <div className="bg-orange-100 text-orange-800 text-xs p-1 rounded mt-1">
                          Lab 2PM
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case "assignments":
        return <StudentAssignments />;
      case "lectures":
        return <StudentLiveClass onLeaveClass={() => setActiveSection("dashboard")} />;
      case "discussions":
        return <Discussions />;
      case "announcements":
        return <AnnouncementsNews />;
      case "assessments":
        return <TakeAssessment />;
      case "assessment-results":
        return <AssessmentResults />;
      case "games":
        return <Games />;
      case "settings":
        return (
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
            
            {/* Password Reset Section */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Password Reset</h2>
              <p className="text-muted-foreground mb-4">
                Change your account password for security purposes
              </p>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const currentPassword = formData.get('currentPassword') as string;
                const newPassword = formData.get('newPassword') as string;
                const confirmPassword = formData.get('confirmPassword') as string;
                
                // Validation
                if (!currentPassword || !newPassword || !confirmPassword) {
                  alert('Please fill in all password fields');
                  return;
                }
                
                if (newPassword.length < 4) {
                  alert('New password must be at least 4 characters long');
                  return;
                }
                
                if (newPassword !== confirmPassword) {
                  alert('New passwords do not match!');
                  return;
                }
                
                try {
                  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                  
                  console.log('=== PASSWORD RESET DEBUG (STUDENT) ===');
                  console.log('Current User:', currentUser);
                  
                  const response = await fetch('https://must-lms-backend.onrender.com/api/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId: currentUser.id,
                      username: currentUser.username,
                      currentPassword,
                      newPassword,
                      userType: 'student'
                    })
                  });
                  
                  console.log('Response Status:', response.status);
                  
                  const result = await response.json();
                  console.log('Response Data:', result);
                  
                  if (result.success) {
                    alert('Password updated successfully! Please use your new password next time you login.');
                    (e.target as HTMLFormElement).reset();
                  } else {
                    alert(result.message || 'Failed to update password. Please check your current password.');
                  }
                } catch (error) {
                  console.error('Password reset error:', error);
                  alert('Error updating password. Please check your internet connection and try again.');
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <input 
                    name="currentPassword"
                    type="password" 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your current password"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input 
                    name="newPassword"
                    type="password" 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your new password"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <input 
                    name="confirmPassword"
                    type="password" 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm your new password"
                    required
                  />
                </div>
                
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reset Password
                </button>
              </form>
            </div>
            
            {/* Other Settings Sections */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Account Preferences</h2>
              <p className="text-muted-foreground">
                Manage your account preferences and notification settings
              </p>
            </div>
          </div>
        );
      case "profile":
        return <div className="p-6"><h1 className="text-3xl font-bold">My Profile</h1><p>View and edit your profile information.</p></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onLogout={handleLogout} 
        onNavigate={setActiveSection}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuChange={setIsMobileMenuOpen}
      />
      <div className="flex">
        <Navigation 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuChange={setIsMobileMenuOpen}
        />
        {renderContent()}
      </div>
      <JedaNetworksCredit />
    </div>
  );
};

export default Index;
