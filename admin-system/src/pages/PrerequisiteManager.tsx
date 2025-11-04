import { useState } from "react";
import {
  BookOpen,
  ArrowRight,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Network,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: number;
  title: string;
  code: string;
  department: string;
  credits: number;
  level: number;
  prerequisites: number[];
  corequisites: number[];
  description: string;
}

interface PrerequisiteRule {
  id: number;
  courseId: number;
  prerequisiteId: number;
  type: "hard" | "soft" | "recommended";
  minGrade?: string;
}

export const PrerequisiteManager = () => {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: "Basic Mathematics",
      code: "MATH101",
      department: "Mathematics",
      credits: 3,
      level: 100,
      prerequisites: [],
      corequisites: [],
      description: "Foundation mathematics course",
    },
    {
      id: 2,
      title: "Advanced Mathematics",
      code: "MATH301",
      department: "Mathematics",
      credits: 4,
      level: 300,
      prerequisites: [1],
      corequisites: [],
      description: "Advanced mathematical concepts",
    },
    {
      id: 3,
      title: "Physics I",
      code: "PHYS101",
      department: "Physics",
      credits: 3,
      level: 100,
      prerequisites: [1],
      corequisites: [],
      description: "Introduction to physics",
    },
    {
      id: 4,
      title: "Physics II",
      code: "PHYS201",
      department: "Physics",
      credits: 4,
      level: 200,
      prerequisites: [3, 2],
      corequisites: [],
      description: "Advanced physics concepts",
    },
    {
      id: 5,
      title: "Computer Science",
      code: "CS101",
      department: "Computer Science",
      credits: 4,
      level: 100,
      prerequisites: [1],
      corequisites: [],
      description: "Introduction to programming",
    },
    {
      id: 6,
      title: "Data Structures",
      code: "CS201",
      department: "Computer Science",
      credits: 3,
      level: 200,
      prerequisites: [5],
      corequisites: [],
      description: "Advanced programming concepts",
    },
  ]);

  const [prerequisiteRules, setPrerequisiteRules] = useState<PrerequisiteRule[]>([
    { id: 1, courseId: 2, prerequisiteId: 1, type: "hard", minGrade: "C" },
    { id: 2, courseId: 3, prerequisiteId: 1, type: "hard", minGrade: "C" },
    { id: 3, courseId: 4, prerequisiteId: 3, type: "hard", minGrade: "B" },
    { id: 4, courseId: 4, prerequisiteId: 2, type: "recommended", minGrade: "C" },
    { id: 5, courseId: 5, prerequisiteId: 1, type: "hard", minGrade: "C" },
    { id: 6, courseId: 6, prerequisiteId: 5, type: "hard", minGrade: "B" },
  ]);

  const [editingCourse, setEditingCourse] = useState<number | null>(null);
  const [newPrerequisite, setNewPrerequisite] = useState({
    courseId: 0,
    prerequisiteId: 0,
    type: "hard" as "hard" | "soft" | "recommended",
    minGrade: "C",
  });

  const getCourseById = (id: number) => courses.find(c => c.id === id);

  const getPrerequisitesForCourse = (courseId: number) => {
    return prerequisiteRules.filter(rule => rule.courseId === courseId);
  };

  const addPrerequisite = () => {
    if (newPrerequisite.courseId && newPrerequisite.prerequisiteId) {
      // Check for circular dependencies
      if (hasCircularDependency(newPrerequisite.courseId, newPrerequisite.prerequisiteId)) {
        alert('Error: This would create a circular dependency!');
        return;
      }

      const newRule: PrerequisiteRule = {
        id: Date.now(),
        ...newPrerequisite,
      };

      setPrerequisiteRules([...prerequisiteRules, newRule]);
      
      // Update course prerequisites
      setCourses(courses.map(course => {
        if (course.id === newPrerequisite.courseId) {
          return {
            ...course,
            prerequisites: [...course.prerequisites, newPrerequisite.prerequisiteId],
          };
        }
        return course;
      }));

      setNewPrerequisite({ courseId: 0, prerequisiteId: 0, type: "hard", minGrade: "C" });
      alert('Prerequisite added successfully!');
    } else {
      alert('Please select both course and prerequisite');
    }
  };

  const removePrerequisite = (ruleId: number) => {
    const rule = prerequisiteRules.find(r => r.id === ruleId);
    if (!rule) return;

    if (confirm('Are you sure you want to remove this prerequisite?')) {
      setPrerequisiteRules(prerequisiteRules.filter(r => r.id !== ruleId));
      
      // Update course prerequisites
      setCourses(courses.map(course => {
        if (course.id === rule.courseId) {
          return {
            ...course,
            prerequisites: course.prerequisites.filter(p => p !== rule.prerequisiteId),
          };
        }
        return course;
      }));

      alert('Prerequisite removed successfully!');
    }
  };

  const hasCircularDependency = (courseId: number, prerequisiteId: number): boolean => {
    // Simple circular dependency check
    const visited = new Set<number>();
    
    const checkCircular = (currentId: number): boolean => {
      if (visited.has(currentId)) return true;
      if (currentId === prerequisiteId) return true;
      
      visited.add(currentId);
      
      const coursePrereqs = courses.find(c => c.id === currentId)?.prerequisites || [];
      return coursePrereqs.some(prereqId => checkCircular(prereqId));
    };
    
    return checkCircular(courseId);
  };

  const validateStudentEnrollment = (studentId: number, courseId: number) => {
    // Mock student grades
    const studentGrades = {
      1: "A", // MATH101
      2: "B", // MATH301
      3: "C", // PHYS101
      5: "B", // CS101
    };

    const course = getCourseById(courseId);
    if (!course) return { canEnroll: false, reasons: ["Course not found"] };

    const reasons: string[] = [];
    let canEnroll = true;

    const courseRules = getPrerequisitesForCourse(courseId);
    
    courseRules.forEach(rule => {
      const prerequisite = getCourseById(rule.prerequisiteId);
      if (!prerequisite) return;

      const studentGrade = studentGrades[rule.prerequisiteId as keyof typeof studentGrades];
      
      if (!studentGrade) {
        if (rule.type === "hard") {
          canEnroll = false;
          reasons.push(`Must complete ${prerequisite.code} first`);
        } else if (rule.type === "recommended") {
          reasons.push(`Recommended to complete ${prerequisite.code} first`);
        }
      } else if (rule.minGrade && !isGradeSufficient(studentGrade, rule.minGrade)) {
        if (rule.type === "hard") {
          canEnroll = false;
          reasons.push(`Need minimum grade ${rule.minGrade} in ${prerequisite.code} (current: ${studentGrade})`);
        }
      }
    });

    return { canEnroll, reasons };
  };

  const isGradeSufficient = (studentGrade: string, minGrade: string): boolean => {
    const gradeValues = { "A": 4, "B": 3, "C": 2, "D": 1, "F": 0 };
    return (gradeValues[studentGrade as keyof typeof gradeValues] || 0) >= 
           (gradeValues[minGrade as keyof typeof gradeValues] || 0);
  };

  const generatePrerequisiteMap = () => {
    const mapData = courses.map(course => {
      const prerequisites = course.prerequisites.map(id => getCourseById(id)?.code).join(', ');
      const dependents = courses.filter(c => c.prerequisites.includes(course.id)).map(c => c.code).join(', ');
      
      return {
        course: course.code,
        title: course.title,
        level: course.level,
        prerequisites: prerequisites || 'None',
        dependents: dependents || 'None',
        credits: course.credits
      };
    });
    
    const csvContent = [
      'Course,Title,Level,Prerequisites,Dependents,Credits',
      ...mapData.map(row => 
        `"${row.course}","${row.title}",${row.level},"${row.prerequisites}","${row.dependents}",${row.credits}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prerequisite_map.csv';
    a.click();
    URL.revokeObjectURL(url);
    alert('Prerequisite map exported successfully!');
  };

  const testEnrollment = () => {
    // Test enrollment for a mock student
    const studentId = 1;
    const testCourseId = 4; // Physics II
    
    const result = validateStudentEnrollment(studentId, testCourseId);
    const course = getCourseById(testCourseId);
    
    alert(`Enrollment Test for ${course?.code}:\n\nCan Enroll: ${result.canEnroll ? 'Yes' : 'No'}\n\nReasons:\n${result.reasons.join('\n')}`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "hard": return "bg-red-100 text-red-800";
      case "soft": return "bg-yellow-100 text-yellow-800";
      case "recommended": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prerequisite Manager</h1>
          <p className="text-muted-foreground">
            Manage course prerequisites and dependencies
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={testEnrollment} variant="outline">
            <CheckCircle className="mr-2 h-4 w-4" />
            Test Enrollment
          </Button>
          <Button onClick={generatePrerequisiteMap} className="bg-gradient-to-r from-primary to-secondary text-white">
            <Network className="mr-2 h-4 w-4" />
            Export Map
          </Button>
        </div>
      </div>

      {/* Add New Prerequisite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Prerequisite Rule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Course</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newPrerequisite.courseId}
                onChange={(e) => setNewPrerequisite({...newPrerequisite, courseId: Number(e.target.value)})}
              >
                <option value={0}>Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Prerequisite</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newPrerequisite.prerequisiteId}
                onChange={(e) => setNewPrerequisite({...newPrerequisite, prerequisiteId: Number(e.target.value)})}
              >
                <option value={0}>Select Prerequisite</option>
                {courses.filter(c => c.id !== newPrerequisite.courseId).map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newPrerequisite.type}
                onChange={(e) => setNewPrerequisite({...newPrerequisite, type: e.target.value as any})}
              >
                <option value="hard">Hard Requirement</option>
                <option value="soft">Soft Requirement</option>
                <option value="recommended">Recommended</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Min Grade</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newPrerequisite.minGrade}
                onChange={(e) => setNewPrerequisite({...newPrerequisite, minGrade: e.target.value})}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={addPrerequisite} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Rule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Prerequisites */}
      <div className="grid gap-6">
        {courses.map((course) => {
          const courseRules = getPrerequisitesForCourse(course.id);
          const dependentCourses = courses.filter(c => c.prerequisites.includes(course.id));
          
          return (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>{course.title} ({course.code})</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {course.department} • Level {course.level} • {course.credits} credits
                    </p>
                  </div>
                  <Badge variant="outline">
                    {courseRules.length} Prerequisites
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Prerequisites */}
                {courseRules.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Prerequisites:</h4>
                    <div className="space-y-2">
                      {courseRules.map((rule) => {
                        const prerequisite = getCourseById(rule.prerequisiteId);
                        return (
                          <div key={rule.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center space-x-4">
                              <span className="font-medium">{prerequisite?.code}</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span>{course.code}</span>
                              <Badge className={getTypeColor(rule.type)}>
                                {rule.type}
                              </Badge>
                              {rule.minGrade && (
                                <Badge variant="outline">
                                  Min Grade: {rule.minGrade}
                                </Badge>
                              )}
                            </div>
                            <Button
                              onClick={() => removePrerequisite(rule.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dependent Courses */}
                {dependentCourses.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Required for:</h4>
                    <div className="flex flex-wrap gap-2">
                      {dependentCourses.map((dependent) => (
                        <Badge key={dependent.id} variant="secondary">
                          {dependent.code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Description */}
                <div>
                  <h4 className="font-medium mb-1">Description:</h4>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2 border-t">
                  <Button
                    onClick={() => alert(`Viewing enrollment requirements for ${course.code}`)}
                    variant="outline"
                    size="sm"
                  >
                    <Target className="mr-2 h-3 w-3" />
                    Check Requirements
                  </Button>
                  <Button
                    onClick={() => alert(`Viewing dependency tree for ${course.code}`)}
                    variant="outline"
                    size="sm"
                  >
                    <Network className="mr-2 h-3 w-3" />
                    View Dependencies
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
