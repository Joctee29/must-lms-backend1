import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Eye,
  Users,
  CalendarDays,
  Building
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

interface Program {
  id: number;
  name: string;
  course_name: string;
  department_name: string;
  college_name: string;
  lecturer_name: string;
  semester: number;
}

interface Lecturer {
  id: number;
  name: string;
  specialization: string;
  department: string;
  college: string;
}

interface Venue {
  id: number;
  name: string;
  short_name: string;
  capacity: number;
  type: string;
  building: string;
  floor: string;
  description: string;
}

const TimetableManagement = () => {
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'weekly'>('weekly');
  
  const [newEntry, setNewEntry] = useState({
    day: '',
    time_start: '',
    time_end: '',
    program_id: '',
    lecturer_id: '',
    venue: '',
    semester: 1,
    academic_year: '2024/2025'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Fetch data
  useEffect(() => {
    fetchTimetableEntries();
    fetchPrograms();
    fetchLecturers();
    fetchVenues();
  }, []);

  const fetchTimetableEntries = async () => {
    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/timetable');
      if (response.ok) {
        const result = await response.json();
        setTimetableEntries(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      // Fallback data for demonstration
      setTimetableEntries([
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
          academic_year: '2024/2025'
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
          academic_year: '2024/2025'
        }
      ]);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/programs');
      if (response.ok) {
        const result = await response.json();
        setPrograms(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      // Fallback programs
      setPrograms([
        {
          id: 1,
          name: 'Introduction to Programming',
          course_name: 'Computer Science',
          department_name: 'Computer Science',
          college_name: 'College of Informatics',
          lecturer_name: 'Dr. John Mwalimu',
          semester: 1
        },
        {
          id: 2,
          name: 'Database Management Systems',
          course_name: 'Computer Science',
          department_name: 'Computer Science',
          college_name: 'College of Informatics',
          lecturer_name: 'Dr. Mary Lyimo',
          semester: 1
        }
      ]);
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/lecturers');
      if (response.ok) {
        const result = await response.json();
        setLecturers(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      // Fallback lecturers
      setLecturers([
        {
          id: 1,
          name: 'Dr. John Mwalimu',
          specialization: 'Computer Science',
          department: 'Computer Science',
          college: 'College of Informatics'
        },
        {
          id: 2,
          name: 'Dr. Mary Lyimo',
          specialization: 'Database Systems',
          department: 'Computer Science',
          college: 'College of Informatics'
        }
      ]);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/venues');
      if (response.ok) {
        const result = await response.json();
        setVenues(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
      // Fallback venues
      setVenues([
        {
          id: 1,
          name: 'Computer Laboratory 1',
          short_name: 'Comp Lab 1',
          capacity: 50,
          type: 'laboratory',
          building: 'Main Building',
          floor: 'Ground Floor',
          description: 'Computer lab with 50 workstations'
        },
        {
          id: 2,
          name: 'Lecture Hall A',
          short_name: 'LH A',
          capacity: 100,
          type: 'lecture_hall',
          building: 'Academic Block',
          floor: 'First Floor',
          description: 'Large lecture hall for general classes'
        },
        {
          id: 3,
          name: 'Physics Laboratory',
          short_name: 'Physics Lab',
          capacity: 30,
          type: 'laboratory',
          building: 'Science Block',
          floor: 'Second Floor',
          description: 'Physics experiments and practicals'
        }
      ]);
    }
  };

  const handleCreateEntry = async () => {
    if (!newEntry.day || !newEntry.time_start || !newEntry.time_end || !newEntry.program_id || !newEntry.lecturer_id || !newEntry.venue) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedProgram = programs.find(p => p.id.toString() === newEntry.program_id);
    const selectedLecturer = lecturers.find(l => l.id.toString() === newEntry.lecturer_id);

    if (!selectedProgram || !selectedLecturer) {
      alert('Invalid program or lecturer selection');
      return;
    }

    const entryData = {
      day: newEntry.day,
      time_start: newEntry.time_start,
      time_end: newEntry.time_end,
      program_name: selectedProgram.name,
      lecturer_name: selectedLecturer.name,
      venue: newEntry.venue,
      course_name: selectedProgram.course_name,
      department_name: selectedProgram.department_name,
      college_name: selectedProgram.college_name,
      semester: newEntry.semester,
      academic_year: newEntry.academic_year
    };

    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
      });

      if (response.ok) {
        const result = await response.json();
        setTimetableEntries([...timetableEntries, result.data]);
        alert('Timetable entry created successfully!');
      } else {
        throw new Error('Failed to create entry');
      }
    } catch (error) {
      // Fallback - add to local state
      const newEntryWithId = {
        id: Date.now(),
        ...entryData
      };
      setTimetableEntries([...timetableEntries, newEntryWithId]);
      alert('Timetable entry created locally (server not available)');
    }

    // Reset form
    setNewEntry({
      day: '',
      time_start: '',
      time_end: '',
      program_id: '',
      lecturer_id: '',
      venue: '',
      semester: 1,
      academic_year: '2024/2025'
    });
    setShowCreateForm(false);
  };

  const handleDeleteEntry = async (id: number) => {
    if (!confirm('Are you sure you want to delete this timetable entry?')) return;

    try {
      const response = await fetch(`https://must-lms-backend.onrender.com/api/timetable/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTimetableEntries(timetableEntries.filter(entry => entry.id !== id));
        alert('Timetable entry deleted successfully!');
      } else {
        throw new Error('Failed to delete entry');
      }
    } catch (error) {
      // Fallback - remove from local state
      setTimetableEntries(timetableEntries.filter(entry => entry.id !== id));
      alert('Timetable entry deleted locally (server not available)');
    }
  };

  const getEntriesForDay = (day: string) => {
    return timetableEntries
      .filter(entry => entry.day === day)
      .sort((a, b) => a.time_start.localeCompare(b.time_start));
  };

  const renderWeeklyView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
      {days.map(day => (
        <Card key={day} className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-center bg-green-50 py-2 rounded">
              {day}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {getEntriesForDay(day).map(entry => (
              <div key={entry.id} className="p-2 bg-green-50 rounded-lg border border-green-200 text-xs">
                <div className="font-semibold text-green-800 mb-1">{entry.time_start} - {entry.time_end}</div>
                <div className="text-green-700 mb-1">{entry.program_name}</div>
                <div className="text-green-600 mb-1">{entry.lecturer_name}</div>
                <div className="flex items-center text-green-600 mb-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {entry.venue}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded">
                    Sem {entry.semester}
                  </span>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                      onClick={() => setEditingEntry(entry)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {getEntriesForDay(day).length === 0 && (
              <div className="text-center text-gray-400 py-4 text-xs">
                No classes scheduled
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {timetableEntries.map(entry => (
        <Card key={entry.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">{entry.day}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span>{entry.time_start} - {entry.time_end}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{entry.program_name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span>{entry.lecturer_name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span>{entry.venue}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">
                    {entry.college_name} → {entry.department_name} → {entry.course_name}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-green-600 hover:text-green-700"
                  onClick={() => setEditingEntry(entry)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteEntry(entry.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-green-600" />
            Timetable Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage weekly schedules for all programs, lecturers, and venues
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'weekly' ? 'default' : 'outline'}
            onClick={() => setViewMode('weekly')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Weekly View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <Eye className="h-4 w-4 mr-2" />
            List View
          </Button>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CalendarDays className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{timetableEntries.length}</p>
            <p className="text-sm text-muted-foreground">Total Schedules</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{new Set(timetableEntries.map(e => e.lecturer_name)).size}</p>
            <p className="text-sm text-muted-foreground">Active Lecturers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{new Set(timetableEntries.map(e => e.program_name)).size}</p>
            <p className="text-sm text-muted-foreground">Programs Scheduled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{new Set(timetableEntries.map(e => e.venue)).size}</p>
            <p className="text-sm text-muted-foreground">Venues Used</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {viewMode === 'weekly' ? renderWeeklyView() : renderListView()}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Add New Schedule Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="day">Day</Label>
                  <select
                    id="day"
                    value={newEntry.day}
                    onChange={(e) => setNewEntry({...newEntry, day: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Day</option>
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <select
                    id="semester"
                    value={newEntry.semester}
                    onChange={(e) => setNewEntry({...newEntry, semester: parseInt(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time_start">Start Time</Label>
                  <select
                    id="time_start"
                    value={newEntry.time_start}
                    onChange={(e) => setNewEntry({...newEntry, time_start: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Start Time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="time_end">End Time</Label>
                  <select
                    id="time_end"
                    value={newEntry.time_end}
                    onChange={(e) => setNewEntry({...newEntry, time_end: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select End Time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="program">Program</Label>
                <select
                  id="program"
                  value={newEntry.program_id}
                  onChange={(e) => setNewEntry({...newEntry, program_id: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Program</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name} - {program.course_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="lecturer">Lecturer</Label>
                <select
                  id="lecturer"
                  value={newEntry.lecturer_id}
                  onChange={(e) => setNewEntry({...newEntry, lecturer_id: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Lecturer</option>
                  {lecturers.map(lecturer => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.name} - {lecturer.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="venue">Venue</Label>
                <select
                  id="venue"
                  value={newEntry.venue}
                  onChange={(e) => setNewEntry({...newEntry, venue: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Venue</option>
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.name}>
                      {venue.name} ({venue.short_name}) - {venue.type} - Capacity: {venue.capacity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="academic_year">Academic Year</Label>
                <Input
                  id="academic_year"
                  value={newEntry.academic_year}
                  onChange={(e) => setNewEntry({...newEntry, academic_year: e.target.value})}
                  placeholder="e.g., 2024/2025"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateEntry}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TimetableManagement;
