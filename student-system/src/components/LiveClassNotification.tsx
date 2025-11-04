import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Clock, 
  Users, 
  Bell, 
  X, 
  Play, 
  Calendar,
  Globe,
  Award,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface LiveClass {
  id: string;
  title: string;
  courseName: string;
  lecturerName: string;
  startTime: string;
  duration: number;
  status: "scheduled" | "starting" | "live" | "ended";
  participationPoints: number;
  googleClassroomLink: string;
  studentsJoined: number;
  maxStudents: number;
}

interface LiveClassNotificationProps {
  onJoinClass?: (classId: string) => void;
  onDismiss?: (classId: string) => void;
}

export const LiveClassNotification = ({ onJoinClass, onDismiss }: LiveClassNotificationProps) => {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([
    {
      id: "1",
      title: "Advanced Mathematics - Integration Techniques",
      courseName: "Engineering Mathematics I",
      lecturerName: "Dr. John Smith",
      startTime: "10:00 AM",
      duration: 60,
      status: "starting",
      participationPoints: 10,
      googleClassroomLink: "https://classroom.google.com/c/abc123",
      studentsJoined: 15,
      maxStudents: 50
    },
    {
      id: "2", 
      title: "Structural Analysis - Beam Theory",
      courseName: "Structural Analysis",
      lecturerName: "Prof. Sarah Johnson",
      startTime: "2:00 PM",
      duration: 90,
      status: "scheduled",
      participationPoints: 15,
      googleClassroomLink: "https://classroom.google.com/c/def456",
      studentsJoined: 0,
      maxStudents: 30
    }
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(true);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Auto-show notifications for live or starting classes
      const hasUrgentClasses = liveClasses.some(c => 
        c.status === 'live' || c.status === 'starting'
      );
      
      if (hasUrgentClasses) {
        setShowNotifications(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [liveClasses]);

  // Auto-popup for new live classes
  useEffect(() => {
    const liveClassCount = liveClasses.filter(c => c.status === 'live').length;
    const startingClassCount = liveClasses.filter(c => c.status === 'starting').length;
    
    if (liveClassCount > 0 || startingClassCount > 0) {
      setShowNotifications(true);
      
      // Auto-popup with sound notification (if browser allows)
      if ('Notification' in window && Notification.permission === 'granted') {
        liveClasses.forEach(classItem => {
          if (classItem.status === 'live' || classItem.status === 'starting') {
            new Notification(`Live Class: ${classItem.title}`, {
              body: `${classItem.courseName} - ${classItem.lecturerName}`,
              icon: '/must-logo.png'
            });
          }
        });
      }
    }
  }, [liveClasses]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "starting": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "live": return "bg-red-100 text-red-800 border-red-200";
      case "ended": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled": return <Calendar className="h-4 w-4" />;
      case "starting": return <AlertCircle className="h-4 w-4" />;
      case "live": return <Video className="h-4 w-4 animate-pulse" />;
      case "ended": return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled": return "Scheduled";
      case "starting": return "Starting Soon";
      case "live": return "LIVE NOW";
      case "ended": return "Ended";
      default: return "Unknown";
    }
  };

  const handleJoinClass = (classItem: LiveClass) => {
    if (onJoinClass) {
      onJoinClass(classItem.id);
    }
    // Open Google Classroom link
    window.open(classItem.googleClassroomLink, '_blank');
  };

  const handleDismissNotification = (classId: string) => {
    setLiveClasses(prev => prev.filter(c => c.id !== classId));
    if (onDismiss) {
      onDismiss(classId);
    }
  };

  const handleDismissAll = () => {
    setShowNotifications(false);
    // Auto-show again after 5 minutes if there are still live classes
    setTimeout(() => {
      const hasLiveClasses = liveClasses.some(c => c.status === 'live' || c.status === 'starting');
      if (hasLiveClasses) {
        setShowNotifications(true);
      }
    }, 300000); // 5 minutes
  };

  const getTimeUntilClass = (startTime: string) => {
    const now = new Date();
    const classTime = new Date();
    const [time, period] = startTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    classTime.setHours(period === 'PM' && hours !== 12 ? hours + 12 : hours);
    classTime.setMinutes(minutes);
    classTime.setSeconds(0);
    
    const diff = classTime.getTime() - now.getTime();
    const minutesUntil = Math.floor(diff / (1000 * 60));
    
    if (minutesUntil <= 0) return "Starting now";
    if (minutesUntil < 60) return `${minutesUntil} min`;
    
    const hoursUntil = Math.floor(minutesUntil / 60);
    const remainingMinutes = minutesUntil % 60;
    return `${hoursUntil}h ${remainingMinutes}m`;
  };

  if (liveClasses.length === 0 || !showNotifications) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {/* Auto-popup indicator */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
      {liveClasses.map((classItem) => (
        <Card 
          key={classItem.id} 
          className={`border-2 shadow-lg animate-in slide-in-from-right-full duration-500 ${
            classItem.status === 'live' ? 'border-red-300 bg-red-50' :
            classItem.status === 'starting' ? 'border-yellow-300 bg-yellow-50' :
            'border-blue-300 bg-blue-50'
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <Badge className={getStatusColor(classItem.status)}>
                  {getStatusIcon(classItem.status)}
                  <span className="ml-1">{getStatusText(classItem.status)}</span>
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismissNotification(classItem.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-lg leading-tight">{classItem.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{classItem.courseName}</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Class Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{classItem.lecturerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{classItem.startTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-gray-500" />
                <span>{classItem.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span>{classItem.participationPoints} points</span>
              </div>
            </div>

            {/* Participation Info */}
            {classItem.status === 'live' && (
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Students joined:</span>
                  <span className="font-medium">{classItem.studentsJoined}/{classItem.maxStudents}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(classItem.studentsJoined / classItem.maxStudents) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Time Until Class */}
            {classItem.status === 'scheduled' && (
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Starts in:</span>
                  <span className="font-medium text-blue-600">{getTimeUntilClass(classItem.startTime)}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {classItem.status === 'live' && (
                <Button 
                  onClick={() => handleJoinClass(classItem)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Join Live Class
                </Button>
              )}
              
              {classItem.status === 'starting' && (
                <Button 
                  onClick={() => handleJoinClass(classItem)}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Class
                </Button>
              )}
              
              {classItem.status === 'scheduled' && (
                <Button 
                  onClick={() => handleJoinClass(classItem)}
                  variant="outline"
                  className="flex-1"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Open Classroom
                </Button>
              )}
            </div>

            {/* Google Classroom Integration */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span>Integrated with Google Classroom</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
