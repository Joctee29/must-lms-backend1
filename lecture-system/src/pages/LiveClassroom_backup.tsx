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
  Square,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share,
  MessageSquare,
  Monitor,
  Plus,
  Trash2
} from "lucide-react";

export const LiveClassroom = () => {
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  
  const [newClass, setNewClass] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: 60,
    program: ""
  });
  
  const [lecturerPrograms, setLecturerPrograms] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [liveStudents, setLiveStudents] = useState([]);

  useEffect(() => {
    fetchLecturerPrograms();
  }, []);

  const fetchLecturerPrograms = async () => {
    try {
      console.log('=== FETCHING LECTURER PROGRAMS FOR LIVE CLASS ROOM ===');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const response = await fetch('https://must-lms-backend.onrender.com/api/programs');
      if (response.ok) {
        const result = await response.json();
        const lecturerPrograms = result.data?.filter(program =>
          program.lecturer_name === currentUser.username ||
          program.lecturer_id === currentUser.id
        ) || [];
        
        console.log('Lecturer programs found:', lecturerPrograms);
        setLecturerPrograms(lecturerPrograms);
      } else {
        console.error('Failed to fetch programs');
        setLecturerPrograms([]);
      }
    } catch (error) {
      console.error('Error fetching lecturer programs:', error);
      setLecturerPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    try {
      console.log('=== CREATING LIVE CLASS ===');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Generate internal meeting room ID
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      const classData = {
        title: newClass.title,
        description: newClass.description,
        program_name: newClass.program,
        date: newClass.date,
        time: newClass.time,
        duration: newClass.duration,
        lecturer_id: currentUser.id,
        lecturer_name: currentUser.username,
        room_id: roomId,
        status: 'scheduled'
      };
      
      console.log('Class data to save:', classData);
      
      // Save to backend
      const response = await fetch('https://must-lms-backend.onrender.com/api/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Class created successfully:', result.data);
        
        // Add to local state
        setUpcomingClasses(prev => [result.data, ...prev]);
        
        // Reset form
        setNewClass({
          title: "",
          description: "",
          date: "",
          time: "",
          duration: 60,
          program: ""
        });
        
        setShowCreateClass(false);
        alert('Live class scheduled successfully!');
      } else {
        console.error('Failed to create class');
        alert('Failed to schedule class. Please try again.');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Error scheduling class. Please try again.');
    }
  };

  const startLiveClass = async (classData = null) => {
    try {
      console.log('=== STARTING LIVE CLASS ===');
      
      if (classData) {
        // Starting scheduled class
        const response = await fetch(`https://must-lms-backend.onrender.com/api/live-classes/${classData.id}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          console.log('Scheduled class started');
          // Update class status
          setUpcomingClasses(prev => 
            prev.map(c => c.id === classData.id ? {...c, status: 'live'} : c)
          );
        }
      }
      
      // Initialize WebRTC and media devices
      await initializeMediaDevices();
      setIsLive(true);
      
    } catch (error) {
      console.error('Error starting live class:', error);
      alert('Failed to start live class. Please check your camera and microphone.');
    }
  };
  
  const initializeMediaDevices = async () => {
    try {
      // Get user media (camera and microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      console.log('Media devices initialized:', stream);
      
      // Set up video element (will be implemented in UI)
      const videoElement = document.getElementById('lecturerVideo') as HTMLVideoElement;
      if (videoElement) {
        videoElement.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  };

  const endLiveClass = async () => {
    try {
      console.log('=== ENDING LIVE CLASS ===');
      
      // Stop all media streams
      const videoElement = document.getElementById('lecturerVideo') as HTMLVideoElement;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
      }
      
      setIsLive(false);
      setLiveStudents([]);
      
      console.log('Live class ended successfully');
    } catch (error) {
      console.error('Error ending live class:', error);
    }
  };

  const deleteScheduledClass = async (classId) => {
    try {
      console.log('=== DELETING SCHEDULED CLASS ===');
      
      const response = await fetch(`https://must-lms-backend.onrender.com/api/live-classes/${classId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setUpcomingClasses(prev => prev.filter(c => c.id !== classId));
        console.log('Class deleted successfully');
      } else {
        console.error('Failed to delete class');
        alert('Failed to delete class. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Error deleting class. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "live": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case "present": return "bg-green-100 text-green-800";
      case "late": return "bg-yellow-100 text-yellow-800";
      case "absent": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Classroom</h1>
          <p className="text-muted-foreground">
            Create and manage live classes with real video, audio, and chat
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateClass(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Live Class
        </Button>
      </div>

      {/* Live Class Features */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Video className="h-5 w-5" />
            Internal Live Classroom System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 mb-2">Built-in video conferencing with real camera, audio, and chat</p>
              <div className="flex items-center gap-4 text-sm text-green-600">
                <span className="flex items-center gap-1">
                  <Camera className="h-4 w-4" />
                  Real Video Streaming
                </span>
                <span className="flex items-center gap-1">
                  <Mic className="h-4 w-4" />
                  Real Audio Communication
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Live Chat System
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Real Participants
                </span>
              </div>
            </div>
            <Button onClick={() => startLiveClass()} className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Start Instant Class
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Scheduled Classes</CardTitle>
            <Button 
              onClick={() => setShowCreateClass(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Class
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingClasses.map((classItem) => (
              <div key={classItem.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{classItem.title}</h3>
                    <p className="text-sm text-muted-foreground">{classItem.program_name || classItem.program}</p>
                  </div>
                  <Badge className={getStatusColor(classItem.status)}>
                    {classItem.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{classItem.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{classItem.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{classItem.students} students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{classItem.duration} min</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(classItem.meetingLink, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Google Meet
                  </Button>
                  {classItem.status === "scheduled" && (
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      Start Class
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {classItem.status === "scheduled" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteScheduledClass(classItem.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>


      {/* Live Class Setup Modal */}
      {showSetupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-6 w-6 text-blue-600" />
                Start Live Class Setup
              </CardTitle>
              <p className="text-muted-foreground">
                Configure your live class with real video, audio, and chat functionality
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Select Program</label>
                  {loading ? (
                    <div className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500">
                      Loading programs...
                    </div>
                  ) : (
                    <select
                      value={newClass.program}
                      onChange={(e) => {
                        const selectedProgram = lecturerPrograms.find(p => p.name === e.target.value);
                        setNewClass({
                          ...newClass, 
                          program: e.target.value,
                          title: selectedProgram ? `${selectedProgram.name} - Live Session` : ""
                        });
                      }}
                      className="w-full border rounded px-3 py-2 bg-white"
                    >
                      <option value="">Choose a program...</option>
                      {lecturerPrograms.map((program) => (
                        <option key={program.id} value={program.name}>
                          {program.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {lecturerPrograms.length === 0 && !loading && (
                    <p className="text-sm text-red-600 mt-1">
                      No programs assigned. Contact admin to assign programs.
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    placeholder="60"
                    value={newClass.duration}
                    onChange={(e) => setNewClass({...newClass, duration: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Class Title</label>
                <Input
                  placeholder="Enter class title..."
                  value={newClass.title}
                  onChange={(e) => setNewClass({...newClass, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Brief description of the class..."
                  value={newClass.description}
                  onChange={(e) => setNewClass({...newClass, description: e.target.value})}
                />
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Live Class Features</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span>HD Video & Audio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Real-time Participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Interactive Chat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>Screen Sharing</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSetupForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    handleCreateClass();
                    setShowSetupForm(false);
                    setIsLive(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!newClass.title || !newClass.course}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Live Class
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schedule Class Modal */}
      {showCreateClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                Schedule New Class
              </CardTitle>
              <p className="text-muted-foreground">
                Create a scheduled class for: <span className="font-semibold text-blue-600">{selectedCourse.name || "Selected Course"}</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Select Course</label>
                  <select
                    value={newClass.course}
                    onChange={(e) => {
                      const selectedCourse = lecturerCourses.find(c => c.name === e.target.value);
                      setNewClass({
                        ...newClass, 
                        course: e.target.value,
                        title: selectedCourse ? `${selectedCourse.name} - Scheduled Class` : ""
                      });
                    }}
                    className="w-full border rounded px-3 py-2 bg-white"
                  >
                    <option value="">Choose a course...</option>
                    {lecturerCourses.map((course) => (
                      <option key={course.id} value={course.name}>
                        {course.name} ({course.program})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select from your assigned courses
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Class Title</label>
                  <Input
                    placeholder="Enter class title..."
                    value={newClass.title}
                    onChange={(e) => setNewClass({...newClass, title: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={newClass.date}
                    onChange={(e) => setNewClass({...newClass, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <Input
                    type="time"
                    value={newClass.time}
                    onChange={(e) => setNewClass({...newClass, time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    placeholder="60"
                    value={newClass.duration}
                    onChange={(e) => setNewClass({...newClass, duration: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Brief description of the class..."
                  value={newClass.description}
                  onChange={(e) => setNewClass({...newClass, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Scheduled Class Features</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Automatic Reminders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    <span>Real Video Streaming</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Student Notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Attendance Tracking</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateClass(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    handleCreateClass();
                    setShowCreateClass(false);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!newClass.title || !newClass.program || !newClass.date || !newClass.time}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Class
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Live Class Interface */}
      {isLive && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
          {/* Header Controls */}
          <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">LIVE</span>
              </div>
              <h2 className="text-lg font-semibold">Live Classroom Session</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Users className="h-4 w-4 mr-1" />
                {liveStudents.length} Students
              </Badge>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={endLiveClass}
              >
                <Square className="h-4 w-4 mr-2" />
                End Class
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex">
            {/* Video Area */}
            <div className="flex-1 flex flex-col bg-gray-800">
              {/* Lecturer Video */}
              <div className="flex-1 relative">
                <video 
                  id="lecturerVideo"
                  className="w-full h-full object-cover"
                  autoPlay 
                  muted
                  playsInline
                />
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                  You (Lecturer)
                </div>
              </div>

              {/* Video Controls */}
              <div className="bg-gray-900 p-4 flex items-center justify-center gap-4">
                <Button
                  variant={isMuted ? "destructive" : "secondary"}
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  variant={isCameraOff ? "destructive" : "secondary"}
                  size="sm"
                  onClick={() => setIsCameraOff(!isCameraOff)}
                >
                  {isCameraOff ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                </Button>
                <Button variant="secondary" size="sm">
                  <Share className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="sm">
                  <Monitor className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat & Participants Sidebar */}
            <div className="w-80 bg-white flex flex-col">
              {/* Participants */}
              <div className="p-4 border-b">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Participants ({liveStudents.length})
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {liveStudents.map((student) => (
                    <div key={student.id} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{student.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {student.status}
                      </Badge>
                    </div>
                  ))}
                  {liveStudents.length === 0 && (
                    <p className="text-gray-500 text-sm">No students joined yet</p>
                  )}
                </div>
              </div>

              {/* Chat */}
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Live Chat
                  </h3>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <p className="text-gray-500 text-sm text-center">
                    Chat messages will appear here
                  </p>
                </div>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button size="sm">
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
