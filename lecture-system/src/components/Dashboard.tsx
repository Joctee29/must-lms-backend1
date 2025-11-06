import { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  BarChart3,
  Clock,
  Calendar,
  Award,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = 'https://must-lms-backend.onrender.com/api';

export const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lecturerData, setLecturerData] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.username) {
        console.log('❌ No current user or username found');
        console.log('Current User Object:', currentUser);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('=== DASHBOARD DATA FETCH ===');
        console.log('Current User:', currentUser);
        console.log('Username for query:', currentUser.username);
        
        // Fetch lecturer info using efficient endpoint
        const lecturerUrl = `${API_BASE_URL}/lecturers?username=${encodeURIComponent(currentUser.username)}`;
        console.log('Fetching from:', lecturerUrl);
        
        const lecturerResponse = await fetch(lecturerUrl);
        console.log('Lecturer Response Status:', lecturerResponse.status);
        
        let lecturer = null;
        if (lecturerResponse.ok) {
          const lecturerResult = await lecturerResponse.json();
          console.log('Lecturer Response:', lecturerResult);
          if (lecturerResult.success && lecturerResult.data.length > 0) {
            lecturer = lecturerResult.data[0];
            console.log('✅ Found Lecturer:', lecturer);
            setLecturerData(lecturer);
          } else {
            console.log('⚠️ No lecturer data in response');
          }
        } else {
          const errorText = await lecturerResponse.text();
          console.log('❌ Lecturer response not OK:', errorText);
          console.log('❌ Lecturer response status:', lecturerResponse.status);
          console.log('❌ Lecturer URL called:', lecturerUrl);
        }

        if (!lecturer) {
          console.log('❌ Lecturer not found in database');
          console.log('Searched for username:', currentUser.username);
          setError('Lecturer profile not found. Please contact admin to ensure your account exists in the system.');
          setLoading(false);
          return;
        }

        // Fetch regular programs using efficient endpoint with lecturer_username filter
        const programsUrl = `${API_BASE_URL}/programs?lecturer_username=${encodeURIComponent(currentUser.username)}`;
        console.log('Fetching programs from:', programsUrl);
        
        const programsResponse = await fetch(programsUrl);
        console.log('Programs Response Status:', programsResponse.status);
        
        let allPrograms = [];
        if (programsResponse.ok) {
          const programsResult = await programsResponse.json();
          console.log('Regular Programs Response:', programsResult);
          if (programsResult.success) {
            allPrograms = [...programsResult.data];
            console.log('✅ Lecturer Regular Programs:', allPrograms.length);
            if (allPrograms.length === 0) {
              console.log('⚠️ No regular programs assigned to this lecturer');
            }
          }
        } else {
          const errorText = await programsResponse.text();
          console.log('❌ Programs response not OK:', errorText);
          console.log('❌ Programs response status:', programsResponse.status);
          console.log('❌ Programs URL called:', programsUrl);
        }

        // Fetch short-term programs using efficient endpoint with lecturer_username filter
        const shortTermUrl = `${API_BASE_URL}/short-term-programs?lecturer_username=${encodeURIComponent(currentUser.username)}`;
        console.log('Fetching short-term programs from:', shortTermUrl);
        
        const shortTermResponse = await fetch(shortTermUrl);
        console.log('Short-Term Programs Response Status:', shortTermResponse.status);
        
        if (shortTermResponse.ok) {
          const shortTermResult = await shortTermResponse.json();
          console.log('Short-Term Programs Response:', shortTermResult);
          if (shortTermResult.success) {
            const shortTermCount = shortTermResult.data.length;
            allPrograms = [...allPrograms, ...shortTermResult.data];
            console.log('✅ Added Short-Term Programs:', shortTermCount);
            console.log('Total Programs (Regular + Short-Term):', allPrograms.length);
            if (shortTermCount === 0) {
              console.log('⚠️ No short-term programs assigned to this lecturer');
            }
          }
        } else {
          const errorText = await shortTermResponse.text();
          console.log('❌ Short-term programs response not OK:', errorText);
          console.log('❌ Short-term programs response status:', shortTermResponse.status);
          console.log('❌ Short-term programs URL called:', shortTermUrl);
        }
        
        setPrograms(allPrograms);
        console.log('📊 FINAL PROGRAMS COUNT:', allPrograms.length);
        
        if (allPrograms.length === 0) {
          console.log('⚠️ WARNING: No programs found for this lecturer!');
          console.log('This could mean:');
          console.log('1. No programs assigned in database');
          console.log('2. lecturer_name field does not match employee_id');
          console.log('3. lecturer_id field is not set correctly');
          console.log('');
          console.log('🔍 DEBUGGING STEPS:');
          console.log('1. Check backend logs for detailed debugging info');
          console.log('2. Verify lecturer exists in database');
          console.log('3. Check if programs have lecturer_name or lecturer_id set');
          console.log('4. Ensure lecturer_name matches employee_id or name');
        }

        // Fetch courses
        const coursesResponse = await fetch(`${API_BASE_URL}/courses`);
        if (coursesResponse.ok) {
          const coursesResult = await coursesResponse.json();
          if (coursesResult.success) {
            setCourses(coursesResult.data);
          }
        }

        // Fetch students - only those in lecturer's programs
        const studentsResponse = await fetch(`${API_BASE_URL}/students`);
        if (studentsResponse.ok) {
          const studentsResult = await studentsResponse.json();
          if (studentsResult.success) {
            // Get course IDs from lecturer's programs
            const courseIds = allPrograms.map(p => p.course_id).filter(Boolean);
            console.log('Course IDs for filtering students:', courseIds);
            
            // Filter students by course IDs
            const lecturerStudents = studentsResult.data.filter((s: any) => 
              courseIds.includes(s.course_id)
            );
            console.log('Filtered Students:', lecturerStudents.length);
            setStudents(lecturerStudents);
          }
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center py-8">
          <div className="text-red-500">{error}</div>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {lecturerData?.name || currentUser?.username || 'Lecturer'}!
          </h1>
          <p className="text-muted-foreground">
            Manage your courses and students at MBEYA University of Science and Technology
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
          <BookOpen className="mr-2 h-4 w-4" />
          View Courses
        </Button>
      </div>

      {/* Lecturer Information */}
      {lecturerData && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <GraduationCap className="mr-2 h-5 w-5" />
              Lecturer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <h4 className="font-semibold text-green-700">Name</h4>
                <p className="text-sm">{lecturerData.name}</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-700">Employee ID</h4>
                <p className="text-sm">{lecturerData.employee_id}</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-700">Specialization</h4>
                <p className="text-sm">{lecturerData.specialization || "General"}</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-700">Programs Assigned</h4>
                <p className="text-sm">{programs.length} Programs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {programs?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {programs?.length === 0 ? "No programs assigned" : `${programs?.length} programs assigned`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {students?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Students in your programs
            </p>
          </CardContent>
        </Card>
        
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lecturer Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {lecturerData ? "Active" : "Pending"}
            </div>
            <p className="text-xs text-muted-foreground">
              {lecturerData ? "Registered lecturer" : "Registration needed"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Programs List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                My Programs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {programs?.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Programs Assigned</h3>
                  <p className="mt-2 text-muted-foreground">
                    You haven't been assigned any programs yet.
                  </p>
                </div>
              ) : (
                programs?.map((program, index) => (
                  <div key={program?.id || index} className="flex items-center space-x-4 rounded-lg border p-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{program?.name || 'Unknown Program'}</h3>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{program?.description || 'No description'}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Semesters: {program?.total_semesters || program?.totalSemesters || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Teaching Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">System Ready</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="text-sm text-muted-foreground">Database Connected</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
