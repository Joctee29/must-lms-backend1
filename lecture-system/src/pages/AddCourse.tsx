import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Building, BookOpen, GraduationCap, Users, Plus, CheckCircle } from "lucide-react";

// Mock data - this would come from admin system
const mockColleges = [
  {
    id: "1",
    name: "College of Engineering and Technology",
    shortName: "CET",
    departments: [
      {
        id: "1",
        name: "Civil Engineering",
        courses: [
          {
            id: "1",
            name: "Bachelor of Engineering in Civil Engineering",
            code: "BECE",
            programs: [
              { id: "1", name: "Civil Engineering Year 1", semester: 1 },
              { id: "2", name: "Civil Engineering Year 1", semester: 2 },
              { id: "3", name: "Civil Engineering Year 2", semester: 1 },
              { id: "4", name: "Civil Engineering Year 2", semester: 2 }
            ]
          }
        ]
      },
      {
        id: "2",
        name: "Mechanical Engineering",
        courses: [
          {
            id: "2",
            name: "Bachelor of Engineering in Mechanical Engineering",
            code: "BEME",
            programs: [
              { id: "5", name: "Mechanical Engineering Year 1", semester: 1 },
              { id: "6", name: "Mechanical Engineering Year 1", semester: 2 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "College of Information and Communication Technology",
    shortName: "CoICT",
    departments: [
      {
        id: "3",
        name: "Computer Science and Engineering",
        courses: [
          {
            id: "3",
            name: "Bachelor of Science in Computer Science",
            code: "BSCS",
            programs: [
              { id: "7", name: "Computer Science Year 1", semester: 1 },
              { id: "8", name: "Computer Science Year 1", semester: 2 }
            ]
          }
        ]
      }
    ]
  }
];

interface LecturerCourse {
  id: string;
  subjectName: string;
  subjectCode: string;
  college: string;
  department: string;
  course: string;
  program: string;
  semester: number;
  credits: number;
  description: string;
  lecturerName: string;
  addedDate: string;
}

export const AddCourse = () => {
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [lecturerCourses, setLecturerCourses] = useState<LecturerCourse[]>([]);

  const [courseForm, setCourseForm] = useState({
    subjectName: "",
    subjectCode: "",
    credits: 0,
    description: "",
    lecturerName: "Dr. John Lecturer" // This would come from auth context
  });

  const getSelectedCollegeData = () => {
    return mockColleges.find(c => c.id === selectedCollege);
  };

  const getSelectedDepartmentData = () => {
    const college = getSelectedCollegeData();
    return college?.departments.find(d => d.id === selectedDepartment);
  };

  const getSelectedCourseData = () => {
    const department = getSelectedDepartmentData();
    return department?.courses.find(c => c.id === selectedCourse);
  };

  const getSelectedProgramData = () => {
    const course = getSelectedCourseData();
    return course?.programs.find(p => p.id === selectedProgram);
  };

  const handleCollegeChange = (collegeId: string) => {
    setSelectedCollege(collegeId);
    setSelectedDepartment("");
    setSelectedCourse("");
    setSelectedProgram("");
  };

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    setSelectedCourse("");
    setSelectedProgram("");
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedProgram("");
  };

  const handleAddCourse = () => {
    if (courseForm.subjectName && courseForm.subjectCode && selectedProgram) {
      const collegeData = getSelectedCollegeData();
      const departmentData = getSelectedDepartmentData();
      const courseData = getSelectedCourseData();
      const programData = getSelectedProgramData();

      const newLecturerCourse: LecturerCourse = {
        id: Date.now().toString(),
        subjectName: courseForm.subjectName,
        subjectCode: courseForm.subjectCode,
        college: collegeData?.name || "",
        department: departmentData?.name || "",
        course: courseData?.name || "",
        program: programData?.name || "",
        semester: programData?.semester || 1,
        credits: courseForm.credits,
        description: courseForm.description,
        lecturerName: courseForm.lecturerName,
        addedDate: new Date().toLocaleDateString()
      };

      setLecturerCourses([...lecturerCourses, newLecturerCourse]);
      
      // Reset form
      setCourseForm({
        subjectName: "",
        subjectCode: "",
        credits: 0,
        description: "",
        lecturerName: "Dr. John Lecturer"
      });
      setSelectedCollege("");
      setSelectedDepartment("");
      setSelectedCourse("");
      setSelectedProgram("");

      alert("Course added successfully! This will now appear in student portals for the selected program.");
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Add New Course</h1>
          <p className="text-muted-foreground">Add subjects to programs and make them available to students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Course Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Course Information
            </CardTitle>
            <CardDescription>Select program hierarchy and add subject details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* College Selection */}
            <div>
              <Label htmlFor="college">Select College</Label>
              <Select value={selectedCollege} onValueChange={handleCollegeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose college" />
                </SelectTrigger>
                <SelectContent>
                  {mockColleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.shortName} - {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department Selection */}
            {selectedCollege && (
              <div>
                <Label htmlFor="department">Select Department</Label>
                <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose department" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSelectedCollegeData()?.departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Course Selection */}
            {selectedDepartment && (
              <div>
                <Label htmlFor="course">Select Course</Label>
                <Select value={selectedCourse} onValueChange={handleCourseChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose course" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSelectedDepartmentData()?.courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Program Selection */}
            {selectedCourse && (
              <div>
                <Label htmlFor="program">Select Program</Label>
                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose program" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSelectedCourseData()?.programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name} - Semester {program.semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Subject Details */}
            {selectedProgram && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subjectName">Subject Name</Label>
                    <Input
                      id="subjectName"
                      value={courseForm.subjectName}
                      onChange={(e) => setCourseForm({...courseForm, subjectName: e.target.value})}
                      placeholder="e.g., Engineering Mathematics I"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subjectCode">Subject Code</Label>
                    <Input
                      id="subjectCode"
                      value={courseForm.subjectCode}
                      onChange={(e) => setCourseForm({...courseForm, subjectCode: e.target.value})}
                      placeholder="e.g., MATH101"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({...courseForm, credits: parseInt(e.target.value) || 0})}
                    placeholder="e.g., 3"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                    placeholder="Brief description of the subject"
                  />
                </div>
                <Button onClick={handleAddCourse} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course to Program
                </Button>
              </>
            )}

            {/* Auto-fetched Information Display */}
            {selectedProgram && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Auto-fetched Information:</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <p><span className="font-medium">College:</span> {getSelectedCollegeData()?.name}</p>
                  <p><span className="font-medium">Department:</span> {getSelectedDepartmentData()?.name}</p>
                  <p><span className="font-medium">Course:</span> {getSelectedCourseData()?.name}</p>
                  <p><span className="font-medium">Program:</span> {getSelectedProgramData()?.name}</p>
                  <p><span className="font-medium">Semester:</span> {getSelectedProgramData()?.semester}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Added Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              My Added Courses ({lecturerCourses.length})
            </CardTitle>
            <CardDescription>Courses you have added to programs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lecturerCourses.map((course) => (
                <Card key={course.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{course.subjectName}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>Code: {course.subjectCode}</span>
                          <span>•</span>
                          <span>Credits: {course.credits}</span>
                        </div>
                      </div>
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                      <p><span className="font-medium">College:</span> {course.college}</p>
                      <p><span className="font-medium">Department:</span> {course.department}</p>
                      <p><span className="font-medium">Program:</span> {course.program}</p>
                      <p><span className="font-medium">Semester:</span> {course.semester}</p>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                    <p className="text-xs text-muted-foreground">Added: {course.addedDate}</p>
                  </CardContent>
                </Card>
              ))}
              
              {lecturerCourses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No courses added yet</p>
                  <p className="text-sm">Add your first course using the form</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
