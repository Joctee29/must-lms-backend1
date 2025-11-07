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
  Download,
  ArrowLeft
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
        
        console.log('=== LECTURER ASSIGNMENTS DEBUG ===');
        console.log('Current User:', currentUser);
        
        if (!currentUser.username) {
          console.error('No username found for current user');
          setLecturerPrograms([]);
          return;
        }
        
        let allPrograms = [];
        
        // Fetch lecturer's regular programs using lecturer_username parameter
        try {
          const programsResponse = await fetch(`https://must-lms-backend.onrender.com/api/programs?lecturer_username=${encodeURIComponent(currentUser.username)}`);
          
          if (programsResponse.ok) {
            const programsResult = await programsResponse.json();
            console.log('Regular Programs from API:', programsResult);
            
            if (programsResult.success && programsResult.data) {
              allPrograms = [...programsResult.data];
              console.log(`✅ Found ${programsResult.data.length} regular programs`);
            }
          } else {
            console.error('Failed to fetch regular programs:', programsResponse.status);
          }
        } catch (error) {
          console.error('Error fetching regular programs:', error);
        }
        
        // Fetch lecturer's short-term programs using lecturer_username parameter
        try {
          const shortTermResponse = await fetch(`https://must-lms-backend.onrender.com/api/short-term-programs?lecturer_username=${encodeURIComponent(currentUser.username)}`);
          
          if (shortTermResponse.ok) {
            const shortTermResult = await shortTermResponse.json();
            console.log('Short-Term Programs from API:', shortTermResult);
            
            if (shortTermResult.success && shortTermResult.data) {
              // Convert short-term programs to same format as regular programs
              const formattedShortTermPrograms = shortTermResult.data.map(program => ({
                id: `short-${program.id}`,
                name: program.title,
                lecturer_name: program.lecturer_name,
                lecturer_id: program.lecturer_id,
                type: 'short-term'
              }));
              
              allPrograms = [...allPrograms, ...formattedShortTermPrograms];
              console.log(`✅ Found ${shortTermResult.data.length} short-term programs`);
            }
          } else {
            console.error('Failed to fetch short-term programs:', shortTermResponse.status);
          }
        } catch (error) {
          console.error('Error fetching short-term programs:', error);
        }
        
        console.log('=== TOTAL PROGRAMS LOADED ===');
        console.log('Total Programs (Regular + Short-Term):', allPrograms.length);
        console.log('Programs:', allPrograms);
        
        if (allPrograms.length === 0) {
          console.warn('⚠️ No programs found for lecturer:', currentUser.username);
          console.warn('Make sure lecturer is assigned to programs in the database');
        }
        
        setLecturerPrograms(allPrograms);
        
        // Fetch assignments
        const assignmentsResponse = await fetch(`https://must-lms-backend.onrender.com/api/assignments?lecturer_id=${currentUser.id}`);
        if (assignmentsResponse.ok) {
          const assignmentsResult = await assignmentsResponse.json();
          console.log('Assignments from API:', assignmentsResult.data);
          
          // Add submission count to each assignment
          const assignmentsWithCounts = await Promise.all(
            (assignmentsResult.data || []).map(async (assignment) => {
              try {
                const submissionsResponse = await fetch(`https://must-lms-backend.onrender.com/api/assignment-submissions?assignment_id=${assignment.id}`);
                if (submissionsResponse.ok) {
                  const submissionsResult = await submissionsResponse.json();
                  return {
                    ...assignment,
                    submission_count: submissionsResult.data?.length || 0
                  };
                }
              } catch (error) {
                console.error('Error fetching submission count:', error);
              }
              return {
                ...assignment,
                submission_count: 0
              };
            })
          );
          
          console.log('Assignments with submission counts:', assignmentsWithCounts);
          setAssignments(assignmentsWithCounts);
        } else {
          console.log('Assignments API failed');
        }
      } catch (error) {
        console.error('Error fetching lecturer data:', error);
        // Fallback programs
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const fallbackPrograms = [
          { id: 1, name: 'Computer Science', lecturer_name: currentUser.username },
          { id: 2, name: 'Software Engineering', lecturer_name: currentUser.username },
          { id: 3, name: 'Information Technology', lecturer_name: currentUser.username }
        ];
        setLecturerPrograms(fallbackPrograms);
        console.log('Set fallback programs:', fallbackPrograms);
      }
    };

    fetchLecturerData();
  }, []);

  // Create new assignment
  const handleCreateAssignment = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const assignmentData = {
        title: newAssignment.title,
        description: newAssignment.description,
        program_name: newAssignment.program,
        deadline: newAssignment.deadline,
        submission_type: newAssignment.submissionType,
        max_points: newAssignment.maxPoints,
        lecturer_id: currentUser.id,
        lecturer_name: currentUser.username
      };

      const response = await fetch('https://must-lms-backend.onrender.com/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      });

      if (response.ok) {
        const result = await response.json();
        setAssignments(prev => [...prev, result.data]);
        setNewAssignment({
          title: "",
          description: "",
          program: "",
          deadline: "",
          submissionType: "text",
          maxPoints: 100
        });
        setViewMode('list');
        alert('Assignment created successfully!');
      } else {
        alert('Failed to create assignment. Please try again.');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Error creating assignment. Please try again.');
    }
  };

  // View assignment submissions
  const handleViewSubmissions = async (assignment) => {
    console.log('=== VIEW SUBMISSIONS DEBUG ===');
    console.log('Assignment to view:', assignment);
    
    try {
      const response = await fetch(`https://must-lms-backend.onrender.com/api/assignment-submissions?assignment_id=${assignment.id}`);
      console.log('Submissions API Response Status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Submissions from API:', result.data);
        setSelectedAssignment({
          ...assignment,
          submissions: result.data || []
        });
        setViewMode('view-submissions');
      } else {
        console.error('Failed to fetch submissions');
        // Show assignment with empty submissions for now
        setSelectedAssignment({
          ...assignment,
          submissions: []
        });
        setViewMode('view-submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      // Show assignment with empty submissions for now
      setSelectedAssignment({
        ...assignment,
        submissions: []
      });
      setViewMode('view-submissions');
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (assignment) => {
    if (!confirm(`Are you sure you want to delete "${assignment.title}"? This will also delete all student submissions.`)) {
      return;
    }

    console.log('=== DELETE ASSIGNMENT DEBUG ===');
    console.log('Assignment to delete:', assignment);

    try {
      const response = await fetch(`https://must-lms-backend.onrender.com/api/assignments/${assignment.id}`, {
        method: 'DELETE'
      });

      console.log('Delete Response Status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Delete Success:', result);
        // Remove from assignments list
        setAssignments(prev => prev.filter(a => a.id !== assignment.id));
        alert('Assignment deleted successfully!');
      } else {
        alert('Failed to delete assignment. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Error deleting assignment. Please try again.');
    }
  };

  // Edit assignment
  const handleEditAssignment = (assignment) => {
    console.log('=== EDIT ASSIGNMENT DEBUG ===');
    console.log('Assignment to edit:', assignment);
    
    setNewAssignment({
      title: assignment.title,
      description: assignment.description,
      program: assignment.program_name,
      deadline: assignment.deadline ? assignment.deadline.split('T')[0] + 'T' + assignment.deadline.split('T')[1].substring(0, 5) : '',
      submissionType: assignment.submission_type,
      maxPoints: assignment.max_points
    });
    setSelectedAssignment(assignment);
    setViewMode('edit');
  };

  // Update assignment
  const handleUpdateAssignment = async () => {
    if (!selectedAssignment) return;

    console.log('=== UPDATE ASSIGNMENT DEBUG ===');
    console.log('Assignment to update:', selectedAssignment);
    console.log('New Assignment Data:', newAssignment);
    
    try {
      const assignmentData = {
        title: newAssignment.title,
        description: newAssignment.description,
        program_name: newAssignment.program,
        deadline: newAssignment.deadline,
        submission_type: newAssignment.submissionType,
        max_points: newAssignment.maxPoints
      };

      console.log('Update Data to Send:', assignmentData);

      const response = await fetch(`https://must-lms-backend.onrender.com/api/assignments/${selectedAssignment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      });

      console.log('Update Response Status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Update Success:', result);
        // Update assignments list
        setAssignments(prev => prev.map(a => a.id === selectedAssignment.id ? result.data : a));
        setNewAssignment({
          title: "",
          description: "",
          program: "",
          deadline: "",
          submissionType: "text",
          maxPoints: 100
        });
        setSelectedAssignment(null);
        setViewMode('list');
        alert('Assignment updated successfully!');
      } else {
        const errorText = await response.text();
        console.error('Update Error Response:', errorText);
        alert('Failed to update assignment. Please try again.');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Error updating assignment. Please try again.');
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment =>
    assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.program_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "expired": return "bg-gray-100 text-gray-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  // CREATE ASSIGNMENT VIEW
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setViewMode('list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {viewMode === 'edit' ? 'Edit Assignment' : 'Create Assignment'}
            </h1>
            <p className="text-muted-foreground">
              {viewMode === 'edit' ? 'Update assignment details' : 'Create a new assignment for your students'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  placeholder="Enter assignment title..."
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="program">Select Program *</Label>
                <Select value={newAssignment.program} onValueChange={(value) => setNewAssignment({...newAssignment, program: value})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose program" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {lecturerPrograms.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        <p className="font-semibold">No programs available</p>
                        <p className="text-xs mt-1">Contact admin to assign programs</p>
                      </div>
                    ) : (
                      lecturerPrograms.map((program) => (
                        <SelectItem key={program.id} value={program.name}>
                          <div className="flex flex-col">
                            <span>{program.name}</span>
                            {program.type === 'short-term' && (
                              <span className="text-xs text-muted-foreground">Short-term program</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {lecturerPrograms.length} program(s) available
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={newAssignment.deadline}
                  onChange={(e) => setNewAssignment({...newAssignment, deadline: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="points">Maximum Points</Label>
                <Input
                  id="points"
                  type="number"
                  placeholder="100"
                  value={newAssignment.maxPoints}
                  onChange={(e) => setNewAssignment({...newAssignment, maxPoints: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="submissionType">Submission Type</Label>
              <Select value={newAssignment.submissionType} onValueChange={(value) => setNewAssignment({...newAssignment, submissionType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Text - Students type in portal
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      PDF Upload - Students upload file
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Assignment Description</Label>
              <Textarea
                id="description"
                placeholder="Enter assignment instructions and requirements..."
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                rows={6}
              />
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={viewMode === 'edit' ? handleUpdateAssignment : handleCreateAssignment} 
                disabled={!newAssignment.title || !newAssignment.program || !newAssignment.deadline}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {viewMode === 'edit' ? 'Update Assignment' : 'Send Assignment to Students'}
              </Button>
              <Button variant="outline" onClick={() => setViewMode('list')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // VIEW SUBMISSIONS VIEW
  if (viewMode === 'view-submissions' && selectedAssignment) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setViewMode('list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assignment Submissions</h1>
            <p className="text-muted-foreground">{selectedAssignment.title}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Submissions ({selectedAssignment.submissions.length})</span>
              <Badge className={getStatusColor(selectedAssignment.status)}>
                {selectedAssignment.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAssignment.submissions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedAssignment.submissions.map((submission) => (
                  <div key={submission.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{submission.student_name}</h4>
                        <p className="text-sm text-gray-500">{submission.student_registration}</p>
                        <p className="text-sm text-gray-500">Submitted: {new Date(submission.submitted_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {submission.submission_type === 'text' ? (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Type className="h-3 w-3 mr-1" />
                            Text
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            <Upload className="h-3 w-3 mr-1" />
                            PDF
                          </Badge>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                    {submission.submission_type === 'text' && submission.text_content && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border">
                        <p className="text-sm">{submission.text_content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // MAIN ASSIGNMENTS LIST VIEW
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">Create and manage course assignments</p>
        </div>
        <Button 
          onClick={() => setViewMode('create')}
          className="bg-gradient-to-r from-primary to-secondary text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search assignments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-6">
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments yet</h3>
              <p className="text-gray-500 text-center mb-4">
                Create your first assignment to get started
              </p>
              <Button onClick={() => setViewMode('create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{assignment.title}</h3>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status.toUpperCase()}
                      </Badge>
                      {assignment.submission_type === 'text' ? (
                        <Badge variant="outline">
                          <Type className="h-3 w-3 mr-1" />
                          Text
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Upload className="h-3 w-3 mr-1" />
                          PDF
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{assignment.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {assignment.program_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(assignment.deadline).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {assignment.submission_count || 0} submissions
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewSubmissions(assignment)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Submissions ({assignment.submission_count || 0})
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditAssignment(assignment)}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteAssignment(assignment)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
