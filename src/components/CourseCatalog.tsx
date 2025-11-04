import { useState } from "react";
import {
  Search,
  Filter,
  Clock,
  Users,
  Star,
  BookOpen,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CourseCatalog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const courses = [
    {
      id: 1,
      title: "Advanced Mathematics",
      instructor: "Dr. Sarah Johnson",
      category: "Mathematics",
      level: "Advanced",
      duration: "12 weeks",
      students: 245,
      rating: 4.8,
      price: "Free",
      image: "/api/placeholder/300/200",
      description: "Master advanced mathematical concepts including calculus, linear algebra, and differential equations.",
      prerequisites: ["Basic Calculus", "Linear Algebra"],
      modules: 8
    },
    {
      id: 2,
      title: "Physics Laboratory Techniques",
      instructor: "Prof. Michael Chen",
      category: "Physics",
      level: "Intermediate",
      duration: "10 weeks",
      students: 189,
      rating: 4.6,
      price: "$299",
      image: "/api/placeholder/300/200",
      description: "Hands-on laboratory experience with modern physics equipment and experimental techniques.",
      prerequisites: ["General Physics I"],
      modules: 12
    },
    {
      id: 3,
      title: "Computer Science Fundamentals",
      instructor: "Dr. Emily Rodriguez",
      category: "Computer Science",
      level: "Beginner",
      duration: "16 weeks",
      students: 567,
      rating: 4.9,
      price: "Free",
      image: "/api/placeholder/300/200",
      description: "Introduction to programming, algorithms, and data structures using Python.",
      prerequisites: [],
      modules: 15
    },
    {
      id: 4,
      title: "Environmental Science",
      instructor: "Dr. James Wilson",
      category: "Science",
      level: "Intermediate",
      duration: "8 weeks",
      students: 134,
      rating: 4.5,
      price: "$199",
      image: "/api/placeholder/300/200",
      description: "Explore environmental systems, sustainability, and climate change impacts.",
      prerequisites: ["General Biology"],
      modules: 10
    },
    {
      id: 5,
      title: "Data Analytics with R",
      instructor: "Dr. Maria Garcia",
      category: "Data Science",
      level: "Advanced",
      duration: "14 weeks",
      students: 298,
      rating: 4.7,
      price: "$399",
      image: "/api/placeholder/300/200",
      description: "Statistical analysis and data visualization using R programming language.",
      prerequisites: ["Statistics", "Basic Programming"],
      modules: 11
    },
    {
      id: 6,
      title: "Organic Chemistry",
      instructor: "Prof. David Kim",
      category: "Chemistry",
      level: "Intermediate",
      duration: "12 weeks",
      students: 156,
      rating: 4.4,
      price: "$249",
      image: "/api/placeholder/300/200",
      description: "Study of carbon-based compounds and their reactions in biological systems.",
      prerequisites: ["General Chemistry"],
      modules: 9
    }
  ];

  const categories = ["All", "Mathematics", "Physics", "Computer Science", "Science", "Chemistry", "Data Science"];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-success/10 text-success";
      case "Intermediate": return "bg-progress/10 text-progress";
      case "Advanced": return "bg-secondary/10 text-secondary";
      default: return "bg-muted/10 text-muted-foreground";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
        <p className="text-muted-foreground">
          Discover and enroll in courses offered by MBEYA University of Science and Technology
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses, instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCourses.length} of {courses.length} courses
        </p>
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/20 p-6">
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
            </div>
            
            <CardHeader className="flex-1">
              <div className="flex items-start justify-between">
                <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{course.instructor}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Course Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>{course.students} enrolled</span>
                </div>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 text-yellow-500" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center">
                  <GraduationCap className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>{course.modules} modules</span>
                </div>
              </div>

              {/* Prerequisites */}
              {course.prerequisites.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Prerequisites:</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {course.prerequisites.map((prereq, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Price and Enroll */}
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-primary">{course.price}</div>
                <Button className="bg-gradient-to-r from-primary to-secondary text-white">
                  Enroll Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};