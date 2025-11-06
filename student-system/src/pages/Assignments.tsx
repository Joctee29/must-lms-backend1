import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, Clock, CheckCircle, AlertTriangle, Calendar, User, BookOpen, Award
} from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  course: string;
  type: 'assessment' | 'project' | 'quiz' | 'homework';
  status: 'completed' | 'pending' | 'overdue' | 'graded';
  submittedAt?: string;
  dueDate: string;
  score?: number;
  maxScore?: number;
  percentage?: number;
  grade?: string;
  feedback?: string;
  lecturer: string;
}

export const Assignments = () => {
  const [activeTab, setActiveTab] = useState<'completed' | 'pending'>('completed');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGradedAssessments();
  }, []);

  const fetchGradedAssessments = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      console.log('=== ASSIGNMENTS PAGE DEBUG ===');
      console.log('Current User:', currentUser);

      // Get student ID first from backend
      const studentResponse = await fetch(`https://must-lms-backend.onrender.com/api/students/me?username=${encodeURIComponent(currentUser.username)}`);
      if (!studentResponse.ok) {
        console.error('Failed to fetch student info');
        setLoading(false);
        return;
      }
      
      const studentData = await studentResponse.json();
      const studentId = studentData.data?.id;

      if (!studentId) {
        console.log('No student ID found');
        setLoading(false);
        return;
      }

      const response = await fetch(`https://must-lms-backend.onrender.com/api/student-graded-assessments?student_id=${studentId}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Graded assessments response:', result);

        const formattedAssignments: Assignment[] = result.data?.map((assessment: any) => ({
          id: assessment.id.toString(),
          title: assessment.title,
          course: assessment.program_name,
          type: 'assessment' as const,
          status: 'graded' as const,
          submittedAt: assessment.submitted_at,
          dueDate: assessment.submitted_at, // Using submitted date as due date for now
          score: assessment.score,
          maxScore: assessment.total_points,
          percentage: assessment.percentage,
          grade: assessment.percentage >= 80 ? 'A' : assessment.percentage >= 70 ? 'B' : assessment.percentage >= 60 ? 'C' : assessment.percentage >= 50 ? 'D' : 'F',
          feedback: assessment.feedback ? JSON.stringify(assessment.feedback) : undefined,
          lecturer: assessment.lecturer_name
        })) || [];

        console.log('Formatted assignments:', formattedAssignments);
        setAssignments(formattedAssignments);
      } else {
        console.error('Failed to fetch graded assessments');
      }
    } catch (error) {
      console.error('Error fetching graded assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter assignments by status
  const completedAssignments = assignments.filter(a => a.status === 'graded');
  const pendingAssignments = assignments.filter(a => a.status === 'pending');

  const getStatusIcon = (status: Assignment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'graded':
        return <Award className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'graded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">
            Track your assignments, submissions, and grades
          </p>
        </div>
        {loading && (
          <Badge variant="outline" className="text-sm">
            Loading...
          </Badge>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Loading...' : assignments.length === 0 ? 'No assignments yet' : 'Total assignments'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Assignments graded</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting grading</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {completedAssignments.length > 0 
                ? Math.round(completedAssignments.reduce((sum, a) => sum + (a.percentage || 0), 0) / completedAssignments.length) + '%'
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {completedAssignments.length > 0 ? 'Overall performance' : 'No grades yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-lg bg-muted p-1">
        <Button
          variant={activeTab === 'completed' ? 'default' : 'ghost'}
          className="flex-1"
          onClick={() => setActiveTab('completed')}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Completed ({completedAssignments.length})
        </Button>
        <Button
          variant={activeTab === 'pending' ? 'default' : 'ghost'}
          className="flex-1"
          onClick={() => setActiveTab('pending')}
        >
          <Clock className="mr-2 h-4 w-4" />
          Pending ({pendingAssignments.length})
        </Button>
      </div>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {activeTab === 'completed' ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Completed Assignments
              </>
            ) : (
              <>
                <Clock className="mr-2 h-5 w-5" />
                Pending Assignments
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(activeTab === 'completed' ? completedAssignments : pendingAssignments).length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No {activeTab} assignments
              </h3>
              <p className="mt-2 text-muted-foreground">
                {activeTab === 'completed' 
                  ? "You haven't completed any assignments yet."
                  : "You don't have any pending assignments at the moment."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(activeTab === 'completed' ? completedAssignments : pendingAssignments).map((assignment) => (
                <Card key={assignment.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <Badge className={getStatusColor(assignment.status)}>
                            {getStatusIcon(assignment.status)}
                            <span className="ml-1 capitalize">{assignment.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {assignment.course}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {assignment.lecturer}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {assignment.status === 'graded' && assignment.score && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {assignment.percentage}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {assignment.score}/{assignment.maxScore}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  {assignment.feedback && (
                    <CardContent className="pt-0">
                      <div className="rounded-lg bg-muted p-3">
                        <p className="text-sm font-medium mb-1">Feedback:</p>
                        <p className="text-sm text-muted-foreground">{assignment.feedback}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
