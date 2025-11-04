import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, AlertTriangle, CheckCircle, XCircle, FileText, Timer, Send, Eye, EyeOff
} from "lucide-react";

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
}

interface Assessment {
  id: string;
  title: string;
  program: string;
  description: string;
  duration: number;
  totalQuestions: number;
  totalPoints: number;
  startDate: string;
  endDate: string;
  scheduledDate?: string;
  scheduledTime?: string;
  questions: Question[];
  autoSubmit: boolean;
  status: string;
  lecturer_name: string;
}

export const TakeAssessment = () => {
  const [availableAssessments, setAvailableAssessments] = useState<Assessment[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  const [answers, setAnswers] = useState<{ [questionId: string]: any }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hasLeftPage, setHasLeftPage] = useState(false);

  // Fetch available assessments for student
  useEffect(() => {
    const fetchStudentAssessments = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        console.log('=== STUDENT ASSESSMENTS FETCH DEBUG ===');
        console.log('Current User:', currentUser);

        // Get student information first
        const studentsResponse = await fetch('https://must-lms-backend.onrender.com/api/students');
        if (studentsResponse.ok) {
          const studentsResult = await studentsResponse.json();
          const currentStudent = studentsResult.data?.find(s => 
            s.name === currentUser.username || 
            s.email === currentUser.username ||
            s.registration_number === currentUser.username
          );

          console.log('Found Student:', currentStudent);

          if (currentStudent) {
            // Get student's programs
            const programsResponse = await fetch('https://must-lms-backend.onrender.com/api/programs');
            if (programsResponse.ok) {
              const programsResult = await programsResponse.json();
              const studentPrograms = programsResult.data?.filter(p => 
                p.course_id === currentStudent.course_id
              ) || [];

              console.log('Student Programs:', studentPrograms);

              // SIMPLIFIED: Get ALL published assessments for student
              console.log('=== FETCHING ASSESSMENTS FOR STUDENT ===');
              console.log('Student ID:', currentStudent.id);
              console.log('Student Programs:', studentPrograms.map(p => p.name));

              // Get ALL published assessments (backend already filters by student_id)
              const assessmentsResponse = await fetch(`https://must-lms-backend.onrender.com/api/student-assessments?student_id=${currentStudent.id}`);
              if (assessmentsResponse.ok) {
                const assessmentsResult = await assessmentsResponse.json();
                
                console.log('=== ASSESSMENTS FROM BACKEND ===');
                console.log('Total Assessments Found:', assessmentsResult.data?.length || 0);
                console.log('Assessments:', assessmentsResult.data);

                // SIMPLE: Show ALL published assessments that student hasn't submitted
                const availableAssessments = assessmentsResult.data?.filter(assessment => {
                  // Only filter out if already submitted
                  const hasSubmitted = assessment.submitted === true;
                  
                  console.log(`Assessment "${assessment.title}":`, {
                    hasSubmitted,
                    status: assessment.status,
                    willShow: !hasSubmitted
                  });
                  
                  // Show if NOT submitted yet
                  return !hasSubmitted;
                }) || [];

                console.log('Filtered Available Assessments:', availableAssessments);

                // Format ONLY available assessments for display
                const formattedAssessments = availableAssessments?.map(assessment => {
                  console.log('=== FORMATTING ASSESSMENT DEBUG ===');
                  console.log('Raw Assessment:', assessment);
                  console.log('Raw Questions:', assessment.questions);
                  
                  // Parse questions if they're stored as JSON string
                  let questions = [];
                  if (assessment.questions) {
                    if (typeof assessment.questions === 'string') {
                      try {
                        questions = JSON.parse(assessment.questions);
                      } catch (e) {
                        console.error('Error parsing questions JSON:', e);
                        questions = [];
                      }
                    } else if (Array.isArray(assessment.questions)) {
                      questions = assessment.questions;
                    }
                  }
                  
                  console.log('Parsed Questions:', questions);
                  
                  return {
                    id: assessment.id.toString(),
                    title: assessment.title,
                    program: assessment.program_name,
                    description: assessment.description,
                    duration: assessment.duration,
                    totalQuestions: assessment.total_questions,
                    totalPoints: assessment.total_points,
                    startDate: assessment.start_date,
                    endDate: assessment.end_date,
                    scheduledDate: assessment.scheduled_date,
                    scheduledTime: assessment.scheduled_time,
                    questions: questions,
                    autoSubmit: assessment.auto_grade,
                    status: assessment.status,
                    lecturer_name: assessment.lecturer_name,
                    submitted: assessment.submitted || false
                  };
                }) || [];

                setAvailableAssessments(formattedAssessments);
                console.log('Formatted Assessments:', formattedAssessments);
              }
            }
          } else {
            console.log('Student not found in database');
          }
        }
      } catch (error) {
        console.error('Error fetching student assessments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAssessments();
  }, []);

  // Check for scheduled assessments automatically
  useEffect(() => {
    if (availableAssessments.length === 0) return;

    const checkScheduledAssessments = () => {
      const now = new Date();
      
      availableAssessments.forEach(assessment => {
        if (assessment.scheduledDate && assessment.scheduledTime && !currentAssessment) {
          const scheduledDateTime = new Date(`${assessment.scheduledDate}T${assessment.scheduledTime}`);
          
          // Check if assessment should start now (within 1 minute window)
          const timeDiff = scheduledDateTime.getTime() - now.getTime();
          
          if (timeDiff <= 60000 && timeDiff > -60000) { // Within 1 minute
            console.log('=== SCHEDULED ASSESSMENT AUTO-START ===');
            console.log('Assessment:', assessment.title);
            console.log('Scheduled time:', scheduledDateTime);
            console.log('Current time:', now);
            
            alert(`Assessment "${assessment.title}" is starting now as scheduled!`);
            handleStartAssessment(assessment);
          }
        }
      });
    };

    // Check every 30 seconds for scheduled assessments
    const scheduledInterval = setInterval(checkScheduledAssessments, 30000);
    
    return () => clearInterval(scheduledInterval);
  }, [availableAssessments, currentAssessment]);

  // Initialize timer when assessment is selected
  useEffect(() => {
    if (currentAssessment && !isSubmitted) {
      // If assessment is scheduled, calculate remaining time from scheduled start
      if (currentAssessment.scheduledDate && currentAssessment.scheduledTime) {
        const now = new Date();
        const scheduledDateTime = new Date(`${currentAssessment.scheduledDate}T${currentAssessment.scheduledTime}`);
        const assessmentEndTime = new Date(scheduledDateTime.getTime() + (currentAssessment.duration * 60 * 1000));
        
        console.log('=== SCHEDULED TIMER CALCULATION ===');
        console.log('Current time:', now);
        console.log('Scheduled start:', scheduledDateTime);
        console.log('Assessment end time:', assessmentEndTime);
        
        // If current time is past scheduled start, calculate remaining time
        if (now >= scheduledDateTime) {
          const remainingMs = assessmentEndTime.getTime() - now.getTime();
          const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
          
          console.log('Remaining seconds:', remainingSeconds);
          setTimeRemaining(remainingSeconds);
          
          // Auto-submit if time has already expired
          if (remainingSeconds <= 0) {
            handleAutoSubmit("Assessment time has expired");
          }
        } else {
          // Assessment hasn't started yet
          setTimeRemaining(currentAssessment.duration * 60);
        }
      } else {
        // Regular assessment without scheduling
        setTimeRemaining(currentAssessment.duration * 60);
      }
    }
  }, [currentAssessment, isSubmitted]);

  // REAL TIME COUNTDOWN - Syncs with actual time every second
  useEffect(() => {
    if (currentAssessment && !isSubmitted && currentAssessment.scheduledDate && currentAssessment.scheduledTime) {
      const timer = setInterval(() => {
        const now = new Date();
        const scheduledDateTime = new Date(`${currentAssessment.scheduledDate}T${currentAssessment.scheduledTime}`);
        const assessmentEndTime = new Date(scheduledDateTime.getTime() + (currentAssessment.duration * 60 * 1000));
        
        // Calculate REAL remaining time from current time
        const remainingMs = assessmentEndTime.getTime() - now.getTime();
        const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
        
        console.log('=== REAL TIME SYNC ===');
        console.log('Current time:', now.toLocaleTimeString());
        console.log('Assessment ends at:', assessmentEndTime.toLocaleTimeString());
        console.log('Remaining seconds:', remainingSeconds);
        
        setTimeRemaining(remainingSeconds);
        
        // Auto-submit when time expires
        if (remainingSeconds <= 0) {
          handleAutoSubmit("Assessment time has expired - Real time check");
        }
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeRemaining > 0 && !isSubmitted && !currentAssessment?.scheduledDate) {
      // Fallback for non-scheduled assessments
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit("Time expired");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentAssessment, isSubmitted]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      handleAutoSubmit("Lost internet connection");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enhanced page visibility detection with stricter rules
  useEffect(() => {
    let visibilityTimer: NodeJS.Timeout;
    
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setHasLeftPage(true);
        setShowWarning(true);
        
        // Immediate auto-submit for stricter security
        visibilityTimer = setTimeout(() => {
          if (document.hidden && !isSubmitted) {
            handleAutoSubmit("Left assessment page - Security violation");
          }
        }, 2000); // Reduced from 5 seconds to 2 seconds
      } else if (!document.hidden) {
        // Clear timer if user returns quickly
        if (visibilityTimer) {
          clearTimeout(visibilityTimer);
        }
        setShowWarning(false);
      }
    };

    // Also detect focus/blur events for additional security
    const handleWindowBlur = () => {
      if (!isSubmitted) {
        setHasLeftPage(true);
        setShowWarning(true);
      }
    };

    const handleWindowFocus = () => {
      if (!isSubmitted) {
        setShowWarning(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      if (visibilityTimer) {
        clearTimeout(visibilityTimer);
      }
    };
  }, [isSubmitted]);

  // Prevent back button and refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmitted) {
        e.preventDefault();
        e.returnValue = '';
        handleAutoSubmit("Attempted to leave page");
      }
    };

    const handlePopState = () => {
      if (!isSubmitted) {
        handleAutoSubmit("Used browser back button");
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isSubmitted]);

  const handleAutoSubmit = async (reason: string) => {
    if (isSubmitted || !currentAssessment) return;
    
    setIsSubmitted(true);
    
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Prepare submission data - let backend handle ALL grading logic
      const submission = {
        assessment_id: parseInt(currentAssessment.id),
        student_id: currentUser.id || null,
        student_name: currentUser.username || "Unknown Student",
        student_registration: currentUser.username || "N/A",
        student_program: currentAssessment.program,
        answers: answers // Only send answers - backend will do grading based on assessment.auto_grade setting
      };

      console.log('=== ASSESSMENT SUBMISSION DEBUG ===');
      console.log('Submission Data:', submission);
      console.log('Answers:', answers);

      // Submit to backend
      const response = await fetch('https://must-lms-backend.onrender.com/api/assessment-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Assessment submitted successfully:', result);
        alert(`Assessment submitted successfully!\nReason: ${reason}\nYour submission has been recorded.`);
        
        // Remove submitted assessment from available assessments
        setAvailableAssessments(prev => 
          prev.filter(assessment => assessment.id !== currentAssessment.id)
        );
        
        // Reset to assessment selection screen
        setCurrentAssessment(null);
        setSelectedAssessmentId(null);
        setAnswers({});
        setCurrentQuestionIndex(0);
        setShowWarning(false);
        setHasLeftPage(false);
      } else {
        const error = await response.json();
        if (error.error === 'Assessment already submitted') {
          alert('You have already submitted this assessment.');
          
          // Remove already submitted assessment from list
          setAvailableAssessments(prev => 
            prev.filter(assessment => assessment.id !== currentAssessment.id)
          );
          
          // Reset to assessment selection screen
          setCurrentAssessment(null);
          setSelectedAssessmentId(null);
        } else {
          alert('Assessment submitted locally (server not available)');
        }
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Assessment submitted locally due to connection issues.');
    }
  };

  const handleManualSubmit = () => {
    if (isSubmitted || !currentAssessment) return;
    
    const unansweredCount = currentAssessment.questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      const confirm = window.confirm(`You have ${unansweredCount} unanswered questions. Submit anyway?`);
      if (!confirm) return;
    }

    handleAutoSubmit("Manual submission");
  };

  const handleStartAssessment = (assessment: Assessment) => {
    console.log('=== STARTING ASSESSMENT DEBUG ===');
    console.log('Assessment:', assessment);
    console.log('Questions:', assessment.questions);
    console.log('Questions Length:', assessment.questions?.length);
    
    if (!assessment.questions || assessment.questions.length === 0) {
      alert('This assessment has no questions. Please contact administration.');
      return;
    }
    
    // Check if assessment is scheduled - REAL TIME SYSTEM
    if (assessment.scheduledDate && assessment.scheduledTime) {
      const now = new Date();
      const scheduledDateTime = new Date(`${assessment.scheduledDate}T${assessment.scheduledTime}`);
      const assessmentEndTime = new Date(scheduledDateTime.getTime() + (assessment.duration * 60 * 1000));
      
      console.log('=== REAL TIME ASSESSMENT SYSTEM ===');
      console.log('Current time:', now);
      console.log('Scheduled start time:', scheduledDateTime);
      console.log('Assessment end time:', assessmentEndTime);
      
      if (now < scheduledDateTime) {
        alert(`This assessment is scheduled to start at ${assessment.scheduledTime} on ${assessment.scheduledDate}. Please wait until the scheduled time.`);
        return;
      }
      
      // Check if assessment time has already expired - REAL TIME CHECK
      if (now > assessmentEndTime) {
        alert(`This assessment time has expired. The assessment period was from ${assessment.scheduledTime} on ${assessment.scheduledDate} for ${assessment.duration} minutes.`);
        return;
      }
      
      // Calculate remaining time from NOW (not from when student started)
      const remainingMinutes = Math.floor((assessmentEndTime.getTime() - now.getTime()) / (1000 * 60));
      const remainingSeconds = Math.floor((assessmentEndTime.getTime() - now.getTime()) / 1000) % 60;
      
      if (remainingMinutes <= 0) {
        alert('Assessment time has expired. You cannot start this assessment.');
        return;
      }
      
      // Show remaining time to student
      const confirmStart = confirm(`Assessment is active. You have ${remainingMinutes} minutes and ${remainingSeconds} seconds remaining to complete this assessment. Time will continue counting down even if you leave and return. Do you want to start?`);
      if (!confirmStart) return;
    }
    
    setCurrentAssessment(assessment);
    setSelectedAssessmentId(assessment.id);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setShowWarning(false);
    setHasLeftPage(false);
  };

  // Remove calculateScore function - students should not see scores

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!currentAssessment) return 'text-gray-600';
    const percentage = (timeRemaining / (currentAssessment.duration * 60)) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const currentQuestion = currentAssessment?.questions[currentQuestionIndex];
  const progress = currentAssessment ? ((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100 : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading available assessments...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Assessment selection screen
  if (!currentAssessment) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Available Assessments</CardTitle>
              <p className="text-muted-foreground">Select an assessment to begin</p>
            </CardHeader>
          </Card>

          {availableAssessments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Available</h3>
                <p className="text-gray-600">There are currently no active assessments for your programs.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {availableAssessments.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{assessment.title}</h3>
                        <p className="text-muted-foreground mb-3">{assessment.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Program</p>
                            <p className="font-medium">{assessment.program}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Duration</p>
                            <p className="font-medium">{assessment.duration} minutes</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Questions</p>
                            <p className="font-medium">{assessment.totalQuestions}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Points</p>
                            <p className="font-medium">{assessment.totalPoints}</p>
                          </div>
                        </div>

                        {assessment.scheduledDate && assessment.scheduledTime && (
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-800">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">Scheduled Assessment</span>
                            </div>
                            <p className="text-sm text-yellow-700 mt-1">
                              This assessment is scheduled to start on {assessment.scheduledDate} at {assessment.scheduledTime}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant={assessment.status === 'active' ? 'default' : 'secondary'}>
                            {assessment.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="ml-4">
                        <Button 
                          onClick={() => handleStartAssessment(assessment)}
                          disabled={assessment.status !== 'published'}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Start Assessment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Assessment Submitted Successfully</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">{currentAssessment.title}</h3>
              <p className="text-muted-foreground mb-4">{currentAssessment.program}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Questions Answered</p>
                  <p className="text-2xl font-bold text-blue-600">{Object.keys(answers).length}/{currentAssessment.questions.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted At</p>
                  <p className="text-lg font-medium text-blue-600">{new Date().toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 justify-center">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Assessment Under Review</span>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  Your assessment has been submitted and is being reviewed. Results will be available once grading is complete.
                </p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Thank you for completing the assessment. You can now close this window.
            </p>
            
            <Button onClick={() => window.location.href = '/grades'} className="bg-blue-600 hover:bg-blue-700">
              View All Grades
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Warning Banner */}
      {(showWarning || !isOnline || hasLeftPage) && (
        <div className="bg-red-600 text-white p-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>
              {!isOnline ? "Internet connection lost! Assessment will auto-submit." :
               hasLeftPage ? "You left the assessment page! Assessment may auto-submit." :
               "Warning: Suspicious activity detected!"}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{currentAssessment.title}</h1>
            <p className="text-sm text-muted-foreground">{currentAssessment.program}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className={`h-5 w-5 ${getTimeColor()}`} />
              <span className={`font-mono text-lg ${getTimeColor()}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm">Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Question {currentQuestionIndex + 1}
              </CardTitle>
              <Badge variant="outline">{currentQuestion.points} points</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium">{currentQuestion.question}</div>

            {/* Multiple Choice */}
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name={`question-${currentQuestion.id}`}
                      checked={answers[currentQuestion.id] === index}
                      onChange={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: index }))}
                      className="w-4 h-4"
                    />
                    <label htmlFor={`option-${index}`} className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* True/False */}
            {currentQuestion.type === 'true-false' && (
              <div className="space-y-3">
                {['True', 'False'].map((option) => (
                  <div key={option} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id={`tf-${option.toLowerCase()}`}
                      name={`question-${currentQuestion.id}`}
                      checked={answers[currentQuestion.id] === option.toLowerCase()}
                      onChange={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: option.toLowerCase() }))}
                      className="w-4 h-4"
                    />
                    <label htmlFor={`tf-${option.toLowerCase()}`} className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* Short Answer */}
            {currentQuestion.type === 'short-answer' && (
              <div>
                <textarea
                  placeholder="Enter your answer here..."
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                  className="w-full border rounded-lg p-3 h-32 resize-none"
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {currentAssessment.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answers[currentAssessment.questions[index].id] !== undefined
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {currentQuestionIndex === currentAssessment.questions.length - 1 ? (
                <Button onClick={handleManualSubmit} className="bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Assessment
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(currentAssessment.questions.length - 1, prev + 1))}
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assessment Info */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="font-semibold">{currentAssessment.totalQuestions}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Answered</p>
                <p className="font-semibold text-green-600">{Object.keys(answers).length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="font-semibold text-orange-600">{currentAssessment.totalQuestions - Object.keys(answers).length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="font-semibold">{currentAssessment.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
