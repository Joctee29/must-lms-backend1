import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, Clock, CheckCircle, AlertTriangle, Calendar, User, BookOpen, 
  Award, Upload, Type, Send, ArrowLeft, Download, Eye
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
  assignment_title?: string;
  program_name?: string;
  submission_type: 'text' | 'pdf';
  text_content?: string;
  file_path?: string;
  file_name?: string;
  submitted_at: string;
  points_awarded: number;
  feedback?: string;
  deadline?: string;
}

export const StudentAssignments = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'submitted'>('available');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submittedAssignments, setSubmittedAssignments] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'submit'>('list');
  const [deletingSubmission, setDeletingSubmission] = useState<number | null>(null);
  
  // Submission form state
  const [textSubmission, setTextSubmission] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchSubmittedAssignments();
  }, []);

  // Filter out submitted assignments from available list
  const getAvailableAssignments = () => {
    const submittedIds = submittedAssignments.map(sub => sub.assignment_id);
    return assignments.filter(assignment => {
      const assignmentId = assignment.original_id || assignment.id;
      // Check if this assignment has been submitted
      return !submittedIds.includes(assignmentId) && 
             !submittedIds.includes(Number(assignmentId)) &&
             !submittedIds.includes(String(assignmentId));
    });
  };

  const fetchAssignments = async () => {
    try {
      console.log('=== FETCHING ASSIGNMENTS ===');
      
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      console.log('Current User:', currentUser);
      
      if (!currentUser.username) {
        console.log('No user logged in');
        setAssignments([]);
        setLoading(false);
        return;
      }

      // OPTIMIZED: Backend handles all filtering
      console.log('Fetching assignments for student:', currentUser.username);
      
      let allAssignments: any[] = [];
      
      // 1. Fetch published assessments (new system) with student filtering
      // Backend handles ALL filtering - no need for frontend filtering!
      try {
        const assessmentsResponse = await fetch(
          `https://must-lms-backend.onrender.com/api/assessments?status=published&student_username=${encodeURIComponent(currentUser.username)}`
        );
        
        if (!assessmentsResponse.ok) {
          throw new Error(`HTTP error! status: ${assessmentsResponse.status}`);
        }
        
        const assessmentsResult = await assessmentsResponse.json();
        
        if (!assessmentsResult.success) {
          console.warn('Failed to fetch assessments:', assessmentsResult.error);
        } else {
          const studentAssessments = assessmentsResult.data || [];
          console.log(`✅ Received ${studentAssessments.length} filtered assessments from backend`);
          
          // Convert assessments to assignment format
          const formattedAssessments = studentAssessments.map(assessment => ({
            id: `assessment_${assessment.id}`,
            original_id: assessment.id,
            type: 'assessment',
            title: assessment.title,
            description: assessment.description || '',
            program_name: assessment.program_name,
            deadline: assessment.end_date || assessment.scheduled_date || new Date().toISOString(),
            submission_type: 'text' as const,
            max_points: assessment.total_points || 100,
            lecturer_name: '', // Hidden from student view
            status: assessment.status === 'active' || assessment.status === 'published' ? 'active' as const : 'expired' as const,
            created_at: assessment.created_at
          }));
          
          allAssignments = [...allAssignments, ...formattedAssessments];
        }
      } catch (error) {
        console.error('❌ Error fetching assessments:', error);
      }
      
      // 2. Fetch traditional assignments (old system) with student filtering
      // Backend handles ALL filtering - no need for frontend filtering!
      try {
        const assignmentsResponse = await fetch(
          `https://must-lms-backend.onrender.com/api/assignments?student_username=${encodeURIComponent(currentUser.username)}`
        );
        
        if (!assignmentsResponse.ok) {
          throw new Error(`HTTP error! status: ${assignmentsResponse.status}`);
        }
        
        const assignmentsResult = await assignmentsResponse.json();
        
        if (!assignmentsResult.success) {
          console.warn('Failed to fetch assignments:', assignmentsResult.error);
        } else {
          const studentTraditionalAssignments = assignmentsResult.data || [];
          console.log(`✅ Received ${studentTraditionalAssignments.length} filtered assignments from backend`);
          
          // Convert traditional assignments to unified format
          const formattedTraditionalAssignments = studentTraditionalAssignments.map(assignment => ({
            id: `assignment_${assignment.id}`,
            original_id: assignment.id,
            type: 'assignment',
            title: assignment.title,
            description: assignment.description || '',
            program_name: assignment.program_name,
            deadline: assignment.deadline,
            submission_type: assignment.submission_type || 'text' as const,
            max_points: assignment.max_points || 100,
            lecturer_name: '', // Hidden from student view
            status: 'active' as const,
            created_at: assignment.created_at
          }));
          
          allAssignments = [...allAssignments, ...formattedTraditionalAssignments];
        }
      } catch (error) {
        console.error('Error fetching traditional assignments:', error);
      }
      
      // Sort all assignments by deadline (earliest first)
      allAssignments.sort((a, b) => {
        const dateA = new Date(a.deadline).getTime();
        const dateB = new Date(b.deadline).getTime();
        return dateA - dateB;
      });
      
      console.log('=== FINAL COMBINED ASSIGNMENTS ===');
      console.log(`✅ Total assignments found: ${allAssignments.length}`);
      
      if (allAssignments.length === 0) {
        console.warn('⚠️ NO ASSIGNMENTS FOUND for this student');
      } else {
        allAssignments.forEach(a => {
          console.log(`  - ${a.title} (${a.program_name})`);
        });
      }
      
      setAssignments(allAssignments);
      
    } catch (error) {
      console.error('❌ Error fetching assignments:', error);
      alert('Failed to load assignments. Please refresh the page.');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittedAssignments = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!currentUser.id && !currentUser.username) {
        return;
      }

      // Fetch student's submitted assignments from backend
      const response = await fetch(`https://must-lms-backend.onrender.com/api/assignment-submissions?student_id=${currentUser.id || ''}&student_name=${encodeURIComponent(currentUser.username || '')}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched submitted assignments:', result);
        
        if (result.success && result.data) {
          const formattedSubmissions = result.data.map((sub: any) => ({
            id: sub.id,
            assignment_id: sub.assignment_id,
            assignment_title: sub.assignment_title || 'Assignment',
            program_name: sub.program_name || sub.student_program || '',
            submission_type: sub.submission_type || 'text',
            text_content: sub.text_content,
            file_path: sub.file_path,
            file_name: sub.file_name,
            submitted_at: sub.submitted_at || sub.created_at,
            points_awarded: sub.points_awarded || 0,
            feedback: sub.feedback,
            deadline: sub.deadline
          }));
          
          setSubmittedAssignments(formattedSubmissions);
        }
      }
    } catch (error) {
      console.error('Error fetching submitted assignments:', error);
    }
  };

  // Delete submission function
  const handleDeleteSubmission = async (submissionId: number, assignmentId: number) => {
    const confirmDelete = window.confirm(
      '🗑️ DELETE SUBMISSION?\n\n' +
      'This will:\n' +
      '• Remove your submission permanently\n' +
      '• Delete from lecturer\'s view as well\n' +
      '• Allow you to resubmit if deadline hasn\'t passed\n\n' +
      'Are you sure you want to delete this submission?'
    );

    if (!confirmDelete) return;

    setDeletingSubmission(submissionId);
    
    try {
      const response = await fetch(`https://must-lms-backend.onrender.com/api/assignment-submissions/${submissionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        // Remove from submitted list
        setSubmittedAssignments(prev => prev.filter(sub => sub.id !== submissionId));
        
        // Refresh available assignments to show the assignment again
        await fetchAssignments();
        
        alert('✅ Submission deleted successfully!\n\nYou can now resubmit if the deadline hasn\'t passed.');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Failed to delete submission: ${errorData.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Error deleting submission. Please try again.');
    } finally {
      setDeletingSubmission(null);
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
      
      let filePath = null;
      let fileName = null;
      
      // If PDF submission, upload the file first
      if (selectedAssignment.submission_type === 'pdf' && pdfFile) {
        console.log('📤 Uploading PDF file to server...');
        console.log('📄 File details:', {
          name: pdfFile.name,
          size: pdfFile.size,
          type: pdfFile.type
        });
        
        // Check file size (max 100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (pdfFile.size > maxSize) {
          throw new Error('File size too large. Maximum allowed size is 100MB.');
        }
        
        const formData = new FormData();
        formData.append('file', pdfFile);
        
        console.log('🌐 Sending upload request...');
        const uploadResponse = await fetch('https://must-lms-backend.onrender.com/api/assignment-submissions/upload', {
          method: 'POST',
          body: formData
        });
        
        console.log('📡 Upload response status:', uploadResponse.status);
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('❌ Upload failed:', errorText);
          throw new Error(`Failed to upload PDF file: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        console.log('✅ File uploaded successfully:', uploadResult);
        
        if (!uploadResult.success || !uploadResult.file_path) {
          throw new Error('Upload succeeded but no file path returned');
        }
        
        filePath = uploadResult.file_path;
        fileName = uploadResult.file_name;
      }
      
      const submissionData = {
        assignment_id: selectedAssignment.original_id || selectedAssignment.id,
        student_id: currentUser.id || 1,
        student_name: currentUser.username || 'Student',
        student_registration: currentUser.registration || currentUser.username || 'STU001/2024',
        student_program: studentProgram,
        submission_type: selectedAssignment.submission_type,
        text_content: selectedAssignment.submission_type === 'text' ? textSubmission : null,
        file_path: filePath,
        file_name: fileName
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
        alert('✅ Assignment submitted successfully!\n\nYour PDF has been uploaded and your lecturer can now view and download it.');
        setViewMode('list');
        setSelectedAssignment(null);
        setTextSubmission('');
        setPdfFile(null);
        // Refresh assignments to remove submitted one
        fetchAssignments();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Submission failed:', errorData);
        alert(`Failed to submit assignment: ${errorData.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert(`Error submitting assignment: ${error instanceof Error ? error.message : 'Please try again.'}`);
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
      <div className="flex-1 space-y-6 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button variant="outline" onClick={() => setViewMode('list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Submit Assignment</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{selectedAssignment.title}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button 
                  onClick={handleSubmitAssignment}
                  disabled={
                    submitting || 
                    (selectedAssignment.submission_type === 'text' && !textSubmission.trim()) ||
                    (selectedAssignment.submission_type === 'pdf' && !pdfFile)
                  }
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
                <Button variant="outline" onClick={() => setViewMode('list')} className="w-full sm:w-auto">
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
    <div className="flex-1 space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-sm sm:text-base text-muted-foreground">View and submit your course assignments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'available'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Available ({getAvailableAssignments().length})
        </button>
        <button
          onClick={() => setActiveTab('submitted')}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
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
              {getAvailableAssignments().length === 0 ? (
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
                getAvailableAssignments().map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="text-lg sm:text-xl font-semibold">{assignment.title}</h3>
                            <div className="flex flex-wrap items-center gap-2">
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
                          </div>
                          <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">{assignment.description}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {assignment.program_name}
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
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button 
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setViewMode('submit');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm"
                            disabled={new Date(assignment.deadline) <= new Date()}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">View Assignment</span>
                            <span className="sm:hidden">View</span>
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
            <>
              {submittedAssignments.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No submitted assignments</h3>
                    <p className="text-gray-500 text-center">
                      Your submitted assignments will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                submittedAssignments.map((submission) => {
                  const deadlinePassed = submission.deadline ? new Date(submission.deadline) <= new Date() : true;
                  
                  return (
                    <Card key={submission.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="text-lg sm:text-xl font-semibold">{submission.assignment_title}</h3>
                              <Badge className="bg-green-100 text-green-800 w-fit">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Submitted
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3">
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {submission.program_name || 'N/A'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Submitted: {new Date(submission.submitted_at).toLocaleString()}
                              </div>
                              {submission.submission_type === 'pdf' && submission.file_name && (
                                <div className="flex items-center gap-1">
                                  <Upload className="h-4 w-4" />
                                  {submission.file_name}
                                </div>
                              )}
                            </div>
                            {submission.text_content && (
                              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                <p className="text-sm text-gray-700 line-clamp-3">{submission.text_content}</p>
                              </div>
                            )}
                            {submission.feedback && (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-blue-800 mb-1">Lecturer Feedback:</p>
                                <p className="text-sm text-blue-700">{submission.feedback}</p>
                              </div>
                            )}
                            {submission.points_awarded > 0 && (
                              <div className="mt-2">
                                <Badge className="bg-blue-100 text-blue-800">
                                  <Award className="h-3 w-3 mr-1" />
                                  Score: {submission.points_awarded} points
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 w-full sm:w-auto">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSubmission(submission.id, submission.assignment_id)}
                              disabled={deletingSubmission === submission.id}
                              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 w-full sm:w-auto"
                            >
                              {deletingSubmission === submission.id ? (
                                <>Deleting...</>
                              ) : (
                                <>
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Delete
                                </>
                              )}
                            </Button>
                            {!deadlinePassed && (
                              <p className="text-xs text-green-600 text-center">Can resubmit after delete</p>
                            )}
                            {deadlinePassed && (
                              <p className="text-xs text-red-600 text-center">Deadline passed</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
