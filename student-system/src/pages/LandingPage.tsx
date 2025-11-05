import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building,
  BookOpen,
  GraduationCap,
  Users,
  Calculator,
  Stethoscope,
  Cpu,
  Microscope,
  Globe,
  Award,
  Shield,
  Zap,
  CheckCircle,
  Star,
  Clock,
  Target,
  LogIn,
  Leaf,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface LandingPageProps {
  onShowLogin: () => void;
}

const LandingPage = ({ onShowLogin }: LandingPageProps) => {
  // Updated to Academic Year 2025/2026 with copyright 2026
  console.log("Updated to Academic Year 2025/2026 with copyright 2026");
  
  const [expandedCollege, setExpandedCollege] = useState<number | null>(null);
  
  const stats = [
    { icon: Building, label: "Colleges", value: "7", color: "text-blue-600" },
    { icon: BookOpen, label: "Departments", value: "30", color: "text-green-600" },
    { icon: GraduationCap, label: "Programs", value: "120+", color: "text-purple-600" },
    { icon: Users, label: "Students", value: "12,000+", color: "text-orange-600" }
  ];

  const colleges = [
    {
      name: "College of Engineering and Technology (CET)",
      shortName: "CET",
      departments: [
        "Civil Engineering",
        "Electrical and Power Engineering", 
        "Geosciences and Mining Technology",
        "Mechanical and Industrial Engineering",
        "Chemical and Environmental Engineering",
        "Information and Communication Technology"
      ],
      programs: 25,
      icon: Calculator,
      color: "bg-blue-100 text-blue-700"
    },
    {
      name: "College of Architecture and Construction Technology (CoACT)",
      shortName: "CoACT",
      departments: [
        "Architecture and Art Design",
        "Construction Management and Technology",
        "Urban Planning and Real Estate Studies"
      ],
      programs: 12,
      icon: Building,
      color: "bg-purple-100 text-purple-700"
    },
    {
      name: "College of Information and Communication Technology (CoICT)",
      shortName: "CoICT",
      departments: [
        "Computer Science and Engineering",
        "Electronics and Telecommunications Engineering",
        "Informatics",
        "Information Systems and Technology"
      ],
      programs: 18,
      icon: Cpu,
      color: "bg-red-100 text-red-700"
    },
    {
      name: "College of Science and Technical Education (CoSTE)",
      shortName: "CoSTE",
      departments: [
        "Applied Sciences",
        "Medical Sciences and Technology",
        "Natural Sciences",
        "Technical Education",
        "Earth Sciences",
        "Mathematics and Statistics"
      ],
      programs: 22,
      icon: Microscope,
      color: "bg-green-100 text-green-700"
    },
    {
      name: "College of Humanities and Business Studies (CoHBS)",
      shortName: "CoHBS",
      departments: [
        "Business Management",
        "Humanities",
        "Law (iko kwenye maandalizi / inatarajiwa)"
      ],
      programs: 15,
      icon: Globe,
      color: "bg-indigo-100 text-indigo-700"
    },
    {
      name: "College of Agricultural Sciences and Technology (CoAST)",
      shortName: "CoAST",
      departments: [
        "Agricultural Engineering",
        "Crop Science and Horticulture",
        "Food Science and Technology",
        "Natural Resources",
        "Veterinary Medicine and Animal Science",
        "Agronomy and Soil Science"
      ],
      programs: 20,
      icon: Leaf,
      color: "bg-yellow-100 text-yellow-700"
    },
    {
      name: "MUST Rukwa Campus College (MRCC)",
      shortName: "MRCC",
      departments: [
        "Business Management",
        "Mechanical and Industrial Engineering"
      ],
      programs: 8,
      icon: MapPin,
      color: "bg-orange-100 text-orange-700"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Background Image - from header text to end of hero section */}
      <div 
        className="absolute top-16 left-0 right-0 h-96 bg-cover bg-center bg-no-repeat opacity-35"
        style={{
          backgroundImage: `url('/WhatsApp Image 2025-09-17 at 07.22.39_6d77ccd7.jpg')`,
          backgroundPosition: 'center top',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
        }}
      />
      
      {/* Light overlay for text readability - only in hero area */}
      <div className="absolute top-16 left-0 right-0 h-96 bg-white/10"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/60 backdrop-blur-md border-b sticky top-0 z-50">
          <div className="container mx-auto px-2 md:px-4 py-2 md:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-7">
                <img src="/must-logo.png" alt="MUST" className="h-20 w-20 md:h-28 md:w-28 object-contain" />
                <div>
                  <h1 className="text-xl md:text-5xl font-bold text-gray-900 drop-shadow-sm">MUST</h1>
                  <p className="hidden md:block text-xl text-gray-800 font-semibold drop-shadow-sm">Mbeya University of Science and Technology</p>
                  <p className="md:hidden text-[10px] leading-tight text-gray-800 font-semibold drop-shadow-sm">Mbeya University of Science and Technology</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1 bg-blue-100 text-blue-700">
                <span className="hidden md:inline">Learning Management System (LMS)</span>
                <span className="md:hidden">LMS</span>
              </Badge>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-10 md:py-20 px-2 md:px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
                Welcome to <span className="text-blue-600">MUST</span> LMS
              </h1>
              <p className="text-sm md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed px-2">
                Empowering excellence in science and technology education through innovative digital learning solutions. 
                Join thousands of learners in their journey towards academic and professional success.
              </p>
              
              {/* Login Button */}
              <Button 
                onClick={() => {
                  console.log("Button clicked!");
                  onShowLogin();
                }}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-8 py-3 md:py-4 text-sm md:text-lg font-semibold shadow-lg"
              >
                <LogIn className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Access LMS Portal
              </Button>
            
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-8 md:mt-16">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 md:p-6 shadow-lg">
                    <stat.icon className={`h-5 w-5 md:h-8 md:w-8 ${stat.color} mx-auto mb-1 md:mb-2`} />
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs md:text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      {/* Colleges & Departments */}
      <section className="py-10 md:py-20 px-2 md:px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">Academic Excellence</h2>
            <p className="text-sm md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Discover our comprehensive range of colleges, departments, and programs designed to shape the future leaders in science and technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {colleges.map((college, index) => (
              <Card 
                key={index} 
                className="hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setExpandedCollege(expandedCollege === index ? null : index)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${college.color} flex items-center justify-center mb-4`}>
                    <college.icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{college.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {college.programs} Programs Available
                      </CardDescription>
                    </div>
                    <div className="ml-2">
                      {expandedCollege === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {expandedCollege === index && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-700 border-t pt-3">Departments:</h4>
                      <div className="space-y-2">
                        {college.departments.map((dept, deptIndex) => (
                          <div key={deptIndex} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">{dept}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 md:py-20 px-2 md:px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">Why Choose MUST Student Portal?</h2>
            <p className="text-sm md:text-xl text-gray-600 px-2">
              Experience cutting-edge educational technology designed for your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center px-2">
                <div className="bg-white rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-2 md:mb-4 shadow-lg">
                  <feature.icon className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">{feature.title}</h3>
                <p className="text-xs md:text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Info */}
      <section className="py-8 md:py-16 px-2 md:px-4 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div>
              <h3 className="text-base md:text-xl font-bold mb-2 md:mb-4">Contact Information</h3>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                  <span className="text-xs md:text-base">P.O.Box 131, Mbeya - Tanzania</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <Phone className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                  <span className="text-xs md:text-base">+255 25 295 7544</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <Mail className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                  <span className="text-xs md:text-base">must@must.ac.tz</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-base md:text-xl font-bold mb-2 md:mb-4">LMS Services</h3>
              <div className="space-y-1 md:space-y-2">
                <a href="#" className="block hover:text-blue-400 transition-colors text-xs md:text-base">Academic Calendar</a>
                <a href="#" className="block hover:text-blue-400 transition-colors text-xs md:text-base">Course Registration</a>
                <a href="#" className="block hover:text-blue-400 transition-colors text-xs md:text-base">Learning Support</a>
                <a href="#" className="block hover:text-blue-400 transition-colors text-xs md:text-base">Library Services</a>
              </div>
            </div>
            
            <div>
              <h3 className="text-base md:text-xl font-bold mb-2 md:mb-4">Academic Year 2025/2026</h3>
              <p className="text-gray-300 mb-2 md:mb-4 text-xs md:text-base">
                Join us in our mission to advance science and technology education in Tanzania and beyond.
              </p>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
                <span className="text-xs md:text-sm">Accredited & Chartered University</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-6 md:mt-12 pt-4 md:pt-8 text-center">
            <div className="mb-2 md:mb-4">
              <span className="font-semibold text-base md:text-lg text-white">MUST LMS</span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm mb-1 md:mb-2 px-2">
              © 2026 Mbeya University of Science and Technology. All rights reserved.
            </p>
            <p className="text-xs text-gray-500">
              Powered by JEDA NETWORKS
            </p>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default LandingPage;
