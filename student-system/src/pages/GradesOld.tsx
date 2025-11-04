import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  FileText,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Grades = () => {
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  // Student assessment results and grades
  const assessmentResults = [
    {
      id: "1",
      title: "Calculus Fundamentals Quiz",
      course: "Engineering Mathematics I",
      program: "Bachelor of Engineering",
      type: "quiz",
      submittedAt: "2024-03-20T09:45",
      timeSpent: 25,
      totalQuestions: 10,
      correctAnswers: 8,
      score: 42,
      totalPoints: 50,
      percentage: 84,
      status: "graded",
      feedback: "Excellent work on integration problems. Review differentiation rules.",
      questions: [
        {
          id: "q1",
          question: "What is the derivative of x²?",
          studentAnswer: "2x",
          correctAnswer: "2x",
          isCorrect: true,
          points: 5
        },
        {
          id: "q2", 
          question: "Integrate ∫x dx",
          studentAnswer: "x²/2",
          correctAnswer: "x²/2 + C",
          isCorrect: false,
          points: 0,
          feedback: "Don't forget the constant of integration"
        }
      ]
    },
    {
      id: "2",
      title: "Data Structures Assignment",
      course: "Computer Programming", 
      program: "Bachelor of Computer Science",
      type: "assignment",
      submittedAt: "2024-03-21T15:30",
      timeSpent: 95,
      totalQuestions: 5,
      correctAnswers: 4,
      score: 85,
      totalPoints: 100,
      percentage: 85,
      status: "graded",
      feedback: "Good implementation of linked lists. Work on algorithm optimization."
    },
    {
      id: "3",
      title: "Physics Midterm Exam",
      course: "Physics for Engineers",
      program: "Bachelor of Engineering", 
      type: "midterm",
      submittedAt: "2024-03-22T11:00",
      timeSpent: 120,
      totalQuestions: 15,
      correctAnswers: 12,
      score: 78,
      totalPoints: 100,
      percentage: 78,
      status: "graded",
      feedback: "Strong understanding of mechanics. Review thermodynamics concepts."
    }
  ];

  const grades = [
    {
      id: 1,
      course: "Advanced Mathematics",
      assignment: "Midterm Exam",
      grade: "A",
      points: 95,
      maxPoints: 100,
      date: "2024-01-15",
      weight: 30,
    },
    {
      id: 2,
      course: "Physics Laboratory",
      assignment: "Lab Report 1",
      grade: "B+",
      points: 87,
      maxPoints: 100,
      date: "2024-01-10",
      weight: 20,
    },
    {
      id: 3,
      course: "Computer Science",
      assignment: "Programming Project",
      grade: "A-",
      points: 92,
      maxPoints: 100,
      date: "2024-01-08",
      weight: 25,
    },
    {
      id: 4,
      course: "Advanced Mathematics",
      assignment: "Quiz 1",
      grade: "A",
      points: 98,
      maxPoints: 100,
      date: "2024-01-05",
      weight: 10,
    },
  ];

  const courseStats = [
    {
      course: "Advanced Mathematics",
      currentGrade: "A",
      percentage: 94.5,
      trend: "up",
    },
    {
      course: "Physics Laboratory",
      currentGrade: "B+",
      percentage: 87.2,
      trend: "stable",
    },
    {
      course: "Computer Science",
      currentGrade: "A-",
      percentage: 91.8,
      trend: "up",
    },
  ];

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
  };

  const overallGPA = 3.7;
  const currentSemesterGPA = 3.8;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Grades</h1>
        <p className="text-muted-foreground">Track your academic performance and assessment results</p>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grades</h1>
          <p className="text-muted-foreground">
            Track your academic performance and progress
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-primary to-secondary text-white"
          onClick={() => {
            const transcript = grades.map(g => `${g.course} - ${g.assignment}: ${g.grade} (${g.points}/${g.maxPoints})`).join('\n');
            const blob = new Blob([`MUST LMS - Academic Transcript\n\nOverall GPA: ${overallGPA}\n\nGrades:\n${transcript}`], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'academic_transcript.txt';
            a.click();
            URL.revokeObjectURL(url);
            alert('Transcript downloaded successfully!');
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Transcript
        </Button>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall GPA</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{overallGPA}</div>
            <p className="text-xs text-muted-foreground">Out of 4.0</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">3</div>
            <p className="text-xs text-muted-foreground">Active this semester</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">12</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-progress">91.2%</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Recent Assessment Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessmentResults.map((result) => (
              <div key={result.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{result.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {result.course} • {result.program}
                    </p>
            {grades.map((grade) => (
              <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{grade.assignment}</h3>
                  <p className="text-sm text-muted-foreground">{grade.course}</p>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {grade.date}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge className={getGradeColor(grade.grade)}>
                    {grade.grade}
                  </Badge>
                  <p className="text-sm font-medium">
                    {grade.points}/{grade.maxPoints}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {grade.weight}% weight
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
