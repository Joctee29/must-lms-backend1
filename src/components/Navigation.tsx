import { useState } from "react";
import {
  BookOpen,
  Calendar,
  BarChart3,
  Users,
  Award,
  Settings,
  MessageSquare,
  Home,
  Search,
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
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "catalog", label: "Course Catalog", icon: Search },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "grades", label: "Grades", icon: BarChart3 },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
    { id: "achievements", label: "Achievements", icon: Award },
    { id: "people", label: "People", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
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