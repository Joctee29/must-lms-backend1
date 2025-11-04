import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Video,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Schedule = ({ onNavigate }: { onNavigate?: (section: string) => void }) => {
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch REAL schedule data from database
  useEffect(() => {
    const fetchRealScheduleData = async () => {
      try {
        console.log('=== FETCHING REAL SCHEDULE DATA ===');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Get current student
        const studentsResponse = await fetch('https://must-lms-backend.onrender.com/api/students');
        if (studentsResponse.ok) {
          const studentsResult = await studentsResponse.json();
          const currentStudent = studentsResult.data?.find(s => 
            s.name === currentUser.username || 
            s.email === currentUser.username ||
            s.registration_number === currentUser.username
          );
          
          console.log('Current student found:', currentStudent);
          
          if (currentStudent) {
            // Get live classes for student's course
            const liveClassResponse = await fetch('https://must-lms-backend.onrender.com/api/live-classes');
            if (liveClassResponse.ok) {
              const liveClassResult = await liveClassResponse.json();
              console.log('All live classes:', liveClassResult.data);
              
              // Filter and format classes for student
              const studentClasses = liveClassResult.data?.filter(liveClass => {
                // Use enhanced course mapping
                const mappedCourse = liveClass.mapped_course || liveClass.program_name;
                const studentCourse = currentStudent.course_name;
                
                // Check if class matches student's course
                if (mappedCourse && studentCourse) {
                  return mappedCourse.toUpperCase().includes(studentCourse.toUpperCase()) ||
                         studentCourse.toUpperCase().includes(mappedCourse.toUpperCase());
                }
                return false;
              }).map(liveClass => ({
                id: liveClass.id,
                title: liveClass.title,
                time: `${liveClass.time} - ${liveClass.time}`, // Format time properly
                date: liveClass.date?.split('T')[0] || new Date().toISOString().split('T')[0],
                location: "Online - Live Classroom",
                instructor: liveClass.lecturer_name,
                type: "Live Class",
                status: liveClass.status === 'live' ? 'Live Now' : 
                       liveClass.status === 'scheduled' ? 'Starting Soon' : 'Completed',
                course: liveClass.program_name,
                startTime: new Date(`${liveClass.date} ${liveClass.time}`),
                canJoin: liveClass.status === 'live' || liveClass.status === 'scheduled',
                liveClassData: liveClass
              })) || [];
              
              console.log('Student classes found:', studentClasses);
              
              // Only show classes if they exist, otherwise empty
              if (studentClasses && studentClasses.length > 0) {
                setScheduleItems(studentClasses);
              } else {
                console.log('No live classes found for student');
                setScheduleItems([]);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching schedule data:', error);
        // Show empty schedule if error
        setScheduleItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRealScheduleData();
  }, []);

  const handleJoinClass = (classItem: any) => {
    if (classItem.type === "Live Class" && classItem.canJoin) {
      // Store class info for lectures section
      sessionStorage.setItem('selectedCourse', classItem.course);
      sessionStorage.setItem('classInfo', JSON.stringify(classItem));
      
      // Navigate to lectures section
      if (onNavigate) {
        onNavigate('lectures');
      }
    }
  };

  const assignments: any[] = []; // Removed fake assignments data

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Lecture": return "bg-blue-100 text-blue-800";
      case "Lab": return "bg-blue-100 text-blue-800";
      case "Tutorial": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-blue-100 text-blue-800";
      case "Upcoming": return "bg-blue-100 text-blue-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">
            View your class schedule and upcoming assignments
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Today's Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading live classes...</p>
                </div>
              ) : scheduleItems.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Live Classes Today</h3>
                  <p className="text-gray-500 mb-4">
                    There are no live classes scheduled for your program today.
                  </p>
                  <p className="text-sm text-gray-400">
                    Live classes will appear here when your lecturers start them.
                  </p>
                </div>
              ) : (
                scheduleItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{item.title}</h3>
                      <div className="flex space-x-2">
                        <Badge className={getTypeColor(item.type)}>
                          {item.type}
                        </Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{item.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>{item.instructor}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span>{item.course}</span>
                      </div>
                    </div>
                    
                    {/* Join Class Button */}
                    {item.type === "Live Class" && item.canJoin && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {item.status === "Live Now" && (
                              <span className="text-blue-600 font-medium">🔴 Class is live now!</span>
                            )}
                            {item.status === "Starting Soon" && (
                              <span className="text-orange-600 font-medium">⏰ Starting in a few minutes</span>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleJoinClass(item)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            {item.status === "Live Now" ? "Join Live Class" : "Join Class"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {item.status === "Upcoming" ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          window.open(`https://meet.google.com/new`, '_blank');
                          alert(`Joining ${item.title} class...`);
                        }}
                      >
                        Join Class
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Attended
                      </Button>
                    )}
                  </div>
                </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{scheduleItems.length}</div>
                <p className="text-sm text-muted-foreground">Live Classes</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <p className="text-sm text-muted-foreground">Assignments Due</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">Real Data</div>
                <p className="text-sm text-muted-foreground">From Database</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignments.length === 0 ? (
                <div className="text-center py-6">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No assignments due</p>
                  <p className="text-xs text-gray-400">Assignments will appear here when available</p>
                </div>
              ) : (
                assignments.map((assignment) => (
                  <div key={assignment.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{assignment.title}</h4>
                      <Badge className={getStatusColor(assignment.status)} variant="outline">
                        {assignment.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{assignment.course}</p>
                    <p className="text-xs text-muted-foreground">Due: {assignment.dueDate}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
