import { useState } from "react";
import { Bell, BookOpen, LogOut, Search, User, Settings } from "lucide-react";
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
// Using public path for logo to avoid build issues
const mustLogo = "/must-logo.png";

export const Header = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Fetch system-wide data
        const [studentsRes, lecturersRes, coursesRes] = await Promise.all([
          fetch('https://must-lms-backend.onrender.com/api/students'),
          fetch('https://must-lms-backend.onrender.com/api/lecturers'),
          fetch('https://must-lms-backend.onrender.com/api/courses')
        ]);
        
        const students = await studentsRes.json();
        const lecturers = await lecturersRes.json();
        const courses = await coursesRes.json();
        
        const newNotifications: any[] = [];
        
        // Add recent students
        if (students.success && students.data) {
          const recentStudents = students.data.filter((s: any) => {
            if (!s.created_at) return false;
            const createdDate = new Date(s.created_at);
            const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceCreated <= 7; // Last 7 days
          });
          
          if (recentStudents.length > 0) {
            newNotifications.push({
              title: '🎓 New Students',
              message: `${recentStudents.length} new student(s) registered`,
              time: 'Last 7 days'
            });
          }
        }
        
        // Add recent lecturers
        if (lecturers.success && lecturers.data) {
          const recentLecturers = lecturers.data.filter((l: any) => {
            if (!l.created_at) return false;
            const createdDate = new Date(l.created_at);
            const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceCreated <= 7; // Last 7 days
          });
          
          if (recentLecturers.length > 0) {
            newNotifications.push({
              title: '👨‍🏫 New Lecturers',
              message: `${recentLecturers.length} new lecturer(s) added`,
              time: 'Last 7 days'
            });
          }
        }
        
        // System stats
        if (students.success && lecturers.success && courses.success) {
          newNotifications.push({
            title: '📊 System Overview',
            message: `${students.data?.length || 0} students, ${lecturers.data?.length || 0} lecturers, ${courses.data?.length || 0} courses`,
            time: 'Current'
          });
        }
        
        setNotifications(newNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 300000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-32 items-center">
        {/* Logo and Branding */}
        <div className="flex items-center space-x-8">
          <img src="/must-logo.png" alt="MUST" className="h-28 w-28 object-contain" />
          <div className="flex flex-col">
            <span className="text-5xl font-bold text-foreground">MUST</span>
            <span className="hidden md:block text-lg font-semibold text-primary">Learning Management System</span>
            <span className="md:hidden text-lg font-semibold text-primary">LMS</span>
            <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded-md">ADMIN SYSTEM</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-sm lg:max-w-md">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users, courses, reports..."
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
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
              <DropdownMenuLabel>System Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <p>No new notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notif, index) => (
                    <div key={index} className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    AD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>System Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
