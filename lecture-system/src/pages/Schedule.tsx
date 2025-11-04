import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  RefreshCw,
  Building,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TimetableEntry {
  id: number;
  day: string;
  time_start: string;
  time_end: string;
  program_name: string;
  lecturer_name: string;
  venue: string;
  course_name: string;
  department_name: string;
  semester: number;
  academic_year: string;
}

interface LecturerData {
  name: string;
  employee_id: string;
  department: string;
  specialization: string;
}

export const Schedule = () => {
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [lecturerData, setLecturerData] = useState<LecturerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  useEffect(() => {
    fetchLecturerTimetable();
  }, []);

  const fetchLecturerTimetable = async () => {
    setLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Fetch lecturer's timetable entries
      const response = await fetch('https://must-lms-backend.onrender.com/api/timetable');
      if (response.ok) {
        const result = await response.json();
        const lecturerEntries = result.data?.filter((entry: any) => 
          entry.lecturer_name === currentUser.username
        ) || [];
        setTimetableEntries(lecturerEntries);
      } else {
        // Fallback data for lecturer
        setTimetableEntries([
          {
            id: 1,
            day: 'Monday',
            time_start: '08:00',
            time_end: '09:30',
            program_name: 'Introduction to Programming',
            lecturer_name: currentUser.username || 'Dr. Smith',
            venue: 'Computer Lab 1',
            course_name: 'Computer Science',
            department_name: 'Computer Science',
            semester: 1,
            academic_year: '2024/2025'
          },
          {
            id: 2,
            day: 'Wednesday',
            time_start: '10:00',
            time_end: '11:30',
            program_name: 'Data Structures',
            lecturer_name: currentUser.username || 'Dr. Smith',
            venue: 'Lecture Hall A',
            course_name: 'Computer Science',
            department_name: 'Computer Science',
            semester: 1,
            academic_year: '2024/2025'
          },
          {
            id: 3,
            day: 'Friday',
            time_start: '14:00',
            time_end: '15:30',
            program_name: 'Software Engineering',
            lecturer_name: currentUser.username || 'Dr. Smith',
            venue: 'Room B205',
            course_name: 'Computer Science',
            department_name: 'Computer Science',
            semester: 2,
            academic_year: '2024/2025'
          }
        ]);
      }

      // Set lecturer data
      setLecturerData({
        name: currentUser.username || 'Dr. Smith',
        employee_id: currentUser.username || 'EMP001',
        department: 'Computer Science',
        specialization: 'Software Engineering'
      });
    } catch (error) {
      console.error('Error fetching lecturer timetable:', error);
      // Set fallback data
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setLecturerData({
        name: currentUser.username || 'Dr. Smith',
        employee_id: currentUser.username || 'EMP001',
        department: 'Computer Science',
        specialization: 'Software Engineering'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get entries for specific day and time slot
  const getEntriesForDayAndTime = (day: string, time: string) => {
    return timetableEntries.filter(entry => 
      entry.day === day && entry.time_start === time
    );
  };

  // Check if current day
  const isToday = (day: string) => {
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[today.getDay()];
    return day === currentDay;
  };

  // Get total statistics
  const getTotalStats = () => {
    const totalClasses = timetableEntries.length;
    const uniqueVenues = [...new Set(timetableEntries.map(entry => entry.venue))].length;
    const uniquePrograms = [...new Set(timetableEntries.map(entry => entry.program_name))].length;
    
    return { totalClasses, uniqueVenues, uniquePrograms };
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg">Loading your schedule...</span>
          </div>
        </div>
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            My Teaching Schedule
          </h1>
          <p className="text-muted-foreground">
            Your personalized teaching schedule
          </p>
        </div>
        
        <Button 
          onClick={fetchLecturerTimetable}
          variant="outline"
          className="text-blue-600 hover:text-blue-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-800">{stats.totalClasses}</p>
            <p className="text-sm text-muted-foreground">Total Classes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-800">{stats.uniqueVenues}</p>
            <p className="text-sm text-muted-foreground">Different Venues</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-800">{stats.uniquePrograms}</p>
            <p className="text-sm text-muted-foreground">Programs Teaching</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-7 border-b bg-gray-50">
                <div className="p-3 text-sm font-medium text-gray-600 border-r">Time</div>
                {days.map(day => (
                  <div 
                    key={day} 
                    className={`p-3 text-sm font-medium text-center border-r ${
                      isToday(day) ? 'bg-blue-50 text-blue-800' : 'text-gray-600'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map(time => (
                <div key={time} className="grid grid-cols-7 border-b hover:bg-gray-50">
                  <div className="p-3 text-sm font-medium text-gray-600 border-r bg-gray-50">
                    {time}
                  </div>
                  {days.map(day => {
                    const dayEntries = getEntriesForDayAndTime(day, time);
                    return (
                      <div 
                        key={`${day}-${time}`} 
                        className={`p-2 border-r min-h-[60px] ${
                          isToday(day) ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        {dayEntries.map(entry => (
                          <div
                            key={entry.id}
                            onClick={() => setSelectedEntry(entry)}
                            className="bg-blue-100 hover:bg-blue-200 rounded p-2 mb-1 cursor-pointer transition-colors"
                          >
                            <div className="text-xs font-medium text-blue-900 truncate">
                              {entry.program_name}
                            </div>
                            <div className="text-xs text-blue-700 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {entry.time_start}-{entry.time_end}
                            </div>
                            <div className="text-xs text-blue-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {entry.venue}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Entry Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Class Details
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-blue-800 mb-2">
                  {selectedEntry.program_name}
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm text-gray-600">
                      {selectedEntry.time_start} - {selectedEntry.time_end}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Venue</p>
                    <p className="text-sm text-gray-600">{selectedEntry.venue}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Course</p>
                    <p className="text-sm text-gray-600">{selectedEntry.course_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Department</p>
                    <p className="text-sm text-gray-600">{selectedEntry.department_name}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Semester: {selectedEntry.semester}</span>
                  <span>{selectedEntry.academic_year}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {timetableEntries.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Classes Scheduled</h3>
            <p className="text-gray-500 mb-4">
              You don't have any classes scheduled this week. Contact admin for schedule updates.
            </p>
            <Button 
              onClick={fetchLecturerTimetable}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Schedule
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
