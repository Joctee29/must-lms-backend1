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
  FileText,
  Video,
  Plus,
  ClipboardList,
  TrendingUp,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuChange?: (isOpen: boolean) => void;
}

export const Navigation = ({ activeSection, onSectionChange, isMobileMenuOpen = false, onMobileMenuChange }: NavigationProps) => {
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "courses", label: "My Programs", icon: BookOpen },
    { id: "content", label: "Course Content", icon: FileText },
    { id: "lectures", label: "Lectures", icon: Video },
    { id: "assessments", label: "Assessments", icon: ClipboardList },
    { id: "assessment-results", label: "Assessment Results", icon: TrendingUp },
    { id: "assignments", label: "Assignments", icon: Search },
    { id: "students", label: "Students", icon: Users },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleNavClick = (sectionId: string) => {
    onSectionChange(sectionId);
    // Close menu after selection on mobile
    if (onMobileMenuChange) {
      onMobileMenuChange(false);
    }
  };

  return (
    <>
      {/* Overlay - Only on mobile when menu is open */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => onMobileMenuChange?.(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <nav
        className={cn(
          "fixed md:relative top-0 left-0 h-full w-64 border-r bg-card p-4 z-40 transition-transform duration-300 ease-in-out",
          // Mobile: slide in/out from left
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col space-y-2 mt-16 md:mt-0">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start px-4",
                  activeSection === item.id && "bg-primary/10 text-primary hover:bg-primary/15"
                )}
                onClick={() => handleNavClick(item.id)}
              >
                <IconComponent className="h-5 w-5 mr-3" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
