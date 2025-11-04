import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, Clock, CheckCircle, AlertTriangle, Calendar, User, BookOpen, 
  Award, Upload, Type, Send, ArrowLeft, Download
} from "lucide-react";

interface Assignment {
  id: number;
  title: string;
  description: string;
  program_name: string;
  deadline: string;
  submission_type: 'text' | 'pdf';
  max_points: number;
  lecturer_name: string;
  status: 'active' | 'expired';
  created_at: string;
}

interface Submission {
  id: number;
  assignment_id: number;
  submission_type: 'text' | 'pdf';
  text_content?: string;
  file_path?: string;
  file_name?: string;
  submitted_at: string;
  points_awarded: number;
  feedback?: string;
}

export const StudentAssignments = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'submitted'>('available');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submittedAssignments, setSubmittedAssignments] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'submit'>('list');
  
  // Submission form state
  const [textSubmission, setTextSubmission] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchSubmittedAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      console.log('=== FETCHING ASSIGNMENTS ===');
      
      // Simple: Get ALL assignments first
      const response = await fetch('https://must-lms-backend.onrender.com/api/assignments');
      
      if (response.ok) {
        const result = await response.json();
        console.log('All assignments:', result.data);
        
        // Filter active assignments with proper deadline check
        const now = new Date();
        const activeAssignments = result.data?.filter(assignment => {
          const deadline = new Date(assignment.deadline);
          const isActive = assignment.status === 'active';
          const isNotExpired = deadline > now;
          
          console.log(`Assignment "${assignment.title}": Status=${assignment.status}, Deadline=${assignment.deadline}, Expired=${deadline <= now}`);
          
          return isActive && isNotExpired;
        }) || [];
        
        console.log('Active assignments:', activeAssignments);
        setAssignments(activeAssignments);
        
      } else {
        console.error('Failed to fetch assignments');
        setAssignments([]);
      }
      
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Set empty assignments on error
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittedAssignments = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!currentUser.id) {
        return;
      }

      // This would need a new endpoint to get student's submissions
      // For now, we'll use empty array
      setSubmittedAssignments([]);
    } catch (error) {
      console.error('Error fetching submitted assignments:', error);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;
    
    console.log('=== STUDENT SUBMISSION DEBUG ===');
    console.log('Selected Assignment:', selectedAssignment);
    console.log('Text Submission:', textSubmission);
    console.log('PDF File:', pdfFile);
    
    setSubmitting(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Use course name as program for submission matching
      const studentProgram = currentUser.program || currentUser.course || currentUser.course_name || 'Computer Science';
      
      const submissionData = {
        assignment_id: selectedAssignment.id,
        student_id: currentUser.id || 1,
        student_name: currentUser.username || 'Student',
        student_registration: currentUser.registration || currentUser.username || 'STU001/2024',
        student_program: studentProgram,
        submission_type: selectedAssignment.submission_type,
        text_content: selectedAssignment.submission_type === 'text' ? textSubmission : null,
        file_path: selectedAssignment.submission_type === 'pdf' && pdfFile ? `/uploads/${pdfFile.name}` : null,
        file_name: selectedAssignment.submission_type === 'pdf' && pdfFile ? pdfFile.name : null
      };

      console.log('Submission Data to Send:', submissionData);

      const response = await fetch('https://must-lms-backend.onrender.com/api/assignment-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      console.log('Submission Response Status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Submission Success:', result);
        alert('Assignment submitted successfully!');
        setViewMode('list');
        setSelectedAssignment(null);
        setTextSubmission('');
        setPdfFile(null);
        // Refresh assignments to remove submitted one
        fetchAssignments();
      } else {
        alert('Failed to submit assignment. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Error submitting assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please select a PDF file only.');
      e.target.value = '';
    }
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const due = new Date(deadline);
    const diff = due.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Due soon';
  };

  const getStatusColor = (deadline: string) => {
    const now = new Date();
    const due = new Date(deadline);
    const diff = due.getTime() - now.getTime();
    const hoursLeft = diff / (1000 * 60 * 60);
    
    if (diff <= 0) return 'bg-red-100 text-red-800';
    if (hoursLeft <= 24) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  // SUBMIT ASSIGNMENT VIEW
  if (viewMode === 'submit' && selectedAssignment) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setViewMode('list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Submit Assignment</h1>
            <p className="text-muted-foreground">{selectedAssignment.title}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Details */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Title</Label>
                <p className="font-semibold">{selectedAssignment.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Program</Label>
                <p>{selectedAssignment.program_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Lecturer</Label>
                <p>{selectedAssignment.lecturer_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Deadline</Label>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedAssignment.deadline).toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Max Points</Label>
                <p className="font-semibold text-blue-600">{selectedAssignment.max_points} points</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Submission Type</Label>
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                  {selectedAssignment.submission_type === 'text' ? (
                    <>
                      <Type className="h-3 w-3" />
                      Text
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3" />
                      PDF Upload
                    </>
                  )}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Time Remaining</Label>
                <Badge className={getStatusColor(selectedAssignment.deadline)}>
                  <Clock className="h-3 w-3 mr-1" />
                  {getTimeRemaining(selectedAssignment.deadline)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Submission Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Your Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-600">Assignment Description</Label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="whitespace-pre-wrap">{selectedAssignment.description}</p>
                </div>
              </div>

              {selectedAssignment.submission_type === 'text' ? (
                <div>
                  <Label htmlFor="textSubmission">Type Your Answer</Label>
                  <Textarea
                    id="textSubmission"
                    placeholder="Type your assignment answer here..."
                    value={textSubmission}
                    onChange={(e) => setTextSubmission(e.target.value)}
                    rows={12}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Characters: {textSubmission.length}
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="pdfUpload">Upload PDF File</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop your PDF file
                      </p>
                      <Input
                        id="pdfUpload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                    {pdfFile && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-800">
                          Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  onClick={handleSubmitAssignment}
                  disabled={
                    submitting || 
                    (selectedAssignment.submission_type === 'text' && !textSubmission.trim()) ||
                    (selectedAssignment.submission_type === 'pdf' && !pdfFile)
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
                <Button variant="outline" onClick={() => setViewMode('list')}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // MAIN ASSIGNMENTS LIST VIEW
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">View and submit your course assignments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'available'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Available ({assignments.length})
        </button>
        <button
          onClick={() => setActiveTab('submitted')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'submitted'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Submitted ({submittedAssignments.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <p>Loading assignments...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'available' && (
            <>
              {assignments.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments available</h3>
                    <p className="text-gray-500 text-center">
                      Check back later for new assignments from your lecturers
                    </p>
                  </CardContent>
                </Card>
              ) : (
                assignments.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{assignment.title}</h3>
                            <Badge className={getStatusColor(assignment.deadline)}>
                              <Clock className="h-3 w-3 mr-1" />
                              {getTimeRemaining(assignment.deadline)}
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
                          <p className="text-gray-600 mb-3 line-clamp-2">{assignment.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {assignment.program_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {assignment.lecturer_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: {new Date(assignment.deadline).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              {assignment.max_points} points
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setViewMode('submit');
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={new Date(assignment.deadline) <= new Date()}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Submit Assignment
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </>
          )}

          {activeTab === 'submitted' && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No submitted assignments</h3>
                <p className="text-gray-500 text-center">
                  Your submitted assignments will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
