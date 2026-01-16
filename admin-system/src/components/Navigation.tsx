import { useState } from "react";
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  Database,
  FileText,
  Calendar,
  MessageSquare,
  Megaphone,
  Clock,
  UserPlus,
  Upload,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "users", label: "User Management", icon: Users },
    { id: "bulk-upload", label: "Bulk Upload", icon: Upload },
    { id: "courses", label: "Course Management", icon: BookOpen },
    { id: "database", label: "Lecturer Information", icon: Database },
    { id: "students", label: "Student Information", icon: GraduationCap },
    { id: "class-representatives", label: "Class Representatives", icon: Award },
    { id: "short-term-programs", label: "Short-Term Programs", icon: Clock },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "security", label: "Password Management", icon: Shield },
    { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
    { id: "content", label: "Content Management", icon: FileText },
    { id: "communications", label: "Communications", icon: MessageSquare },
    { id: "system", label: "Academic Settings", icon: Settings },
  ];

  return (
    <nav className="w-64 border-r bg-card p-4">
      <div className="space-y-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                activeSection === item.id && "bg-primary/10 text-primary hover:bg-primary/15"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <IconComponent className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
};
