import { useState } from "react";
import {
  Home,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  MessageSquare,
  Award,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Gamepad2,
  PlayCircle,
  FolderOpen,
  ClipboardCheck,
  Search,
  CheckCircle,
  Megaphone,
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
    { id: "courses", label: "My Programs", icon: BookOpen },
    { id: "lectures", label: "Lectures", icon: PlayCircle },
    { id: "assessments", label: "Take Assessment", icon: ClipboardCheck },
    { id: "assessment-results", label: "Assessment Results", icon: CheckCircle },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "materials", label: "Materials", icon: FolderOpen },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "announcements", label: "Announcements & News", icon: Megaphone },
    { id: "games", label: "Programming Games", icon: Gamepad2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="w-full md:w-64 border-r bg-card p-2 md:p-4 overflow-x-auto md:overflow-visible">
      <div className="flex md:flex-col space-x-1 md:space-x-0 md:space-y-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "flex-shrink-0 md:w-full justify-start whitespace-nowrap px-3 md:px-4",
                activeSection === item.id && "bg-primary/10 text-primary hover:bg-primary/15"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <IconComponent className="mr-2 md:mr-3 h-4 w-4" />
              <span className="text-xs md:text-sm">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};
