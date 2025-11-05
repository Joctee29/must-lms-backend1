import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  RefreshCw,
  CalendarDays,
  Building,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Printer
} from 'lucide-react';

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
  college_name: string;
  semester: number;
  academic_year: string;
}

interface LecturerData {
  id: number;
  name: string;
  employee_id: string;
  specialization: string;
  department: string;
  college: string;
}

const MySchedule = () => {
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [lecturerData, setLecturerData] = useState<LecturerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [filterSemester, setFilterSemester] = useState<number | 'all'>('all');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];
  const API_BASE_URL = 'http://localhost:5000/api';

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    fetchLecturerSchedule();
  }, []);

  const fetchLecturerSchedule = async () => {
    try {
      setLoading(true);
      console.log('=== LECTURER SCHEDULE DEBUG ===');
      console.log('Current User:', currentUser);

      // 1. Get lecturer information
      const lecturersResponse = await fetch(`${API_BASE_URL}/lecturers`);
      if (lecturersResponse.ok) {
        const lecturersResult = await lecturersResponse.json();
        console.log('Lecturers API Response:', lecturersResult);

        // Find current lecturer
        const lecturer = lecturersResult.data?.find((l: any) => 
          l.employee_id === currentUser.username || 
          l.name === currentUser.username ||
          l.email === currentUser.username
        );

        console.log('Found Lecturer:', lecturer);

        if (lecturer) {
          setLecturerData(lecturer);

          // 2. Get timetable entries for this lecturer
          const timetableResponse = await fetch(`${API_BASE_URL}/timetable/lecturer/${encodeURIComponent(lecturer.name)}`);
          console.log('Timetable URL:', `${API_BASE_URL}/timetable/lecturer/${encodeURIComponent(lecturer.name)}`);
          console.log('Timetable Response Status:', timetableResponse.status);
          
          if (timetableResponse.ok) {
            const timetableResult = await timetableResponse.json();
            console.log('Lecturer Timetable Response:', timetableResult);
            console.log('Timetable Entries Count:', timetableResult.data?.length);
            setTimetableEntries(timetableResult.data || []);
          } else {
            console.log('Lecturer-specific endpoint failed, using fallback...');
            // Fallback: get all timetable and filter by lecturer name
            const allTimetableResponse = await fetch(`${API_BASE_URL}/timetable`);
            if (allTimetableResponse.ok) {
              const allTimetableResult = await allTimetableResponse.json();
              console.log('All Timetable Entries:', allTimetableResult.data?.length);
              console.log('All Lecturer Names:', allTimetableResult.data?.map((e: any) => e.lecturer_name));
              
              const lecturerTimetable = allTimetableResult.data?.filter((entry: any) => {
                const match = entry.lecturer_name === lecturer.name;
                console.log(`Checking "${entry.lecturer_name}" === "${lecturer.name}": ${match ? 'MATCH' : 'NO MATCH'}`);
                return match;
              }) || [];
              
              console.log('Filtered Lecturer Timetable:', lecturerTimetable);
              console.log('Filtered Count:', lecturerTimetable.length);
              setTimetableEntries(lecturerTimetable);
            }
          }
        } else {
          console.log('Lecturer not found, showing demo schedule');
          // Show demo schedule for testing
          const demoSchedule = [
            {
              id: 1,
              day: 'Monday',
              time_start: '08:00',
              time_end: '10:00',
              program_name: 'Introduction to Programming',
              lecturer_name: currentUser.username || 'Dr. Lecturer',
              venue: 'Computer Lab 1',
              course_name: 'Computer Science',
              department_name: 'Computer Science',
              college_name: 'College of Informatics',
              semester: 1,
              academic_year: '2024/2025'
            },
            {
              id: 2,
              day: 'Tuesday',
              time_start: '10:00',
              time_end: '12:00',
              program_name: 'Database Management Systems',
              lecturer_name: currentUser.username || 'Dr. Lecturer',
              venue: 'Lecture Hall A',
              course_name: 'Computer Science',
              department_name: 'Computer Science',
              college_name: 'College of Informatics',
              semester: 1,
              academic_year: '2024/2025'
            },
            {
              id: 3,
              day: 'Wednesday',
              time_start: '14:00',
              time_end: '16:00',
              program_name: 'Software Engineering',
              lecturer_name: currentUser.username || 'Dr. Lecturer',
              venue: 'Computer Lab 2',
              course_name: 'Information Technology',
              department_name: 'Computer Science',
              college_name: 'College of Informatics',
              semester: 2,
              academic_year: '2024/2025'
            },
            {
              id: 4,
              day: 'Thursday',
              time_start: '09:00',
              time_end: '11:00',
              program_name: 'Data Structures and Algorithms',
              lecturer_name: currentUser.username || 'Dr. Lecturer',
              venue: 'Lecture Hall B',
              course_name: 'Computer Science',
              department_name: 'Computer Science',
              college_name: 'College of Informatics',
              semester: 1,
              academic_year: '2024/2025'
            },
            {
              id: 5,
              day: 'Friday',
              time_start: '13:00',
              time_end: '15:00',
              program_name: 'Computer Networks',
              lecturer_name: currentUser.username || 'Dr. Lecturer',
              venue: 'Network Lab',
              course_name: 'Information Technology',
              department_name: 'Computer Science',
              college_name: 'College of Informatics',
              semester: 2,
              academic_year: '2024/2025'
            }
          ];

          setTimetableEntries(demoSchedule);
          setLecturerData({
            id: 1,
            name: currentUser.username || 'Dr. Lecturer',
            employee_id: currentUser.username || 'EMP001',
            specialization: 'Computer Science',
            department: 'Computer Science',
            college: 'College of Informatics'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching lecturer schedule:', error);
      
      // Show demo schedule when server is unavailable
      const demoSchedule = [
        {
          id: 1,
          day: 'Monday',
          time_start: '08:00',
          time_end: '10:00',
          program_name: 'Introduction to Programming',
          lecturer_name: currentUser.username || 'Dr. Lecturer',
          venue: 'Computer Lab 1',
          course_name: 'Computer Science',
          department_name: 'Computer Science',
          college_name: 'College of Informatics',
          semester: 1,
          academic_year: '2024/2025'
        },
        {
          id: 2,
          day: 'Tuesday',
          time_start: '10:00',
          time_end: '12:00',
          program_name: 'Database Management Systems',
          lecturer_name: currentUser.username || 'Dr. Lecturer',
          venue: 'Lecture Hall A',
          course_name: 'Computer Science',
          department_name: 'Computer Science',
          college_name: 'College of Informatics',
          semester: 1,
          academic_year: '2024/2025'
        }
      ];

      setTimetableEntries(demoSchedule);
      setLecturerData({
        id: 1,
        name: currentUser.username || 'Dr. Lecturer',
        employee_id: currentUser.username || 'EMP001',
        specialization: 'Computer Science',
        department: 'Computer Science',
        college: 'College of Informatics'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get entries for specific day and time slot
  const getEntriesForDayAndTime = (day: string, time: string) => {
    let entries = timetableEntries.filter(entry => 
      entry.day === day && entry.time_start === time
    );
    
    // Filter by semester if selected
    if (filterSemester !== 'all') {
      entries = entries.filter(entry => entry.semester === filterSemester);
    }
    
    return entries;
  };

  // Check if current day
  const isToday = (day: string) => {
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[today.getDay()];
    return day === currentDay;
  };

  const getTotalHours = () => {
    let filteredEntries = timetableEntries;
    if (filterSemester !== 'all') {
      filteredEntries = timetableEntries.filter(entry => entry.semester === filterSemester);
    }
    
    return filteredEntries.reduce((total, entry) => {
      const start = new Date(`1970-01-01T${entry.time_start}:00`);
      const end = new Date(`1970-01-01T${entry.time_end}:00`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
  };

  const handlePrintSchedule = () => {
    window.print();
  };

  const handleDownloadSchedule = () => {
    const csvContent = [
      ['Day', 'Time', 'Program', 'Venue', 'Course', 'Semester'].join(','),
      ...timetableEntries.map(entry => [
        entry.day,
        `${entry.time_start}-${entry.time_end}`,
        entry.program_name,
        entry.venue,
        entry.course_name,
        entry.semester
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${lecturerData?.name || 'lecturer'}_schedule.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
            <span className="text-lg">Loading your schedule...</span>
          </div>
        </div>
      </div>
    );
  }

  const totalHours = getTotalHours();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8 text-green-600" />
            My Teaching Schedule
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personalized teaching calendar
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handlePrintSchedule}
            variant="outline"
            className="text-green-600 hover:text-green-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            onClick={handleDownloadSchedule}
            variant="outline"
            className="text-green-600 hover:text-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
          <Button 
            onClick={fetchLecturerSchedule}
            variant="outline"
            className="text-green-600 hover:text-green-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Lecturer Information Card */}
      {lecturerData && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">{lecturerData.name}</h3>
                  <p className="text-green-700">{lecturerData.specialization}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-green-700">
                  <Building className="h-4 w-4" />
                  <span className="text-sm">{lecturerData.college}</span>
                </div>
                <div className="flex items-center gap-2 text-green-600 mt-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">{lecturerData.department}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-green-600" />
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Semesters</option>
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Total Hours: <span className="font-semibold text-green-600">{totalHours}h/week</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-800">
              {filterSemester === 'all' 
                ? timetableEntries.length 
                : timetableEntries.filter(e => e.semester === filterSemester).length
              }
            </p>
            <p className="text-sm text-muted-foreground">Total Classes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-800">{totalHours}h</p>
            <p className="text-sm text-muted-foreground">Teaching Hours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-800">
              {new Set(
                filterSemester === 'all' 
                  ? timetableEntries.map(e => e.venue)
                  : timetableEntries.filter(e => e.semester === filterSemester).map(e => e.venue)
              ).size}
            </p>
            <p className="text-sm text-muted-foreground">Different Venues</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-800">
              {new Set(
                filterSemester === 'all' 
                  ? timetableEntries.map(e => e.program_name)
                  : timetableEntries.filter(e => e.semester === filterSemester).map(e => e.program_name)
              ).size}
            </p>
            <p className="text-sm text-muted-foreground">Programs Teaching</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Weekly Teaching Schedule
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
                      isToday(day) ? 'bg-green-50 text-green-800' : 'text-gray-600'
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
                          isToday(day) ? 'bg-green-50/30' : ''
                        }`}
                      >
                        {dayEntries.map(entry => (
                          <div
                            key={entry.id}
                            onClick={() => setSelectedEntry(entry)}
                            className="bg-green-100 hover:bg-green-200 rounded p-2 mb-1 cursor-pointer transition-colors"
                          >
                            <div className="text-xs font-medium text-green-900 truncate">
                              {entry.program_name}
                            </div>
                            <div className="text-xs text-green-700 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {entry.time_start}-{entry.time_end}
                            </div>
                            <div className="text-xs text-green-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {entry.venue}
                            </div>
                            <div className="mt-1">
                              <span className={`text-xs px-1 py-0.5 rounded ${
                                entry.semester === 1 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                S{entry.semester}
                              </span>
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
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
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
                <h3 className="font-semibold text-lg text-green-800 mb-2">
                  {selectedEntry.program_name}
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm text-gray-600">
                      {selectedEntry.time_start} - {selectedEntry.time_end}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Venue</p>
                    <p className="text-sm text-gray-600">{selectedEntry.venue}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Course</p>
                    <p className="text-sm text-gray-600">{selectedEntry.course_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-green-600" />
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
              onClick={fetchLecturerSchedule}
              className="bg-green-600 hover:bg-green-700"
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

export default MySchedule;
