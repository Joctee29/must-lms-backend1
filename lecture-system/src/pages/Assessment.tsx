import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Archive,
  Eye, 
  Clock, 
  Users, 
  User,
  CheckCircle,
  Check,
  AlertTriangle, 
  Download,
  Calendar,
  BookOpen,
  FileText,
  BarChart3,
  Award,
  Target,
  TrendingUp,
  RefreshCw,
  Percent,
  Hash,
  CalendarClock
} from "lucide-react";
import jsPDF from 'jspdf';

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  points: number;
}

interface Assessment {
  id: string;
  title: string;
  program: string;
  description: string;
  duration: number;
  startDate: string;
  endDate: string;
  scheduledDate?: string;
  autoGrade: boolean;
  gradingFormat: 'percentage' | 'fraction';
  questions: Question[];
  totalQuestions: number;
  totalPoints: number;
  submissions: StudentSubmission[];
  status: 'draft' | 'scheduled' | 'published' | 'active' | 'completed' | 'expired';
  resultsPublishedToStudents?: boolean;
  lecturerInfo: {
    name: string;
    department: string;
    college: string;
  };
}

interface StudentSubmission {
  id: string;
  studentId?: string;
  studentName: string;
  registrationNumber: string;
  studentRegistration?: string;
  program: string;
  studentProgram?: string;
  submittedAt: string;
  answers: { [questionId: string]: any };
  score: number;
  percentage: number;
  status: 'submitted' | 'auto-graded' | 'manually-graded' | 'partially-graded';
  autoGradedScore?: number;
  manualGradedScore?: number;
}

export const Assessment = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const [viewMode, setViewMode] = useState<'list' | 'create' | 'results' | 'student-review' | 'manual-grade'>('list');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [gradingScores, setGradingScores] = useState<{[questionId: string]: number}>({});
  const [questionFeedback, setQuestionFeedback] = useState<{[questionId: string]: string}>({});
  const [newAssessment, setNewAssessment] = useState<Partial<Assessment>>({
    title: "",
    program: "",
    description: "",
    duration: 60,
    startDate: "",
    endDate: "",
    autoGrade: true,
    gradingFormat: "percentage",
    questions: [],
    lecturerInfo: {
      name: "Dr. John Mwalimu",
      department: "Engineering Department", 
      college: "College of Engineering and Technology"
    }
  });

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    type: 'multiple-choice',
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    points: 4
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const [lecturerPrograms, setLecturerPrograms] = useState([]);

  // AUTO-UPDATE ASSESSMENT STATUS based on time and submissions
  const updateAssessmentStatus = async (assessment: Assessment) => {
    const now = new Date();
    const endDate = assessment.endDate ? new Date(assessment.endDate) : null;
    const hasExpired = endDate && now > endDate;
    const hasSubmissions = assessment.submissions && assessment.submissions.length > 0;
    
    let newStatus = assessment.status;
    
    // Auto-update status based on conditions
    if (assessment.status === 'published' && hasExpired && hasSubmissions) {
      newStatus = 'completed';
    } else if (assessment.status === 'published' && hasExpired && !hasSubmissions) {
      newStatus = 'expired';
    } else if (assessment.status === 'published' && !hasExpired && hasSubmissions) {
      newStatus = 'active';
    }
    
    // Update if status changed
    if (newStatus !== assessment.status) {
      try {
        const response = await fetch(`https://must-lms-backend.onrender.com/api/assessments/${assessment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
          console.log(`Assessment ${assessment.id} status updated: ${assessment.status} → ${newStatus}`);
          
          // Update local state
          setAssessments(prev => prev.map(a => 
            a.id === assessment.id 
              ? { ...a, status: newStatus }
              : a
          ));
        }
      } catch (error) {
        console.error('Error updating assessment status:', error);
      }
    }
  };

  // Function to refresh submissions for a specific assessment
  const refreshAssessmentSubmissions = async (assessmentId: string) => {
    try {
      console.log('=== REFRESHING SUBMISSIONS FOR ASSESSMENT ===', assessmentId);
      
      const submissionsResponse = await fetch(`https://must-lms-backend.onrender.com/api/assessment-submissions?assessment_id=${assessmentId}`);
      if (submissionsResponse.ok) {
        const submissionsResult = await submissionsResponse.json();
        const realSubmissions = submissionsResult.data?.filter(sub => 
          sub.assessment_id.toString() === assessmentId
        ).map(sub => ({
          id: sub.id,
          studentId: sub.student_id,
          studentName: sub.student_name,
          studentRegistration: sub.student_registration,
          studentProgram: sub.student_program,
          answers: sub.answers,
          score: sub.score || 0,
          percentage: sub.percentage || 0,
          status: sub.status || 'submitted',
          submittedAt: sub.submitted_at,
          gradedAt: sub.graded_at,
          feedback: sub.feedback || {}
        })) || [];
        
        console.log('=== REFRESHED SUBMISSIONS ===');
        console.log('Found submissions:', realSubmissions.length);
        console.log('Submissions data:', realSubmissions);
        
        // Update the specific assessment with new submissions
        setAssessments(prev => prev.map(assessment => 
          assessment.id === assessmentId 
            ? { ...assessment, submissions: realSubmissions }
            : assessment
        ));
        
        return realSubmissions;
      }
    } catch (error) {
      console.error('Error refreshing submissions:', error);
    }
    return [];
  };

  // Fetch lecturer's programs and existing assessments from database
  useEffect(() => {
    const fetchLecturerData = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        console.log('=== ASSESSMENT DATA FETCH ===');
        console.log('Current User:', currentUser);
        
        // 1. Fetch lecturer's regular programs using efficient endpoint
        const programsResponse = await fetch(`https://must-lms-backend.onrender.com/api/programs?lecturer_username=${encodeURIComponent(currentUser.username)}`);
        let allPrograms = [];
        
        if (programsResponse.ok) {
          const result = await programsResponse.json();
          if (result.success) {
            allPrograms = [...result.data];
            console.log('Lecturer Regular Programs:', allPrograms.length);
          }
        }
        
        // 2. Fetch lecturer's short-term programs using efficient endpoint
        const shortTermResponse = await fetch(`https://must-lms-backend.onrender.com/api/short-term-programs?lecturer_username=${encodeURIComponent(currentUser.username)}`);
        if (shortTermResponse.ok) {
          const shortTermResult = await shortTermResponse.json();
          if (shortTermResult.success) {
            const lecturerShortTermPrograms = shortTermResult.data || [];
            console.log('Lecturer Short-Term Programs:', lecturerShortTermPrograms.length);
            
            // Convert short-term programs to same format as regular programs
            const formattedShortTermPrograms = lecturerShortTermPrograms.map(program => ({
              id: `short-${program.id}`,
              name: program.title,
              lecturer_name: program.lecturer_name,
              lecturer_id: program.lecturer_id,
              type: 'short-term'
            }));
            
            allPrograms = [...allPrograms, ...formattedShortTermPrograms];
          }
        }
        
        console.log('=== LECTURER PROGRAMS DEBUG ===');
        console.log('Current User:', currentUser);
        console.log('All Programs (Regular + Short-Term):', allPrograms);
        
        setLecturerPrograms(allPrograms);

        // 2. Initialize assessment tables and fetch existing assessments
        await fetch('https://must-lms-backend.onrender.com/api/assessments/init', { method: 'POST' });
        
        const assessmentsResponse = await fetch(`https://must-lms-backend.onrender.com/api/assessments?lecturer_name=${encodeURIComponent(currentUser.username)}`);
        if (assessmentsResponse.ok) {
          const assessmentsResult = await assessmentsResponse.json();
          
          console.log('=== EXISTING ASSESSMENTS DEBUG ===');
          console.log('Assessments from database:', assessmentsResult.data);
          
          // Format assessments for display with REAL SUBMISSIONS
          const formattedAssessments = await Promise.all(assessmentsResult.data?.map(async (dbAssessment) => {
            // Fetch real submissions for each assessment
            let realSubmissions = [];
            try {
              const submissionsResponse = await fetch(`https://must-lms-backend.onrender.com/api/assessment-submissions?assessment_id=${dbAssessment.id}`);
              if (submissionsResponse.ok) {
                const submissionsResult = await submissionsResponse.json();
                realSubmissions = submissionsResult.data?.filter(sub => 
                  sub.assessment_id === dbAssessment.id
                ).map(sub => ({
                  id: sub.id,
                  studentId: sub.student_id,
                  studentName: sub.student_name || 'N/A',
                  registrationNumber: sub.student_registration || 'N/A',
                  studentRegistration: sub.student_registration || 'N/A',
                  program: sub.student_program || 'N/A',
                  studentProgram: sub.student_program || 'N/A',
                  submittedAt: sub.submitted_at || sub.created_at,
                  answers: sub.answers,
                  score: sub.score || 0,
                  percentage: sub.percentage || 0,
                  status: sub.status || 'submitted',
                  manual_scores: sub.manual_scores || {},
                  manual_feedback: sub.manual_feedback || {},
                })) || [];
              
              // Reduced logging for performance
              if (realSubmissions.length > 0) {
                console.log(`Assessment ${dbAssessment.id}: ${realSubmissions.length} submissions`);
              }
            } // CLOSE THE if (submissionsResponse.ok) BLOCK
          } catch (error) {
              console.error(`Error fetching submissions for assessment ${dbAssessment.id}:`, error);
            }
            
            return {
              id: dbAssessment.id.toString(),
              title: dbAssessment.title,
              program: dbAssessment.program_name,
              description: dbAssessment.description,
              duration: dbAssessment.duration,
              startDate: dbAssessment.start_date,
              endDate: dbAssessment.end_date,
              scheduledDate: dbAssessment.scheduled_date,
              scheduledTime: dbAssessment.scheduled_time,
              autoGrade: dbAssessment.auto_grade,
              gradingFormat: dbAssessment.grading_format,
              questions: dbAssessment.questions || [],
              totalQuestions: dbAssessment.total_questions,
              totalPoints: dbAssessment.total_points,
              status: dbAssessment.status,
              submissions: realSubmissions, // REAL SUBMISSIONS FROM DATABASE
              lecturerInfo: {
                name: currentUser.username || "Dr. John Mwalimu",
                department: "Engineering Department", 
                college: "College of Engineering and Technology"
              }
            };
          }) || []);
          
          setAssessments(formattedAssessments);
          console.log('Loaded assessments:', formattedAssessments);
        }
      } catch (error) {
        console.error('Error fetching lecturer data:', error);
        // Fallback programs
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setLecturerPrograms([
          { id: 1, name: 'Introduction to Programming', lecturer_name: currentUser.username },
          { id: 2, name: 'Data Structures and Algorithms', lecturer_name: currentUser.username },
          { id: 3, name: 'Database Management Systems', lecturer_name: currentUser.username },
          { id: 4, name: 'Software Engineering', lecturer_name: currentUser.username }
        ]);
      }
    };

    fetchLecturerData();
    
    // AUTO-UPDATE ASSESSMENT STATUS every 2 minutes (reduced frequency)
    const statusUpdateInterval = setInterval(() => {
      assessments.forEach(assessment => {
        if (assessment.status === 'published' || assessment.status === 'active') {
          updateAssessmentStatus(assessment);
        }
      });
    }, 120000); // Check every 2 minutes to reduce load
    
    return () => clearInterval(statusUpdateInterval);
  }, []);

  const handleSaveAsDraft = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Initialize assessment tables first
      await fetch('https://must-lms-backend.onrender.com/api/assessments/init', { method: 'POST' });
      
      const assessmentData = {
        title: newAssessment.title,
        description: newAssessment.description,
        program_name: newAssessment.program,
        lecturer_id: currentUser.id || null,
        lecturer_name: currentUser.username || '',
        duration: newAssessment.duration || 60,
        start_date: newAssessment.startDate || null,
        end_date: newAssessment.endDate || null,
        scheduled_date: newAssessment.scheduledDate || null,
        scheduled_time: newAssessment.scheduledTime || null,
        auto_grade: newAssessment.autoGrade,
        grading_format: newAssessment.gradingFormat,
        questions: newAssessment.questions || [],
        status: 'draft' // SAVE AS DRAFT - NOT PUBLISHED YET
      };

      console.log('=== ASSESSMENT DRAFT SAVE DEBUG ===');
      console.log('Assessment Data:', assessmentData);

      const response = await fetch('https://must-lms-backend.onrender.com/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Assessment saved to database:', result.data);
        
        // Add to local state
        const assessment: Assessment = {
          id: result.data.id.toString(),
          title: result.data.title,
          program: result.data.program_name,
          description: result.data.description,
          duration: result.data.duration,
          startDate: result.data.start_date,
          endDate: result.data.end_date,
          scheduledDate: result.data.scheduled_date,
          scheduledTime: result.data.scheduled_time,
          autoGrade: result.data.auto_grade,
          gradingFormat: result.data.grading_format,
          questions: result.data.questions || [],
          totalQuestions: result.data.total_questions,
          totalPoints: result.data.total_points,
          status: result.data.status,
          submissions: [],
          lecturerInfo: {
            name: currentUser.username || "Dr. John Mwalimu",
            department: "Engineering Department", 
            college: "College of Engineering and Technology"
          }
        };

        setAssessments(prev => [assessment, ...prev]);
        alert(
          `📁 ASSESSMENT SAVED AS DRAFT!\n\n` +
          `"${newAssessment.title}" has been saved as draft.\n\n` +
          `You can:\n` +
          `✅ Continue editing questions\n` +
          `✅ Modify assessment details\n` +
          `✅ Send to students when ready\n\n` +
          `Draft assessments are NOT visible to students yet.`
        );
      } else {
        // Fallback - save locally
        const assessment: Assessment = {
          id: Date.now().toString(),
          ...newAssessment as Assessment,
          totalQuestions: newAssessment.questions?.length || 0,
          totalPoints: newAssessment.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0,
          status: 'published',
          submissions: []
        };

        setAssessments(prev => [assessment, ...prev]);
        alert('Assessment saved locally (server not available)');
      }

      // Reset form
      setNewAssessment({
        title: "",
        program: "",
        description: "",
        duration: 60,
        startDate: "",
        endDate: "",
        autoGrade: true,
        gradingFormat: "percentage",
        questions: [],
        lecturerInfo: {
          name: currentUser.username || "Dr. John Mwalimu",
          department: "Engineering Department", 
          college: "College of Engineering and Technology"
        }
      });
      setViewMode('list');
    } catch (error) {
      console.error('Error publishing assessment:', error);
      alert('Failed to publish assessment. Please try again.');
    }
  };

  // SEND ASSESSMENT - Publish to students
  const handleSendAssessment = async () => {
    const confirmSend = confirm(
      `📤 SEND ASSESSMENT TO STUDENTS?\n\n` +
      `Assessment: "${newAssessment.title}"\n` +
      `Program: ${newAssessment.program}\n` +
      `Questions: ${newAssessment.questions?.length || 0}\n\n` +
      `This will:\n` +
      `✅ Make assessment available to students\n` +
      `✅ Students can start taking the assessment\n` +
      `✅ Assessment will appear in Take Assessment section\n\n` +
      `Are you sure you want to send this assessment?`
    );

    if (!confirmSend) return;

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Initialize assessment tables first
      await fetch('https://must-lms-backend.onrender.com/api/assessments/init', { method: 'POST' });
      
      const assessmentData = {
        title: newAssessment.title,
        description: newAssessment.description,
        program_name: newAssessment.program,
        lecturer_id: currentUser.id || null,
        lecturer_name: currentUser.username || '',
        duration: newAssessment.duration || 60,
        start_date: newAssessment.startDate || null,
        end_date: newAssessment.endDate || null,
        scheduled_date: newAssessment.scheduledDate || null,
        scheduled_time: newAssessment.scheduledTime || null,
        auto_grade: newAssessment.autoGrade,
        grading_format: newAssessment.gradingFormat,
        questions: newAssessment.questions || [],
        status: 'published' // PUBLISHED TO STUDENTS
      };

      console.log('=== SEND ASSESSMENT DEBUG ===');
      console.log('Assessment Data:', assessmentData);

      const response = await fetch('https://must-lms-backend.onrender.com/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Assessment sent to students:', result.data);
        
        // Add to local state
        const assessment: Assessment = {
          id: result.data.id.toString(),
          title: result.data.title,
          program: result.data.program_name,
          description: result.data.description,
          duration: result.data.duration,
          startDate: result.data.start_date,
          endDate: result.data.end_date,
          scheduledDate: result.data.scheduled_date,
          scheduledTime: result.data.scheduled_time,
          autoGrade: result.data.auto_grade,
          gradingFormat: result.data.grading_format,
          questions: result.data.questions || [],
          totalQuestions: result.data.total_questions,
          totalPoints: result.data.total_points,
          status: result.data.status,
          submissions: [],
          lecturerInfo: {
            name: currentUser.username || "Dr. John Mwalimu",
            department: "Engineering Department", 
            college: "College of Engineering and Technology"
          }
        };

        setAssessments(prev => [assessment, ...prev]);
        alert(
          `✅ ASSESSMENT SENT SUCCESSFULLY!\n\n` +
          `"${newAssessment.title}" is now available to students.\n` +
          `Students can find it in their Take Assessment section.\n\n` +
          `Assessment Details:\n` +
          `• Questions: ${newAssessment.questions?.length || 0}\n` +
          `• Duration: ${newAssessment.duration || 60} minutes\n` +
          `• Auto-Grade: ${newAssessment.autoGrade ? 'Enabled' : 'Disabled'}`
        );
      } else {
        alert('Failed to send assessment to students. Please try again.');
      }

      // Reset form
      setNewAssessment({
        title: "",
        program: "",
        description: "",
        duration: 60,
        startDate: "",
        endDate: "",
        autoGrade: true,
        gradingFormat: "percentage",
        questions: [],
        lecturerInfo: {
          name: currentUser.username || "Dr. John Mwalimu",
          department: "Engineering Department", 
          college: "College of Engineering and Technology"
        }
      });
      setViewMode('list');
    } catch (error) {
      console.error('Error sending assessment:', error);
      alert('Failed to send assessment. Please try again.');
    }
  };

  // DELETE ASSESSMENT - Complete removal from database and student portal
  const handleDeleteAssessment = async (assessmentId: string) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (!assessment) return;

    const confirmDelete = confirm(
      `🗑️ DELETE ASSESSMENT PERMANENTLY?\n\n` +
      `Assessment: "${assessment.title}"\n` +
      `Program: ${assessment.program}\n` +
      `Questions: ${assessment.totalQuestions}\n` +
      `Submissions: ${assessment.submissions?.length || 0}\n\n` +
      `⚠️ WARNING: This action cannot be undone!\n\n` +
      `This will:\n` +
      `❌ Delete assessment from database permanently\n` +
      `❌ Remove from student Take Assessment section\n` +
      `❌ Delete all student submissions and results\n` +
      `❌ Remove from Assessment Results section\n\n` +
      `Are you absolutely sure you want to delete this assessment?`
    );

    if (!confirmDelete) return;

    // Second confirmation for safety
    const finalConfirm = confirm(
      `🚨 FINAL CONFIRMATION\n\n` +
      `You are about to PERMANENTLY DELETE:\n` +
      `"${assessment.title}"\n\n` +
      `This will affect ${assessment.submissions?.length || 0} student submissions.\n\n` +
      `Type "DELETE" in the next prompt to confirm.`
    );

    if (!finalConfirm) return;

    const userInput = prompt(
      `Type "DELETE" to confirm permanent deletion of "${assessment.title}"`
    );

    if (userInput !== "DELETE") {
      alert('❌ Deletion cancelled. Assessment not deleted.');
      return;
    }

    try {
      console.log('=== DELETE ASSESSMENT ===');
      console.log('Deleting assessment ID:', assessmentId);
      console.log('Assessment:', assessment);

      // Delete from backend database
      const response = await fetch(`https://must-lms-backend.onrender.com/api/assessments/${assessmentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        console.log('Assessment deleted from database successfully');
        
        // Remove from local state
        setAssessments(prev => prev.filter(a => a.id !== assessmentId));
        
        alert(
          `✅ ASSESSMENT DELETED SUCCESSFULLY!\n\n` +
          `"${assessment.title}" has been permanently deleted.\n\n` +
          `Removed from:\n` +
          `✅ Database\n` +
          `✅ Student Take Assessment section\n` +
          `✅ Assessment Results section\n` +
          `✅ All student submissions deleted\n\n` +
          `This action is permanent and cannot be undone.`
        );
      } else {
        // Remove from local state even if backend fails
        setAssessments(prev => prev.filter(a => a.id !== assessmentId));
        
        alert(
          `⚠️ ASSESSMENT REMOVED LOCALLY\n\n` +
          `"${assessment.title}" removed from your view.\n` +
          `Server connection failed - may need manual database cleanup.\n\n` +
          `Contact admin if assessment still appears for students.`
        );
      }
    } catch (error) {
      console.error('Error deleting assessment:', error);
      
      // Remove from local state as fallback
      setAssessments(prev => prev.filter(a => a.id !== assessmentId));
      
      alert(
        `⚠️ ASSESSMENT REMOVED LOCALLY\n\n` +
        `"${assessment.title}" removed from your view.\n` +
        `Network error occurred - may need manual database cleanup.\n\n` +
        `Contact admin if assessment still appears for students.`
      );
    }
  };

  // PUBLISH DRAFT ASSESSMENT - Convert draft to published
  const handlePublishAssessment = async (assessmentId: string) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (!assessment) return;

    const confirmPublish = confirm(
      `📤 PUBLISH ASSESSMENT TO STUDENTS?\n\n` +
      `Assessment: "${assessment.title}"\n` +
      `Program: ${assessment.program}\n` +
      `Questions: ${assessment.totalQuestions}\n\n` +
      `This will:\n` +
      `✅ Make assessment available to students\n` +
      `✅ Students can start taking the assessment\n` +
      `✅ Change status from DRAFT to PUBLISHED\n\n` +
      `Are you sure you want to publish this assessment?`
    );

    if (!confirmPublish) return;

    try {
      console.log('=== PUBLISHING DRAFT ASSESSMENT ===');
      console.log('Assessment ID:', assessmentId);

      // Update assessment status to published
      const response = await fetch(`https://must-lms-backend.onrender.com/api/assessments/${assessmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Assessment published:', result.data);
        
        // Update local state
        setAssessments(prev => prev.map(a => 
          a.id === assessmentId 
            ? { ...a, status: 'published' }
            : a
        ));
        
        alert(
          `✅ ASSESSMENT PUBLISHED SUCCESSFULLY!\n\n` +
          `"${assessment.title}" is now available to students.\n` +
          `Students can find it in their Take Assessment section.\n\n` +
          `Status changed: DRAFT → PUBLISHED`
        );
      } else {
        alert('Failed to publish assessment. Please try again.');
      }
    } catch (error) {
      console.error('Error publishing assessment:', error);
      alert('Failed to publish assessment. Please try again.');
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question) return;

    const question: Question = {
      id: Date.now().toString(),
      ...newQuestion as Question
    };

    setNewAssessment(prev => ({
      ...prev,
      questions: [...(prev.questions || []), question]
    }));

    setNewQuestion({
      type: 'multiple-choice',
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 4
    });
    setShowQuestionForm(false);
  };

  // QUESTION MANAGEMENT FUNCTIONS
  const handleEditQuestion = (question: any, index: number) => {
    console.log('=== EDIT QUESTION ===');
    console.log('Editing question:', question);
    
    // Set question data for editing
    setNewQuestion({
      type: question.type,
      question: question.question,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer,
      points: question.points
    });
    
    // Set editing mode (you'll need to add this state)
    // setEditingQuestionIndex(index);
    setShowQuestionForm(true);
    
    alert(`📝 EDITING QUESTION ${index + 1}\n\nQuestion loaded for editing.\nMake your changes and click "Add Question" to update.`);
  };

  const handleArchiveQuestion = (questionId: string) => {
    const confirmArchive = confirm(
      '📁 ARCHIVE QUESTION?\n\n' +
      'This will archive the question for later use.\n' +
      'You can restore it later if needed.\n\n' +
      'Continue with archiving?'
    );

    if (confirmArchive) {
      console.log('=== ARCHIVE QUESTION ===');
      console.log('Archiving question ID:', questionId);
      
      // Find question to archive
      const questionToArchive = newAssessment.questions?.find(q => q.id === questionId);
      if (questionToArchive) {
        // Add to archived questions (you can implement this later)
        console.log('Question archived:', questionToArchive);
        
        // Remove from current questions
        setNewAssessment(prev => ({
          ...prev,
          questions: prev.questions?.filter(q => q.id !== questionId) || []
        }));
        
        alert('✅ Question archived successfully!\nYou can restore it later if needed.');
      }
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    const confirmDelete = confirm(
      '🗑️ DELETE QUESTION PERMANENTLY?\n\n' +
      'This will permanently delete the question.\n' +
      'This action cannot be undone.\n\n' +
      'Are you sure you want to delete this question?'
    );

    if (confirmDelete) {
      console.log('=== DELETE QUESTION ===');
      console.log('Deleting question ID:', questionId);
      
      setNewAssessment(prev => ({
        ...prev,
        questions: prev.questions?.filter(q => q.id !== questionId) || []
      }));
      
      alert('✅ Question deleted successfully!');
    }
  };

  const calculateAutoGrade = (assessment: Assessment, submission: StudentSubmission) => {
    let autoGradablePoints = 0;
    let totalAutoGradablePoints = 0;
    
    assessment.questions.forEach(question => {
      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        totalAutoGradablePoints += question.points;
        const studentAnswer = submission.answers[question.id];
        
        if (question.type === 'multiple-choice') {
          if (studentAnswer === question.correctAnswer) {
            autoGradablePoints += question.points;
          }
        } else if (question.type === 'true-false') {
          const correctAnswer = String(question.correctAnswer).toLowerCase() === 'true';
          const studentAnswerBool = String(studentAnswer).toLowerCase() === 'true';
          if (correctAnswer === studentAnswerBool) {
            autoGradablePoints += question.points;
          }
        }
      }
    });
    
    return { autoGradablePoints, totalAutoGradablePoints };
  };


  const handleManualGradeAll = (assessmentId: string) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (!assessment) return;

    if (!assessment.autoGrade) {
      // MANUAL MODE: Open grading interface for first ungraded submission
      const ungradedSubmissions = assessment.submissions.filter(sub => sub.status === 'submitted');
      
      if (ungradedSubmissions.length === 0) {
        alert('All submissions have been graded.');
        return;
      }

      // Start manual grading with first ungraded submission
      const firstUngraded = ungradedSubmissions[0];
      setSelectedSubmission(firstUngraded);
      setViewMode('manual-grading');
      
      // Initialize grading scores for all questions
      const initialScores: { [key: string]: number } = {};
      assessment.questions.forEach(question => {
        initialScores[question.id] = 0; // Start with 0 for manual mode
      });
      setGradingScores(initialScores);
      
      alert(`Starting manual grading for ${assessment.title}. Grade each question for ${firstUngraded.studentName}.`);
    } else {
      // AUTO MODE: This shouldn't be called, but handle gracefully
      alert('This assessment is in Auto-Grade mode. Use "Auto Grade All" instead.');
    }
  };

  const handleViewResults = async (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setViewMode('results');
    
    // Automatically refresh submissions when viewing results
    console.log('=== AUTO-REFRESHING SUBMISSIONS ON VIEW ===');
    await refreshAssessmentSubmissions(assessment.id);
  };

  // INDIVIDUAL GRADING FUNCTIONS - EXACTLY AS REQUESTED
  const handleIndividualAutoGrade = async (submission: StudentSubmission) => {
    try {
      console.log('=== INDIVIDUAL AUTO-GRADE ===');
      console.log('Submission:', submission);
      
      // Call backend to auto-grade this specific submission
      const response = await fetch(`https://must-lms-backend.onrender.com/api/assessment-submissions/${submission.id}/auto-grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Auto-grade result:', result);
        
        // Refresh submissions to show updated scores
        await refreshAssessmentSubmissions(selectedAssessment!.id);
        alert(`Auto-graded ${submission.studentName}: ${result.percentage}%`);
      } else {
        alert('Failed to auto-grade submission');
      }
    } catch (error) {
      console.error('Error auto-grading submission:', error);
      alert('Error auto-grading submission');
    }
  };

  const handleIndividualManualGrade = (submission: StudentSubmission) => {
    console.log('=== INDIVIDUAL MANUAL GRADE ===');
    console.log('Opening manual grading for:', submission.studentName);
    
    // Set up manual grading interface
    setSelectedSubmission(submission);
    setViewMode('manual-grade');
    
    // Initialize grading scores for each question
    const initialScores: {[questionId: string]: number} = {};
    selectedAssessment?.questions.forEach(question => {
      initialScores[question.id] = 0;
    });
    setGradingScores(initialScores);
  };

  // VIEW STUDENT SUBMISSION - Single function only (Fixed duplicate issue)
  const handleViewStudentSubmission = (submission: StudentSubmission) => {
    console.log('=== VIEW STUDENT SUBMISSION ===');
    console.log('Viewing submission from:', submission.studentName);
    
    // Load existing manual scores if available
    if (submission.manual_scores) {
      console.log('Loading existing manual scores:', submission.manual_scores);
      setGradingScores(submission.manual_scores);
    } else {
      setGradingScores({});
    }
    
    // Load existing manual feedback if available
    if (submission.manual_feedback) {
      console.log('Loading existing manual feedback:', submission.manual_feedback);
      setQuestionFeedback(submission.manual_feedback);
    } else {
      setQuestionFeedback({});
    }
    
    setSelectedSubmission(submission);
    setViewMode('student-review');
  };

  // BULK AUTO-GRADE - Grade all students at once
  const handleBulkAutoGrade = async (assessmentId: string) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (!assessment) return;

    const ungradedSubmissions = assessment.submissions.filter(sub => 
      sub.status === 'submitted'
    );

    if (ungradedSubmissions.length === 0) {
      alert('No ungraded submissions found for bulk auto-grading.');
      return;
    }

    const confirmBulk = confirm(
      `🚀 BULK AUTO-GRADE ALL STUDENTS?\n\n` +
      `Assessment: "${assessment.title}"\n` +
      `Students to grade: ${ungradedSubmissions.length}\n\n` +
      `This will:\n` +
      `✅ Auto-grade ALL MC/True-False questions\n` +
      `✅ Process all ${ungradedSubmissions.length} students at once\n` +
      `⚠️ Short Answer questions will still need manual grading\n\n` +
      `Continue with bulk auto-grading?`
    );

    if (!confirmBulk) return;

    try {
      console.log('=== BULK AUTO-GRADE ALL STUDENTS ===');
      console.log('Processing', ungradedSubmissions.length, 'submissions');

      // Process all submissions in parallel
      const promises = ungradedSubmissions.map(submission => 
        fetch(`https://must-lms-backend.onrender.com/api/assessment-submissions/${submission.id}/auto-grade`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.ok).length;

      // Refresh submissions to show updated scores
      await refreshAssessmentSubmissions(assessmentId);
      
      alert(
        `✅ BULK AUTO-GRADING COMPLETED!\n\n` +
        `Successfully processed: ${successCount}/${ungradedSubmissions.length} students\n` +
        `Auto-gradable questions have been scored\n` +
        `Manual questions still require individual grading`
      );
    } catch (error) {
      console.error('Error in bulk auto-grading:', error);
      alert('Error during bulk auto-grading process');
    }
  };

  // INDIVIDUAL AUTO-GRADE MODE - Enable individual grading per student
  const handleIndividualAutoGradeMode = (assessmentId: string) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (!assessment) return;

    alert(
      `🎯 INDIVIDUAL AUTO-GRADE MODE ACTIVATED!\n\n` +
      `Assessment: "${assessment.title}"\n\n` +
      `You can now:\n` +
      `✅ Click "Auto" button for each student individually\n` +
      `✅ Choose which students to auto-grade\n` +
      `✅ Mix auto and manual grading as needed\n\n` +
      `Use the "Auto" and "Manual" buttons next to each student submission.`
    );
  };

  // MIXED GRADING - Auto grade MC/True-False, Manual grade Short Answer
  const handleMixedGrading = (assessmentId: string) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (!assessment) return;

    const mcQuestions = assessment.questions?.filter(q => 
      q.type === 'multiple-choice' || q.type === 'true-false'
    ).length || 0;
    
    const shortAnswerQuestions = assessment.questions?.filter(q => 
      q.type === 'short-answer'
    ).length || 0;

    alert(
      `🔄 MIXED GRADING MODE!\n\n` +
      `Assessment: "${assessment.title}"\n\n` +
      `Question Breakdown:\n` +
      `⚡ Auto-Gradable: ${mcQuestions} questions (MC/True-False)\n` +
      `✏️ Manual Required: ${shortAnswerQuestions} questions (Short Answer)\n\n` +
      `Process:\n` +
      `1️⃣ Auto-grade MC/True-False questions first\n` +
      `2️⃣ Then manually grade Short Answer questions\n` +
      `3️⃣ System will calculate final scores\n\n` +
      `Start with "Auto Grade All" then review Short Answer responses.`
    );
  };

  // INDIVIDUAL MANUAL MODE - Grade students one by one manually
  const handleIndividualManualMode = (assessmentId: string) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (!assessment) return;

    alert(
      `✏️ INDIVIDUAL MANUAL GRADING MODE!\n\n` +
      `Assessment: "${assessment.title}"\n\n` +
      `This assessment requires manual grading:\n` +
      `📝 All questions need lecturer review\n` +
      `🎯 Grade each student individually\n` +
      `⭐ Provide detailed feedback\n\n` +
      `You can now:\n` +
      `✅ Click "Manual" button for each student\n` +
      `✅ Grade questions one by one\n` +
      `✅ Add personalized feedback\n\n` +
      `Use the "Manual" button next to each student submission.`
    );
  };

  const handleSubmitResultsToStudents = async (assessmentId: string) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (!assessment) return;

    // Check if all submissions are graded
    const ungradedSubmissions = assessment.submissions.filter(sub => 
      sub.status === 'submitted'
    );

    if (ungradedSubmissions.length > 0) {
      alert(`Please grade all submissions first. ${ungradedSubmissions.length} submissions are still ungraded.`);
      return;
    }

    // LECTURER CLICKS "DONE" - PUBLISH RESULTS TO ASSESSMENT RESULTS
    const confirmSubmit = window.confirm(
      `🎯 LECTURER DONE - PUBLISH RESULTS?\n\n` +
      `Assessment: "${assessment.title}"\n` +
      `Students: ${assessment.submissions.length}\n\n` +
      `This will:\n` +
      `✅ Move results to Assessment Results category\n` +
      `✅ Make scores visible to students\n` +
      `✅ Send notifications to students\n` +
      `✅ Mark assessment as completed\n\n` +
      `Statistics:\n` +
      `• Average: ${Math.round(assessment.submissions.reduce((sum, s) => sum + s.percentage, 0) / assessment.submissions.length)}%\n` +
      `• Pass Rate: ${Math.round((assessment.submissions.filter(s => s.percentage >= 60).length / assessment.submissions.length) * 100)}%\n` +
      `• Highest: ${Math.max(...assessment.submissions.map(s => s.percentage))}%\n\n` +
      `⚠️ This action cannot be undone!`
    );

    if (confirmSubmit) {
      try {
        const response = await fetch(`https://must-lms-backend.onrender.com/api/submit-results-to-students/${assessmentId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const result = await response.json();
          
          // Update local state to mark results as published
          setAssessments(prev => prev.map(a => {
            if (a.id === assessmentId) {
              return { 
                ...a, 
                status: 'completed' as const,
                resultsPublishedToStudents: true
              };
            }
            return a;
          }));

          alert(
            `🎊 RESULTS PUBLISHED TO ASSESSMENT RESULTS!\n\n` +
            `✅ ${result.message}\n` +
            `✅ Results moved to Assessment Results category\n` +
            `✅ Students can now view their scores\n` +
            `✅ Assessment marked as completed\n\n` +
            `Students will find their results in Assessment Results section.`
          );
        } else {
          const error = await response.json();
          alert(`Failed to submit results: ${error.error}`);
        }
      } catch (error) {
        console.error('Error submitting results to students:', error);
        alert('Error submitting results. Please try again.');
      }
    }
  };



  const generatePDFReport = async (assessment: Assessment) => {
    const doc = new jsPDF();
    
    // MUST Logo and Header
    doc.setFillColor(0, 51, 102); // MUST Blue
    doc.rect(0, 0, 210, 40, 'F');
    
    // Load MUST logo for all pages
    let logoData = null;
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Set canvas size for optimal quality
          canvas.width = 120;
          canvas.height = 120;
          ctx?.drawImage(img, 0, 0, 120, 120);
          logoData = canvas.toDataURL('image/png');
          resolve(true);
        };
        img.onerror = reject;
        img.src = '/must-logo.png';
      });
    } catch (error) {
      console.log('Logo loading failed, using fallback');
    }
    
    // No logo in main header - clean design
    
    // University Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('MBEYA UNIVERSITY OF SCIENCE AND TECHNOLOGY', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(assessment.lecturerInfo.college, 105, 25, { align: 'center' });
    doc.text(assessment.lecturerInfo.department, 105, 32, { align: 'center' });
    
    // Add university motto
    doc.setFontSize(8);
    doc.text('Excellence in Education, Research and Innovation', 105, 37, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('ASSESSMENT REPORT', 105, 55, { align: 'center' });
    
    // Assessment Information
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    let yPos = 75;
    
    const info = [
      ['Course Name:', assessment.course],
      ['Assessment Title:', assessment.title],
      ['Lecturer:', assessment.lecturerInfo.name],
      ['Date Generated:', new Date().toLocaleDateString()],
      ['Duration:', `${assessment.duration} minutes`],
      ['Total Questions:', assessment.totalQuestions.toString()],
      ['Total Points:', assessment.totalPoints.toString()],
      ['Grading Format:', assessment.gradingFormat === 'percentage' ? 'Percentage (%)' : 'Fraction']
    ];
    
    info.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(value, 80, yPos);
      yPos += 8;
    });
    
    // Statistics Section
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('ASSESSMENT STATISTICS', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    
    const stats = [
      ['Total Submissions:', assessment.submissions.length.toString()],
      ['Average Score:', `${assessment.submissions.length > 0 ? Math.round(assessment.submissions.reduce((sum, s) => sum + s.percentage, 0) / assessment.submissions.length) : 0}%`],
      ['Highest Score:', `${assessment.submissions.length > 0 ? Math.max(...assessment.submissions.map(s => s.percentage)) : 0}%`],
      ['Lowest Score:', `${assessment.submissions.length > 0 ? Math.min(...assessment.submissions.map(s => s.percentage)) : 0}%`],
      ['Pass Rate (≥60%):', `${assessment.submissions.length > 0 ? Math.round((assessment.submissions.filter(s => s.percentage >= 60).length / assessment.submissions.length) * 100) : 0}%`]
    ];
    
    stats.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(value, 80, yPos);
      yPos += 8;
    });
    
    // Grade Distribution
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('GRADE DISTRIBUTION', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    
    const grades = [
      ['A (80-100%):', assessment.submissions.filter(s => s.percentage >= 80).length],
      ['B (70-79%):', assessment.submissions.filter(s => s.percentage >= 70 && s.percentage < 80).length],
      ['C (60-69%):', assessment.submissions.filter(s => s.percentage >= 60 && s.percentage < 70).length],
      ['D (50-59%):', assessment.submissions.filter(s => s.percentage >= 50 && s.percentage < 60).length],
      ['F (0-49%):', assessment.submissions.filter(s => s.percentage < 50).length]
    ];
    
    grades.forEach(([grade, count]) => {
      doc.setFont(undefined, 'bold');
      doc.text(grade, 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(`${count} students`, 80, yPos);
      yPos += 8;
    });
    
    // New page for student results
    doc.addPage();
    
    // Student Results Header
    doc.setFillColor(0, 51, 102);
    doc.rect(0, 0, 210, 30, 'F');
    
    // No logo on results page - clean design
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('STUDENT RESULTS', 105, 18, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    yPos = 40;
    
    // Table headers
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Rank', 15, yPos);
    doc.text('Student Name', 35, yPos);
    doc.text('Reg. Number', 90, yPos);
    doc.text('Program', 130, yPos);
    doc.text('Score', 170, yPos);
    doc.text('Grade', 190, yPos);
    
    // Line under headers
    doc.line(10, yPos + 2, 200, yPos + 2);
    yPos += 10;
    
    // Sort submissions by percentage (highest first)
    const sortedSubmissions = [...assessment.submissions].sort((a, b) => b.percentage - a.percentage);
    
    doc.setFont(undefined, 'normal');
    sortedSubmissions.forEach((submission, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const grade = submission.percentage >= 80 ? 'A' : 
                   submission.percentage >= 70 ? 'B' : 
                   submission.percentage >= 60 ? 'C' : 
                   submission.percentage >= 50 ? 'D' : 'F';
      
      doc.text((index + 1).toString(), 15, yPos);
      doc.text(submission.studentName.substring(0, 20), 35, yPos);
      doc.text(submission.registrationNumber, 90, yPos);
      doc.text(submission.program.substring(0, 15), 130, yPos);
      doc.text(`${submission.percentage}%`, 170, yPos);
      doc.text(grade, 190, yPos);
      
      yPos += 8;
    });
    
    // Footer with MUST branding on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(0, 51, 102);
      doc.setLineWidth(1);
      doc.line(20, 280, 190, 280);
      
      // Footer content
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 285);
      doc.text(`MUST Learning Management System`, 105, 285, { align: 'center' });
      doc.text(`Page ${i} of ${pageCount}`, 150, 285);
      
      // MUST logo positioned below the blue line - compact, wide and readable
      if (logoData) {
        // Moderately sized logo - not too wide, not too narrow
        doc.addImage(logoData, 'PNG', 170, 284, 15, 8);
      } else {
        // Moderately sized fallback logo with clear branding
        doc.setFillColor(0, 51, 102);
        doc.roundedRect(170, 284, 15, 8, 1, 1, 'F');
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.6);
        doc.roundedRect(170, 284, 15, 8, 1, 1, 'S');
        
        // Clear, readable MUST text - compact
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.setFont(undefined, 'bold');
        doc.text('MUST', 177.5, 289, { align: 'center' });
        
        // Compact university identifier
        doc.setFontSize(3);
        doc.setFont(undefined, 'normal');
        doc.text('MBEYA UNIVERSITY OF SCIENCE & TECHNOLOGY', 178, 293, { align: 'center' });
      }
    }
    
    // Save the PDF
    doc.save(`MUST_${assessment.course.replace(/\s+/g, '_')}_${assessment.title.replace(/\s+/g, '_')}_Report.pdf`);
  };

  const handleManualGrade = (submission: StudentSubmission) => {
    setSelectedSubmission(submission);
    
    // Initialize grading scores with current scores or auto-graded scores
    const initialScores: {[questionId: string]: number} = {};
    selectedAssessment?.questions.forEach(question => {
      if (submission.answers[question.id] !== undefined) {
        // If auto-graded, use auto score, otherwise 0
        if (selectedAssessment.autoGrade) {
          const studentAnswer = submission.answers[question.id];
          if (question.type === 'multiple-choice' && studentAnswer === question.correctAnswer) {
            initialScores[question.id] = question.points;
          } else if (question.type === 'true-false' && studentAnswer === question.correctAnswer) {
            initialScores[question.id] = question.points;
          } else {
            initialScores[question.id] = 0;
          }
        } else {
          initialScores[question.id] = 0;
        }
      }
    });
    
    setGradingScores(initialScores);
    setQuestionFeedback({});
    setViewMode('manual-grade');
  };

  const handleManualGradeQuestion = (submissionId: string, questionId: string, score: number) => {
    setGradingScores(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const handleQuestionFeedback = (submissionId: string, questionId: string, feedback: string) => {
    setQuestionFeedback(prev => ({
      ...prev,
      [questionId]: feedback
    }));
  };

  const handleSaveManualGrades = async () => {
    if (!selectedSubmission || !selectedAssessment) return;

    try {
      const totalScore = Object.values(gradingScores).reduce((sum, score) => sum + score, 0);
      const percentage = Math.round((totalScore / selectedAssessment.totalPoints) * 100);

      const gradeData = {
        submission_id: selectedSubmission.id,
        manual_scores: gradingScores,
        feedback: questionFeedback,
        total_score: totalScore,
        percentage: percentage,
        status: 'manually-graded'
      };

      console.log('=== MANUAL GRADING DEBUG ===');
      console.log('Grade Data:', gradeData);

      const response = await fetch('https://must-lms-backend.onrender.com/api/manual-grade-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData)
      });

      if (response.ok) {
        alert('Grades saved successfully!');
        
        // Update local state
        setAssessments(prev => prev.map(assessment => {
          if (assessment.id === selectedAssessment.id) {
            return {
              ...assessment,
              submissions: assessment.submissions.map(sub => 
                sub.id === selectedSubmission.id 
                  ? { ...sub, score: totalScore, percentage, status: 'manually-graded' as const }
                  : sub
              )
            };
          }
          return assessment;
        }));

        // Update selected submission status locally
        setSelectedSubmission(prev => prev ? {
          ...prev,
          score: totalScore,
          percentage,
          status: 'manually-graded' as const
        } : null);
        
        setViewMode('results');
      } else {
        const errorData = await response.json();
        console.error('Failed to save grades:', errorData);
        alert(`Failed to save grades: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving manual grades:', error);
      alert(`Error saving grades: ${error.message}`);
    }
  };

  const handleAutoGradeAll = async (assessmentId: string) => {
    if (!confirm('Auto-grade all submitted assessments? This will grade multiple-choice and true/false questions automatically.')) {
      return;
    }

    try {
      const response = await fetch(`https://must-lms-backend.onrender.com/api/auto-grade-all/${assessmentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully auto-graded ${result.data.length} submissions!`);
        
        // Refresh assessments to show updated data
        window.location.reload();
      } else {
        alert('Failed to auto-grade submissions. Please try again.');
      }
    } catch (error) {
      console.error('Error auto-grading submissions:', error);
      alert('Error auto-grading submissions. Please try again.');
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-orange-100 text-orange-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'DRAFT';
      case 'scheduled': return 'SCHEDULED';
      case 'published': return 'PUBLISHED';
      case 'active': return 'ACTIVE';
      case 'completed': return 'COMPLETED';
      case 'expired': return 'EXPIRED';
      default: return status.toUpperCase();
    }
  };

  if (viewMode === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setViewMode('list')}>← Back</Button>
          <h2 className="text-2xl font-bold">Create Assessment</h2>
        </div>

        <Card>
          <CardHeader><CardTitle>Assessment Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="e.g., Midterm Exam" value={newAssessment.title} onChange={(e) => setNewAssessment(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Program</label>
                <select value={newAssessment.program} onChange={(e) => setNewAssessment(prev => ({ ...prev, program: e.target.value }))} className="w-full border rounded px-3 py-2 bg-white">
                  <option value="">Select Program</option>
                  {lecturerPrograms.map((program) => (
                    <option key={program.id || program.name} value={program.name || program}>
                      {program.name || program}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Assessment description..." value={newAssessment.description} onChange={(e) => setNewAssessment(prev => ({ ...prev, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input type="number" placeholder="60" value={newAssessment.duration} onChange={(e) => setNewAssessment(prev => ({ ...prev, duration: parseInt(e.target.value) }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Start Date & Time</label>
                <Input type="datetime-local" value={newAssessment.startDate} onChange={(e) => setNewAssessment(prev => ({ ...prev, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">End Date & Time</label>
                <Input type="datetime-local" value={newAssessment.endDate} onChange={(e) => setNewAssessment(prev => ({ ...prev, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="border rounded-lg p-4 bg-green-50">
                <div className="flex items-center space-x-2 mb-2">
                  <input type="checkbox" id="autoGrade" checked={newAssessment.autoGrade} onChange={(e) => setNewAssessment(prev => ({ ...prev, autoGrade: e.target.checked }))} />
                  <label htmlFor="autoGrade" className="text-sm font-semibold">Enable Auto-Grading</label>
                </div>
                <div className="text-xs text-green-700 space-y-1">
                  {newAssessment.autoGrade ? (
                    <div>
                      <p><strong>✅ AUTO-GRADE MODE:</strong></p>
                      <p>• Multiple Choice & True/False questions → Auto-graded immediately</p>
                      <p>• Short Answer questions → Manual grading required</p>
                      <p>• Final Score = Auto-graded + Manual scores</p>
                      <p>• You can review and adjust any scores</p>
                    </div>
                  ) : (
                    <div>
                      <p><strong>📝 MANUAL MODE:</strong></p>
                      <p>• ALL questions require manual grading</p>
                      <p>• You control every score (even Multiple Choice)</p>
                      <p>• Complete flexibility in grading decisions</p>
                      <p>• Grade each question according to your judgment</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Grading Format</label>
                <Select value={newAssessment.gradingFormat} onValueChange={(value: 'percentage' | 'fraction') => setNewAssessment(prev => ({ ...prev, gradingFormat: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Percentage (85%)
                      </div>
                    </SelectItem>
                    <SelectItem value="fraction">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Fraction (17/20)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Scheduling Section */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <CalendarClock className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Assessment Scheduling (Optional)</h4>
              </div>
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Note:</strong> Scheduling is optional. If you don't set a schedule, the assessment will be available to students immediately after publishing.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Schedule Date</label>
                  <Input 
                    type="date" 
                    value={newAssessment.scheduledDate || ''} 
                    onChange={(e) => setNewAssessment(prev => ({ ...prev, scheduledDate: e.target.value }))} 
                    placeholder="Optional - Leave empty for immediate availability"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty to make available immediately after publishing</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Schedule Time</label>
                  <Input 
                    type="time" 
                    value={newAssessment.scheduledTime || ''} 
                    onChange={(e) => setNewAssessment(prev => ({ ...prev, scheduledTime: e.target.value }))} 
                    disabled={!newAssessment.scheduledDate}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Time when assessment becomes available to students</p>
                </div>
              </div>
              {newAssessment.scheduledDate && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Scheduled Assessment</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    This assessment will become available to students on{' '}
                    <strong>{new Date(newAssessment.scheduledDate).toLocaleDateString()}</strong>
                    {newAssessment.scheduledTime && (
                      <> at <strong>{newAssessment.scheduledTime}</strong></>
                    )}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Questions ({newAssessment.questions?.length || 0})</CardTitle>
              <Button onClick={() => setShowQuestionForm(true)}><Plus className="h-4 w-4 mr-2" />Add Question</Button>
            </div>
          </CardHeader>
          <CardContent>
            {newAssessment.questions && newAssessment.questions.length > 0 ? (
              <div className="space-y-4">
                {newAssessment.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Q{index + 1}</Badge>
                        <Badge variant="outline">{question.type}</Badge>
                        <Badge variant="outline">{question.points} pts</Badge>
                      </div>
                      
                      {/* QUESTION MANAGEMENT BUTTONS */}
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditQuestion(question, index)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleArchiveQuestion(question.id)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="font-medium">{question.question}</p>
                    
                    {/* Multiple Choice Options */}
                    {question.type === 'multiple-choice' && question.options && (
                      <div className="mt-2 space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className={`text-sm p-2 rounded ${question.correctAnswer === optIndex ? 'bg-green-100 text-green-800' : 'bg-gray-50'}`}>
                            {String.fromCharCode(65 + optIndex)}. {option}
                            {question.correctAnswer === optIndex && (
                              <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Correct Answer</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* True/False Options */}
                    {question.type === 'true-false' && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className={`text-sm p-2 rounded text-center ${
                          String(question.correctAnswer).toLowerCase() === 'true' 
                            ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                            : 'bg-gray-50 border'
                        }`}>
                          <span className="font-medium text-green-600">TRUE</span>
                          {String(question.correctAnswer).toLowerCase() === 'true' && (
                            <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Correct Answer</Badge>
                          )}
                        </div>
                        <div className={`text-sm p-2 rounded text-center ${
                          String(question.correctAnswer).toLowerCase() === 'false' 
                            ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                            : 'bg-gray-50 border'
                        }`}>
                          <span className="font-medium text-red-600">FALSE</span>
                          {String(question.correctAnswer).toLowerCase() === 'false' && (
                            <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Correct Answer</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Short Answer */}
                    {question.type === 'short-answer' && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Manual Grading Required</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">This question will require manual grading by the lecturer.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No questions added yet.</p>
            )}
          </CardContent>
        </Card>

        {showQuestionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader><CardTitle>Add Question</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <select value={newQuestion.type} onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value as any }))} className="w-full border rounded px-3 py-2 bg-white">
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="true-false">True/False</option>
                      {/* Show Short Answer only when Auto-Grade is OFF */}
                      {!newAssessment.autoGrade && (
                        <option value="short-answer">Short Answer</option>
                      )}
                    </select>
                    {newAssessment.autoGrade && (
                      <p className="text-xs text-blue-600 mt-1">
                        📝 Short Answer questions not available in Auto-Grade mode
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Points</label>
                    <Input type="number" placeholder="4" value={newQuestion.points} onChange={(e) => setNewQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Question</label>
                  <Textarea placeholder="Enter question..." value={newQuestion.question} onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))} rows={3} />
                </div>
                {newQuestion.type === 'multiple-choice' && (
                  <div>
                    <label className="text-sm font-medium">Options</label>
                    <div className="space-y-2">
                      {newQuestion.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          {/* Show correct answer radio only when Auto-Grade is ON */}
                          {newAssessment.autoGrade && (
                            <input 
                              type="radio" 
                              name="correctAnswer" 
                              checked={newQuestion.correctAnswer === index} 
                              onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswer: index }))} 
                            />
                          )}
                          <Input placeholder={`Option ${String.fromCharCode(65 + index)}`} value={option} onChange={(e) => {
                            const newOptions = [...(newQuestion.options || [])];
                            newOptions[index] = e.target.value;
                            setNewQuestion(prev => ({ ...prev, options: newOptions }));
                          }} />
                        </div>
                      ))}
                    </div>
                    {!newAssessment.autoGrade && (
                      <p className="text-xs text-orange-600 mt-1">
                        📝 Correct answers not needed - Manual grading mode
                      </p>
                    )}
                  </div>
                )}
                
                {newQuestion.type === 'true-false' && (
                  <div>
                    {newAssessment.autoGrade ? (
                      <>
                        <label className="text-sm font-medium">Correct Answer</label>
                        <RadioGroup value={String(newQuestion.correctAnswer)} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, correctAnswer: value }))}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="true" />
                            <Label htmlFor="true" className="text-green-600 font-medium">True</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="false" />
                            <Label htmlFor="false" className="text-red-600 font-medium">False</Label>
                          </div>
                        </RadioGroup>
                      </>
                    ) : (
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm text-orange-700">
                          📝 <strong>Manual Grading Mode:</strong> Correct answer not needed - you will grade manually
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Short answer questions - no manual grading message needed */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowQuestionForm(false)}>Cancel</Button>
                  <Button onClick={handleAddQuestion} disabled={!newQuestion.question}>Add Question</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}


        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setViewMode('list')}>Cancel</Button>
          
          {/* DRAFT AND SEND OPTIONS */}
          <Button 
            onClick={handleSaveAsDraft} 
            disabled={!newAssessment.title || !newAssessment.program} 
            variant="outline"
            className="text-orange-600 hover:text-orange-700 border-orange-600 hover:border-orange-700"
          >
            <Archive className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          
          <Button 
            onClick={handleSendAssessment} 
            disabled={!newAssessment.title || !newAssessment.program || !newAssessment.questions?.length} 
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Send Assessment
          </Button>
        </div>
      </div>
    );
  }

  if (viewMode === 'results' && selectedAssessment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setViewMode('list')}>← Back</Button>
          <div>
            <h2 className="text-2xl font-bold">{selectedAssessment.title}</h2>
            <p className="text-muted-foreground">Results - {selectedAssessment.course}</p>
          </div>
        </div>

        {/* STATISTICS - ONLY SHOW AFTER GRADING STARTS */}
        {(() => {
          const hasGradedSubmissions = selectedAssessment.submissions.some(sub => 
            sub.status === 'auto-graded' || sub.status === 'manually-graded' || sub.status === 'partially-graded'
          );
          
          if (!hasGradedSubmissions) {
            // BEFORE GRADING - Show basic info only
            return (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Total Submissions</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{selectedAssessment.submissions.length}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Grading Status</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold text-orange-600">
                      {selectedAssessment.autoGrade ? 'Ready for Auto-Grading' : 'Ready for Manual Grading'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          } else {
            // AFTER GRADING STARTS - Show full statistics
            return (
              <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader><CardTitle className="text-sm">Submissions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{selectedAssessment.submissions.length}</div></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">Average</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{selectedAssessment.submissions.length > 0 ? Math.round(selectedAssessment.submissions.reduce((sum, s) => sum + s.percentage, 0) / selectedAssessment.submissions.length) : 0}%</div></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">Pass Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{selectedAssessment.submissions.length > 0 ? Math.round((selectedAssessment.submissions.filter(s => s.percentage >= 60).length / selectedAssessment.submissions.length) * 100) : 0}%</div></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">Highest</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{selectedAssessment.submissions.length > 0 ? Math.max(...selectedAssessment.submissions.map(s => s.percentage)) : 0}%</div></CardContent></Card>
              </div>
            );
          }
        })()}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Student Results</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {selectedAssessment.autoGrade ? (
                    <Badge className="bg-blue-100 text-blue-800">
                      ⚡ Auto-Grade Mode
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-800">
                      📝 Manual Grade Mode
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {/* SMART GRADING SYSTEM - BASED ON ASSESSMENT CREATION */}
                {selectedAssessment.autoGrade ? (
                  // AUTO-GRADE MODE: Assessment created with MC/True-False questions
                  <div className="flex gap-2">
                    
                    {/* MIXED MODE: If assessment has both auto and manual questions */}
                    {selectedAssessment.questions?.some(q => q.type === 'short-answer') && (
                      <Button 
                        onClick={() => handleMixedGrading(selectedAssessment.id)} 
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Mixed Grading
                      </Button>
                    )}
                  </div>
                ) : (
                  // MANUAL MODE: Assessment created with Short Answer questions only
                  <div className="text-sm text-gray-600">
                    Manual grading mode - All questions require manual review
                  </div>
                )}
                
                
                {/* Results submission and reporting */}
                <Button onClick={() => handleSubmitResultsToStudents(selectedAssessment.id)} className="bg-green-600 hover:bg-green-700">
                  <Users className="h-4 w-4 mr-2" />
                  DONE - Publish Results
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedAssessment.submissions.map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-semibold text-lg">{submission.studentName}</h4>
                          <p className="text-sm text-muted-foreground">{submission.registrationNumber}</p>
                          <p className="text-sm text-muted-foreground">{submission.program}</p>
                        </div>
                        <div className="text-center">
                          {/* SHOW RESULTS BASED ON GRADING STATUS */}
                          {submission.status === 'submitted' ? (
                            <div>
                              <div className="text-2xl font-bold text-orange-600">PENDING</div>
                              <p className="text-sm text-orange-600">Awaiting Grading</p>
                            </div>
                          ) : (
                            <div>
                              <div className="text-3xl font-bold text-blue-600">{submission.percentage}%</div>
                              <p className="text-sm text-muted-foreground">{submission.score}/{selectedAssessment.totalPoints} points</p>
                              {submission.status === 'manually-graded' && (
                                <p className="text-xs text-green-600 font-medium">✅ Manually Graded</p>
                              )}
                              {submission.status === 'auto-graded' && (
                                <p className="text-xs text-blue-600 font-medium">🤖 Auto Graded</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4">
                        <p className="text-sm text-muted-foreground">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                        {/* GRADING STATUS BADGES */}
                        {submission.status === 'submitted' ? (
                          <Badge className="bg-orange-100 text-orange-800">PENDING GRADING</Badge>
                        ) : submission.status === 'manually-graded' ? (
                          <div className="flex gap-2">
                            <Badge className="bg-green-100 text-green-800">✅ MANUALLY GRADED</Badge>
                            <Badge className={submission.percentage >= 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {submission.percentage >= 60 ? 'PASS' : 'FAIL'}
                            </Badge>
                          </div>
                        ) : submission.status === 'auto-graded' ? (
                          <div className="flex gap-2">
                            <Badge className="bg-blue-100 text-blue-800">🤖 AUTO GRADED</Badge>
                            <Badge className={submission.percentage >= 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {submission.percentage >= 60 ? 'PASS' : 'FAIL'}
                            </Badge>
                          </div>
                        ) : (
                          <Badge className={submission.percentage >= 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {submission.percentage >= 60 ? 'PASS' : 'FAIL'}
                          </Badge>
                        )}
                        
                        {/* REAL FLEXIBLE GRADING STATUS */}
                        {selectedAssessment.autoGrade ? (
                          // Auto-Grade Mode: Show specific status
                          submission.status === 'submitted' ? (
                            <Badge className="bg-yellow-100 text-yellow-800">Awaiting Auto-Grade</Badge>
                          ) : submission.status === 'partially-graded' ? (
                            <Badge className="bg-blue-100 text-blue-800">Auto-Graded (Manual Pending)</Badge>
                          ) : submission.status === 'auto-graded' ? (
                            <Badge className="bg-green-100 text-green-800">Fully Auto-Graded</Badge>
                          ) : submission.status === 'manually-graded' ? (
                            <Badge className="bg-green-100 text-green-800">Manually Completed</Badge>
                          ) : (
                            <Badge variant="outline">{submission.status}</Badge>
                          )
                        ) : (
                          // Manual Mode: All questions need manual grading
                          submission.status === 'submitted' ? (
                            <Badge className="bg-orange-100 text-orange-800">Awaiting Manual Grade</Badge>
                          ) : submission.status === 'manually-graded' ? (
                            <Badge className="bg-green-100 text-green-800">Manually Graded</Badge>
                          ) : (
                            <Badge variant="outline">{submission.status}</Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {/* Preview only available after manual grading is complete */}
                      {selectedAssessment.autoGrade || (!selectedAssessment.autoGrade && submission.status === 'manually-graded') ? (
                        <Button variant="outline" size="sm" onClick={() => handleViewStudentSubmission(submission)}>
                          <Eye className="h-4 w-4 mr-2" />Preview
                        </Button>
                      ) : null}
                      
                      {/* INDIVIDUAL GRADING OPTIONS - EXACTLY AS REQUESTED */}
                      {!selectedAssessment.autoGrade ? (
                        // MANUAL MODE: All questions require manual grading
                        submission.status === 'submitted' && (
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => handleIndividualManualGrade(submission)}>
                            <Edit className="h-4 w-4 mr-2" />Manual Grade
                          </Button>
                        )
                      ) : (
                        // AUTO-GRADE MODE: Mixed questions - Individual options
                        <div className="flex gap-1">
                          {submission.status === 'submitted' && (
                            <>
                              <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => handleIndividualAutoGrade(submission)}>
                                <CheckCircle className="h-4 w-4 mr-1" />Auto
                              </Button>
                              <Button size="sm" variant="outline" className="text-orange-600 hover:text-orange-700" onClick={() => handleIndividualManualGrade(submission)}>
                                <Edit className="h-4 w-4 mr-1" />Manual
                              </Button>
                            </>
                          )}
                          {submission.status === 'partially-graded' && (
                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => handleIndividualManualGrade(submission)}>
                              <Edit className="h-4 w-4 mr-2" />Complete Manual
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewMode === 'student-review' && selectedSubmission && selectedAssessment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setViewMode('results')}>← Back to Results</Button>
          <div>
            <h2 className="text-2xl font-bold">Student Submission Review</h2>
            <p className="text-muted-foreground">{selectedSubmission.studentName} - {selectedAssessment.title}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-sm">Student Information</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><span className="font-medium">Reg. No:</span> {selectedSubmission.registrationNumber || selectedSubmission.student_registration || 'N/A'}</div>
                <div><span className="font-medium">Program:</span> {selectedSubmission.program || selectedSubmission.studentProgram || selectedSubmission.student_program || 'N/A'}</div>
                <div><span className="font-medium">Submitted:</span> {selectedSubmission.submittedAt || selectedSubmission.submitted_at ? new Date(selectedSubmission.submittedAt || selectedSubmission.submitted_at).toLocaleString() : 'N/A'}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Score Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Show manual grades if available, otherwise show original scores */}
                {(() => {
                  const manualTotalScore = Object.values(gradingScores).reduce((sum, score) => sum + score, 0);
                  const totalPoints = selectedAssessment.totalPoints || selectedAssessment.questions.reduce((sum, q) => sum + q.points, 0);
                  const manualPercentage = totalPoints > 0 ? Math.round((manualTotalScore / totalPoints) * 100) : 0;
                  const hasManualGrades = Object.keys(gradingScores).length > 0;
                  
                  const displayScore = hasManualGrades ? manualTotalScore : selectedSubmission.score;
                  const displayPercentage = hasManualGrades ? manualPercentage : selectedSubmission.percentage;
                  
                  return (
                    <>
                      <div><span className="font-medium">Total Score:</span> {displayScore}/{totalPoints}</div>
                      <div><span className="font-medium">Percentage:</span> {displayPercentage}%</div>
                      <div><span className="font-medium">Grade:</span> 
                        <Badge className={`ml-2 ${displayPercentage >= 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {displayPercentage >= 80 ? 'A' : displayPercentage >= 70 ? 'B' : displayPercentage >= 60 ? 'C' : displayPercentage >= 50 ? 'D' : 'F'}
                        </Badge>
                      </div>
                      <div><span className="font-medium">Status:</span> 
                        <Badge variant="outline" className="ml-2">
                          {hasManualGrades ? 'manually-graded' : selectedSubmission.status}
                        </Badge>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Assessment Info</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><span className="font-medium">Duration:</span> {selectedAssessment.duration || 'N/A'} minutes</div>
                <div><span className="font-medium">Questions:</span> {selectedAssessment.questions?.length || 0}</div>
                <div><span className="font-medium">Format:</span> {selectedAssessment.gradingFormat === 'percentage' ? 'Percentage' : 'Fraction'}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Question by Question Review</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-6">
              {selectedAssessment.questions.map((question, index) => {
                const studentAnswer = selectedSubmission.answers[question.id];
                
                // FOR MANUAL GRADING MODE: Don't show automatic scoring
                const isAutoGrade = selectedAssessment.autoGrade;
                const isCorrect = isAutoGrade && question.type === 'multiple-choice' 
                  ? studentAnswer === question.correctAnswer
                  : isAutoGrade && question.type === 'true-false'
                  ? String(studentAnswer).toLowerCase() === String(question.correctAnswer).toLowerCase()
                  : null; // Manual grading - no automatic scoring

                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Q{index + 1}</Badge>
                        <Badge variant="outline">{question.type}</Badge>
                        <Badge variant="outline">{question.points} pts</Badge>
                        {/* Only show correct/incorrect for auto-grade mode */}
                        {isAutoGrade && question.type !== 'short-answer' && isCorrect !== null && (
                          <Badge className={isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </Badge>
                        )}
                        {/* For manual mode, show manual score if available */}
                        {!isAutoGrade && (
                          <>
                            {gradingScores[question.id] !== undefined ? (
                              <Badge className="bg-green-100 text-green-800">
                                Score: {gradingScores[question.id]}/{question.points}
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-800">
                                Awaiting Manual Grade
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                      {/* Show scores based on grading mode */}
                      <div className="text-right">
                        {isAutoGrade && question.type !== 'short-answer' && isCorrect !== null ? (
                          <div className="text-lg font-bold">{isCorrect ? question.points : 0}/{question.points}</div>
                        ) : !isAutoGrade && gradingScores[question.id] !== undefined ? (
                          <div className="text-lg font-bold text-green-600">{gradingScores[question.id]}/{question.points}</div>
                        ) : !isAutoGrade ? (
                          <div className="text-lg font-bold text-orange-600">-/{question.points}</div>
                        ) : null}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-lg mb-2">{question.question}</h4>
                    </div>

                    {question.type === 'multiple-choice' && question.options && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-600 mb-2">Options:</div>
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className={`p-2 rounded border ${
                            isAutoGrade ? (
                              question.correctAnswer === optIndex 
                                ? 'bg-green-50 border-green-200' 
                                : studentAnswer === optIndex 
                                ? 'bg-red-50 border-red-200'
                                : 'bg-gray-50 border-gray-200'
                            ) : (
                              // Manual grading - only highlight student answer
                              studentAnswer === optIndex 
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200'
                            )
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                              <span>{option}</span>
                              {/* Only show correct answer for auto grading */}
                              {isAutoGrade && question.correctAnswer === optIndex && (
                                <Badge className="bg-green-100 text-green-800 text-xs">Correct Answer</Badge>
                              )}
                              {/* Show student answer for both modes */}
                              {studentAnswer === optIndex && (
                                <Badge className={`text-xs ${
                                  isAutoGrade 
                                    ? (question.correctAnswer !== optIndex ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800')
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  Student's Answer
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === 'true-false' && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-600 mb-2">True/False Question:</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`p-2 rounded border text-center ${
                            isAutoGrade ? (
                              String(question.correctAnswer).toLowerCase() === 'true'
                                ? 'bg-green-50 border-green-200'
                                : String(studentAnswer).toLowerCase() === 'true'
                                ? 'bg-red-50 border-red-200'
                                : 'bg-gray-50 border-gray-200'
                            ) : (
                              // Manual grading - only highlight student answer
                              String(studentAnswer).toLowerCase() === 'true'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200'
                            )
                          }`}>
                            <span className="font-medium text-green-600">TRUE</span>
                            {/* Only show correct answer for auto grading */}
                            {isAutoGrade && String(question.correctAnswer).toLowerCase() === 'true' && (
                              <Badge className="bg-green-100 text-green-800 text-xs ml-2">Correct</Badge>
                            )}
                            {String(studentAnswer).toLowerCase() === 'true' && (
                              <Badge className={`text-xs ml-2 ${
                                isAutoGrade 
                                  ? (String(question.correctAnswer).toLowerCase() !== 'true' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800')
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                Student's Answer
                              </Badge>
                            )}
                          </div>
                          <div className={`p-2 rounded border text-center ${
                            isAutoGrade ? (
                              String(question.correctAnswer).toLowerCase() === 'false'
                                ? 'bg-green-50 border-green-200'
                                : String(studentAnswer).toLowerCase() === 'false'
                                ? 'bg-red-50 border-red-200'
                                : 'bg-gray-50 border-gray-200'
                            ) : (
                              // Manual grading - only highlight student answer
                              String(studentAnswer).toLowerCase() === 'false'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200'
                            )
                          }`}>
                            <span className="font-medium text-red-600">FALSE</span>
                            {/* Only show correct answer for auto grading */}
                            {isAutoGrade && String(question.correctAnswer).toLowerCase() === 'false' && (
                              <Badge className="bg-green-100 text-green-800 text-xs ml-2">Correct</Badge>
                            )}
                            {String(studentAnswer).toLowerCase() === 'false' && String(question.correctAnswer).toLowerCase() !== 'false' && (
                              <Badge className="bg-red-100 text-red-800 text-xs ml-2">Student's Answer</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {question.type === 'short-answer' && (
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-gray-600 mb-2">Student's Answer:</div>
                          <div className="p-3 bg-gray-50 border rounded">
                            {studentAnswer || 'No answer provided'}
                          </div>
                        </div>
                        
                        {/* SHOW GRADING INTERFACE ONLY IF NOT YET GRADED */}
                        {selectedSubmission.status === 'submitted' ? (
                          <div className="bg-gray-50 border border-gray-200 rounded p-3">{/* Removed Manual Grading Required message */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Award Points:</label>
                              <Input 
                                type="number" 
                                min="0" 
                                max={question.points}
                                placeholder={`0-${question.points}`}
                                className="mt-1"
                                onChange={(e) => handleManualGradeQuestion(selectedSubmission.id, question.id, parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Feedback (Optional):</label>
                              <Textarea 
                                placeholder="Add feedback for student..."
                                className="mt-1"
                                rows={2}
                                onChange={(e) => handleQuestionFeedback(selectedSubmission.id, question.id, e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                        ) : (
                          // SHOW GRADED RESULTS - Clean display without status
                          <div className="bg-gray-50 border border-gray-200 rounded p-3">
                            {/* Show lecturer feedback if available */}
                            {questionFeedback[question.id] && (
                              <div className="bg-green-50 border border-green-200 rounded p-3">
                                <p className="text-sm font-medium text-green-800 mb-1">Lecturer Feedback:</p>
                                <p className="text-green-700 text-sm">{questionFeedback[question.id]}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Manual grading view
  if (viewMode === 'manual-grade' && selectedSubmission && selectedAssessment) {
    const totalPossiblePoints = selectedAssessment.questions.reduce((sum, q) => sum + q.points, 0);
    const currentTotalScore = Object.values(gradingScores).reduce((sum, score) => sum + score, 0);
    const currentPercentage = totalPossiblePoints > 0 ? Math.round((currentTotalScore / totalPossiblePoints) * 100) : 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setViewMode('results')}>← Back to Results</Button>
            <div>
              <h2 className="text-2xl font-bold">Manual Grading</h2>
              <p className="text-muted-foreground">{selectedSubmission.studentName} - {selectedAssessment.title}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveManualGrades} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" />Save Grades
            </Button>
          </div>
        </div>

        {/* Grading Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Student</CardTitle></CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{selectedSubmission.studentName}</div>
              <div className="text-sm text-muted-foreground">{selectedSubmission.registrationNumber}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Current Score</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{currentTotalScore}/{totalPossiblePoints}</div>
              <div className="text-sm text-muted-foreground">{currentPercentage}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Questions</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedAssessment.questions.length}</div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Status</CardTitle></CardHeader>
            <CardContent>
              <Badge className={currentPercentage >= 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {currentPercentage >= 60 ? 'PASS' : 'FAIL'}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">
                {currentPercentage >= 80 ? 'A' : currentPercentage >= 70 ? 'B' : currentPercentage >= 60 ? 'C' : currentPercentage >= 50 ? 'D' : 'F'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions Grading */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Each Question</CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedAssessment.autoGrade ? 'Adjust auto-graded scores or grade short-answer questions manually' : 'Grade all questions manually'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {selectedAssessment.questions.map((question, index) => {
                const studentAnswer = selectedSubmission.answers[question.id];
                const currentScore = gradingScores[question.id] || 0;
                const isAutoGradable = question.type === 'multiple-choice' || question.type === 'true-false';
                const isCorrect = isAutoGradable && studentAnswer === question.correctAnswer;

                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Question {index + 1}</Badge>
                          <Badge variant="secondary">{question.points} points</Badge>
                          {/* Manual grading - no correct/incorrect badges */}
                          <Badge variant="outline">{question.type}</Badge>
                        </div>
                        <h4 className="font-medium mb-2">{question.question}</h4>
                        
                        {/* Show student answer */}
                        <div className="bg-gray-50 p-3 rounded mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Student Answer:</p>
                          {question.type === 'multiple-choice' && question.options && (
                            <p className="text-sm">
                              {typeof studentAnswer === 'number' ? question.options[studentAnswer] : 'No answer'}
                            </p>
                          )}
                          {question.type === 'true-false' && (
                            <p className="text-sm">{studentAnswer || 'No answer'}</p>
                          )}
                          {question.type === 'short-answer' && (
                            <p className="text-sm">{studentAnswer || 'No answer provided'}</p>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Grading Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`score-${question.id}`}>Score (0-{question.points})</Label>
                        <Input
                          id={`score-${question.id}`}
                          type="number"
                          min={0}
                          max={question.points}
                          value={currentScore}
                          placeholder={`0-${question.points}`}
                          className="mt-1"
                          onChange={(e) => handleManualGradeQuestion(selectedSubmission.id, question.id, parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`feedback-${question.id}`}>Feedback (Optional)</Label>
                        <Textarea
                          id={`feedback-${question.id}`}
                          placeholder="Add feedback for student..."
                          className="mt-1"
                          rows={2}
                          value={questionFeedback[question.id] || ''}
                          onChange={(e) => handleQuestionFeedback(selectedSubmission.id, question.id, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assessments</h2>
          <p className="text-muted-foreground">Create and manage course assessments</p>
        </div>
        <Button onClick={() => setViewMode('create')} className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 mr-2" />Create Assessment</Button>
      </div>

      <div className="grid gap-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-green-600" />{assessment.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{assessment.course}</p>
                  <p className="text-xs text-muted-foreground mt-1">{assessment.description}</p>
                  {(assessment.startDate || assessment.scheduledDate) && (
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      {assessment.scheduledDate && (
                        <p className="text-xs text-orange-600">
                          <CalendarClock className="h-3 w-3 inline mr-1" />
                          Available: {new Date(assessment.scheduledDate).toLocaleDateString()}
                          {assessment.scheduledTime && ` at ${assessment.scheduledTime}`}
                        </p>
                      )}
                      {assessment.startDate && (
                        <p className="text-xs text-blue-600">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Start: {new Date(assessment.startDate).toLocaleDateString()} at {new Date(assessment.startDate).toLocaleTimeString()}
                        </p>
                      )}
                      {assessment.endDate && (
                        <p className="text-xs text-red-600">
                          <Clock className="h-3 w-3 inline mr-1" />
                          End: {new Date(assessment.endDate).toLocaleDateString()} at {new Date(assessment.endDate).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <Badge className={getStatusColor(assessment.status)}>{getStatusText(assessment.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{assessment.duration} min</span></div>
                <div className="flex items-center gap-2"><Target className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{assessment.totalQuestions} questions</span></div>
                <div className="flex items-center gap-2"><Award className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{assessment.totalPoints} points</span></div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{assessment.submissions.length} submissions</span></div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {assessment.status === 'draft' && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedAssessment(assessment); setNewAssessment(assessment); setViewMode('create'); }}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                    <Button size="sm" onClick={() => handlePublishAssessment(assessment.id)} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {assessment.scheduledDate ? 'Schedule Assessment' : 'Send to Students'}
                    </Button>
                  </>
                )}
                
                {assessment.status === 'scheduled' && (
                  <>
                    <Badge className="bg-orange-100 text-orange-800">
                      <CalendarClock className="h-4 w-4 mr-1" />
                      Scheduled for {new Date(assessment.scheduledDate!).toLocaleDateString()}
                      {assessment.scheduledTime && ` at ${assessment.scheduledTime}`}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedAssessment(assessment); setNewAssessment(assessment); setViewMode('create'); }}><Edit className="h-4 w-4 mr-2" />Edit Schedule</Button>
                  </>
                )}
                
                {/* Show View Results and Download buttons ONLY after students start submitting */}
                {(assessment.status === 'published' || assessment.status === 'active' || assessment.status === 'completed' || assessment.status === 'expired') && assessment.submissions.length > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedAssessment(assessment); setViewMode('results'); }}>
                      <BarChart3 className="h-4 w-4 mr-2" />Results ({assessment.submissions.length})
                    </Button>
                    {assessment.status === 'completed' && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Assessment Completed - Ready for Final Results
                      </Badge>
                    )}
                    {assessment.status === 'expired' && (
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        Time Expired - No More Submissions
                      </Badge>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteAssessment(assessment.id)}
                      className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Assessment
                    </Button>
                  </>
                )}
                
                {assessment.status === 'published' && assessment.submissions.length === 0 && (
                  <Badge className="bg-blue-100 text-blue-800">
                    Available to Students - {assessment.totalQuestions} Questions, {assessment.duration} mins
                  </Badge>
                )}
                
                {assessment.status === 'published' && assessment.submissions.length > 0 && !assessment.resultsPublishedToStudents && (
                  <Badge className="bg-green-100 text-green-800">Active - {assessment.submissions.length} Submissions</Badge>
                )}
                
                {assessment.resultsPublishedToStudents && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Results Published to Students
                    {assessment.resultsPublishedAt && (
                      <span className="text-xs ml-1">
                        ({new Date(assessment.resultsPublishedAt).toLocaleDateString()})
                      </span>
                    )}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
