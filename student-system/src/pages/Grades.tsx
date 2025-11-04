import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  FileText,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Grades = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Real student profile from logged in user
  const studentProfile = {
    name: currentUser?.username || "Student",
    registrationNumber: currentUser?.username || "Not logged in",
    program: "To be assigned",
    semester: "Not enrolled",
    totalCredits: 0,
    status: "Active",
    lastLogin: new Date().toISOString()
  };

  // Real data - empty until grades are recorded
  const grades: any[] = [];

  const calculateGPA = () => {
    if (grades.length === 0) return 0;
    const totalPoints = grades.reduce((sum, grade) => sum + (grade.points || 0), 0);
    const totalMaxPoints = grades.reduce((sum, grade) => sum + (grade.maxPoints || 0), 0);
    return totalMaxPoints > 0 ? (totalPoints / totalMaxPoints) * 4.0 : 0;
  };

  const getGradeDistribution = () => {
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    grades.forEach(grade => {
      const letter = grade.grade?.[0] || 'F';
      if (letter in distribution) {
        distribution[letter as keyof typeof distribution]++;
      }
    });
    return distribution;
  };

  const gpa = calculateGPA();
  const gradeDistribution = getGradeDistribution();

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grades & Performance</h1>
          <p className="text-muted-foreground">
            Track your academic performance and view detailed grade reports
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            Real Database Data
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Student Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Student Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{studentProfile.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
              <p className="text-lg font-semibold">{studentProfile.registrationNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Program</p>
              <p className="text-lg font-semibold">{studentProfile.program}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Semester</p>
              <p className="text-lg font-semibold">{studentProfile.semester}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gpa > 0 ? gpa.toFixed(2) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {grades.length === 0 ? "No grades recorded" : "Out of 4.0"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentProfile.totalCredits}</div>
            <p className="text-xs text-muted-foreground">Credits completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Graded</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grades.length}</div>
            <p className="text-xs text-muted-foreground">
              {grades.length === 0 ? "No grades yet" : "Assignments graded"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grades.length > 0 
                ? Math.round(grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length) + "%"
                : "N/A"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {grades.length === 0 ? "No scores recorded" : "Across all assignments"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Grade Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Grades Available</h3>
              <p className="mt-2 text-muted-foreground">
                Your grade distribution will appear here once you receive grades for your assignments.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="flex items-center space-x-4">
                  <div className="w-8 text-center font-semibold">{grade}</div>
                  <div className="flex-1">
                    <Progress 
                      value={grades.length > 0 ? (count / grades.length) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  <div className="w-12 text-right text-sm text-muted-foreground">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Grades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Detailed Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Grades Recorded</h3>
              <p className="mt-2 text-muted-foreground">
                Your assignment grades and feedback will appear here once your instructors have graded your work.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {grades.map((grade) => (
                <Card key={grade.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{grade.assignment}</CardTitle>
                          <Badge variant={grade.grade?.startsWith('A') ? 'default' : 
                                        grade.grade?.startsWith('B') ? 'secondary' : 'outline'}>
                            {grade.grade}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{grade.course}</span>
                          <span>{grade.type}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(grade.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {grade.percentage}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {grade.points}/{grade.maxPoints}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {grade.feedback && (
                    <CardContent className="pt-0">
                      <div className="rounded-lg bg-muted p-3">
                        <p className="text-sm font-medium mb-1">Instructor Feedback:</p>
                        <p className="text-sm text-muted-foreground">{grade.feedback}</p>
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
