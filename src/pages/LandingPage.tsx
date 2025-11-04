import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award, 
  Globe, 
  Microscope,
  Calculator,
  Stethoscope,
  Cpu,
  Building,
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle,
  ArrowRight,
  Shield,
  Clock,
  Target
} from "lucide-react";

const LandingPage = () => {
  const [loginData, setLoginData] = useState({
    registrationNumber: "",
    password: ""
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle the login logic
    console.log("Login attempt:", loginData);
    // Redirect to appropriate system based on registration number pattern
    if (loginData.registrationNumber && loginData.password) {
      // For demo purposes, redirect to student system
      window.location.href = "http://localhost:3001";
    }
  };

  const stats = [
    { icon: Building, label: "Schools/Faculties", value: "6", color: "text-blue-600" },
    { icon: BookOpen, label: "Departments", value: "24", color: "text-green-600" },
    { icon: GraduationCap, label: "Programs", value: "85+", color: "text-purple-600" },
    { icon: Users, label: "Students", value: "12,000+", color: "text-orange-600" }
  ];

  const schools = [
    {
      name: "School of Engineering",
      departments: ["Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Mining Engineering"],
      programs: 18,
      icon: Calculator,
      color: "bg-blue-100 text-blue-700"
    },
    {
      name: "School of Medicine",
      departments: ["Clinical Medicine", "Public Health", "Nursing", "Pharmacy"],
      programs: 12,
      icon: Stethoscope,
      color: "bg-red-100 text-red-700"
    },
    {
      name: "School of ICT",
      departments: ["Computer Science", "Information Systems", "Software Engineering", "Cybersecurity"],
      programs: 15,
      icon: Cpu,
      color: "bg-green-100 text-green-700"
    },
    {
      name: "School of Natural Sciences",
      departments: ["Mathematics", "Physics", "Chemistry", "Biology"],
      programs: 20,
      icon: Microscope,
      color: "bg-purple-100 text-purple-700"
    },
    {
      name: "School of Business",
      departments: ["Accounting", "Marketing", "Management", "Economics"],
      programs: 12,
      icon: Globe,
      color: "bg-yellow-100 text-yellow-700"
    },
    {
      name: "School of Education",
      departments: ["Science Education", "Mathematics Education", "Language Education"],
      programs: 8,
      icon: Award,
      color: "bg-indigo-100 text-indigo-700"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Secure Learning Environment",
      description: "Advanced security measures to protect student data and academic integrity"
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Access your courses, materials, and grades anytime, anywhere"
    },
    {
      icon: Target,
      title: "Personalized Learning",
      description: "Tailored learning paths and progress tracking for each student"
    },
    {
      icon: CheckCircle,
      title: "Quality Assurance",
      description: "Accredited programs meeting international standards"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/must-logo.png" alt="MUST" className="h-16 w-16 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MUST</h1>
                <p className="text-sm text-gray-600">Mbeya University of Science and Technology</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Learning Management System
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">MUST</span> Learning Management System
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Empowering excellence in science and technology education through innovative digital learning solutions. 
              Join thousands of students in their journey towards academic and professional success.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg">
                  <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="max-w-md mx-auto">
            <Card className="shadow-2xl border-0">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Student Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access the Learning Management System
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="registration">Registration Number</Label>
                    <Input
                      id="registration"
                      type="text"
                      placeholder="e.g., MUST/2024/001234"
                      value={loginData.registrationNumber}
                      onChange={(e) => setLoginData({...loginData, registrationNumber: e.target.value})}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      className="h-12"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg font-semibold">
                    Login to LMS
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Forgot your password? <a href="#" className="text-blue-600 hover:underline">Reset here</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Schools & Departments */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Academic Excellence</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our comprehensive range of schools, departments, and programs designed to shape the future leaders in science and technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {schools.map((school, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${school.color} flex items-center justify-center mb-4`}>
                    <school.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{school.name}</CardTitle>
                  <CardDescription>
                    {school.programs} Programs Available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">Departments:</h4>
                    <div className="flex flex-wrap gap-2">
                      {school.departments.map((dept, deptIndex) => (
                        <Badge key={deptIndex} variant="secondary" className="text-xs">
                          {dept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose MUST LMS?</h2>
            <p className="text-xl text-gray-600">
              Experience cutting-edge educational technology designed for your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Info */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <span>P.O.Box 131, Mbeya - Tanzania</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span>+255 25 295 7544</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span>must@must.ac.tz</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="#" className="block hover:text-blue-400 transition-colors">University Website</a>
                <a href="#" className="block hover:text-blue-400 transition-colors">Online Application</a>
                <a href="#" className="block hover:text-blue-400 transition-colors">Academic Calendar</a>
                <a href="#" className="block hover:text-blue-400 transition-colors">Student Services</a>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Academic Year 2024/2025</h3>
              <p className="text-gray-300 mb-4">
                Join us in our mission to advance science and technology education in Tanzania and beyond.
              </p>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-sm">Accredited & Chartered University</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img src="/must-logo.png" alt="MUST" className="h-8 w-8" />
              <span className="font-semibold">MUST Learning Management System</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">
              © 2024 Mbeya University of Science and Technology. All rights reserved.
            </p>
            <p className="text-xs text-gray-500">
              Powered by JEDA NETWORKS
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
