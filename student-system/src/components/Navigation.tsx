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
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "courses", label: "My Programs", icon: BookOpen },
    { id: "lectures", label: "Lectures", icon: PlayCircle },
    { id: "assessments", label: "Take Assessment", icon: ClipboardCheck },
    { id: "assessment-results", label: "Assessment Results", icon: CheckCircle },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "materials", label: "Materials", icon: FolderOpen },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
    { id: "announcements", label: "Announcements & News", icon: Megaphone },
    { id: "games", label: "Programming Games", icon: Gamepad2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleNavClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsMobileMenuOpen(false); // Close menu after selection on mobile
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-24 left-4 z-50 text-gray-700 hover:text-gray-900 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay - Only on mobile when menu is open */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
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
