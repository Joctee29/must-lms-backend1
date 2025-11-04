import { useState } from "react";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { CourseCatalog } from "@/components/CourseCatalog";
import { Assignments } from "@/components/Assignments";
import { Grades } from "@/components/Grades";
import { Schedule } from "@/components/Schedule";
import { Discussions } from "@/components/Discussions";
import { Achievements } from "@/components/Achievements";
import { JedaNetworksCredit } from "@/components/JedaNetworksCredit";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "catalog":
        return <CourseCatalog />;
      case "courses":
        return (
          <div className="flex-1 p-6">
            <h1 className="text-3xl font-bold">My Courses</h1>
            <p className="text-muted-foreground mt-2">View and manage your enrolled courses</p>
            {/* Course content will be implemented */}
          </div>
        );
      default:
        return (
          <div className="flex-1 p-6">
            <h1 className="text-3xl font-bold">Coming Soon</h1>
            <p className="text-muted-foreground mt-2">This section is under development</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
        {renderContent()}
      </div>
      <JedaNetworksCredit />
    </div>
  );
};

export default Index;
