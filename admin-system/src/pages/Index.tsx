import { useState } from "react";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { CourseCatalog } from "@/components/CourseCatalog";
import { UserManagement } from "@/pages/UserManagement";
import { CourseManagement } from "@/pages/CourseManagement";
import { EnhancedUserManagement } from "@/pages/EnhancedUserManagement";
import { StudentInformation } from "@/pages/StudentInformation";
import { AcademicSettings } from "@/pages/AcademicSettings";
import { PasswordManagement } from "@/pages/PasswordManagement";
import { LecturerInformation } from "@/pages/LecturerInformation";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";
import { AnnouncementManagement } from "@/pages/AnnouncementManagement";
import { ShortTermPrograms } from "@/pages/ShortTermPrograms";
import TimetableManagement from "@/pages/TimetableManagement";
import { BulkUpload } from "@/pages/BulkUpload";
import { JedaNetworksCredit } from "@/components/JedaNetworksCredit";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        return <EnhancedUserManagement />;
      case "bulk-upload":
        return <BulkUpload />;
      case "students":
        return <StudentInformation />;
      case "courses":
        return <CourseManagement />;
      case "reports":
        return <Reports />;
      case "system":
        return <AcademicSettings />;
      case "security":
        return <PasswordManagement />;
      case "database":
        return <LecturerInformation />;
      case "content":
        return <div className="p-6"><h1 className="text-3xl font-bold">Content Management</h1><p>Manage system content and resources.</p></div>;
      case "schedule":
        return <TimetableManagement />;
      case "communications":
        return <div className="p-6"><h1 className="text-3xl font-bold">Communications</h1><p>System communications and notifications.</p></div>;
      case "announcements":
        return <AnnouncementManagement />;
      case "short-term-programs":
        return <ShortTermPrograms />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
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
