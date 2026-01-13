import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, Users, TrendingUp, Award, Eye, Download, 
  Search, Filter, ChevronDown, BarChart3, PieChart
} from "lucide-react";

interface Submission {
  id: string;
  student_name: string;
  student_registration: string;
  student_program: string;
  score: number;
  percentage: number;
  status: string;
  submitted_at: string;
  answers: any;
  auto_graded_score?: number;
  manual_graded_score?: number;
}

interface Assessment {
  id: string;
  title: string;
  program_name: string;
  total_questions: number;
  total_points: number;
  status: string;
  submissions: Submission[];
  created_at: string;
}

export const AssessmentResults = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch assessments with submissions
  useEffect(() => {
    const fetchAssessmentResults = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        console.log('=== ASSESSMENT RESULTS FETCH DEBUG ===');
        console.log('Current User:', currentUser);

        // Fetch assessments for current lecturer
        const response = await fetch(`https://must-lms-backend.onrender.com/api/assessments?lecturer_name=${encodeURIComponent(currentUser.username)}`);
        if (response.ok) {
          const result = await response.json();
          
          console.log('Assessments with submissions:', result.data);

          // Format assessments for display
          const formattedAssessments = result.data?.map(assessment => ({
            id: assessment.id.toString(),
            title: assessment.title,
            program_name: assessment.program_name,
            total_questions: assessment.total_questions,
            total_points: assessment.total_points,
            status: assessment.status,
            created_at: assessment.created_at,
            submissions: []
          })) || [];

          // Fetch submissions for each assessment
          for (const assessment of formattedAssessments) {
            try {
              const submissionsResponse = await fetch(`https://must-lms-backend.onrender.com/api/assessments/${assessment.id}`);
              if (submissionsResponse.ok) {
                const submissionResult = await submissionsResponse.json();
                assessment.submissions = submissionResult.data?.submissions || [];
              }
            } catch (error) {
              console.error(`Error fetching submissions for assessment ${assessment.id}:`, error);
            }
          }

          setAssessments(formattedAssessments);
          console.log('Formatted Assessments with Submissions:', formattedAssessments);
        }
      } catch (error) {
        console.error('Error fetching assessment results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentResults();
  }, []);

  const getAssessmentStats = (assessment: Assessment) => {
    const submissions = assessment.submissions || [];
    const totalSubmissions = submissions.length;
    const averageScore = totalSubmissions > 0 
      ? submissions.reduce((sum, sub) => sum + (sub.percentage || 0), 0) / totalSubmissions 
      : 0;
    const passRate = totalSubmissions > 0 
      ? (submissions.filter(sub => (sub.percentage || 0) >= 50).length / totalSubmissions) * 100 
      : 0;

    return {
      totalSubmissions,
      averageScore: Math.round(averageScore),
      passRate: Math.round(passRate)
    };
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.program_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || assessment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const exportResults = (assessment: Assessment) => {
    // DIRECT PDF DOWNLOAD - NO PRINT DIALOG
    const generateAndDownloadPDF = () => {
      // Get current date and time
      const now = new Date();
      const dateStr = now.toLocaleDateString();
      const timeStr = now.toLocaleTimeString();

      // Calculate statistics
      const totalSubmissions = assessment.submissions.length;
      const averageScore = totalSubmissions > 0 
        ? Math.round(assessment.submissions.reduce((sum, sub) => sum + sub.percentage, 0) / totalSubmissions)
        : 0;
      const passRate = totalSubmissions > 0
        ? Math.round((assessment.submissions.filter(sub => sub.percentage >= 60).length / totalSubmissions) * 100)
        : 0;

      // Create PDF content as text
      let pdfContent = "MBEYA UNIVERSITY OF SCIENCE AND TECHNOLOGY\n";
      pdfContent += "Assessment Results Report\n";
      pdfContent += "=".repeat(50) + "\n\n";
      pdfContent += `Assessment Title: ${assessment.title}\n`;
      pdfContent += `Program: ${assessment.program_name}\n`;
      pdfContent += `Generated On: ${dateStr} ${timeStr}\n`;
      pdfContent += `Total Questions: ${assessment.total_questions}\n`;
      pdfContent += `Total Points: ${assessment.total_points}\n\n`;
      pdfContent += "STATISTICS\n";
      pdfContent += "-".repeat(30) + "\n";
      pdfContent += `Total Submissions: ${totalSubmissions}\n`;
      pdfContent += `Average Score: ${averageScore}%\n`;
      pdfContent += `Pass Rate: ${passRate}%\n\n`;
      pdfContent += "STUDENT RESULTS\n";
      pdfContent += "-".repeat(30) + "\n";
      pdfContent += "No. | Registration | Program | Score | Percentage | Grade | Submitted\n";
      pdfContent += "-".repeat(80) + "\n";
      
      assessment.submissions.forEach((sub, index) => {
        const getGrade = (percentage: number) => {
          if (percentage >= 90) return 'A';
          if (percentage >= 80) return 'B';
          if (percentage >= 70) return 'C';
          if (percentage >= 60) return 'D';
          return 'F';
        };
        
        pdfContent += `${index + 1}. ${sub.student_registration} | ${sub.student_program} | ${sub.score}/${assessment.total_points} | ${sub.percentage}% | ${getGrade(sub.percentage)} | ${new Date(sub.submitted_at).toLocaleDateString()}\n`;
      });

      pdfContent += "\n" + "=".repeat(50) + "\n";
      pdfContent += "MUST LEARNING MANAGEMENT SYSTEM powered by JEDA NETWORKS\n";

      // Create blob and download as PDF
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${assessment.title.replace(/\s+/g, '_')}_Results_${dateStr.replace(/\//g, '-')}.pdf`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    generateAndDownloadPDF();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading assessment results...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedAssessment) {
    const stats = getAssessmentStats(selectedAssessment);
    
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedAssessment(null)}
                    className="mb-2 text-xs sm:text-sm"
                    size="sm"
                  >
                    ← Back
                  </Button>
                  <CardTitle className="text-lg sm:text-2xl">{selectedAssessment.title}</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">{selectedAssessment.program_name}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => exportResults(selectedAssessment)}
                    size="sm"
                    className="text-xs sm:text-sm w-full sm:w-auto"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Card>
              <CardContent className="p-2 sm:p-4 text-center">
                <Users className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-lg sm:text-2xl font-bold">{stats.totalSubmissions}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Submissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 sm:p-4 text-center">
                <TrendingUp className="h-5 w-5 sm:h-8 sm:w-8 text-green-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-lg sm:text-2xl font-bold">{stats.averageScore}%</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Average</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 sm:p-4 text-center">
                <Award className="h-5 w-5 sm:h-8 sm:w-8 text-yellow-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-lg sm:text-2xl font-bold">{stats.passRate}%</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Pass Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 sm:p-4 text-center">
                <FileText className="h-5 w-5 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-lg sm:text-2xl font-bold">{selectedAssessment.total_questions}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Questions</p>
              </CardContent>
            </Card>
          </div>

          {/* Submissions Table - Mobile Responsive */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Student Submissions</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {selectedAssessment.submissions.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
                  <p className="text-sm text-gray-600">Students haven't submitted this assessment yet.</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block sm:hidden space-y-3">
                    {selectedAssessment.submissions.map((submission) => (
                      <div key={submission.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">{submission.student_name}</p>
                            <p className="text-xs text-gray-500">{submission.student_registration}</p>
                          </div>
                          <Badge variant={submission.percentage >= 50 ? "default" : "destructive"} className="text-xs">
                            {submission.percentage}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                          <div>
                            <span className="font-medium">Score:</span> {submission.score}/{selectedAssessment.total_points}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span> {submission.status}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </span>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 text-sm">Student</th>
                          <th className="text-left p-3 text-sm">Registration</th>
                          <th className="text-left p-3 text-sm">Program</th>
                          <th className="text-center p-3 text-sm">Score</th>
                          <th className="text-center p-3 text-sm">Percentage</th>
                          <th className="text-center p-3 text-sm">Status</th>
                          <th className="text-center p-3 text-sm">Submitted</th>
                          <th className="text-center p-3 text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAssessment.submissions.map((submission) => (
                          <tr key={submission.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium text-sm">{submission.student_name}</td>
                            <td className="p-3 text-sm">{submission.student_registration}</td>
                            <td className="p-3 text-sm">{submission.student_program}</td>
                            <td className="p-3 text-center text-sm">
                              {submission.score}/{selectedAssessment.total_points}
                            </td>
                            <td className="p-3 text-center">
                              <Badge variant={submission.percentage >= 50 ? "default" : "destructive"} className="text-xs">
                                {submission.percentage}%
                              </Badge>
                            </td>
                            <td className="p-3 text-center">
                              <Badge variant="outline" className="text-xs">{submission.status}</Badge>
                            </td>
                            <td className="p-3 text-center text-xs">
                              {new Date(submission.submitted_at).toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-lg sm:text-2xl">Assessment Results</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">View and manage assessment submissions and grades</p>
          </CardHeader>
        </Card>

        {/* Search and Filter */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessments List */}
        {filteredAssessments.length === 0 ? (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Assessment Results</h3>
              <p className="text-sm text-gray-600">Create assessments to view student results and analytics.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {filteredAssessments.map((assessment) => {
              const stats = getAssessmentStats(assessment);
              
              return (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-xl font-semibold mb-1 sm:mb-2">{assessment.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">{assessment.program_name}</p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Submissions</p>
                            <p className="text-sm sm:text-base font-medium">{stats.totalSubmissions}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Average</p>
                            <p className="text-sm sm:text-base font-medium">{stats.averageScore}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Pass Rate</p>
                            <p className="text-sm sm:text-base font-medium">{stats.passRate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Questions</p>
                            <p className="text-sm sm:text-base font-medium">{assessment.total_questions}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={assessment.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {assessment.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Created: {new Date(assessment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto">
                        <Button 
                          onClick={() => setSelectedAssessment(assessment)}
                          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Results
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
