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
    // PROFESSIONAL PDF EXPORT WITH WHITE BACKGROUND AND BLUE DESIGN
    const generatePDF = () => {
      // Create new window for PDF generation
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

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

      // Professional PDF HTML with white background and blue design
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>MUST LMS</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              background: white; 
              color: #333; 
              line-height: 1.4;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              border-bottom: 3px solid #2563eb;
            }
            .logo {
              font-size: 20px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            .results-title {
              font-size: 18px;
              color: #1e40af;
              margin-bottom: 10px;
            }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 25px;
              padding: 15px;
              background: #f8fafc;
              border-left: 4px solid #2563eb;
            }
            .info-item {
              text-align: center;
            }
            .info-label {
              font-size: 12px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-value {
              font-size: 16px;
              font-weight: bold;
              color: #1e40af;
              margin-top: 2px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 25px;
            }
            .stat-card {
              text-align: center;
              padding: 15px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              background: white;
            }
            .stat-number {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
            }
            .stat-label {
              font-size: 12px;
              color: #64748b;
              margin-top: 5px;
            }
            .results-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              background: white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .results-table th {
              background: #2563eb;
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .results-table td {
              padding: 10px 8px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 11px;
            }
            .results-table tr:nth-child(even) {
              background: #f8fafc;
            }
            .status-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 500;
              text-transform: uppercase;
            }
            .status-completed { background: #dcfce7; color: #166534; }
            .status-submitted { background: #dbeafe; color: #1d4ed8; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .score-excellent { color: #059669; font-weight: bold; }
            .score-good { color: #2563eb; font-weight: bold; }
            .score-average { color: #d97706; font-weight: bold; }
            .score-poor { color: #dc2626; font-weight: bold; }
            .footer {
              margin-top: 30px;
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #64748b;
              font-size: 11px;
            }
            @media print {
              body { padding: 10px; }
              .header { margin-bottom: 20px; }
              .info-section { margin-bottom: 15px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">MBEYA UNIVERSITY OF SCIENCE AND TECHNOLOGY</div>
            <div class="results-title">Assessment Results</div>
          </div>

          <div class="info-section">
            <div class="info-item">
              <div class="info-label">Assessment Title</div>
              <div class="info-value">${assessment.title}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Program</div>
              <div class="info-value">${assessment.program_name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Generated On</div>
              <div class="info-value">${dateStr} ${timeStr}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Total Questions</div>
              <div class="info-value">${assessment.total_questions}</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${totalSubmissions}</div>
              <div class="stat-label">Total Submissions</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${averageScore}%</div>
              <div class="stat-label">Average Score</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${passRate}%</div>
              <div class="stat-label">Pass Rate</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${assessment.total_points}</div>
              <div class="stat-label">Total Points</div>
            </div>
          </div>

          <table class="results-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Registration</th>
                <th>Program</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              ${assessment.submissions.map((sub, index) => {
                const getGrade = (percentage: number) => {
                  if (percentage >= 90) return 'A';
                  if (percentage >= 80) return 'B';
                  if (percentage >= 70) return 'C';
                  if (percentage >= 60) return 'D';
                  return 'F';
                };
                
                const getScoreClass = (percentage: number) => {
                  if (percentage >= 80) return 'score-excellent';
                  if (percentage >= 70) return 'score-good';
                  if (percentage >= 60) return 'score-average';
                  return 'score-poor';
                };

                const getStatusClass = (status: string) => {
                  if (status === 'completed' || status === 'auto-graded' || status === 'manually-graded') return 'status-completed';
                  if (status === 'submitted') return 'status-submitted';
                  return 'status-pending';
                };

                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${sub.student_registration}</td>
                    <td>${sub.student_program}</td>
                    <td>${sub.score}/${assessment.total_points}</td>
                    <td class="${getScoreClass(sub.percentage)}">${sub.percentage}%</td>
                    <td><strong>${getGrade(sub.percentage)}</strong></td>
                    <td>${new Date(sub.submitted_at).toLocaleDateString()}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p><strong>MUST LEARNING MANAGEMENT SYSTEM</strong> powered by <strong>JEDA NETWORKS</strong></p>
          </div>
        </body>
        </html>
      `;

      // Write content and trigger print
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
    };

    generatePDF();
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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedAssessment(null)}
                    className="mb-2"
                  >
                    ← Back to Assessments
                  </Button>
                  <CardTitle className="text-2xl">{selectedAssessment.title}</CardTitle>
                  <p className="text-muted-foreground">{selectedAssessment.program_name}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => exportResults(selectedAssessment)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.passRate}%</p>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{selectedAssessment.total_questions}</p>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </CardContent>
            </Card>
          </div>

          {/* Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAssessment.submissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
                  <p className="text-gray-600">Students haven't submitted this assessment yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Student</th>
                        <th className="text-left p-3">Registration</th>
                        <th className="text-left p-3">Program</th>
                        <th className="text-center p-3">Score</th>
                        <th className="text-center p-3">Percentage</th>
                        <th className="text-center p-3">Status</th>
                        <th className="text-center p-3">Submitted</th>
                        <th className="text-center p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAssessment.submissions.map((submission) => (
                        <tr key={submission.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{submission.student_name}</td>
                          <td className="p-3">{submission.student_registration}</td>
                          <td className="p-3">{submission.student_program}</td>
                          <td className="p-3 text-center">
                            {submission.score}/{selectedAssessment.total_points}
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant={submission.percentage >= 50 ? "default" : "destructive"}>
                              {submission.percentage}%
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="outline">{submission.status}</Badge>
                          </td>
                          <td className="p-3 text-center text-sm">
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Assessment Results</CardTitle>
            <p className="text-muted-foreground">View and manage assessment submissions and grades</p>
          </CardHeader>
        </Card>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border rounded px-3 py-2"
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
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Results</h3>
              <p className="text-gray-600">Create assessments to view student results and analytics.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAssessments.map((assessment) => {
              const stats = getAssessmentStats(assessment);
              
              return (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{assessment.title}</h3>
                        <p className="text-muted-foreground mb-3">{assessment.program_name}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Submissions</p>
                            <p className="font-medium">{stats.totalSubmissions}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Average Score</p>
                            <p className="font-medium">{stats.averageScore}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Pass Rate</p>
                            <p className="font-medium">{stats.passRate}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Questions</p>
                            <p className="font-medium">{assessment.total_questions}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={assessment.status === 'active' ? 'default' : 'secondary'}>
                            {assessment.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Created: {new Date(assessment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="ml-4">
                        <Button 
                          onClick={() => setSelectedAssessment(assessment)}
                          className="bg-green-600 hover:bg-green-700"
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
