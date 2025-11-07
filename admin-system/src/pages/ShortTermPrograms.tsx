import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  Plus, 
  Search, 
  Calendar,
  Users,
  BookOpen,
  AlertCircle,
  Trash2,
  Building,
  GraduationCap,
  CheckCircle,
  XCircle
} from "lucide-react";

export const ShortTermPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [newProgram, setNewProgram] = useState({
    title: "",
    description: "",
    duration_value: "",
    duration_unit: "days",
    start_date: "",
    target_type: "all",
    target_value: "",
    lecturer_id: "",
    lecturer_name: ""
  });

  // Target options data
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [regularPrograms, setRegularPrograms] = useState([]);
  const [lecturers, setLecturers] = useState([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch short-term programs
        const programsResponse = await fetch('https://must-lms-backend.onrender.com/api/short-term-programs');
        if (programsResponse.ok) {
          const result = await programsResponse.json();
          setPrograms(result.data || []);
        }

        // Fetch colleges
        const collegesResponse = await fetch('https://must-lms-backend.onrender.com/api/colleges');
        if (collegesResponse.ok) {
          const result = await collegesResponse.json();
          setColleges(result.data || []);
        }

        // Fetch departments
        const departmentsResponse = await fetch('https://must-lms-backend.onrender.com/api/departments');
        if (departmentsResponse.ok) {
          const result = await departmentsResponse.json();
          setDepartments(result.data || []);
        }

        // Fetch courses
        const coursesResponse = await fetch('https://must-lms-backend.onrender.com/api/courses');
        if (coursesResponse.ok) {
          const result = await coursesResponse.json();
          setCourses(result.data || []);
        }

        // Fetch regular programs (admin needs all programs)
        const regularProgramsResponse = await fetch('https://must-lms-backend.onrender.com/api/programs?user_type=admin');
        if (regularProgramsResponse.ok) {
          const result = await regularProgramsResponse.json();
          console.log('Regular programs loaded for target selection:', result.data?.length || 0);
          setRegularPrograms(result.data || []);
        } else {
          console.error('Failed to fetch regular programs for target selection');
        }

        // Fetch lecturers
        const lecturersResponse = await fetch('https://must-lms-backend.onrender.com/api/lecturers');
        if (lecturersResponse.ok) {
          const result = await lecturersResponse.json();
          setLecturers(result.data || []);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateEndDate = (startDate, durationValue, durationUnit) => {
    if (!startDate || !durationValue) return "";
    
    const start = new Date(startDate);
    let end = new Date(start);
    
    switch (durationUnit) {
      case "days":
        end.setDate(start.getDate() + parseInt(durationValue));
        break;
      case "weeks":
        end.setDate(start.getDate() + (parseInt(durationValue) * 7));
        break;
      case "months":
        end.setMonth(start.getMonth() + parseInt(durationValue));
        break;
      default:
        break;
    }
    
    return end.toISOString().split('T')[0];
  };

  const handleCreateProgram = async () => {
    if (!newProgram.title || !newProgram.duration_value || !newProgram.start_date || !newProgram.lecturer_name) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const endDate = calculateEndDate(newProgram.start_date, newProgram.duration_value, newProgram.duration_unit);
      
      const programData = {
        title: newProgram.title,
        description: newProgram.description,
        duration_value: parseInt(newProgram.duration_value),
        duration_unit: newProgram.duration_unit,
        start_date: newProgram.start_date,
        end_date: endDate,
        target_type: newProgram.target_type,
        target_value: newProgram.target_value || null,
        lecturer_id: newProgram.lecturer_id || null,
        lecturer_name: newProgram.lecturer_name,
        created_by: currentUser.username || 'Admin',
        created_by_id: currentUser.id || null
      };

      console.log('=== CREATING SHORT-TERM PROGRAM ===');
      console.log('Program Data:', programData);

      const response = await fetch('https://must-lms-backend.onrender.com/api/short-term-programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(programData)
      });

      if (response.ok) {
        const result = await response.json();
        setPrograms([result.data, ...programs]);
        
        // Reset form
        setNewProgram({
          title: "",
          description: "",
          duration_value: "",
          duration_unit: "days",
          start_date: "",
          target_type: "all",
          target_value: "",
          lecturer_id: "",
          lecturer_name: ""
        });
        setShowCreateForm(false);
        
        alert('Short-term program created successfully!');
      } else {
        alert('Failed to create program');
      }
    } catch (error) {
      console.error('Error creating program:', error);
      alert('Failed to create program');
    }
  };

  const handleDeleteProgram = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this program?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`https://must-lms-backend.onrender.com/api/short-term-programs/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setPrograms(programs.filter(p => p.id !== id));
        alert('Program deleted successfully!');
      } else {
        alert('Failed to delete program');
      }
    } catch (error) {
      console.error('Error deleting program:', error);
      alert('Failed to delete program');
    }
  };

  const getTargetOptions = () => {
    switch (newProgram.target_type) {
      case "college":
        return colleges.map(c => ({ value: c.name, label: c.name }));
      case "department":
        return departments.map(d => ({ value: d.name, label: d.name }));
      case "course":
        return courses.map(c => ({ value: c.name, label: c.name }));
      case "program":
        return regularPrograms.map(p => ({ value: p.name, label: p.name }));
      default:
        return [];
    }
  };

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case "all": return <Users className="h-4 w-4" />;
      case "college": return <Building className="h-4 w-4" />;
      case "department": return <BookOpen className="h-4 w-4" />;
      case "course": return <GraduationCap className="h-4 w-4" />;
      case "program": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTargetLabel = (targetType: string, targetValue: string) => {
    switch (targetType) {
      case "all": return "All Students";
      case "college": return `College: ${targetValue}`;
      case "department": return `Department: ${targetValue}`;
      case "course": return `Course: ${targetValue}`;
      case "program": return `Program: ${targetValue}`;
      default: return "General";
    }
  };

  const getStatusBadge = (program) => {
    const now = new Date();
    const endDate = new Date(program.end_date);
    
    if (program.status === 'expired' || now > endDate) {
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Expired</Badge>;
    }
    
    return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Active</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading short-term programs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="h-8 w-8 text-purple-600" />
            Short-Term Programs
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage short-duration programs for targeted student groups
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Program
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Short-Term Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Program Title *</Label>
                <Input
                  id="title"
                  value={newProgram.title}
                  onChange={(e) => setNewProgram({...newProgram, title: e.target.value})}
                  placeholder="Enter program title"
                />
              </div>
              <div>
                <Label htmlFor="lecturer">Assign Lecturer *</Label>
                <Select
                  value={newProgram.lecturer_name}
                  onValueChange={(value) => {
                    const lecturer = lecturers.find(l => l.name === value);
                    setNewProgram({
                      ...newProgram, 
                      lecturer_name: value,
                      lecturer_id: lecturer?.id || null
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lecturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturers.map((lecturer) => (
                      <SelectItem key={lecturer.id} value={lecturer.name}>
                        {lecturer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProgram.description}
                onChange={(e) => setNewProgram({...newProgram, description: e.target.value})}
                placeholder="Enter program description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="duration_value">Duration *</Label>
                <Input
                  id="duration_value"
                  type="number"
                  min="1"
                  value={newProgram.duration_value}
                  onChange={(e) => setNewProgram({...newProgram, duration_value: e.target.value})}
                  placeholder="Enter duration"
                />
              </div>
              <div>
                <Label htmlFor="duration_unit">Unit *</Label>
                <Select
                  value={newProgram.duration_unit}
                  onValueChange={(value) => setNewProgram({...newProgram, duration_unit: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newProgram.start_date}
                  onChange={(e) => setNewProgram({...newProgram, start_date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_type">Target Audience *</Label>
                <Select
                  value={newProgram.target_type}
                  onValueChange={(value) => setNewProgram({...newProgram, target_type: value, target_value: ""})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="college">Specific College</SelectItem>
                    <SelectItem value="department">Specific Department</SelectItem>
                    <SelectItem value="course">Specific Course</SelectItem>
                    <SelectItem value="program">Specific Program</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newProgram.target_type !== "all" && (
                <div>
                  <Label htmlFor="target_value">Select Target</Label>
                  <Select
                    value={newProgram.target_value}
                    onValueChange={(value) => setNewProgram({...newProgram, target_value: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      {getTargetOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateProgram}>Create Program</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search programs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Programs List */}
      <div className="space-y-4">
        {filteredPrograms.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No programs found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "Create your first short-term program"}
            </p>
          </div>
        ) : (
          filteredPrograms.map((program) => (
            <Card key={program.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{program.title}</h3>
                      {getStatusBadge(program)}
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getTargetIcon(program.target_type)}
                        {getTargetLabel(program.target_type, program.target_value)}
                      </Badge>
                    </div>
                    
                    {program.description && (
                      <p className="text-muted-foreground mb-3">{program.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Duration:</span>
                        <p>{program.duration_value} {program.duration_unit}</p>
                      </div>
                      <div>
                        <span className="font-medium">Start Date:</span>
                        <p>{formatDate(program.start_date)}</p>
                      </div>
                      <div>
                        <span className="font-medium">End Date:</span>
                        <p>{formatDate(program.end_date)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Lecturer:</span>
                        <p>{program.lecturer_name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProgram(program.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
