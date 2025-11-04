import { useState, useEffect } from "react";
import { Bell, BookOpen, LogOut, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

// Database operations
const API_BASE_URL = 'https://must-lms-backend.onrender.com/api';

interface HeaderProps {
  onLogout?: () => void;
  onNavigate?: (section: string) => void;
}

export const Header = ({ onLogout, onNavigate }: HeaderProps = {}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lecturerData, setLecturerData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Fetch lecturer data
  useEffect(() => {
    const fetchLecturerData = async () => {
      if (!currentUser?.username) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/lecturers`);
        const result = await response.json();
        
        if (result.success) {
          const lecturer = result.data.find((l: any) => 
            l.employee_id === currentUser.username
          );
          setLecturerData(lecturer);
        }
      } catch (error) {
        console.error('Error fetching lecturer data:', error);
      }
    };

    fetchLecturerData();
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  const handleProfile = () => {
    if (onNavigate) {
      onNavigate('profile');
    }
  };

  const handleMyPrograms = () => {
    if (onNavigate) {
      onNavigate('courses');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Perform actual search
      const searchResults = document.querySelectorAll('[data-searchable]');
      let found = false;
      
      searchResults.forEach((element) => {
        const text = element.textContent?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        if (text.includes(searchLower)) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-yellow-200');
          setTimeout(() => element.classList.remove('bg-yellow-200'), 3000);
          found = true;
        }
      });
      
      if (!found) {
        alert(`No results found for: "${searchTerm}"`);
      } else {
        alert(`Found results for: "${searchTerm}"`);
      }
    }
  };

  const getUserInitials = () => {
    if (lecturerData?.name) {
      return lecturerData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (currentUser?.username) {
      return currentUser.username.slice(0, 2).toUpperCase();
    }
    return 'LC';
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 md:h-32 items-center px-2 md:px-4">
        {/* Logo and Branding */}
        <div className="flex items-center space-x-2 md:space-x-8">
          <img src="/must-logo.png" alt="MUST" className="h-12 w-12 md:h-28 md:w-28 object-contain" />
          <div className="flex flex-col">
            <span className="text-xl md:text-5xl font-bold text-foreground">MUST</span>
            <span className="hidden md:block text-lg font-semibold text-primary">Learning Management System</span>
            <span className="md:hidden text-xs font-semibold text-primary">LMS</span>
            <span className="text-xs md:text-sm font-medium text-green-600 bg-green-100 px-1 md:px-2 py-0.5 md:py-1 rounded-md">LECTURER</span>
          </div>
        </div>

        {/* Search */}
        <div className="hidden sm:flex flex-1 items-center justify-center px-2 md:px-6">
          <div className="w-full max-w-sm lg:max-w-md">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses, modules..."
                className="pl-10 bg-muted/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  0
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-4 text-center text-muted-foreground">
                <p>No new notifications</p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {lecturerData?.name || currentUser?.username || "Lecturer"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Employee ID: {lecturerData?.employee_id || currentUser?.username || "Not assigned"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate && onNavigate('dashboard')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMyPrograms}>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>My Programs</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
