import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Users, 
  Calendar, 
  Clock, 
  Play,
  Plus,
  AlertCircle,
  ExternalLink,
  Globe,
  Award,
  CheckCircle,
  Trash2
} from "lucide-react";

export const LiveClassroom = () => {
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showInstantClassForm, setShowInstantClassForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGoogleMeetAuthenticated, setIsGoogleMeetAuthenticated] = useState(true);
  const [lecturerPrograms, setLecturerPrograms] = useState([]);
  const [activeLiveClasses, setActiveLiveClasses] = useState([]);

  // Form states for scheduled class
  const [scheduledClass, setScheduledClass] = useState({
    title: '',
    description: '',
    program: '',
    date: '',
    time: '',
    duration: '60'
  });

  // Form states for instant class
  const [instantClass, setInstantClass] = useState({
    title: '',
    description: '',
    program: '',
    duration: '60'
  });

  // Load data on component mount
  useEffect(() => {
    loadLecturerPrograms();
    loadActiveLiveClasses();
    setLoading(false);
  }, []);

  // No authentication required - Jitsi Meet works without any login

  // Load lecturer's programs (regular + short-term)
  const loadLecturerPrograms = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Get lecturer's regular programs
      const programsResponse = await fetch('https://must-lms-backend.onrender.com/api/programs');
      let allPrograms = [];
      
      if (programsResponse.ok) {
        const programsResult = await programsResponse.json();
        
        // Filter regular programs for current lecturer
        const lecturerPrograms = programsResult.data?.filter(program => 
          program.lecturer_name === currentUser.username ||
          program.lecturer_id === currentUser.id
        ) || [];
        
        allPrograms = [...lecturerPrograms];
      }
      
      // Get lecturer's short-term programs
      const shortTermResponse = await fetch('https://must-lms-backend.onrender.com/api/short-term-programs');
      if (shortTermResponse.ok) {
        const shortTermResult = await shortTermResponse.json();
        
        // Filter short-term programs for current lecturer
        const lecturerShortTermPrograms = shortTermResult.data?.filter(program => 
          program.lecturer_name === currentUser.username ||
          program.lecturer_id === currentUser.id
        ) || [];
        
        // Convert short-term programs to same format as regular programs
        const formattedShortTermPrograms = lecturerShortTermPrograms.map(program => ({
          id: `short-${program.id}`,
          name: program.title,
          lecturer_name: program.lecturer_name,
          lecturer_id: program.lecturer_id,
          type: 'short-term'
        }));
        
        allPrograms = [...allPrograms, ...formattedShortTermPrograms];
      }
      
      setLecturerPrograms(allPrograms);
    } catch (error) {
      console.error('Error loading lecturer programs:', error);
    }
  };

  // Load active live classes
  const loadActiveLiveClasses = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const response = await fetch('https://must-lms-backend.onrender.com/api/live-classes');
      const result = await response.json();
      
      // Filter for current lecturer's active classes
      const lecturerClasses = result.data?.filter(liveClass => 
        liveClass.lecturer_name === currentUser.username &&
        (liveClass.status === 'live' || liveClass.status === 'scheduled')
      ) || [];
      
      setActiveLiveClasses(lecturerClasses);
    } catch (error) {
      console.error('Error loading active live classes:', error);
    }
  };

  // Generate a unique Jitsi Meet URL (free, no authentication required)
  const generateJitsiMeetUrl = () => {
    // Generate unique room name for Jitsi Meet
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const roomName = `MUST-LiveClass-${timestamp}-${randomStr}`;
    
    // Jitsi Meet URL format - works without authentication
    const meetingUrl = `https://meet.jit.si/${roomName}`;
    
    console.log('Generated Jitsi Meet URL:', meetingUrl);
    console.log('Room Name:', roomName);
    
    return meetingUrl;
  };

  // Handle scheduled class creation
  const handleScheduleClass = async () => {
    try {
      // Validate form data
      if (!scheduledClass.title.trim()) {
        alert('❌ Please enter a class title');
        return;
      }
      
      if (!scheduledClass.program) {
        alert('❌ Please select a program');
        return;
      }
      
      if (!scheduledClass.date) {
        alert('❌ Please select a date');
        return;
      }
      
      if (!scheduledClass.time) {
        alert('❌ Please select a time');
        return;
      }
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!currentUser.username) {
        alert('❌ User not found. Please login again.');
        return;
      }
      
      const meetingUrl = generateJitsiMeetUrl();
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      const classData = {
        title: scheduledClass.title.trim(),
        description: scheduledClass.description.trim() || 'Scheduled live class session',
        program_name: scheduledClass.program,
        date: scheduledClass.date,
        time: scheduledClass.time,
        duration: parseInt(scheduledClass.duration) || 60,
        lecturer_id: currentUser.id || null,
        lecturer_name: currentUser.username,
        room_id: roomId,
        meeting_url: meetingUrl,
        status: 'scheduled'
      };
      
      console.log('Creating scheduled class with data:', classData);
      
      const response = await fetch('https://must-lms-backend.onrender.com/api/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      });
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (response.ok && result.success) {
        alert(`✅ Class scheduled successfully!\n\nMeeting Link: ${meetingUrl}\n\nStudents will see this class in their portal and can join when the time arrives.\n\nNote: This uses Jitsi Meet - a free, secure video conferencing platform.`);
        setScheduledClass({ title: '', description: '', program: '', date: '', time: '', duration: '60' });
        setShowCreateClass(false);
        loadActiveLiveClasses();
      } else {
        console.error('API Error:', result);
        alert(`❌ Failed to schedule class: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error scheduling class:', error);
      alert(`❌ Error scheduling class: ${error.message}`);
    }
  };

  // Handle instant class creation
  const handleStartInstantClass = async () => {
    try {
      // Validate form data
      if (!instantClass.title.trim()) {
        alert('❌ Please enter a class title');
        return;
      }
      
      if (!instantClass.program) {
        alert('❌ Please select a program');
        return;
      }
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!currentUser.username) {
        alert('❌ User not found. Please login again.');
        return;
      }
      
      const meetingUrl = generateJitsiMeetUrl();
      
      // Create class data with proper formatting
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      const classData = {
        title: instantClass.title.trim(),
        description: instantClass.description.trim() || 'Instant live class session',
        program_name: instantClass.program,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        duration: parseInt(instantClass.duration) || 60,
        lecturer_id: currentUser.id || null,
        lecturer_name: currentUser.username,
        room_id: roomId,
        meeting_url: meetingUrl,
        status: 'live'
      };
      
      console.log('Creating instant class with data:', classData);
      
      const response = await fetch('https://must-lms-backend.onrender.com/api/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      });
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (response.ok && result.success) {
        alert(`✅ Live class started successfully!\n\nJitsi Meet will open automatically.\n\nStudents can now join this class from their portal.\n\nNote: Jitsi Meet is a free, secure video conferencing platform.`);
        
        // Open Jitsi Meet for lecturer
        console.log('Opening Jitsi Meet for lecturer:', meetingUrl);
        window.open(meetingUrl, '_blank', 'width=1200,height=800');
        
        // Reset form and close
        setInstantClass({ title: '', description: '', program: '', duration: '60' });
        setShowInstantClassForm(false);
        loadActiveLiveClasses();
      } else {
        console.error('API Error:', result);
        alert(`❌ Failed to start live class: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error starting instant class:', error);
      alert(`❌ Error starting live class: ${error.message}`);
    }
  };

  // Join existing live class
  const joinLiveClass = (meetingUrl) => {
    console.log('Joining live class:', meetingUrl);
    
    // Open the meeting URL directly (works for both Jitsi Meet and Google Meet)
    if (meetingUrl && (meetingUrl.includes('meet.jit.si') || meetingUrl.includes('meet.google.com'))) {
      console.log('Opening meeting:', meetingUrl);
      window.open(meetingUrl, '_blank', 'width=1200,height=800');
    } else {
      alert('❌ Invalid meeting URL');
    }
  };

  // End live class
  const endLiveClass = async (classId) => {
    try {
      const response = await fetch(`https://must-lms-backend.onrender.com/api/live-classes/${classId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('✅ Live class ended successfully!');
        loadActiveLiveClasses();
      } else {
        alert('❌ Failed to end live class.');
      }
    } catch (error) {
      console.error('Error ending live class:', error);
      alert('❌ Error ending live class.');
    }
  };

  // No authentication screen needed - direct access to live classroom

  // Loading state
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading live classroom...</p>
      </div>
    );
  }

  // Main lecturer interface
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Live Classroom</h1>
        <Badge variant="outline" className="text-sm">
          Jitsi Meet Integration
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={() => setShowCreateClass(true)}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Schedule Live Class
        </Button>
        
        <Button 
          onClick={() => setShowInstantClassForm(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Start Instant Live Class
        </Button>
      </div>

      {/* Active Live Classes */}
      {activeLiveClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Active Live Classes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeLiveClasses.map((liveClass) => (
              <div key={liveClass.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${
                      liveClass.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
                    }`}></div>
                    <Badge variant={liveClass.status === 'live' ? 'destructive' : 'secondary'}>
                      {liveClass.status === 'live' ? 'LIVE NOW' : 'SCHEDULED'}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold">{liveClass.title}</h3>
                  <p className="text-sm text-gray-600">{liveClass.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <span>{liveClass.program_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{liveClass.date} at {liveClass.time}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => joinLiveClass(liveClass.meeting_url)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join Class
                  </Button>
                  
                  <Button 
                    onClick={() => endLiveClass(liveClass.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Schedule Class Form */}
      {showCreateClass && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule Live Class</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Class Title</label>
              <Input
                value={scheduledClass.title}
                onChange={(e) => setScheduledClass({...scheduledClass, title: e.target.value})}
                placeholder="Enter class title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={scheduledClass.description}
                onChange={(e) => setScheduledClass({...scheduledClass, description: e.target.value})}
                placeholder="Enter class description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Program</label>
              <select
                value={scheduledClass.program}
                onChange={(e) => setScheduledClass({...scheduledClass, program: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select Program</option>
                {lecturerPrograms.map((program) => (
                  <option key={program.id} value={program.name}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  type="date"
                  value={scheduledClass.date}
                  onChange={(e) => setScheduledClass({...scheduledClass, date: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <Input
                  type="time"
                  value={scheduledClass.time}
                  onChange={(e) => setScheduledClass({...scheduledClass, time: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
              <Input
                type="number"
                value={scheduledClass.duration}
                onChange={(e) => setScheduledClass({...scheduledClass, duration: e.target.value})}
                placeholder="60"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleScheduleClass} className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Class
              </Button>
              <Button 
                onClick={() => setShowCreateClass(false)} 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instant Class Form */}
      {showInstantClassForm && (
        <Card>
          <CardHeader>
            <CardTitle>Start Instant Live Class</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Class Title</label>
              <Input
                value={instantClass.title}
                onChange={(e) => setInstantClass({...instantClass, title: e.target.value})}
                placeholder="Enter class title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={instantClass.description}
                onChange={(e) => setInstantClass({...instantClass, description: e.target.value})}
                placeholder="Enter class description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Program</label>
              <select
                value={instantClass.program}
                onChange={(e) => setInstantClass({...instantClass, program: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select Program</option>
                {lecturerPrograms.map((program) => (
                  <option key={program.id} value={program.name}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
              <Input
                type="number"
                value={instantClass.duration}
                onChange={(e) => setInstantClass({...instantClass, duration: e.target.value})}
                placeholder="60"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleStartInstantClass} className="flex-1 bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Start Live Class Now
              </Button>
              <Button 
                onClick={() => setShowInstantClassForm(false)} 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Programs Message */}
      {lecturerPrograms.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Assigned</h3>
            <p className="text-gray-500">
              You don't have any programs assigned yet. Contact admin to assign programs to you.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveClassroom;
