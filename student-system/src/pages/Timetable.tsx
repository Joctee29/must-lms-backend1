import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  RefreshCw,
  CalendarDays,
  Building,
  GraduationCap
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

interface StudentData {
  id: number;
  name: string;
  course_id: number;
  course_name: string;
  department_name: string;
  college_name: string;
  current_semester: number;
  academic_year: string;
}

const Timetable = () => {
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState<string>("2024/2025");
  const [activeSemester, setActiveSemester] = useState<number>(1);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];
  const API_BASE_URL = 'https://must-lms-backend.onrender.com/api';

  // Track previous academic period to detect changes
  const previousPeriodRef = useRef<{ year: string; semester: number } | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  // Function to fetch active academic period
  const fetchActivePeriod = async () => {
    try {
      const periodResponse = await fetch(`${API_BASE_URL}/academic-periods/active`);
      if (periodResponse.ok) {
        const periodResult = await periodResponse.json();
        console.log('Academic Period Response (Timetable):', periodResult);
        const period = periodResult.data || periodResult;
        if (period && period.academic_year) {
          const year = period.academic_year as string;
          const sem = (period.semester as number) || 1;
          
          // Check if period has changed
          const periodChanged = 
            !previousPeriodRef.current ||
            previousPeriodRef.current.year !== year ||
            previousPeriodRef.current.semester !== sem;
          
          if (periodChanged) {
            console.log('📢 Academic period changed in Timetable! Old:', previousPeriodRef.current, 'New:', { year, sem });
            previousPeriodRef.current = { year, sem };
            setActiveAcademicYear(year);
            setActiveSemester(sem);
            return { year, sem, changed: true };
          }
          
          return { year, sem, changed: false };
        }
      }
    } catch (periodError) {
      console.error('Error fetching academic period for Timetable:', periodError);
    }
    return { year: activeAcademicYear, sem: activeSemester, changed: false };
  };

  useEffect(() => {
    fetchStudentTimetable();
  }, []);

  const fetchStudentTimetable = async () => {
    try {
      setLoading(true);
      console.log('=== STUDENT TIMETABLE DEBUG ===');
      console.log('Current User:', currentUser);
      console.log('Username:', currentUser.username);

      // Fetch active academic period first
      const periodData = await fetchActivePeriod();

      // 1. Get student information
      const studentsResponse = await fetch(`${API_BASE_URL}/students`);
      if (studentsResponse.ok) {
        const studentsResult = await studentsResponse.json();
        console.log('Students API Response:', studentsResult);
        console.log('Total Students:', studentsResult.data?.length);

        // Find current student
        const student = studentsResult.data?.find((s: any) => 
          s.name === currentUser.username || 
          s.email === currentUser.username ||
          s.registration_number === currentUser.username
        );

        console.log('Found Student:', student);
        console.log('Student Course ID:', student?.course_id);
        console.log('Student Course Name:', student?.course_name);

        if (student) {
          // Update student data with active academic period
          const updatedStudent = {
            ...student,
            academic_year: periodData.year,
            current_semester: periodData.sem
          };
          setStudentData(updatedStudent);

          // 2. Get programs for student's course
          const programsResponse = await fetch(`${API_BASE_URL}/programs`);
          if (programsResponse.ok) {
            const programsResult = await programsResponse.json();
            console.log('Programs API Response:', programsResult);

            // Filter programs for student's course
            const studentPrograms = programsResult.data?.filter((p: any) => 
              p.course_id === student.course_id
            ) || [];

            console.log('Student Programs:', studentPrograms);
            console.log('Student Programs Count:', studentPrograms.length);
            console.log('Program Names:', studentPrograms.map((p: any) => p.name));

            // 3. Get timetable entries for student's programs
            const timetableResponse = await fetch(`${API_BASE_URL}/timetable`);
            if (timetableResponse.ok) {
              const timetableResult = await timetableResponse.json();
              console.log('Timetable API Response:', timetableResult);
              console.log('Total Timetable Entries:', timetableResult.data?.length);
              console.log('All Program Names in Timetable:', timetableResult.data?.map((e: any) => e.program_name));

              // Filter timetable entries for student's programs
              const studentTimetable = timetableResult.data?.filter((entry: any) => {
                const match = studentPrograms.some((program: any) => program.name === entry.program_name);
                console.log(`Checking entry "${entry.program_name}": ${match ? 'MATCH' : 'NO MATCH'}`);
                return match;
              }) || [];

              console.log('Student Timetable Entries:', studentTimetable);
              console.log('Filtered Timetable Count:', studentTimetable.length);
              setTimetableEntries(studentTimetable);
            }
          }
        } else {
          console.log('Student not found, showing demo timetable');
          // Show demo timetable for testing
          const demoTimetable = [
            {
              id: 1,
              day: 'Monday',
              time_start: '08:00',
              time_end: '10:00',
              program_name: 'Introduction to Programming',
              lecturer_name: 'Dr. John Mwalimu',
              venue: 'Computer Lab 1',
              course_name: 'Computer Science',
              department_name: 'Computer Science',
              college_name: 'College of Informatics',
              semester: 1,
              academic_year: periodData.year
            },
            {
              id: 2,
              day: 'Tuesday',
              time_start: '10:00',
              time_end: '12:00',
              program_name: 'Database Management Systems',
              lecturer_name: 'Dr. Mary Lyimo',
              venue: 'Lecture Hall A',
              course_name: 'Computer Science',
              department_name: 'Computer Science',
              college_name: 'College of Informatics',
              semester: 1,
              academic_year: periodData.year
            },
            {
              id: 3,
              day: 'Wednesday',
              time_start: '14:00',
              time_end: '16:00',
              program_name: 'Data Structures and Algorithms',
              lecturer_name: 'Dr. Grace Kimaro',
              venue: 'Computer Lab 2',
              course_name: 'Computer Science',
              department_name: 'Computer Science',
              college_name: 'College of Informatics',
              semester: 1,
              academic_year: periodData.year
            },
            {
              id: 4,
              day: 'Thursday',
              time_start: '09:00',
              time_end: '11:00',
              program_name: 'Software Engineering',
              lecturer_name: 'Dr. Peter Moshi',
              venue: 'Lecture Hall B',
              course_name: 'Computer Science',
              department_name: 'Computer Science',
              college_name: 'College of Informatics',
              semester: 1,
              academic_year: periodData.year
            },
            {
              id: 5,
              day: 'Friday',
              time_start: '13:00',
              time_end: '15:00',
              program_name: 'Computer Networks',
              lecturer_name: 'Dr. Sarah Mbwana',
              venue: 'Network Lab',
              course_name: 'Computer Science',
              department_name: 'Computer Science',
              college_name: 'College of Informatics',
              semester: 1,
              academic_year: periodData.year
            }
          ];

          setTimetableEntries(demoTimetable);
          setStudentData({
            id: 1,
            name: currentUser.username || 'Student',
            course_id: 1,
            course_name: 'Computer Science',
            department_name: 'Computer Science',
            college_name: 'College of Informatics',
            current_semester: periodData.sem,
            academic_year: periodData.year
          });
        }
      }
    } catch (error) {
      console.error('Error fetching student timetable:', error);
      
      // Fetch period data for demo
      const periodData = await fetchActivePeriod();
      
      // Show demo timetable when server is unavailable
      const demoTimetable = [
        {
          id: 1,
          day: 'Monday',
          time_start: '08:00',
          time_end: '10:00',
          program_name: 'Introduction to Programming',
          lecturer_name: 'Dr. John Mwalimu',
          venue: 'Computer Lab 1',
          course_name: 'Computer Science',
          department_name: 'Computer Science',
          college_name: 'College of Informatics',
          semester: 1,
          academic_year: periodData.year
        },
        {
          id: 2,
          day: 'Tuesday',
          time_start: '10:00',
          time_end: '12:00',
          program_name: 'Database Management Systems',
          lecturer_name: 'Dr. Mary Lyimo',
          venue: 'Lecture Hall A',
          course_name: 'Computer Science',
          department_name: 'Computer Science',
          college_name: 'College of Informatics',
          semester: 1,
          academic_year: periodData.year
        }
      ];

      setTimetableEntries(demoTimetable);
      setStudentData({
        id: 1,
        name: currentUser.username || 'Student',
        course_id: 1,
        course_name: 'Computer Science',
        department_name: 'Computer Science',
        college_name: 'College of Informatics',
        current_semester: periodData.sem,
        academic_year: periodData.year
      });
    } finally {
      setLoading(false);
    }
  };

  // Setup polling to detect academic period changes
  useEffect(() => {
    // Poll every 30 seconds to check for academic period changes
    pollingIntervalRef.current = setInterval(async () => {
      console.log('🔄 Polling for academic period changes in Timetable...');
      const periodData = await fetchActivePeriod();
      
      if (periodData.changed && studentData) {
        console.log('✅ Academic period changed detected in Timetable! Updating...');
        // Update student data with new period
        setStudentData({
          ...studentData,
          academic_year: periodData.year,
          current_semester: periodData.sem
        });
        
        // Also update timetable entries
        setTimetableEntries(prev => prev.map(entry => ({
          ...entry,
          academic_year: periodData.year,
          semester: periodData.sem
        })));
      }
    }, 30000); // Poll every 30 seconds

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [studentData]);

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
    const uniqueLecturers = [...new Set(timetableEntries.map(entry => entry.lecturer_name))].length;
    const uniqueVenues = [...new Set(timetableEntries.map(entry => entry.venue))].length;
    
    return { totalClasses, uniqueLecturers, uniqueVenues };
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
            <span className="text-lg">Loading your timetable...</span>
          </div>
        </div>
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8 text-green-600" />
            My Timetable
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personalized class schedule
          </p>
        </div>
        
        <Button 
          onClick={fetchStudentTimetable}
          variant="outline"
          className="text-green-600 hover:text-green-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Student Information Card */}
      {studentData && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <GraduationCap className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">{studentData.name}</h3>
                  <p className="text-green-700">{studentData.course_name}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-green-700">
                  <Building className="h-4 w-4" />
                  <span className="text-sm">{studentData.college_name}</span>
                </div>
                <div className="flex items-center gap-2 text-green-600 mt-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">Semester {studentData.current_semester} • {studentData.academic_year}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalClasses}</p>
                <p className="text-sm text-muted-foreground">Total Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.uniqueLecturers}</p>
                <p className="text-sm text-muted-foreground">Lecturers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.uniqueVenues}</p>
                <p className="text-sm text-muted-foreground">Venues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Weekly Calendar View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Time slots header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                <div className="p-2 text-center font-medium text-sm bg-gray-50 rounded">Time</div>
                {days.map(day => (
                  <div 
                    key={day} 
                    className={`p-2 text-center font-medium text-sm rounded ${
                      isToday(day) 
                        ? 'bg-green-600 text-white' 
                        : 'bg-green-50 text-green-800'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Time slots grid */}
              {timeSlots.map(time => (
                <div key={time} className="grid grid-cols-7 gap-1 mb-1">
                  {/* Time column */}
                  <div className="p-2 text-center text-sm font-medium bg-gray-50 rounded flex items-center justify-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {time}
                  </div>
                  
                  {/* Day columns */}
                  {days.map(day => {
                    const entries = getEntriesForDayAndTime(day, time);
                    const hasEntry = entries.length > 0;
                    
                    return (
                      <div 
                        key={`${day}-${time}`} 
                        className={`p-2 min-h-[60px] rounded border transition-all cursor-pointer ${
                          hasEntry 
                            ? 'bg-green-100 border-green-300 hover:bg-green-200' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => hasEntry && setSelectedEntry(entries[0])}
                      >
                        {hasEntry && (
                          <div className="text-xs space-y-1">
                            <div className="font-semibold text-green-800 truncate">
                              {entries[0].program_name}
                            </div>
                            <div className="text-green-600 truncate">
                              {entries[0].lecturer_name}
                            </div>
                            <div className="text-green-500 truncate">
                              {entries[0].venue}
                            </div>
                          </div>
                        )}
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
                  <User className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Lecturer</p>
                    <p className="text-sm text-gray-600">{selectedEntry.lecturer_name}</p>
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
            <CalendarDays className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Classes Scheduled</h3>
            <p className="text-gray-500 mb-4">
              Your timetable is empty for this week. Check back later or contact your academic advisor.
            </p>
            <Button 
              onClick={fetchStudentTimetable}
              className="bg-green-600 hover:bg-green-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Timetable
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Timetable;
