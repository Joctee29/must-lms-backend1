import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Eye,
  EyeOff,
  Calendar,
  User,
  Award,
  BarChart3
} from "lucide-react";

interface AssessmentResult {
  id: string;
  title: string;
  program: string;
  lecturer_name: string;
  score: number;
  percentage: number;
  total_points: number;
  status: string;
  submitted_at: string;
  graded_at?: string;
  feedback?: any;
  questions?: any[];
  answers?: any;
  published_to_students?: boolean; // LECTURER DONE STATUS
  grading_format?: 'percentage' | 'fraction'; // GRADING FORMAT FROM ASSESSMENT
}

export const AssessmentResults = () => {
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<AssessmentResult | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');

  useEffect(() => {
    fetchAssessmentResults();
  }, []);

  const fetchAssessmentResults = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      console.log('=== ASSESSMENT RESULTS DEBUG ===');
      console.log('Current User:', currentUser);

      // Fetch submitted assessments for current student
      const response = await fetch('https://must-lms-backend.onrender.com/api/assessment-submissions');
      if (response.ok) {
        const result = await response.json();
        console.log('All Submissions:', result.data);
        
        // Filter submissions for current student
        const studentSubmissions = result.data?.filter((submission: any) => 
          submission.student_name === currentUser.username || 
          submission.student_id === currentUser.id
        ) || [];

        console.log('Student Submissions:', studentSubmissions);

        // Fetch assessment details for each submission
        const resultsWithDetails = await Promise.all(
          studentSubmissions.map(async (submission: any) => {
            try {
              const assessmentResponse = await fetch(`https://must-lms-backend.onrender.com/api/assessments/${submission.assessment_id}`);
              if (assessmentResponse.ok) {
                const assessmentData = await assessmentResponse.json();
                return {
                  id: submission.id,
                  title: assessmentData.data?.title || 'Assessment',
                  program: submission.student_program || 'Unknown Program',
                  lecturer_name: assessmentData.data?.lecturer_name || 'Unknown Lecturer',
                  score: submission.score || 0,
                  percentage: submission.percentage || 0,
                  total_points: assessmentData.data?.total_points || 0,
                  status: submission.status || 'submitted',
                  submitted_at: submission.submitted_at,
                  graded_at: submission.graded_at,
                  feedback: submission.feedback,
                  questions: assessmentData.data?.questions || [],
                  answers: submission.answers,
                  published_to_students: submission.published_to_students || false, // LECTURER DONE STATUS
                  grading_format: assessmentData.data?.grading_format || 'percentage', // GET GRADING FORMAT FROM ASSESSMENT
                  manual_scores: submission.manual_scores || {}, // MANUAL SCORES FOR EACH QUESTION
                  manual_feedback: submission.manual_feedback || {} // MANUAL FEEDBACK FOR EACH QUESTION
                };
              }
              return null;
            } catch (error) {
              console.error('Error fetching assessment details:', error);
              return null;
            }
          })
        );

        const validResults = resultsWithDetails.filter(result => result !== null);
        console.log('Final Assessment Results:', validResults);
        setAssessmentResults(validResults);
      } else {
        console.log('Failed to fetch submissions - no real data available');
        // No fake data - show empty state
        setAssessmentResults([]);
      }
    } catch (error) {
      console.error('Error fetching assessment results:', error);
      // No fake data - show empty state
      setAssessmentResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, percentage: number, publishedToStudents?: boolean) => {
    // Show actual status based on real data
    if (!publishedToStudents) {
      // Check if it's actually graded but not published yet
      if (status === 'auto-graded' || status === 'manually-graded') {
        return <Badge className="bg-yellow-100 text-yellow-800">GRADED - Awaiting Publication</Badge>;
      }
      // If just submitted and not graded yet
      if (status === 'submitted') {
        return <Badge className="bg-orange-100 text-orange-800">SUBMITTED - Awaiting Grading</Badge>;
      }
      return <Badge className="bg-gray-100 text-gray-800">PENDING</Badge>;
    }

    // If published to students, show completion status
    if (status === 'auto-graded' || status === 'manually-graded') {
      return <Badge className="bg-green-100 text-green-800">COMPLETED</Badge>;
    }
    
    if (status === 'submitted') {
      return <Badge className="bg-blue-100 text-blue-800">SUBMITTED</Badge>;
    }
    
    return <Badge className="bg-gray-100 text-gray-800">{status.toUpperCase()}</Badge>;
  };

  const getGradeBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge className="bg-green-100 text-green-800">A</Badge>;
    if (percentage >= 80) return <Badge className="bg-blue-100 text-blue-800">B</Badge>;
    if (percentage >= 70) return <Badge className="bg-yellow-100 text-yellow-800">C</Badge>;
    if (percentage >= 60) return <Badge className="bg-orange-100 text-orange-800">D</Badge>;
    return <Badge className="bg-red-100 text-red-800">F</Badge>;
  };

  const handleViewDetails = (result: AssessmentResult) => {
    setSelectedResult(result);
    setViewMode('details');
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading assessment results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'details' && selectedResult) {
    return (
      <div className="flex-1 p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setViewMode('list')}
            className="mb-4"
          >
            ← Back to Results
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedResult.title}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {selectedResult.program}
                  </p>
                </div>
                <div className="text-right">
                  {/* HIDE RESULTS UNTIL LECTURER PUBLISHES */}
                  {selectedResult.published_to_students ? (
                    <div>
                      <div className="text-3xl font-bold text-blue-600">
                        {selectedResult.grading_format === 'fraction' 
                          ? `${selectedResult.score}/${selectedResult.total_points}`
                          : `${selectedResult.percentage}%`
                        }
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedResult.grading_format === 'fraction' 
                          ? `${selectedResult.percentage}% (${selectedResult.score}/${selectedResult.total_points} points)`
                          : `${selectedResult.score}/${selectedResult.total_points} points`
                        }
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl font-bold text-orange-600">PENDING</div>
                      <p className="text-sm text-orange-600">Lecturer Review</p>
                      <Badge className="bg-orange-100 text-orange-800">Results Not Published</Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedResult.submitted_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {selectedResult.graded_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Graded</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedResult.graded_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                
              </div>

              {selectedResult.status === 'submitted' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h3 className="font-medium text-yellow-800">Assessment Under Review</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your assessment has been submitted and is being reviewed by your lecturer. 
                        Results will be available once grading is complete.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-medium text-green-800">Assessment Completed</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Your assessment has been graded. Review your performance below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* DETAILED ASSESSMENT REVIEW - EXACTLY LIKE LECTURER PORTAL */}
              {selectedResult && selectedResult.questions && (
                <Card className="mt-6">
                  <CardHeader><CardTitle>Question by Question Review</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {selectedResult.questions.map((question, index) => {
                        // TRY ALL POSSIBLE WAYS TO GET STUDENT ANSWER
                        let studentAnswer = selectedResult.answers?.[question.id] || 
                                          selectedResult.answers?.[index] || 
                                          selectedResult.answers?.[`question_${index}`] ||
                                          selectedResult.answers?.[`q${index + 1}`] ||
                                          selectedResult.answers?.[`${index}`] ||
                                          selectedResult.answers?.[question.id?.toString()];
                        
                        // COMPREHENSIVE ANSWER CHECKING LOGIC
                        let isCorrect = false; // Default to false instead of null
                        
                        console.log(`=== QUESTION ${index + 1} COMPREHENSIVE DEBUG ===`);
                        console.log('Question Object:', question);
                        console.log('Question ID:', question.id);
                        console.log('Question Type:', question.type);
                        console.log('Question Text:', question.question);
                        console.log('All Possible Answer Keys:');
                        console.log('  question.id:', question.id, '→', selectedResult.answers?.[question.id]);
                        console.log('  index:', index, '→', selectedResult.answers?.[index]);
                        console.log('  question_index:', `question_${index}`, '→', selectedResult.answers?.[`question_${index}`]);
                        console.log('  q+1:', `q${index + 1}`, '→', selectedResult.answers?.[`q${index + 1}`]);
                        console.log('  string index:', `${index}`, '→', selectedResult.answers?.[`${index}`]);
                        console.log('Full Answers Object:', selectedResult.answers);
                        console.log('Student Answer Found:', studentAnswer);
                        console.log('Correct Answer:', question.correctAnswer);
                        console.log('Question Options:', question.options);
                        // FOR MANUAL GRADING: Don't show automatic scoring
                        const isManualGrading = selectedResult.status === 'manually-graded' || selectedResult.grading_mode === 'manual';
                        
                        if (!isManualGrading && question.type === 'multiple-choice') {
                          // COMPREHENSIVE MULTIPLE CHOICE COMPARISON (AUTO GRADING ONLY)
                          if (studentAnswer !== undefined && studentAnswer !== null) {
                            const methods = [];
                            
                            // Method 1: Direct comparison
                            const directMatch = studentAnswer === question.correctAnswer;
                            methods.push({ name: 'Direct', result: directMatch, student: studentAnswer, correct: question.correctAnswer });
                            
                            // Method 2: Number comparison
                            const studentNum = Number(studentAnswer);
                            const correctNum = Number(question.correctAnswer);
                            const numberMatch = !isNaN(studentNum) && !isNaN(correctNum) && studentNum === correctNum;
                            methods.push({ name: 'Number', result: numberMatch, student: studentNum, correct: correctNum });
                            
                            // Method 3: String comparison
                            const studentStr = String(studentAnswer);
                            const correctStr = String(question.correctAnswer);
                            const stringMatch = studentStr === correctStr;
                            methods.push({ name: 'String', result: stringMatch, student: studentStr, correct: correctStr });
                            
                            // Method 4: Option text comparison (if options exist)
                            let optionMatch = false;
                            if (question.options && Array.isArray(question.options)) {
                              const studentOptionText = question.options[Number(studentAnswer)];
                              const correctOptionText = question.options[Number(question.correctAnswer)];
                              optionMatch = studentOptionText && correctOptionText && studentOptionText === correctOptionText;
                              methods.push({ name: 'Option Text', result: optionMatch, student: studentOptionText, correct: correctOptionText });
                            }
                            
                            // Method 5: Loose comparison
                            const looseMatch = studentAnswer == question.correctAnswer;
                            methods.push({ name: 'Loose (==)', result: looseMatch, student: studentAnswer, correct: question.correctAnswer });
                            
                            // Set isCorrect if ANY method matches
                            isCorrect = methods.some(method => method.result);
                            
                            console.log('ALL COMPARISON METHODS:');
                            methods.forEach(method => {
                              console.log(`  ${method.name}: ${method.student} vs ${method.correct} = ${method.result}`);
                            });
                            console.log('FINAL RESULT: Any match =', isCorrect);
                          } else {
                            console.log('No student answer found - marking as incorrect');
                            isCorrect = false;
                          }
                          
                        } else if (!isManualGrading && question.type === 'true-false') {
                          // Try different comparison methods for true/false (AUTO GRADING ONLY)
                          const studentStr = String(studentAnswer).toLowerCase().trim();
                          const correctStr = String(question.correctAnswer).toLowerCase().trim();
                          
                          isCorrect = studentStr === correctStr ||
                                     studentAnswer === question.correctAnswer ||
                                     (studentStr === 'true' && correctStr === 'true') ||
                                     (studentStr === 'false' && correctStr === 'false');
                          
                          console.log('True/False Comparisons:');
                          console.log('  Lowercase:', studentStr, '===', correctStr, '=', studentStr === correctStr);
                          console.log('  Direct:', studentAnswer, '===', question.correctAnswer, '=', studentAnswer === question.correctAnswer);
                        } else if (isManualGrading) {
                          // FOR MANUAL GRADING: Use manual scores if available
                          const manualScore = selectedResult.manual_scores?.[question.id] || 0;
                          isCorrect = manualScore > 0;
                        }
                        
                        console.log('Final isCorrect:', isCorrect);
                        console.log('========================');

                        return (
                          <div key={question.id || index} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Q{index + 1}</Badge>
                                <Badge variant="outline">{question.type}</Badge>
                                <Badge variant="outline">{question.points || 1} pts</Badge>
                                {/* Only show correct/incorrect for auto grading */}
                                {!isManualGrading && question.type !== 'short-answer' && question.type !== 'essay' && (
                                  <Badge className={isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {isCorrect ? 'Correct' : 'Incorrect'}
                                  </Badge>
                                )}
                                {/* Manual grading - no badge here, only fraction on right */}
                              </div>
                              {/* Show score based on grading mode */}
                              <div className="text-right">
                                {isManualGrading ? (
                                  selectedResult.manual_scores?.[question.id] !== undefined ? (
                                    <div className="text-lg font-bold text-green-600">
                                      {selectedResult.manual_scores[question.id]}/{question.points || 1}
                                    </div>
                                  ) : (
                                    <div className="text-lg font-bold text-orange-600">-/{question.points || 1}</div>
                                  )
                                ) : question.type !== 'short-answer' && question.type !== 'essay' ? (
                                  <div className="text-lg font-bold">{isCorrect ? (question.points || 1) : 0}/{question.points || 1}</div>
                                ) : null}
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <h4 className="font-medium text-lg mb-2">{question.question}</h4>
                            </div>

                            {question.type === 'multiple-choice' && question.options && (
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-600 mb-2">Options:</div>
                                {question.options.map((option, optIndex) => {
                                  // REAL DATA COMPARISON FOR OPTION HIGHLIGHTING
                                  const studentIndex = Number(studentAnswer);
                                  const correctIndex = Number(question.correctAnswer);
                                  const isStudentChoice = studentIndex === optIndex;
                                  const isCorrectChoice = correctIndex === optIndex;
                                  
                                  return (
                                    <div key={optIndex} className={`p-2 rounded border ${
                                      // For manual grading, only highlight student choice
                                      isManualGrading
                                        ? isStudentChoice
                                          ? 'bg-blue-50 border-blue-200'
                                          : 'bg-gray-50 border-gray-200'
                                        : // For auto grading, show correct/incorrect
                                          isCorrectChoice
                                          ? 'bg-green-50 border-green-200' 
                                          : isStudentChoice && !isCorrectChoice
                                          ? 'bg-red-50 border-red-200'
                                          : 'bg-gray-50 border-gray-200'
                                    }`}>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                                        <span>{option}</span>
                                        {/* Only show correct answer for auto grading */}
                                        {!isManualGrading && isCorrectChoice && (
                                          <Badge className="bg-green-100 text-green-800 text-xs">Correct Answer</Badge>
                                        )}
                                        {isStudentChoice && (
                                          <Badge className={`text-xs ${
                                            isManualGrading 
                                              ? 'bg-blue-100 text-blue-800' 
                                              : !isCorrectChoice 
                                              ? 'bg-red-100 text-red-800' 
                                              : 'bg-blue-100 text-blue-800'
                                          }`}>
                                            Your Answer
                                          </Badge>
                                        )}
                                        {/* Manual score shown on right side only */}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {question.type === 'true-false' && (
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-600 mb-2">True/False Question:</div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className={`p-2 rounded border ${
                                    isManualGrading
                                      ? String(studentAnswer).toLowerCase() === 'true'
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-gray-50 border-gray-200'
                                      : String(question.correctAnswer).toLowerCase() === 'true'
                                      ? 'bg-green-50 border-green-200'
                                      : String(studentAnswer).toLowerCase() === 'true'
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}>
                                    <span className="font-medium text-green-600">TRUE</span>
                                    {/* Only show correct answer for auto grading */}
                                    {!isManualGrading && String(question.correctAnswer).toLowerCase() === 'true' && (
                                      <Badge className="bg-green-100 text-green-800 text-xs ml-2">Correct</Badge>
                                    )}
                                    {String(studentAnswer).toLowerCase() === 'true' && (
                                      <Badge className={`text-xs ml-2 ${
                                        isManualGrading 
                                          ? 'bg-blue-100 text-blue-800' 
                                          : String(question.correctAnswer).toLowerCase() !== 'true'
                                          ? 'bg-red-100 text-red-800' 
                                          : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        Your Answer
                                      </Badge>
                                    )}
                                  </div>
                                  <div className={`p-2 rounded border ${
                                    isManualGrading
                                      ? String(studentAnswer).toLowerCase() === 'false'
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-gray-50 border-gray-200'
                                      : String(question.correctAnswer).toLowerCase() === 'false'
                                      ? 'bg-green-50 border-green-200'
                                      : String(studentAnswer).toLowerCase() === 'false'
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}>
                                    <span className="font-medium text-red-600">FALSE</span>
                                    {/* Only show correct answer for auto grading */}
                                    {!isManualGrading && String(question.correctAnswer).toLowerCase() === 'false' && (
                                      <Badge className="bg-green-100 text-green-800 text-xs ml-2">Correct</Badge>
                                    )}
                                    {String(studentAnswer).toLowerCase() === 'false' && (
                                      <Badge className={`text-xs ml-2 ${
                                        isManualGrading 
                                          ? 'bg-blue-100 text-blue-800' 
                                          : String(question.correctAnswer).toLowerCase() !== 'false'
                                          ? 'bg-red-100 text-red-800' 
                                          : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        Your Answer
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {(question.type === 'short-answer' || question.type === 'essay') && (
                              <div className="space-y-3">
                                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                  <p className="text-sm font-medium text-blue-800 mb-1">Your Answer:</p>
                                  <p className="text-blue-700 text-sm">
                                    {studentAnswer || "No answer provided"}
                                  </p>
                                </div>
                                {/* Show manual feedback if available */}
                                {isManualGrading && selectedResult.manual_feedback?.[question.id] && (
                                  <div className="bg-purple-50 border border-purple-200 rounded p-3">
                                    <p className="text-sm font-medium text-purple-800 mb-1">Lecturer Feedback:</p>
                                    <p className="text-purple-700 text-sm">{selectedResult.manual_feedback[question.id]}</p>
                                  </div>
                                )}
                                {/* Only show sample answer for auto grading */}
                                {!isManualGrading && question.sampleAnswer && (
                                  <div className="bg-green-50 border border-green-200 rounded p-3">
                                    <p className="text-sm font-medium text-green-800 mb-1">Sample Answer:</p>
                                    <p className="text-green-700 text-sm">{question.sampleAnswer}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Show manual feedback for all question types in manual grading */}
                            {isManualGrading && selectedResult.manual_feedback?.[question.id] && (
                              <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                                <p className="text-sm font-medium text-blue-800 mb-1">Lecturer Feedback:</p>
                                <p className="text-blue-700 text-sm">{selectedResult.manual_feedback[question.id]}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Assessment Results</h1>
        <p className="text-muted-foreground">
          View your completed assessments and grades
        </p>
      </div>

      {assessmentResults.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Results</h3>
            <p className="text-gray-600 text-center max-w-md">
              You haven't submitted any assessments yet. Complete assessments to see your results here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assessmentResults.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold">{result.title}</h3>
                      {getStatusBadge(result.status, result.percentage, result.published_to_students)}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(result.submitted_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        {result.program}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {result.published_to_students ? (
                        // RESULTS PUBLISHED - Show scores
                        <>
                          <div className="text-2xl font-bold text-blue-600">
                            {result.grading_format === 'fraction' 
                              ? `${result.score}/${result.total_points}`
                              : `${result.percentage}%`
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {result.grading_format === 'fraction' 
                              ? `${result.percentage}%`
                              : `${result.score}/${result.total_points} points`
                            }
                          </div>
                        </>
                      ) : (
                        // PENDING LECTURER REVIEW - Hide scores
                        <div className="text-sm text-orange-600 font-medium">
                          📝 Pending lecturer review...
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* HIDE VIEW DETAILS UNTIL LECTURER PUBLISHES */}
                    {result.published_to_students ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(result)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled
                        className="opacity-50 cursor-not-allowed"
                      >
                        <EyeOff className="h-4 w-4 mr-2" />
                        Results Pending
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
