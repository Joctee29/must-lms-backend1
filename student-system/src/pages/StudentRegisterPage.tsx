import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, User, Lock, Mail, BookOpen, GraduationCap, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

interface StudentRegisterPageProps {
  onBack: () => void;
  onRegisterSuccess: () => void;
}

interface Course {
  id: number;
  name: string;
  code: string;
  academic_level: string;
  year_of_study: number;
}

const StudentRegisterPage = ({ onBack, onRegisterSuccess }: StudentRegisterPageProps) => {
  const [registerData, setRegisterData] = useState({
    registrationNumber: "",
    courseLevel: "",
    yearOfStudy: "",
    courseId: "",
    password: "",
    confirmPassword: "",
    email: ""
  });
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch all courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter courses when level or year changes
  useEffect(() => {
    if (registerData.courseLevel && registerData.yearOfStudy) {
      const filtered = courses.filter(course => 
        course.academic_level === registerData.courseLevel && 
        course.year_of_study === parseInt(registerData.yearOfStudy)
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses([]);
    }
  }, [registerData.courseLevel, registerData.yearOfStudy, courses]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/courses');
      const result = await response.json();
      if (result.success) {
        setCourses(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Validate all fields
    if (!registerData.registrationNumber || !registerData.courseLevel || !registerData.yearOfStudy || 
        !registerData.courseId || !registerData.password || !registerData.confirmPassword || !registerData.email) {
      setMessage("All fields are required");
      setMessageType('error');
      setLoading(false);
      return;
    }

    // Validate password
    const passwordError = validatePassword(registerData.password);
    if (passwordError) {
      setMessage(passwordError);
      setMessageType('error');
      setLoading(false);
      return;
    }

    // Check password match
    if (registerData.password !== registerData.confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      console.log('=== STUDENT SELF-REGISTRATION ===');
      console.log('Registration Data:', registerData);

      const response = await fetch('https://must-lms-backend.onrender.com/api/auth/student-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: registerData.registrationNumber,
          courseLevel: registerData.courseLevel,
          yearOfStudy: parseInt(registerData.yearOfStudy),
          courseId: parseInt(registerData.courseId),
          password: registerData.password,
          confirmPassword: registerData.confirmPassword,
          email: registerData.email
        })
      });

      const result = await response.json();
      console.log('Registration Response:', result);

      if (result.success) {
        setMessage(result.message || "Registration successful! Redirecting to login...");
        setMessageType('success');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          onRegisterSuccess();
        }, 2000);
      } else {
        setMessage(result.error || "Registration failed. Please try again.");
        setMessageType('error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage("Failed to connect to server. Please check your internet connection.");
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 relative overflow-hidden">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/must-building.jpg')`,
          filter: 'blur(8px)',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-purple-900/80" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Back Button */}
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-6 text-white hover:bg-white/10 backdrop-blur-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>

          {/* Registration Card */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md">
            <CardHeader className="text-center pb-6">
              {/* MUST Logo */}
              <div className="flex justify-center mb-4">
                <img 
                  src="/must-logo.png" 
                  alt="MUST" 
                  className="h-24 w-24 object-contain drop-shadow-lg" 
                />
              </div>
              
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Student Self-Registration
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Activate your account to access MUST LMS
              </CardDescription>
              <CardDescription className="text-xs md:text-sm text-gray-600 mt-2">
                Your account must be pre-registered by admin before you can activate it
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Registration Number */}
                <div className="space-y-2">
                  <Label htmlFor="reg-number" className="text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Registration Number *
                  </Label>
                  <Input
                    id="reg-number"
                    type="text"
                    placeholder="e.g., MUST/2024/001234"
                    value={registerData.registrationNumber}
                    onChange={(e) => setRegisterData({...registerData, registrationNumber: e.target.value})}
                    className="h-11 text-sm border-2 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Course Level */}
                <div className="space-y-2">
                  <Label htmlFor="course-level" className="text-sm font-medium flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Academic Level *
                  </Label>
                  <Select 
                    value={registerData.courseLevel} 
                    onValueChange={(value) => setRegisterData({...registerData, courseLevel: value, courseId: ""})}
                  >
                    <SelectTrigger id="course-level" className="h-11">
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

                {/* Year of Study */}
                <div className="space-y-2">
                  <Label htmlFor="year-of-study" className="text-sm font-medium flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Year of Study *
                  </Label>
                  <Select 
                    value={registerData.yearOfStudy} 
                    onValueChange={(value) => setRegisterData({...registerData, yearOfStudy: value, courseId: ""})}
                  >
                    <SelectTrigger id="year-of-study" className="h-11">
                      <SelectValue placeholder="Select year of study" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">First Year</SelectItem>
                      <SelectItem value="2">Second Year</SelectItem>
                      <SelectItem value="3">Third Year</SelectItem>
                      <SelectItem value="4">Fourth Year</SelectItem>
                      <SelectItem value="5">Fifth Year</SelectItem>
                      <SelectItem value="6">Sixth Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Course Selection */}
                <div className="space-y-2">
                  <Label htmlFor="course" className="text-sm font-medium flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Course/Program *
                  </Label>
                  <Select 
                    value={registerData.courseId} 
                    onValueChange={(value) => setRegisterData({...registerData, courseId: value})}
                    disabled={!registerData.courseLevel || !registerData.yearOfStudy}
                  >
                    <SelectTrigger id="course" className="h-11">
                      <SelectValue placeholder={
                        !registerData.courseLevel || !registerData.yearOfStudy 
                          ? "Select level and year first" 
                          : filteredCourses.length === 0 
                            ? "No courses available" 
                            : "Select your course"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {registerData.courseLevel && registerData.yearOfStudy && filteredCourses.length === 0 && (
                    <p className="text-xs text-amber-600">
                      No courses found for this level and year. Please contact admin.
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@student.must.ac.tz"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    className="h-11 text-sm border-2 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      className="h-11 text-sm border-2 focus:border-blue-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Must contain: 8+ characters, uppercase, lowercase, and number
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                      className="h-11 text-sm border-2 focus:border-blue-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Message */}
                {message && (
                  <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                    messageType === 'error' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                  }`}>
                    {messageType === 'error' ? 
                      <AlertCircle className="h-4 w-4" /> : 
                      <CheckCircle className="h-4 w-4" />
                    }
                    <span className="text-sm">{message}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-11 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already registered? 
                  <button 
                    onClick={onBack}
                    className="text-blue-600 hover:underline ml-1 bg-none border-none cursor-pointer"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/80 text-sm">
              © 2026 Mbeya University of Science and Technology
            </p>
            <p className="text-white/60 text-xs mt-1">
              Powered by JEDA NETWORKS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegisterPage;
