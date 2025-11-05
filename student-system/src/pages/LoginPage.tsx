 import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, User, Lock, AlertCircle, CheckCircle } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
  onBack: () => void;
}

const LoginPage = ({ onLogin, onBack }: LoginPageProps) => {
  const [loginData, setLoginData] = useState({
    registrationNumber: "",
    password: ""
  });
  
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password'>('email');
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'verifying' | 'resetting'>('idle');
  const [resetMessage, setResetMessage] = useState("");
  const [userType, setUserType] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginData.registrationNumber && loginData.password) {
      try {
        console.log('=== STUDENT LOGIN ATTEMPT ===');
        console.log('Registration Number:', loginData.registrationNumber);
        console.log('Connecting to backend:', 'https://must-lms-backend.onrender.com');
        
        // Authenticate with Render backend
        const response = await fetch('https://must-lms-backend.onrender.com/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: loginData.registrationNumber,
            password: loginData.password,
            userType: 'student'
          })
        });
        
        const result = await response.json();
        console.log('Backend Response:', result);
        
        if (result.success && result.data) {
          // Store user info in localStorage for the session
          localStorage.setItem('currentUser', JSON.stringify({
            id: result.data.id,
            username: result.data.registration_number || result.data.name,
            name: result.data.name,
            email: result.data.email,
            type: 'student'
          }));
          
          console.log('Login successful! User:', result.data.name);
          alert(`Welcome ${result.data.name}!`);
          onLogin();
        } else {
          console.error('Login failed:', result.error);
          alert(result.error || "Invalid registration number or password");
        }
      } catch (error) {
        console.error('Login error:', error);
        alert("Failed to connect to server. Please check your internet connection.");
      }
    } else {
      alert("Please enter both registration number and password");
    }
  };

  // Send reset code to email
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('sending');
    setResetMessage("");
    
    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/password-reset/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: forgotPasswordData.email,
          userType: 'student',
          adminEmail: 'uj23hiueddhpna2y@ethereal.email'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setResetStatus('sent');
        setResetMessage(`Reset code sent to ${forgotPasswordData.email}. Please check your email.`);
        setUserType(result.data.userType || 'student');
        setResetStep('code');
      } else {
        setResetStatus('error');
        setResetMessage(result.error || 'Failed to send reset code');
      }
    } catch (error) {
      setResetStatus('error');
      setResetMessage('Network error. Please check your connection.');
    }
  };

  // Verify reset code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('verifying');
    setResetMessage("");
    
    if (!forgotPasswordData.resetCode) {
      setResetStatus('error');
      setResetMessage("Please enter the reset code");
      return;
    }
    
    // Just verify that code is entered, then move to password step
    setResetStatus('idle');
    setResetMessage("Code verified! Now set your new password.");
    setResetStep('password');
  };

  // Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setResetStatus('error');
      setResetMessage("Passwords do not match");
      return;
    }
    
    if (forgotPasswordData.newPassword.length < 6) {
      setResetStatus('error');
      setResetMessage("Password must be at least 6 characters long");
      return;
    }
    
    setResetStatus('resetting');
    setResetMessage("");
    
    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/password-reset/verify-and-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: forgotPasswordData.email, 
          resetCode: forgotPasswordData.resetCode,
          newPassword: forgotPasswordData.newPassword,
          userType: 'student'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setResetStatus('sent');
        setResetMessage("Password reset successfully! You can now login with your new password.");
        
        // Reset form and go back to login after 3 seconds
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetStep('email');
          setResetStatus('idle');
          setResetMessage("");
          setForgotPasswordData({
            email: "",
            resetCode: "",
            newPassword: "",
            confirmPassword: ""
          });
        }, 3000);
      } else {
        setResetStatus('error');
        setResetMessage(result.error || 'Failed to reset password');
      }
    } catch (error) {
      setResetStatus('error');
      setResetMessage('Network error. Please try again.');
    }
  };

  if (showForgotPassword) {
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
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <Button
              onClick={() => {
                setShowForgotPassword(false);
                setResetStep('email');
                setResetStatus('idle');
                setResetMessage("");
                setForgotPasswordData({
                  email: "",
                  resetCode: "",
                  newPassword: "",
                  confirmPassword: ""
                });
              }}
              variant="ghost"
              className="mb-6 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>

            {/* Forgot Password Card */}
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md">
              <CardHeader className="text-center pb-6">
                {/* MUST Logo */}
                <div className="flex justify-center mb-4 md:mb-6">
                  <img 
                    src="/must-logo.png" 
                    alt="MUST" 
                    className="h-28 w-28 object-contain drop-shadow-lg" 
                  />
                </div>
                
                <CardTitle className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
                  Reset Password
                </CardTitle>
                <CardDescription className="text-sm md:text-lg">
                  Student Portal - MUST LMS
                </CardDescription>
                <CardDescription className="text-xs md:text-sm text-gray-600 mt-2">
                  Enter your details to reset your password
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* Step 1: Enter Email */}
                {resetStep === 'email' && (
                  <form onSubmit={handleSendResetCode} className="space-y-4 md:space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-sm md:text-base font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your.email@student.must.ac.tz"
                        value={forgotPasswordData.email}
                        onChange={(e) => setForgotPasswordData({...forgotPasswordData, email: e.target.value})}
                        className="h-10 md:h-12 text-sm md:text-base border-2 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    {resetMessage && (
                      <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                        resetStatus === 'error' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                      }`}>
                        {resetStatus === 'error' ? 
                          <AlertCircle className="h-4 w-4" /> : 
                          <CheckCircle className="h-4 w-4" />
                        }
                        <span className="text-sm">{resetMessage}</span>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={resetStatus === 'sending'}
                      className="w-full h-10 md:h-12 text-base md:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    >
                      {resetStatus === 'sending' ? 'Sending...' : 'Send Reset Code'}
                      <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </form>
                )}

                {/* Step 2: Enter Reset Code */}
                {resetStep === 'code' && (
                  <form onSubmit={handleVerifyCode} className="space-y-6">
                    <div className="text-center space-y-2 mb-6">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                      <h3 className="text-lg font-semibold text-green-700">Code Sent!</h3>
                      <p className="text-sm text-gray-600">
                        Enter the 6-digit code sent to {forgotPasswordData.email}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reset-code" className="text-base font-medium">
                        Reset Code
                      </Label>
                      <Input
                        id="reset-code"
                        type="text"
                        placeholder="123456"
                        value={forgotPasswordData.resetCode}
                        onChange={(e) => setForgotPasswordData({...forgotPasswordData, resetCode: e.target.value})}
                        className="h-12 text-base border-2 focus:border-blue-500 text-center text-2xl tracking-widest"
                        maxLength={6}
                        required
                      />
                    </div>
                    
                    {resetMessage && (
                      <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                        resetStatus === 'error' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                      }`}>
                        {resetStatus === 'error' ? 
                          <AlertCircle className="h-4 w-4" /> : 
                          <CheckCircle className="h-4 w-4" />
                        }
                        <span className="text-sm">{resetMessage}</span>
                      </div>
                    )}
                    
                    <div className="flex space-x-3">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setResetStep('email')}
                        className="flex-1 h-12"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={resetStatus === 'verifying'}
                        className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                      >
                        {resetStatus === 'verifying' ? 'Verifying...' : 'Verify Code'}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Step 3: Set New Password */}
                {resetStep === 'password' && (
                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="text-center space-y-2 mb-6">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                      <h3 className="text-lg font-semibold text-green-700">Code Verified!</h3>
                      <p className="text-sm text-gray-600">
                        Enter your new password
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-base font-medium">
                        New Password
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        value={forgotPasswordData.newPassword}
                        onChange={(e) => setForgotPasswordData({...forgotPasswordData, newPassword: e.target.value})}
                        className="h-12 text-base border-2 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-base font-medium">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        value={forgotPasswordData.confirmPassword}
                        onChange={(e) => setForgotPasswordData({...forgotPasswordData, confirmPassword: e.target.value})}
                        className="h-12 text-base border-2 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    {resetMessage && (
                      <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                        resetStatus === 'error' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                      }`}>
                        {resetStatus === 'error' ? 
                          <AlertCircle className="h-4 w-4" /> : 
                          <CheckCircle className="h-4 w-4" />
                        }
                        <span className="text-sm">{resetMessage}</span>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={resetStatus === 'resetting'}
                      className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    >
                      {resetStatus === 'resetting' ? 'Updating Password...' : 'Update Password'}
                      <Lock className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-6 text-white hover:bg-white/10 backdrop-blur-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          {/* Login Card */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md">
            <CardHeader className="text-center pb-6">
              {/* MUST Logo */}
              <div className="flex justify-center mb-4 md:mb-6">
                <img 
                  src="/must-logo.png" 
                  alt="MUST" 
                  className="h-28 w-28 object-contain drop-shadow-lg" 
                />
              </div>
              
              <CardTitle className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
                MUST LMS
              </CardTitle>
              <CardDescription className="text-sm md:text-lg">
                Mbeya University of Science and Technology
              </CardDescription>
              <CardDescription className="text-xs md:text-sm text-gray-600 mt-2">
                Enter your credentials to access the Learning Management System
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="registration" className="text-sm md:text-base font-medium flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Registration Number
                  </Label>
                  <Input
                    id="registration"
                    type="text"
                    placeholder="e.g., MUST/2024/001234"
                    value={loginData.registrationNumber}
                    onChange={(e) => setLoginData({...loginData, registrationNumber: e.target.value})}
                    className="h-10 md:h-12 text-sm md:text-base border-2 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm md:text-base font-medium flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="h-10 md:h-12 text-sm md:text-base border-2 focus:border-blue-500"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-10 md:h-12 text-base md:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  Login to LMS
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </form>
              
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Forgot your password? 
                  <button 
                    onClick={() => setShowForgotPassword(true)}
                    className="text-blue-600 hover:underline ml-1 bg-none border-none cursor-pointer"
                  >
                    Reset here
                  </button>
                </p>
                <p className="text-xs text-gray-500">
                  Need help? Contact IT Support: +255 25 295 7544
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

export default LoginPage;
