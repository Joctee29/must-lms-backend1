import { useState, useEffect } from "react";
import { courseOperations, lecturerOperations, initializeDatabase } from "@/lib/database";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building, BookOpen, GraduationCap, Users, Plus, Edit, Trash2, ArrowLeft, Eye, Calendar } from "lucide-react";

interface College {
  id: string;
  name: string;
  shortName: string;
  short_name?: string;
  description: string;
  established: string;
}

interface Department {
  id: string;
  name: string;
  collegeId: string;
  college_id?: string;
  description: string;
  headOfDepartment: string;
  head_of_department?: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  department_id?: string;
  duration: number;
  academicLevel: 'certificate' | 'diploma' | 'bachelor' | 'masters' | 'phd';
  academic_level?: 'certificate' | 'diploma' | 'bachelor' | 'masters' | 'phd';
  yearOfStudy: number;
  year_of_study?: number;
  description: string;
}

interface Program {
  id: string;
  name: string;
  courseId: string;
  course_id?: string;
  credits: number;
  totalSemesters: number;
  total_semesters?: number;
  lecturerName: string;
  lecturer_name?: string;
  lecturerId?: string;
  lecturer_id?: string;
  description: string;
}

export const CourseManagement = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // FULL INTERACTION states
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Form states
  const [collegeForm, setCollegeForm] = useState({
    name: "", shortName: "", description: "", established: ""
  });
  const [departmentForm, setDepartmentForm] = useState({
    name: "", collegeId: "", description: "", headOfDepartment: ""
  });
  const [courseForm, setCourseForm] = useState({
    name: "", code: "", courseId: "", departmentId: "", duration: 0, academicLevel: "bachelor" as 'certificate' | 'diploma' | 'bachelor' | 'masters' | 'phd', yearOfStudy: 1, description: ""
  });
  const [programForm, setProgramForm] = useState({
    name: "", courseId: "", credits: 0, totalSemesters: 0, lecturerName: "", description: ""
  });

  // Edit states
  const [editingCollege, setEditingCollege] = useState<any>(null);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editingProgram, setEditingProgram] = useState<any>(null);

  // Search states for dropdowns
  const [collegeSearch, setCollegeSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [lecturerSearch, setLecturerSearch] = useState("");

  // Level filter state
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  // Tab state for navigation
  const [activeTab, setActiveTab] = useState<string>("colleges");

  useEffect(() => {
    const initData = async () => {
      try {
        await initializeDatabase();
        await loadData();
      } catch (error) {
        console.error('Error initializing:', error);
      }
    };
    initData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('=== LOADING DATA FROM DATABASE ===');
      
      // Try to fetch real data from database first
      
      // Load colleges
      console.log('Fetching colleges...');
      const collegesData = await courseOperations.getAllColleges();
      console.log('Colleges API response:', collegesData);
      console.log('Colleges array length:', collegesData?.length);
      setColleges(collegesData || []);
      
      // Load departments
      console.log('Fetching departments...');
      const departmentsData = await courseOperations.getAllDepartments();
      console.log('Departments API response:', departmentsData);
      console.log('Departments array length:', departmentsData?.length);
      setDepartments(departmentsData || []);
      
      // Load courses
      console.log('Fetching courses...');
      const coursesData = await courseOperations.getAllCourses();
      console.log('Courses API response:', coursesData);
      console.log('Courses array length:', coursesData?.length);
      
      // Debug academic levels
      if (coursesData && coursesData.length > 0) {
        console.log('=== COURSES ACADEMIC LEVELS DEBUG ===');
        coursesData.forEach((course, index) => {
          console.log(`Course ${index + 1}:`, {
            name: course.name,
            academic_level: course.academic_level,
            academicLevel: course.academicLevel,
            id: course.id
          });
        });
      }
      
      setCourses(coursesData || []);
      
      // Load programs
      console.log('Fetching programs...');
      const programsData = await courseOperations.getAllPrograms();
      console.log('Programs API response:', programsData);
      console.log('Programs array length:', programsData?.length);
      setPrograms(programsData || []);
      
      // Load lecturers
      console.log('Fetching lecturers...');
      const lecturersData = await courseOperations.getAllLecturers();
      console.log('Lecturers API response:', lecturersData);
      console.log('Lecturers array length:', lecturersData?.length);
      setLecturers(lecturersData || []);
      
      console.log('=== DATA LOADING COMPLETE ===');
      console.log('Final counts:', {
        colleges: collegesData?.length || 0,
        departments: departmentsData?.length || 0,
        courses: coursesData?.length || 0,
        programs: programsData?.length || 0,
        lecturers: lecturersData?.length || 0
      });
      
      // Force re-render by logging state after setting
      setTimeout(() => {
        console.log('=== STATE AFTER SETTING ===');
        console.log('Colleges in state:', colleges.length);
        console.log('Departments in state:', departments.length);
        console.log('Courses in state:', courses.length);
        console.log('Programs in state:', programs.length);
      }, 100);
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error("Failed to load data from database");
      
      // Keep arrays empty if database connection fails - REAL DATA ONLY
      console.log('Database connection failed - keeping arrays empty for real data only');
      setColleges([]);
      setDepartments([]);
      setCourses([]);
      setPrograms([]);
      setLecturers([]);
    } finally {
      setLoading(false);
    }
  };

  // FULL INTERACTION functions
  const handleCollegeClick = (college: College) => {
    setSelectedCollege(college);
    setSelectedDepartment(null);
    setSelectedCourse(null);
    setSelectedProgram(null);
    setShowDetailView(true);
  };

  const handleDepartmentClick = (department: Department) => {
    setSelectedDepartment(department);
    setSelectedCollege(null);
    setSelectedCourse(null);
    setSelectedProgram(null);
    setShowDetailView(true);
  };


  // Statistics functions
  const getCollegeStats = (collegeId: number | string) => {
    console.log('=== COLLEGE STATS DEBUG ===');
    console.log('College ID:', collegeId);
    console.log('All Departments:', departments);
    console.log('All Courses:', courses);
    console.log('All Programs:', programs);
    
    // Support both camelCase and snake_case field names from database
    const collegeDepartments = departments.filter(d => 
      Number(d.collegeId || d.college_id) === Number(collegeId)
    );
    console.log('College Departments:', collegeDepartments);
    
    const collegeCourses = courses.filter(c => 
      collegeDepartments.some(d => Number(d.id) === Number(c.departmentId || c.department_id))
    );
    console.log('College Courses:', collegeCourses);
    
    const collegePrograms = programs.filter(p => 
      collegeCourses.some(c => Number(c.id) === Number(p.courseId || p.course_id))
    );
    console.log('College Programs:', collegePrograms);
    
    return {
      departments: collegeDepartments.length,
      courses: collegeCourses.length,
      programs: collegePrograms.length,
      departmentsList: collegeDepartments,
      coursesList: collegeCourses,
      programsList: collegePrograms
    };
  };

  const getDepartmentStats = (departmentId: number | string) => {
    console.log('=== DEPARTMENT STATS DEBUG ===');
    console.log('Department ID:', departmentId);
    
    const department = departments.find(d => Number(d.id) === Number(departmentId));
    console.log('Department Found:', department);
    
    // Support both camelCase and snake_case field names from database
    const college = colleges.find(c => Number(c.id) === Number(department?.collegeId || department?.college_id));
    console.log('College Found:', college);
    
    const departmentCourses = courses.filter(c => Number(c.departmentId || c.department_id) === Number(departmentId));
    console.log('Department Courses:', departmentCourses);
    
    const departmentPrograms = programs.filter(p => 
      departmentCourses.some(c => Number(c.id) === Number(p.courseId || p.course_id))
    );
    console.log('Department Programs:', departmentPrograms);
    
    return {
      college: college,
      courses: departmentCourses.length,
      programs: departmentPrograms.length,
      coursesList: departmentCourses,
      programsList: departmentPrograms
    };
  };

  const getCourseStats = (courseId: number | string) => {
    const course = courses.find(c => Number(c.id) === Number(courseId));
    // Support both camelCase and snake_case field names from database
    const department = departments.find(d => Number(d.id) === Number(course?.departmentId || course?.department_id));
    const college = colleges.find(c => Number(c.id) === Number(department?.collegeId || department?.college_id));
    const coursePrograms = programs.filter(p => Number(p.courseId || p.course_id) === Number(courseId));
    
    console.log(`Course ${courseId} stats: ${coursePrograms.length} programs`);
    
    return {
      department: department,
      college: college,
      programs: coursePrograms.length,
      programsList: coursePrograms
    };
  };

  const getProgramStats = (programId: number | string) => {
    const program = programs.find(p => Number(p.id) === Number(programId));
    // Support both camelCase and snake_case field names from database
    const course = courses.find(c => Number(c.id) === Number(program?.courseId || program?.course_id));
    const department = departments.find(d => Number(d.id) === Number(course?.departmentId || course?.department_id));
    const college = colleges.find(c => Number(c.id) === Number(department?.collegeId || department?.college_id));
    const lecturer = lecturers.find(l => 
      l.name === program?.lecturerName || l.name === program?.lecturer_name || Number(l.id) === Number(program?.lecturerId || program?.lecturer_id)
    );
    
    console.log(`Program ${programId} stats: lecturer ${lecturer?.name || 'Not assigned'}`);
    
    return {
      course: course,
      department: department,
      college: college,
      lecturer: lecturer
    };
  };

  // CRUD operations
  const handleAddCollege = async () => {
    if (!collegeForm.name || !collegeForm.shortName) {
      toast.error("Please fill required fields");
      return;
    }
    
    try {
      setLoading(true);
      await courseOperations.createCollege(collegeForm);
      await loadData();
      setCollegeForm({ name: "", shortName: "", description: "", established: "" });
      toast.success("College added successfully!");
    } catch (error) {
      console.error('Error adding college:', error);
      toast.error("Failed to add college");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!departmentForm.name || !departmentForm.collegeId) {
      toast.error("Please fill required fields");
      return;
    }
    
    try {
      setLoading(true);
      await courseOperations.createDepartment({
        ...departmentForm,
        collegeId: parseInt(departmentForm.collegeId)
      });
      await loadData();
      setDepartmentForm({ name: "", collegeId: "", description: "", headOfDepartment: "" });
      toast.success("Department added successfully!");
    } catch (error) {
      console.error('Error adding department:', error);
      toast.error("Failed to add department");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!courseForm.name || !courseForm.code || !courseForm.departmentId) {
      toast.error("Please fill required fields");
      return;
    }
    
    try {
      setLoading(true);
      console.log('=== ADDING COURSE DEBUG ===');
      console.log('Course Form Data:', courseForm);
      
      const courseData = {
        name: courseForm.name,
        code: courseForm.code,
        departmentId: parseInt(courseForm.departmentId),
        duration: courseForm.duration,
        academicLevel: courseForm.academicLevel,
        yearOfStudy: courseForm.yearOfStudy,
        description: courseForm.description
      };
      
      console.log('Sending Course Data:', courseData);
      
      const result = await courseOperations.createCourse(courseData);
      console.log('Course Creation Result:', result);
      
      // Force reload all data
      await loadData();
      
      // Reset form
      setCourseForm({ name: "", code: "", courseId: "", departmentId: "", duration: 0, academicLevel: "bachelor" as const, yearOfStudy: 1, description: "" });
      toast.success("Course added successfully!");
      
      console.log('Updated Courses:', courses);
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error("Failed to add course");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgram = async () => {
    if (!programForm.name || !programForm.courseId || !programForm.lecturerName) {
      toast.error("Please fill required fields");
      return;
    }
    
    try {
      setLoading(true);
      await courseOperations.createProgram({
        ...programForm,
        courseId: parseInt(programForm.courseId)
      });
      await loadData();
      setProgramForm({ name: "", courseId: "", duration: 0, totalSemesters: 0, lecturerName: "", description: "" });
      toast.success("Program added successfully!");
    } catch (error) {
      console.error('Error adding program:', error);
      toast.error("Failed to add program");
    } finally {
      setLoading(false);
    }
  };

  // EDIT FUNCTIONS
  const handleEditCollege = async (college: any) => {
    if (!editingCollege) return;
    
    try {
      setLoading(true);
      await courseOperations.updateCollege(editingCollege.id, {
        name: collegeForm.name,
        shortName: collegeForm.shortName,
        established: collegeForm.established,
        description: collegeForm.description
      });
      await loadData();
      setEditingCollege(null);
      setCollegeForm({ name: "", shortName: "", established: "", description: "" });
      toast.success("College updated successfully!");
    } catch (error) {
      console.error('Error updating college:', error);
      toast.error("Failed to update college");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDepartment = async () => {
    if (!editingDepartment) return;
    
    try {
      setLoading(true);
      await courseOperations.updateDepartment(editingDepartment.id, {
        name: departmentForm.name,
        collegeId: parseInt(departmentForm.collegeId),
        headOfDepartment: departmentForm.headOfDepartment,
        description: departmentForm.description
      });
      await loadData();
      setEditingDepartment(null);
      setDepartmentForm({ name: "", collegeId: "", description: "", headOfDepartment: "" });
      toast.success("Department updated successfully!");
    } catch (error) {
      console.error('Error updating department:', error);
      toast.error("Failed to update department");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse) return;
    
    try {
      setLoading(true);
      await courseOperations.updateCourse(editingCourse.id, {
        name: courseForm.name,
        code: courseForm.code,
        courseId: courseForm.courseId,
        departmentId: parseInt(courseForm.departmentId),
        duration: courseForm.duration,
        academicLevel: courseForm.academicLevel,
        yearOfStudy: courseForm.yearOfStudy,
        description: courseForm.description
      });
      await loadData();
      setEditingCourse(null);
      setCourseForm({ name: "", code: "", courseId: "", departmentId: "", duration: 0, academicLevel: "bachelor" as const, yearOfStudy: 1, description: "" });
      toast.success("Course updated successfully!");
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error("Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProgram = async () => {
    if (!editingProgram) return;
    
    try {
      setLoading(true);
      await courseOperations.updateProgram(editingProgram.id, {
        name: programForm.name,
        courseId: parseInt(programForm.courseId),
        lecturerName: programForm.lecturerName,
        credits: programForm.credits || 0,
        totalSemesters: programForm.totalSemesters,
        duration: programForm.duration,
        description: programForm.description
      });
      await loadData();
      setEditingProgram(null);
      setProgramForm({ name: "", courseId: "", duration: 0, totalSemesters: 0, lecturerName: "", description: "" });
      toast.success("Program updated successfully!");
    } catch (error) {
      console.error('Error updating program:', error);
      toast.error("Failed to update program");
    } finally {
      setLoading(false);
    }
  };

  if (showDetailView) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setShowDetailView(false)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course Management
          </Button>
        </div>

        {selectedCollege && (
          <DetailedCollegeView 
            college={selectedCollege} 
            stats={getCollegeStats(selectedCollege.id)}
            onNavigate={(action: string) => {
              setShowDetailView(false);
              if (action === 'departments') {
                setActiveTab('departments');
              } else if (action === 'courses') {
                setActiveTab('courses');
              } else if (action === 'programs') {
                setActiveTab('programs');
              } else if (action === 'edit-college') {
                setActiveTab('colleges');
                setEditingCollege(selectedCollege);
                setCollegeForm({
                  name: selectedCollege.name,
                  shortName: selectedCollege.shortName || selectedCollege.short_name || "",
                  established: selectedCollege.established || "",
                  description: selectedCollege.description || ""
                });
              }
            }}
          />
        )}
        
        {selectedDepartment && (
          <DetailedDepartmentView 
            department={selectedDepartment} 
            stats={getDepartmentStats(selectedDepartment.id)}
            onNavigate={(action: string) => {
              setShowDetailView(false);
              if (action === 'courses') {
                setActiveTab('courses');
              } else if (action === 'programs') {
                setActiveTab('programs');
              } else if (action === 'edit-department') {
                setActiveTab('departments');
                setEditingDepartment(selectedDepartment);
                setDepartmentForm({
                  name: selectedDepartment.name,
                  collegeId: String(selectedDepartment.collegeId || selectedDepartment.college_id || ""),
                  description: selectedDepartment.description || "",
                  headOfDepartment: selectedDepartment.headOfDepartment || selectedDepartment.head_of_department || ""
                });
              }
            }}
          />
        )}
        
        
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
        <p className="text-muted-foreground">
          Manage colleges, departments, courses, and programs with FULL INTERACTION
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="colleges">Colleges</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="colleges" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{editingCollege ? 'Edit College' : 'Add New College'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="college-name">College Name</Label>
                  <Input
                    id="college-name"
                    name="collegeName"
                    value={collegeForm.name}
                    onChange={(e) => setCollegeForm({...collegeForm, name: e.target.value})}
                    placeholder="Enter college name"
                  />
                </div>
                <div>
                  <Label htmlFor="college-short-name">Short Name</Label>
                  <Input
                    id="college-short-name"
                    name="collegeShortName"
                    value={collegeForm.shortName}
                    onChange={(e) => setCollegeForm({...collegeForm, shortName: e.target.value})}
                    placeholder="Enter short name"
                  />
                </div>
                <div>
                  <Label htmlFor="college-description">Description</Label>
                  <Textarea
                    id="college-description"
                    name="collegeDescription"
                    value={collegeForm.description}
                    onChange={(e) => setCollegeForm({...collegeForm, description: e.target.value})}
                    placeholder="College description"
                  />
                </div>
                <div>
                  <Label htmlFor="college-established">Established Year</Label>
                  <Input
                    id="college-established"
                    name="collegeEstablished"
                    value={collegeForm.established}
                    onChange={(e) => setCollegeForm({...collegeForm, established: e.target.value})}
                    placeholder="e.g., 2020"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={editingCollege ? handleEditCollege : handleAddCollege} disabled={loading}>
                    {editingCollege ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {editingCollege ? 'Update College' : 'Add College'}
                  </Button>
                  {editingCollege && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingCollege(null);
                        setCollegeForm({ name: "", shortName: "", established: "", description: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Colleges ({colleges.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {colleges.map((college) => {
                    const stats = getCollegeStats(college.id);
                    return (
                      <div 
                        key={college.id} 
                        className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{college.name}</h3>
                          <p className="text-sm text-gray-500 truncate">{college.shortName || college.short_name || 'No short name'}</p>
                        </div>
                        
                        {/* Stats Badges */}
                        <div className="hidden md:flex items-center gap-2">
                          <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                            {stats.departments} Depts
                          </Badge>
                          <Badge variant="secondary" className="bg-emerald-600 text-white text-xs">
                            {stats.courses} Courses
                          </Badge>
                        </div>
                        
                        {/* Established */}
                        <div className="hidden lg:block text-sm text-gray-500 w-20">
                          {college.established || 'N/A'}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            onClick={() => handleCollegeClick(college)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCollege(college);
                              setCollegeForm({
                                name: college.name,
                                shortName: college.shortName || "",
                                established: college.established || "",
                                description: college.description || ""
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-gray-100"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm(`Are you sure you want to delete ${college.name}?`)) {
                                try {
                                  setLoading(true);
                                  await courseOperations.deleteCollege(college.id);
                                  await loadData();
                                  toast.success(`${college.name} deleted successfully!`);
                                } catch (error) {
                                  console.error('Error deleting college:', error);
                                  toast.error("Failed to delete college");
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{editingDepartment ? 'Edit Department' : 'Add New Department'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="department-name">Department Name</Label>
                  <Input
                    id="department-name"
                    name="departmentName"
                    value={departmentForm.name}
                    onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
                    placeholder="Enter department name"
                  />
                </div>
                <div>
                  <Label htmlFor="department-college">College</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        placeholder="Search colleges..."
                        value={collegeSearch}
                        onChange={(e) => setCollegeSearch(e.target.value)}
                        className="text-sm pr-8"
                      />
                      {collegeSearch && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => setCollegeSearch("")}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                    <Select value={departmentForm.collegeId} onValueChange={(value) => setDepartmentForm({...departmentForm, collegeId: value})}>
                      <SelectTrigger id="department-college" name="departmentCollege">
                        <SelectValue placeholder="Select college" />
                      </SelectTrigger>
                      <SelectContent>
                        {colleges
                          .filter(college => 
                            college.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
                            college.shortName?.toLowerCase().includes(collegeSearch.toLowerCase())
                          )
                          .map((college) => (
                            <SelectItem key={college.id} value={college.id}>
                              {college.name} {college.shortName ? `(${college.shortName})` : ''}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="department-hod">Head of Department</Label>
                  <Input
                    id="department-hod"
                    name="departmentHod"
                    value={departmentForm.headOfDepartment}
                    onChange={(e) => setDepartmentForm({...departmentForm, headOfDepartment: e.target.value})}
                    placeholder="Enter HOD name"
                  />
                </div>
                <div>
                  <Label htmlFor="department-description">Description</Label>
                  <Textarea
                    id="department-description"
                    name="departmentDescription"
                    value={departmentForm.description}
                    onChange={(e) => setDepartmentForm({...departmentForm, description: e.target.value})}
                    placeholder="Department description"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={editingDepartment ? handleEditDepartment : handleAddDepartment} disabled={loading}>
                    {editingDepartment ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {editingDepartment ? 'Update Department' : 'Add Department'}
                  </Button>
                  {editingDepartment && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingDepartment(null);
                        setDepartmentForm({ name: "", collegeId: "", description: "", headOfDepartment: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Departments ({departments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {departments.map((department) => {
                    const stats = getDepartmentStats(department.id);
                    return (
                      <div 
                        key={department.id} 
                        className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{department.name}</h3>
                          <p className="text-sm text-gray-500 truncate">HOD: {department.headOfDepartment || department.head_of_department || 'Not assigned'}</p>
                        </div>
                        
                        {/* College Badge */}
                        <div className="hidden md:block">
                          <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                            {stats.college?.shortName || stats.college?.name?.substring(0, 10) || 'N/A'}
                          </Badge>
                        </div>
                        
                        {/* Stats */}
                        <div className="hidden lg:flex items-center gap-2">
                          <Badge variant="secondary" className="bg-emerald-600 text-white text-xs">
                            {stats.courses} Courses
                          </Badge>
                          <Badge variant="secondary" className="bg-orange-600 text-white text-xs">
                            {stats.programs} Programs
                          </Badge>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            onClick={() => handleDepartmentClick(department)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingDepartment(department);
                              setDepartmentForm({
                                name: department.name,
                                collegeId: department.collegeId?.toString() || "",
                                headOfDepartment: department.headOfDepartment || "",
                                description: department.description || ""
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-gray-100"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm(`Are you sure you want to delete ${department.name}?`)) {
                                try {
                                  setLoading(true);
                                  await courseOperations.deleteDepartment(department.id);
                                  await loadData();
                                  toast.success(`${department.name} deleted successfully!`);
                                } catch (error) {
                                  console.error('Error deleting department:', error);
                                  toast.error("Failed to delete department");
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="course-name">Course Name</Label>
                  <Input
                    id="course-name"
                    name="courseName"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                    placeholder="Enter course name"
                  />
                </div>
                <div>
                  <Label htmlFor="course-code">Course Code</Label>
                  <Input
                    id="course-code"
                    name="courseCode"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({...courseForm, code: e.target.value})}
                    placeholder="e.g., CS101"
                  />
                </div>
                <div>
                  <Label htmlFor="course-id">Course ID</Label>
                  <Input
                    id="course-id"
                    name="courseId"
                    value={courseForm.courseId || 'Auto-generated'}
                    readOnly
                    className="bg-gray-100"
                    placeholder="Auto-generated"
                  />
                </div>
                <div>
                  <Label htmlFor="course-department">Department</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        placeholder="Search departments..."
                        value={departmentSearch}
                        onChange={(e) => setDepartmentSearch(e.target.value)}
                        className="text-sm pr-8"
                      />
                      {departmentSearch && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => setDepartmentSearch("")}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                    <Select value={courseForm.departmentId} onValueChange={(value) => setCourseForm({...courseForm, departmentId: value})}>
                      <SelectTrigger id="course-department" name="courseDepartment">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments
                          .filter(department => 
                            department.name.toLowerCase().includes(departmentSearch.toLowerCase()) ||
                            department.headOfDepartment?.toLowerCase().includes(departmentSearch.toLowerCase())
                          )
                          .map((department) => (
                            <SelectItem key={department.id} value={department.id}>
                              {department.name} - HOD: {department.headOfDepartment || department.head_of_department || 'Dr. ' + department.name?.split(' ')[0] + ' Head'}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="course-duration">Duration (Years)</Label>
                  <Input
                    id="course-duration"
                    name="courseDuration"
                    type="number"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({...courseForm, duration: parseInt(e.target.value) || 0})}
                    placeholder="Course duration in years"
                  />
                </div>
                <div>
                  <Label htmlFor="course-level">Academic Level</Label>
                  <Select value={courseForm.academicLevel} onValueChange={(value) => setCourseForm({...courseForm, academicLevel: value as any})}>
                    <SelectTrigger id="course-level" name="courseLevel">
                      <SelectValue placeholder="Select academic level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="certificate">Certificate Level</SelectItem>
                      <SelectItem value="diploma">Diploma Level</SelectItem>
                      <SelectItem value="bachelor">Bachelor Degree</SelectItem>
                      <SelectItem value="masters">Masters Degree</SelectItem>
                      <SelectItem value="phd">PhD Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="course-year">Year of Study</Label>
                  <Select value={courseForm.yearOfStudy.toString()} onValueChange={(value) => setCourseForm({...courseForm, yearOfStudy: parseInt(value)})}>
                    <SelectTrigger id="course-year" name="courseYear">
                      <SelectValue placeholder="Select year of study" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                      <SelectItem value="5">Year 5</SelectItem>
                      <SelectItem value="6">Year 6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="course-description">Description</Label>
                  <Textarea
                    id="course-description"
                    name="courseDescription"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                    placeholder="Course description"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={editingCourse ? handleEditCourse : handleAddCourse} disabled={loading}>
                    {editingCourse ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {editingCourse ? 'Update Course' : 'Add Course'}
                  </Button>
                  {editingCourse && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingCourse(null);
                        setCourseForm({ name: "", code: "", courseId: "", departmentId: "", duration: 0, academicLevel: "bachelor" as const, yearOfStudy: 1, description: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Courses ({courses.length})</CardTitle>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    variant={selectedLevel === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel("all")}
                  >
                    All Levels ({courses.length})
                  </Button>
                  <Button
                    variant={selectedLevel === "certificate" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel("certificate")}
                  >
                    Certificate ({courses.filter(c => (c.academic_level || c.academicLevel) === 'certificate').length})
                  </Button>
                  <Button
                    variant={selectedLevel === "diploma" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel("diploma")}
                  >
                    Diploma ({courses.filter(c => (c.academic_level || c.academicLevel) === 'diploma').length})
                  </Button>
                  <Button
                    variant={selectedLevel === "bachelor" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel("bachelor")}
                  >
                    Bachelor ({courses.filter(c => (c.academic_level || c.academicLevel) === 'bachelor').length})
                  </Button>
                  <Button
                    variant={selectedLevel === "masters" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel("masters")}
                  >
                    Masters ({courses.filter(c => (c.academic_level || c.academicLevel) === 'masters').length})
                  </Button>
                  <Button
                    variant={selectedLevel === "phd" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel("phd")}
                  >
                    PhD ({courses.filter(c => (c.academic_level || c.academicLevel) === 'phd').length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {courses
                    .filter(course => selectedLevel === "all" || course.academic_level === selectedLevel || course.academicLevel === selectedLevel)
                    .map((course) => {
                    const stats = getCourseStats(course.id);
                    return (
                      <div 
                        key={course.id} 
                        className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{course.name}</h3>
                          <p className="text-sm text-gray-500 truncate">Code: {course.code} | Duration: {course.duration || 0} years</p>
                        </div>
                        
                        {/* Level Badge */}
                        <Badge 
                          variant="secondary"
                          className={`text-xs text-white ${
                            (course.academic_level || course.academicLevel) === 'certificate' ? 'bg-gray-600' :
                            (course.academic_level || course.academicLevel) === 'diploma' ? 'bg-yellow-600' :
                            (course.academic_level || course.academicLevel) === 'bachelor' ? 'bg-blue-600' :
                            (course.academic_level || course.academicLevel) === 'masters' ? 'bg-purple-600' :
                            'bg-red-600'
                          }`}
                        >
                          {(course.academic_level || course.academicLevel)?.toUpperCase() || 'BACHELOR'}
                        </Badge>
                        
                        {/* Programs Count */}
                        <div className="hidden md:block">
                          <Badge variant="secondary" className="bg-emerald-600 text-white text-xs">
                            {stats.programs} Programs
                          </Badge>
                        </div>
                        
                        {/* ID Badge */}
                        <div className="hidden lg:block">
                          <Badge variant="outline" className="text-xs font-mono text-gray-500 border-gray-300">
                            ID: {course.id}
                          </Badge>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCourse(course);
                              setCourseForm({
                                name: course.name,
                                code: course.code,
                                departmentId: course.departmentId?.toString() || "",
                                duration: course.duration || 0,
                                academicLevel: course.academic_level || course.academicLevel || "bachelor",
                                yearOfStudy: course.yearOfStudy || course.year_of_study || 1,
                                description: course.description || ""
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-gray-100"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm(`Are you sure you want to delete ${course.name}?`)) {
                                try {
                                  setLoading(true);
                                  await courseOperations.deleteCourse(course.id);
                                  await loadData();
                                  toast.success(`${course.name} deleted successfully!`);
                                } catch (error) {
                                  console.error('Error deleting course:', error);
                                  toast.error("Failed to delete course");
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{editingProgram ? 'Edit Program' : 'Add New Program'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="program-name">Program Name</Label>
                  <Input
                    id="program-name"
                    name="programName"
                    value={programForm.name}
                    onChange={(e) => setProgramForm({...programForm, name: e.target.value})}
                    placeholder="Enter program name"
                  />
                </div>
                <div>
                  <Label htmlFor="program-course">Course</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        placeholder="Search courses..."
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        className="text-sm pr-8"
                      />
                      {courseSearch && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => setCourseSearch("")}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                    <Select value={programForm.courseId} onValueChange={(value) => setProgramForm({...programForm, courseId: value})}>
                      <SelectTrigger id="program-course" name="programCourse">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses
                          .filter(course => 
                            course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
                            course.code.toLowerCase().includes(courseSearch.toLowerCase())
                          )
                          .map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name} ({course.code}) - {course.duration} years
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="program-lecturer">Lecturer Name</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        placeholder="Search lecturers..."
                        value={lecturerSearch}
                        onChange={(e) => setLecturerSearch(e.target.value)}
                        className="text-sm pr-8"
                      />
                      {lecturerSearch && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => setLecturerSearch("")}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                    <Select value={programForm.lecturerName} onValueChange={(value) => setProgramForm({...programForm, lecturerName: value})}>
                      <SelectTrigger id="program-lecturer" name="programLecturer">
                        <SelectValue placeholder="Select lecturer" />
                      </SelectTrigger>
                      <SelectContent>
                        {lecturers
                          .filter(lecturer => 
                            lecturer.name.toLowerCase().includes(lecturerSearch.toLowerCase()) ||
                            lecturer.email?.toLowerCase().includes(lecturerSearch.toLowerCase()) ||
                            lecturer.specialization?.toLowerCase().includes(lecturerSearch.toLowerCase())
                          )
                          .map((lecturer) => (
                            <SelectItem key={lecturer.id} value={lecturer.name}>
                              {lecturer.name} - {lecturer.specialization || 'No specialization'}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="program-credits">Credits</Label>
                  <Input
                    id="program-credits"
                    name="programCredits"
                    type="number"
                    value={programForm.credits}
                    onChange={(e) => setProgramForm({...programForm, credits: parseInt(e.target.value) || 0})}
                    placeholder="Program credits"
                  />
                </div>
                <div>
                  <Label htmlFor="program-semesters">Total Semesters (1 or 2 only)</Label>
                  <Select value={programForm.totalSemesters.toString()} onValueChange={(value) => setProgramForm({...programForm, totalSemesters: parseInt(value)})}>
                    <SelectTrigger id="program-semesters" name="programSemesters">
                      <SelectValue placeholder="Select semesters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Semester</SelectItem>
                      <SelectItem value="2">2 Semesters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="program-description">Description</Label>
                  <Textarea
                    id="program-description"
                    name="programDescription"
                    value={programForm.description}
                    onChange={(e) => setProgramForm({...programForm, description: e.target.value})}
                    placeholder="Program description"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={editingProgram ? handleEditProgram : handleAddProgram} disabled={loading}>
                    {editingProgram ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {editingProgram ? 'Update Program' : 'Add Program'}
                  </Button>
                  {editingProgram && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingProgram(null);
                        setProgramForm({ name: "", courseId: "", credits: 0, totalSemesters: 0, lecturerName: "", description: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Programs ({programs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {programs.map((program) => {
                    const stats = getProgramStats(program.id);
                    return (
                      <div 
                        key={program.id} 
                        className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{program.name}</h3>
                          <p className="text-sm text-gray-500 truncate">Lecturer: {program.lecturerName || 'Not assigned'}</p>
                        </div>
                        
                        {/* Course Badge */}
                        <div className="hidden md:block">
                          <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                            {stats.course?.name?.substring(0, 15) || 'N/A'}
                          </Badge>
                        </div>
                        
                        {/* Credits & Semesters */}
                        <div className="hidden lg:flex items-center gap-2">
                          <Badge variant="secondary" className="bg-emerald-600 text-white text-xs">
                            {program.credits || 0} Credits
                          </Badge>
                          <Badge variant="secondary" className="bg-purple-600 text-white text-xs">
                            {program.totalSemesters || 1} Sem
                          </Badge>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProgram(program);
                              setProgramForm({
                                name: program.name,
                                courseId: program.courseId?.toString() || "",
                                lecturerName: program.lecturerName || "",
                                credits: program.credits || 0,
                                totalSemesters: program.totalSemesters || 1,
                                description: program.description || ""
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-gray-100"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm(`Are you sure you want to delete ${program.name}?`)) {
                                try {
                                  setLoading(true);
                                  await courseOperations.deleteProgram(program.id);
                                  await loadData();
                                  toast.success(`${program.name} deleted successfully!`);
                                } catch (error) {
                                  console.error('Error deleting program:', error);
                                  toast.error("Failed to delete program");
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Enhanced detailed view components with complete information
const DetailedCollegeView = ({ college, stats, onNavigate }: any) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="mr-2 h-6 w-6 text-blue-600" />
          {college.name} - Complete College Details
        </CardTitle>
        <CardDescription>
          Comprehensive overview of {college.shortName || college.short_name || college.name} with all departments, courses, and programs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* College Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">College Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                <p className="font-semibold">{college.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Short Name</Label>
                <p className="font-semibold">{college.shortName || college.short_name || "Not specified"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Established</Label>
                <p className="font-semibold">{college.established || "Not specified"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm">{college.description || "No description available"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Statistics Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Departments</span>
                <Badge variant="outline" className="bg-blue-50">{stats.departments}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Courses</span>
                <Badge variant="outline" className="bg-green-50">{stats.courses}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Programs</span>
                <Badge variant="outline" className="bg-purple-50">{stats.programs}</Badge>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  This college manages {stats.departments} departments offering {stats.courses} courses 
                  across {stats.programs} academic programs.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onNavigate && onNavigate('departments')}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Department
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onNavigate && onNavigate('courses')}>
                <BookOpen className="mr-2 h-4 w-4" />
                View All Courses
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onNavigate && onNavigate('programs')}>
                <GraduationCap className="mr-2 h-4 w-4" />
                View All Programs
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onNavigate && onNavigate('edit-college')}>
                <Edit className="mr-2 h-4 w-4" />
                Edit College Info
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    {/* Departments Detailed List */}
    {stats.departmentsList && stats.departmentsList.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Departments in {college.shortName || college.short_name || college.name} ({stats.departmentsList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.departmentsList.map((dept: any) => {
              const deptCourses = stats.coursesList?.filter((c: any) => Number(c.departmentId || c.department_id) === Number(dept.id)) || [];
              const deptPrograms = stats.programsList?.filter((p: any) => 
                deptCourses.some((c: any) => Number(c.id) === Number(p.courseId || p.course_id))
              ) || [];
              
              return (
                <div key={dept.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                    <Building className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                    <p className="text-sm text-gray-500">HOD: {dept.headOfDepartment || dept.head_of_department || 'Not assigned'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <span className="text-sm text-gray-500">Courses:</span>
                      <Badge variant="outline" className="ml-2">{deptCourses.length}</Badge>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-500">Programs:</span>
                      <Badge variant="outline" className="ml-2">{deptPrograms.length}</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Courses Summary */}
    {stats.coursesList && stats.coursesList.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            All Courses in {college.shortName || college.name} ({stats.coursesList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.coursesList.map((course: any) => (
              <div key={course.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{course.name}</h3>
                  <p className="text-sm text-gray-500">Code: {course.code}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

const DetailedDepartmentView = ({ department, stats, onNavigate }: any) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="mr-2 h-6 w-6 text-green-600" />
          {department.name} - Complete Department Details
        </CardTitle>
        <CardDescription>
          Comprehensive overview of {department.name} with all courses, programs, and academic information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Department Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Department Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Department Name</Label>
                <p className="font-semibold">{department.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Parent College</Label>
                <p className="font-semibold">{stats.college?.name || "Unknown College"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Head of Department</Label>
                <p className="font-semibold">{department.headOfDepartment || department.head_of_department || "Not assigned"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm">{department.description || "No description available"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Academic Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Courses</span>
                <Badge variant="outline" className="bg-blue-50">{stats.courses}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Programs</span>
                <Badge variant="outline" className="bg-green-50">{stats.programs}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">College</span>
                <Badge variant="outline" className="bg-purple-50">{stats.college?.shortName || stats.college?.short_name || "N/A"}</Badge>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  This department offers {stats.courses} courses across {stats.programs} academic programs 
                  under {stats.college?.name || "the college"}.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onNavigate && onNavigate('courses')}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Course
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onNavigate && onNavigate('programs')}>
                <GraduationCap className="mr-2 h-4 w-4" />
                Add New Program
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onNavigate && onNavigate('edit-department')}>
                <Users className="mr-2 h-4 w-4" />
                Assign HOD
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onNavigate && onNavigate('edit-department')}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Department
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    {/* Courses Detailed List */}
    {stats.coursesList && stats.coursesList.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Courses in {department.name} ({stats.coursesList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.coursesList.map((course: any) => {
              const coursePrograms = stats.programsList?.filter((p: any) => Number(p.courseId || p.course_id) === Number(course.id)) || [];
              
              return (
                <div key={course.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-500">Code: {course.code}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <span className="text-sm text-gray-500">Programs:</span>
                      <Badge variant="outline" className="ml-2">{coursePrograms.length}</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);
