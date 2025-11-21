import { useState, useEffect } from "react";
import { Bell, BookOpen, LogOut, Search, User, Video, Clock, Award } from "lucide-react";
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
  const [studentData, setStudentData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Load read notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('student_read_notifications');
    if (stored) {
      setReadNotifications(new Set(JSON.parse(stored)));
    }
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser?.username) return;
      
      try {
        console.log('=== FETCHING NOTIFICATIONS ===');
        console.log('Student Username:', currentUser.username);
        
        // Fetch assignments, live classes, and announcements
        // CRITICAL: Filter ALL data by student username to show only relevant notifications
        const [assignmentsRes, assessmentsRes, liveClassesRes, announcementsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/assignments?student_username=${encodeURIComponent(currentUser.username)}`),
          fetch(`${API_BASE_URL}/assessments?status=published&student_username=${encodeURIComponent(currentUser.username)}`),
          fetch(`${API_BASE_URL}/live-classes?student_username=${encodeURIComponent(currentUser.username)}`),
          fetch(`${API_BASE_URL}/announcements?student_username=${encodeURIComponent(currentUser.username)}`)
        ]);
        
        const assignments = await assignmentsRes.json();
        const assessments = await assessmentsRes.json();
        const liveClasses = await liveClassesRes.json();
        const announcements = await announcementsRes.json();
        
        console.log('Filtered Assignments:', assignments.data?.length || 0);
        console.log('Filtered Assessments:', assessments.data?.length || 0);
        
        const newNotifications: any[] = [];
        
        // Add new assignments (filtered by student's program)
        if (assignments.success && assignments.data) {
          const recentAssignments = assignments.data.filter((a: any) => {
            const createdDate = new Date(a.created_at);
            const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceCreated <= 3; // Last 3 days
          });
          
          console.log('Recent Assignments (last 3 days):', recentAssignments.length);
          
          recentAssignments.forEach((a: any) => {
            newNotifications.push({
              id: `assignment_${a.id || a.title}_${a.created_at}`,
              title: '📝 New Assignment',
              message: `${a.title} - Due: ${new Date(a.deadline).toLocaleDateString()}`,
              time: new Date(a.created_at).toLocaleString(),
              program: a.program_name
            });
          });
        }
        
        // Add new assessments (filtered by student's program)
        if (assessments.success && assessments.data) {
          const recentAssessments = assessments.data.filter((a: any) => {
            const createdDate = new Date(a.created_at);
            const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceCreated <= 3; // Last 3 days
          });
          
          console.log('Recent Assessments (last 3 days):', recentAssessments.length);
          
          recentAssessments.forEach((a: any) => {
            newNotifications.push({
              id: `assessment_${a.id || a.title}_${a.created_at}`,
              title: '📝 New Assessment',
              message: `${a.title} - ${a.program_name}`,
              time: new Date(a.created_at).toLocaleString(),
              program: a.program_name
            });
          });
        }
        
        // Add live classes
        if (liveClasses.success && liveClasses.data) {
          const activeClasses = liveClasses.data.filter((c: any) => 
            c.status === 'live' || c.status === 'scheduled'
          );
          
          activeClasses.forEach((c: any) => {
            newNotifications.push({
              id: `class_${c.id || c.title}_${c.date}_${c.time}`,
              title: c.status === 'live' ? '🔴 Live Class Now!' : '⏰ Upcoming Class',
              message: `${c.title} - ${c.program_name}`,
              time: `${c.date} at ${c.time}`
            });
          });
        }
        
        // Add announcements
        if (announcements.success && announcements.data) {
          const recentAnnouncements = announcements.data.filter((a: any) => {
            const createdDate = new Date(a.created_at);
            const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceCreated <= 7; // Last 7 days
          });
          
          recentAnnouncements.slice(0, 5).forEach((a: any) => {
            newNotifications.push({
              id: `announcement_${a.id || a.title}_${a.created_at}`,
              title: '📢 Announcement',
              message: a.title,
              time: new Date(a.created_at).toLocaleString()
            });
          });
        }
        
        setNotifications(newNotifications);
        
        // Calculate unread count
        const unread = newNotifications.filter(n => !readNotifications.has(n.id)).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
    // Refresh every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, [currentUser, readNotifications]);

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!currentUser?.username) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/students`);
        const result = await response.json();
        
        if (result.success) {
          const student = result.data.find((s: any) => 
            s.registration_number === currentUser.username
          );
          setStudentData(student);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };

    fetchStudentData();
  }, [currentUser]);

  const handleNotificationOpen = (open: boolean) => {
    if (open && notifications.length > 0) {
      // Mark all current notifications as read
      const newReadNotifications = new Set(readNotifications);
      notifications.forEach(n => newReadNotifications.add(n.id));
      setReadNotifications(newReadNotifications);
      
      // Save to localStorage
      localStorage.setItem('student_read_notifications', JSON.stringify(Array.from(newReadNotifications)));
      
      // Update unread count to 0
      setUnreadCount(0);
    }
  };

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
      onNavigate('dashboard');
    }
  };

  const handleMyCourses = () => {
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
    if (studentData?.name) {
      return studentData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (currentUser?.username) {
      return currentUser.username.slice(0, 2).toUpperCase();
    }
    return 'ST';
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 md:h-32 items-center justify-between px-2 md:px-4">
        {/* Logo and Branding */}
        <div className="flex items-center space-x-2 md:space-x-8">
          <img src="/must-logo.png" alt="MUST" className="h-20 w-20 md:h-28 md:w-28 object-contain" />
          <div className="flex flex-col">
            <span className="text-xl md:text-5xl font-bold text-foreground">MUST</span>
            <span className="hidden md:block text-lg font-semibold text-primary">Learning Management System</span>
            <span className="md:hidden text-xs font-semibold text-primary">LMS</span>
            <span className="text-xs md:text-sm font-medium text-blue-600 bg-blue-100 px-1 md:px-2 py-0.5 md:py-1 rounded-md">STUDENT</span>
          </div>
        </div>

        {/* Search - Hidden on mobile */}
        <div className="hidden md:flex flex-1 items-center justify-center px-2 md:px-6">
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
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Notifications */}
          <DropdownMenu onOpenChange={handleNotificationOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
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
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {studentData?.name || currentUser?.username || "Student"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Student ID: {studentData?.registration_number || currentUser?.username || "Not assigned"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfile}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMyCourses}>
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
