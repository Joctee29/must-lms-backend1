import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { CourseCatalog } from "@/components/CourseCatalog";
import { Courses } from "@/pages/Courses";
import { Students } from "@/pages/Students";
import { LiveClassroom } from "@/pages/LiveClassroom";
import { ContentManager } from "@/pages/ContentManager";
import { ExamSystem } from "@/pages/ExamSystem";
import { AddCourse } from "@/pages/AddCourse";
import { MyCourses } from "@/pages/MyCourses";
import { Assessment } from "@/pages/Assessment";
import { AssessmentResults } from "@/pages/AssessmentResults";
import { Assignments } from "@/pages/NewAssignments";
import { Discussions } from "@/pages/Discussions";
import { Announcements } from "@/pages/Announcements";
import MySchedule from "@/pages/MySchedule";
import { JedaNetworksCredit } from "@/components/JedaNetworksCredit";
import LoginPage from "@/pages/LoginPage";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveSection("dashboard");
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} onBack={() => {}} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "courses":
        return <MyCourses onNavigate={(section, courseId, courseName) => {
          // Store course context for filtering
          if (courseId && courseName) {
            sessionStorage.setItem('selectedCourse', JSON.stringify({id: courseId, name: courseName}));
          }
          setActiveSection(section);
        }} />;
      case "students":
        const selectedCourseStudents = JSON.parse(sessionStorage.getItem('selectedCourse') || '{}');
        // Clear session storage after getting the data so next time it shows "All My Programs"
        if (selectedCourseStudents.id) {
          setTimeout(() => {
            sessionStorage.removeItem('selectedCourse');
          }, 100);
        }
        return (
          <Students 
            selectedProgramId={selectedCourseStudents.id} 
            selectedProgramName={selectedCourseStudents.name}
          />
        );
      case "assessments":
        const selectedCourseAssessments = JSON.parse(sessionStorage.getItem('selectedCourse') || '{}');
        return (
          <div className="p-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold">Assessments</h1>
              {selectedCourseAssessments.name && (
                <p className="text-muted-foreground">Creating assessments for: <span className="font-semibold text-purple-600">{selectedCourseAssessments.name}</span></p>
              )}
            </div>
            <Assessment />
          </div>
        );
      case "assignments":
        return (
          <div className="flex-1">
            <Assignments />
          </div>
        );
      case "schedule":
        return <MySchedule />;
      case "catalog":
        return <CourseCatalog />;
      case "content":
        const selectedCourseContent = JSON.parse(sessionStorage.getItem('selectedCourse') || '{}');
        return (
          <div className="p-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold">Course Content</h1>
              {selectedCourseContent.name && (
                <p className="text-muted-foreground">Managing materials for: <span className="font-semibold text-blue-600">{selectedCourseContent.name}</span></p>
              )}
            </div>
            <ContentManager />
          </div>
        );
      case "lectures":
        const selectedCourseLectures = JSON.parse(sessionStorage.getItem('selectedCourse') || '{}');
        return (
          <div className="p-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold">Lectures</h1>
              {selectedCourseLectures.name && (
                <p className="text-muted-foreground">Teaching: <span className="font-semibold text-green-600">{selectedCourseLectures.name}</span></p>
              )}
            </div>
            <LiveClassroom />
          </div>
        );
      case "grades":
        const selectedCourseGrades = JSON.parse(sessionStorage.getItem('selectedCourse') || '{}');
        return (
          <div className="p-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold">Grading</h1>
              {selectedCourseGrades.name && (
                <p className="text-muted-foreground">Grading for: <span className="font-semibold text-orange-600">{selectedCourseGrades.name}</span></p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p>Grade management interface for the selected course.</p>
            </div>
          </div>
        );
      case "discussions":
        const selectedCourseDiscussions = JSON.parse(sessionStorage.getItem('selectedCourse') || '{}');
        return (
          <div className="p-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold">Discussions</h1>
              {selectedCourseDiscussions.name && (
                <p className="text-muted-foreground">Discussion forum for: <span className="font-semibold text-indigo-600">{selectedCourseDiscussions.name}</span></p>
              )}
            </div>
            <Discussions />
          </div>
        );
      case "announcements":
        return <Announcements />;
      case "exams":
        return <ExamSystem />;
      case "settings":
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold">Settings</h1>
            <div className="mt-6 space-y-6">
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Password Reset</h2>
                <p className="text-muted-foreground mb-4">Change your account password</p>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const currentPassword = formData.get('currentPassword') as string;
                  const newPassword = formData.get('newPassword') as string;
                  const confirmPassword = formData.get('confirmPassword') as string;
                  
                  if (newPassword !== confirmPassword) {
                    alert('New passwords do not match!');
                    return;
                  }
                  
                  try {
                    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    const response = await fetch('https://must-lms-backend.onrender.com/api/change-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: currentUser.id,
                        username: currentUser.username,
                        currentPassword,
                        newPassword,
                        userType: 'lecturer'
                      })
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                      alert('Password updated successfully!');
                      (e.target as HTMLFormElement).reset();
                    } else {
                      alert(result.message || 'Failed to update password');
                    }
                  } catch (error) {
                    alert('Error updating password. Please try again.');
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <input name="currentPassword" type="password" className="w-full p-2 border rounded-md" placeholder="Enter current password" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input name="newPassword" type="password" className="w-full p-2 border rounded-md" placeholder="Enter new password" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <input name="confirmPassword" type="password" className="w-full p-2 border rounded-md" placeholder="Confirm new password" required />
                  </div>
                  <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      case "profile":
        return <div className="p-6"><h1 className="text-3xl font-bold">My Profile</h1><p>View and edit your profile information.</p></div>;
      case "my-courses":
        return <MyCourses onNavigate={(section, courseId, courseName) => {
          if (courseId && courseName) {
            sessionStorage.setItem('selectedCourse', JSON.stringify({id: courseId, name: courseName}));
          }
          setActiveSection(section);
        }} />;
      case "assessment-results":
        return (
          <div className="p-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold">Assessment Results</h1>
              <p className="text-muted-foreground">View and manage student assessment submissions and grades</p>
            </div>
            <AssessmentResults />
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={handleLogout} onNavigate={setActiveSection} />
      <div className="flex">
        <Navigation 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        {renderContent()}
      </div>
      <JedaNetworksCredit />
    </div>
  );
};

export default Index;
