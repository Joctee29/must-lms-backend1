import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Eye,
  Upload,
  Type,
  Send,
  Edit,
  Trash2,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Assignments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'view-submissions'
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [lecturerPrograms, setLecturerPrograms] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    program: "",
    deadline: "",
    submissionType: "text", // 'text' or 'pdf'
    maxPoints: 100
  });

  // Fetch lecturer programs and assignments
  useEffect(() => {
    const fetchLecturerData = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        console.log('=== FETCHING LECTURER DATA ===');
        console.log('Current User from localStorage:', currentUser);
        console.log('User ID:', currentUser.id);
        console.log('Username:', currentUser.username);
        
        if (!currentUser.id) {
          console.error('❌ No lecturer ID found in currentUser');
          alert('Session error: Please log out and log in again.');
          return;
        }
        
        // Fetch lecturer programs
        console.log('Fetching programs for lecturer ID:', currentUser.id);
        const programsResponse = await fetch(`https://must-lms-backend.onrender.com/api/lecturer-programs?lecturer_id=${currentUser.id}`);
        if (programsResponse.ok) {
          const programsResult = await programsResponse.json();
          console.log('Programs fetched:', programsResult.data);
          setLecturerPrograms(programsResult.data || []);
        } else {
          console.error('Failed to fetch programs:', programsResponse.status);
        }
        
        // Fetch assignments
        console.log('Fetching assignments for lecturer ID:', currentUser.id);
        const assignmentsResponse = await fetch(`https://must-lms-backend.onrender.com/api/assignments?lecturer_id=${currentUser.id}`);
        if (assignmentsResponse.ok) {
          const assignmentsResult = await assignmentsResponse.json();
          console.log('Assignments fetched:', assignmentsResult.data);
          setAssignments(assignmentsResult.data || []);
        } else {
          console.error('Failed to fetch assignments:', assignmentsResponse.status);
        }
      } catch (error) {
        console.error('❌ Error fetching lecturer data:', error);
        // Fallback programs
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setLecturerPrograms([
          { id: 1, name: 'Computer Science', lecturer_name: currentUser.username },
          { id: 2, name: 'Software Engineering', lecturer_name: currentUser.username },
          { id: 3, name: 'Information Technology', lecturer_name: currentUser.username }
        ]);
      }
    };

    fetchLecturerData();
  }, []);

  // Create new assignment
  const handleCreateAssignment = async () => {
    try {
      // Validation
      if (!newAssignment.title || !newAssignment.program || !newAssignment.deadline) {
        alert('Please fill in all required fields (Title, Program, Deadline)');
        return;
      }

      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      console.log('=== CREATING ASSIGNMENT DEBUG ===');
      console.log('Current User:', JSON.stringify(currentUser, null, 2));
      console.log('Current User ID:', currentUser.id, '(type:', typeof currentUser.id, ')');
      console.log('Current User Username:', currentUser.username, '(type:', typeof currentUser.username, ')');
      console.log('Current User Name:', currentUser.name);
      console.log('New Assignment Data:', JSON.stringify(newAssignment, null, 2));
      
      // Validate lecturer information
      if (!currentUser.id) {
        console.error('❌ Missing lecturer ID');
        alert('Error: Lecturer ID not found. Please log out and log in again.');
        return;
      }
      
      if (!currentUser.username && !currentUser.name) {
        console.error('❌ Missing lecturer username/name');
        alert('Error: Lecturer information not found. Please log out and log in again.');
        return;
      }
      
      const assignmentData = {
        title: newAssignment.title,
        description: newAssignment.description || '',
        program_name: newAssignment.program,
        deadline: newAssignment.deadline,
        submission_type: newAssignment.submissionType || 'text',
        max_points: parseInt(newAssignment.maxPoints) || 100,
        lecturer_id: parseInt(currentUser.id),
        lecturer_name: currentUser.username || currentUser.name,
        status: 'active'
      };

      console.log('✅ Assignment Data to Send:', JSON.stringify(assignmentData, null, 2));
      console.log('Lecturer ID:', assignmentData.lecturer_id, '(type:', typeof assignmentData.lecturer_id, ')');
      console.log('Lecturer Name:', assignmentData.lecturer_name, '(type:', typeof assignmentData.lecturer_name, ')');
      console.log('Max Points:', assignmentData.max_points, '(type:', typeof assignmentData.max_points, ')');

      const response = await fetch('https://must-lms-backend.onrender.com/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      });

      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);

      const responseText = await response.text();
      console.log('Raw Response:', responseText);
      
      if (response.ok) {
        const result = JSON.parse(responseText);
        console.log('Assignment Created Successfully:', result);
        
        if (result.success && result.data) {
          setAssignments(prev => [...prev, result.data]);
          setNewAssignment({
            title: "",
            description: "",
            program: "",
            deadline: "",
            submissionType: "text",
            maxPoints: 100
          });
          setShowCreateForm(false);
          alert('Assignment created and sent to students successfully!');
        } else {
          console.error('Backend returned success=false:', result);
          alert(`Failed to create assignment: ${result.error || result.message || 'Unknown error'}`);
        }
      } else {
        console.error('HTTP Error:', response.status, response.statusText);
        console.error('Response Body:', responseText);
        
        let errorMessage = 'Server error';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        
        alert(`Failed to create assignment (${response.status}): ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert(`Error creating assignment: ${error.message || 'Please check your connection and try again'}`);
    }
  };

  // View assignment submissions
  const handleViewSubmissions = async (assignment) => {
    try {
      const response = await fetch(`https://must-lms-backend.onrender.com/api/assignment-submissions?assignment_id=${assignment.id}`);
      if (response.ok) {
        const result = await response.json();
        setSelectedAssignment({
          ...assignment,
          submissions: result.data || []
        });
        setViewMode('view-submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment =>
    assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.program_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "expired": return "bg-gray-100 text-gray-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">
            Create and manage course assignments
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-primary to-secondary text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </div>


      {/* Create Assignment Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Assignment Title</label>
                <Input
                  placeholder="Enter assignment title..."
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Program</label>
                <select
                  value={newAssignment.program}
                  onChange={(e) => setNewAssignment({...newAssignment, program: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Program</option>
                  {lecturerPrograms.map((program) => (
                    <option key={program.id} value={program.name}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Deadline</label>
                <Input
                  type="datetime-local"
                  value={newAssignment.deadline}
                  onChange={(e) => setNewAssignment({...newAssignment, deadline: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Points</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={newAssignment.maxPoints}
                  onChange={(e) => setNewAssignment({...newAssignment, maxPoints: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Submission Type</label>
                <select
                  value={newAssignment.submissionType}
                  onChange={(e) => setNewAssignment({...newAssignment, submissionType: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="text">Text (Type in portal)</option>
                  <option value="pdf">PDF Upload</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                placeholder="Assignment description and instructions..."
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                className="w-full border rounded px-3 py-2 h-24"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateAssignment} disabled={!newAssignment.title || !newAssignment.program}>
                <Send className="mr-2 h-4 w-4" />
                Send Assignment to Students
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {filteredAssignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{assignment.course}</p>
                </div>
                <Badge className={getStatusColor(assignment.status)}>
                  {assignment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">{assignment.dueDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Submissions</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.submissions}/{assignment.totalStudents}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Graded</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.graded}/{assignment.submissions}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Average Score</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.averageScore}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Submission Progress</span>
                  <span>{Math.round((assignment.submissions / assignment.totalStudents) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(assignment.submissions / assignment.totalStudents) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View Submissions
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Grade
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Extend Deadline
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
