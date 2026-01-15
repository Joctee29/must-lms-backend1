import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Clock,
  Globe,
  Award,
  AlertCircle,
  ExternalLink
} from "lucide-react";

interface LiveClassViewerProps {
  classId?: string;
  onLeaveClass?: () => void;
}

export const StudentLiveClass = ({ classId, onLeaveClass }: LiveClassViewerProps) => {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGoogleMeetAuthenticated, setIsGoogleMeetAuthenticated] = useState(true);

  // Load live classes on component mount
  useEffect(() => {
    fetchLiveClasses();
    
    // Set up automatic refresh every 10 seconds to check for status updates
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing live classes...');
      fetchLiveClasses();
    }, 10000); // 10 seconds - more frequent to catch status changes quickly
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // No authentication required - Google Meet will handle its own auth when student clicks join

  // Fetch live classes for student's program
  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Get student info
      const studentResponse = await fetch(`https://must-lms-backend.onrender.com/api/students/me?username=${encodeURIComponent(currentUser.username)}`);
      const studentsResult = await studentResponse.json();
      
      const currentStudent = studentsResult.data;
      
      if (!currentStudent) {
        console.error('Student not found');
        setLoading(false);
        return;
      }
      
      // FIXED: Use backend filtering with student_username parameter
      // Backend will handle both regular programs AND short-term programs filtering
      const liveClassResponse = await fetch(`https://must-lms-backend.onrender.com/api/live-classes?student_username=${encodeURIComponent(currentUser.username)}`);
      const liveClassResult = await liveClassResponse.json();
      
      console.log('=== LIVE CLASS FILTERING DEBUG ===');
      console.log('Current Student:', currentStudent);
      console.log('Student Course:', currentStudent.course_name);
      console.log('Live Classes from Backend (already filtered):', liveClassResult.data?.length || 0);
      
      // Backend already filters by student's programs (regular + short-term)
      // No need for frontend filtering - backend handles everything
      const studentClasses = liveClassResult.data || [];
      
      console.log('\n=== FINAL CLASSES ===');
      console.log('Total Classes:', studentClasses.length);
      console.log('Classes:', studentClasses.map(c => `${c.title} (${c.program_name})`));
      
      setLiveClasses(studentClasses);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching live classes:', error);
      setLoading(false);
    }
  };

  // Join live class meeting - supports Jitsi Meet
  const joinLiveClassMeeting = async (liveClass) => {
    try {
      const meetingUrl = liveClass.meeting_url;
      console.log('Student joining live class:', meetingUrl);
      
      // Validate meeting URL
      if (!meetingUrl || (!meetingUrl.includes('meet.jit.si') && !meetingUrl.includes('meet.google.com'))) {
        alert('❌ Invalid meeting link. Please contact your lecturer.');
        return;
      }
      
      // Get current student info
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const studentResponse = await fetch(`https://must-lms-backend.onrender.com/api/students/me?username=${encodeURIComponent(currentUser.username)}`);
      const studentsResult = await studentResponse.json();
      
      const currentStudent = studentsResult.data;
      
      if (!currentStudent) {
        alert('❌ Student information not found. Please log in again.');
        return;
      }
      
      // Record student joining the class
      console.log('Recording student join...');
      const joinResponse = await fetch('https://must-lms-backend.onrender.com/api/live-classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: liveClass.id,
          student_id: currentStudent.id,
          student_name: currentStudent.name,
          join_time: new Date().toISOString()
        })
      });
      
      const joinResult = await joinResponse.json();
      console.log('Join recorded:', joinResult);
      
      // Show success message
      alert('🎓 Joining Live Class!\n\nYou will be taken to the video conference where you can:\n• Enter your name\n• Turn on camera and microphone\n• Join the live class session\n• Participate in the lesson\n\nNote: No account required for Jitsi Meet!');
      
      // Open meeting in new window
      window.open(meetingUrl, '_blank', 'width=1200,height=800');
      
    } catch (error) {
      console.error('Error joining live class:', error);
      alert('⚠️ Opening meeting link...\n\nNote: Your attendance may not be recorded due to a connection issue.');
      // Still open the meeting even if tracking fails
      if (liveClass.meeting_url) {
        window.open(liveClass.meeting_url, '_blank', 'width=1200,height=800');
      }
    }
  };

  // Check if class time has arrived for scheduled classes
  const isClassTimeReached = (classDate, classTime) => {
    const classDateTime = new Date(`${classDate} ${classTime}`);
    const now = new Date();
    return now >= classDateTime;
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading live classes...</p>
      </div>
    );
  }

  // Main live classes interface
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Live Classes</h1>
        <Badge variant="outline" className="text-sm">
          Jitsi Meet Integration
        </Badge>
      </div>

      {liveClasses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Live Classes</h3>
            <p className="text-gray-500">
              There are no live classes available for your program at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {liveClasses.map((liveClass) => (
            <Card key={liveClass.id}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        liveClass.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
                      }`}></div>
                      <Badge variant={liveClass.status === 'live' ? 'destructive' : 'secondary'} className="text-xs">
                        {liveClass.status === 'live' ? '🔴 LIVE NOW' : '⏰ SCHEDULED'}
                      </Badge>
                      {liveClass.status === 'scheduled' && (
                        <span className="text-xs text-gray-500">
                          Starts at {liveClass.time} on {liveClass.date}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-semibold mb-2">{liveClass.title}</h3>
                    <p className="text-sm md:text-base text-gray-600 mb-3">{liveClass.description}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{liveClass.program_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {liveClass.date} at {liveClass.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto md:ml-6">
                    {liveClass.status === 'live' || 
                     (liveClass.status === 'scheduled' && isClassTimeReached(liveClass.date, liveClass.time)) ? (
                      <Button 
                        onClick={() => joinLiveClassMeeting(liveClass)}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
                        size="lg"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Now
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="w-full md:w-auto">
                        <Clock className="h-4 w-4 mr-2" />
                        Scheduled
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentLiveClass;
