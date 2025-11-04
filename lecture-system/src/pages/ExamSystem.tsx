import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Square,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Eye,
  Timer,
  Award,
  BarChart3
} from "lucide-react";

export const ExamSystem = () => {
  const [activeTab, setActiveTab] = useState("exams");
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const [newExam, setNewExam] = useState({
    title: "",
    course: "",
    duration: 60,
    totalMarks: 100,
    passingMarks: 70,
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    instructions: "",
    questions: []
  });

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "mcq",
    options: ["", "", "", ""],
    correctAnswer: 0,
    marks: 1,
    explanation: ""
  });

  const [exams, setExams] = useState([
    {
      id: 1,
      title: "Advanced Mathematics Midterm",
      course: "Advanced Mathematics",
      duration: 120,
      totalMarks: 100,
      passingMarks: 70,
      startDate: "2024-03-25",
      startTime: "09:00",
      endDate: "2024-03-25",
      endTime: "11:00",
      status: "scheduled",
      totalStudents: 45,
      submitted: 0,
      questions: 20,
      autoGrade: true
    },
    {
      id: 2,
      title: "Physics Lab Assessment",
      course: "Physics 101",
      duration: 90,
      totalMarks: 50,
      passingMarks: 35,
      startDate: "2024-03-20",
      startTime: "14:00",
      endDate: "2024-03-20",
      endTime: "15:30",
      status: "active",
      totalStudents: 32,
      submitted: 18,
      questions: 15,
      autoGrade: true
    },
    {
      id: 3,
      title: "Programming Final Exam",
      course: "Computer Science",
      duration: 180,
      totalMarks: 150,
      passingMarks: 105,
      startDate: "2024-03-15",
      startTime: "10:00",
      endDate: "2024-03-15",
      endTime: "13:00",
      status: "completed",
      totalStudents: 28,
      submitted: 28,
      questions: 25,
      autoGrade: true
    }
  ]);

  const [examResults, setExamResults] = useState([
    {
      examId: 3,
      studentId: 1,
      studentName: "Alice Johnson",
      regNumber: "REG001",
      score: 142,
      percentage: 94.7,
      grade: "A",
      status: "passed",
      submittedAt: "2024-03-15T12:45:00",
      timeSpent: 165
    },
    {
      examId: 3,
      studentId: 2,
      studentName: "Bob Smith",
      regNumber: "REG002",
      score: 128,
      percentage: 85.3,
      grade: "B+",
      status: "passed",
      submittedAt: "2024-03-15T12:50:00",
      timeSpent: 170
    },
    {
      examId: 3,
      studentId: 3,
      studentName: "Carol Davis",
      regNumber: "REG003",
      score: 98,
      percentage: 65.3,
      grade: "D",
      status: "failed",
      submittedAt: "2024-03-15T12:30:00",
      timeSpent: 150
    }
  ]);

  // Auto-close exam timer
  useEffect(() => {
    const activeExam = exams.find(exam => exam.status === "active");
    if (activeExam) {
      const endDateTime = new Date(`${activeExam.endDate}T${activeExam.endTime}`);
      const now = new Date();
      const remaining = Math.max(0, endDateTime.getTime() - now.getTime());
      
      setTimeRemaining(remaining);
      
      if (remaining > 0) {
        const timer = setInterval(() => {
          setTimeRemaining(prev => {
            const newTime = Math.max(0, prev - 1000);
            if (newTime === 0) {
              // Auto-close exam
              setExams(prevExams => 
                prevExams.map(exam => 
                  exam.id === activeExam.id 
                    ? { ...exam, status: "completed" }
                    : exam
                )
              );
            }
            return newTime;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      }
    }
  }, [exams]);

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCreateExam = () => {
    const exam = {
      id: Date.now(),
      ...newExam,
      status: "scheduled",
      totalStudents: 0,
      submitted: 0,
      questions: newExam.questions.length,
      autoGrade: true
    };
    
    setExams([...exams, exam]);
    setNewExam({
      title: "",
      course: "",
      duration: 60,
      totalMarks: 100,
      passingMarks: 70,
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      instructions: "",
      questions: []
    });
    setShowCreateExam(false);
  };

  const addQuestion = () => {
    setNewExam({
      ...newExam,
      questions: [...newExam.questions, { ...newQuestion, id: Date.now() }]
    });
    setNewQuestion({
      question: "",
      type: "mcq",
      options: ["", "", "", ""],
      correctAnswer: 0,
      marks: 1,
      explanation: ""
    });
    setShowQuestionForm(false);
  };

  const startExam = (examId) => {
    setExams(exams.map(exam => 
      exam.id === examId ? { ...exam, status: "active" } : exam
    ));
  };

  const endExam = (examId) => {
    setExams(exams.map(exam => 
      exam.id === examId ? { ...exam, status: "completed" } : exam
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A": case "A+": return "bg-green-100 text-green-800";
      case "B": case "B+": return "bg-blue-100 text-blue-800";
      case "C": case "C+": return "bg-yellow-100 text-yellow-800";
      case "D": case "D+": return "bg-orange-100 text-orange-800";
      case "F": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Exam System</h1>
        <Button onClick={() => setShowCreateExam(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Exam
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <Button
          variant={activeTab === "exams" ? "default" : "ghost"}
          onClick={() => setActiveTab("exams")}
        >
          Exams
        </Button>
        <Button
          variant={activeTab === "results" ? "default" : "ghost"}
          onClick={() => setActiveTab("results")}
        >
          Results
        </Button>
        <Button
          variant={activeTab === "analytics" ? "default" : "ghost"}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </Button>
      </div>

      {/* Active Exam Alert */}
      {timeRemaining > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-green-800">Exam in Progress</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-green-700">Time Remaining</p>
                  <p className="text-lg font-bold text-green-800">{formatTime(timeRemaining)}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Monitor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Exam Form */}
      {showCreateExam && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Exam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Exam Title</label>
                <Input
                  placeholder="Enter exam title..."
                  value={newExam.title}
                  onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Course</label>
                <select
                  value={newExam.course}
                  onChange={(e) => setNewExam({...newExam, course: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Course</option>
                  <option value="Advanced Mathematics">Advanced Mathematics</option>
                  <option value="Physics 101">Physics 101</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Chemistry 101">Chemistry 101</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  value={newExam.duration}
                  onChange={(e) => setNewExam({...newExam, duration: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total Marks</label>
                <Input
                  type="number"
                  value={newExam.totalMarks}
                  onChange={(e) => setNewExam({...newExam, totalMarks: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Passing Marks</label>
                <Input
                  type="number"
                  value={newExam.passingMarks}
                  onChange={(e) => setNewExam({...newExam, passingMarks: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date & Time</label>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={newExam.startDate}
                    onChange={(e) => setNewExam({...newExam, startDate: e.target.value})}
                  />
                  <Input
                    type="time"
                    value={newExam.startTime}
                    onChange={(e) => setNewExam({...newExam, startTime: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">End Date & Time</label>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={newExam.endDate}
                    onChange={(e) => setNewExam({...newExam, endDate: e.target.value})}
                  />
                  <Input
                    type="time"
                    value={newExam.endTime}
                    onChange={(e) => setNewExam({...newExam, endTime: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Instructions</label>
              <Textarea
                placeholder="Exam instructions for students..."
                value={newExam.instructions}
                onChange={(e) => setNewExam({...newExam, instructions: e.target.value})}
              />
            </div>

            {/* Questions Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Questions ({newExam.questions.length})</h4>
                <Button variant="outline" size="sm" onClick={() => setShowQuestionForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
              
              {newExam.questions.map((q, index) => (
                <div key={q.id} className="border rounded p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Q{index + 1}: {q.question}</p>
                      <p className="text-sm text-muted-foreground">{q.marks} marks</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleCreateExam} disabled={!newExam.title || !newExam.course}>
                Create Exam
              </Button>
              <Button variant="outline" onClick={() => setShowCreateExam(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Form */}
      {showQuestionForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Question</label>
              <Textarea
                placeholder="Enter your question..."
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Question Type</label>
                <select
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Marks</label>
                <Input
                  type="number"
                  value={newQuestion.marks}
                  onChange={(e) => setNewQuestion({...newQuestion, marks: parseInt(e.target.value)})}
                />
              </div>
            </div>

            {newQuestion.type === "mcq" && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Options</label>
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={newQuestion.correctAnswer === index}
                      onChange={() => setNewQuestion({...newQuestion, correctAnswer: index})}
                    />
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newQuestion.options];
                        newOptions[index] = e.target.value;
                        setNewQuestion({...newQuestion, options: newOptions});
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Explanation (Optional)</label>
              <Textarea
                placeholder="Explanation for the correct answer..."
                value={newQuestion.explanation}
                onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={addQuestion} disabled={!newQuestion.question}>
                Add Question
              </Button>
              <Button variant="outline" onClick={() => setShowQuestionForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exams Tab */}
      {activeTab === "exams" && (
        <div className="space-y-4">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{exam.course}</p>
                  </div>
                  <Badge className={getStatusColor(exam.status)}>
                    {exam.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">{exam.duration} min</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Questions</p>
                      <p className="text-sm text-muted-foreground">{exam.questions}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Total Marks</p>
                      <p className="text-sm text-muted-foreground">{exam.totalMarks}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Submissions</p>
                      <p className="text-sm text-muted-foreground">{exam.submitted}/{exam.totalStudents}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Schedule</p>
                      <p className="text-sm text-muted-foreground">{exam.startDate} {exam.startTime}</p>
                    </div>
                  </div>
                </div>

                {exam.status === "active" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Submission Progress</span>
                      <span>{Math.round((exam.submitted / exam.totalStudents) * 100)}%</span>
                    </div>
                    <Progress value={(exam.submitted / exam.totalStudents) * 100} className="h-2" />
                  </div>
                )}

                <div className="flex space-x-2">
                  {exam.status === "scheduled" && (
                    <Button onClick={() => startExam(exam.id)} size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Start Exam
                    </Button>
                  )}
                  {exam.status === "active" && (
                    <Button onClick={() => endExam(exam.id)} variant="destructive" size="sm">
                      <Square className="h-4 w-4 mr-2" />
                      End Exam
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {exam.status === "completed" && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Results
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === "results" && (
        <Card>
          <CardHeader>
            <CardTitle>Exam Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {examResults.map((result) => (
                <div key={`${result.examId}-${result.studentId}`} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{result.studentName}</h4>
                      <p className="text-sm text-muted-foreground">Reg: {result.regNumber}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Badge className={getGradeColor(result.grade)}>
                          {result.grade}
                        </Badge>
                        <Badge className={result.status === "passed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {result.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="font-semibold">{result.score}/150</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Percentage</p>
                      <p className="font-semibold">{result.percentage}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time Spent</p>
                      <p className="font-semibold">{result.timeSpent} min</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="font-semibold">{new Date(result.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-Grading Info */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Automatic Exam Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Auto-Grading System</h4>
              <ul className="text-sm space-y-1">
                <li>• Instant grading for MCQ and True/False questions</li>
                <li>• Automatic grade calculation and assignment</li>
                <li>• Real-time result generation</li>
                <li>• Pass/Fail status determination</li>
                <li>• Detailed performance analytics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Time Management</h4>
              <ul className="text-sm space-y-1">
                <li>• Automatic exam closure at end time</li>
                <li>• Real-time countdown timer</li>
                <li>• Auto-submit when time expires</li>
                <li>• Time tracking per student</li>
                <li>• Late submission prevention</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
