import { useState, useEffect } from "react";
import { lecturerOperations, studentOperations, initializeDatabase } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Key, Users, GraduationCap, Eye, EyeOff, RefreshCw, Shield, AlertTriangle, Mail } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  userType: "student" | "lecturer";
  registrationNumber?: string;
  employeeId?: string;
  lastLogin: string;
  passwordLastChanged: string;
  status: "active" | "locked" | "pending";
}

interface PasswordReset {
  id: string;
  userId: string;
  userName: string;
  userType: "student" | "lecturer";
  requestDate: string;
  reason: string;
  status: "pending" | "completed" | "rejected";
}

export const PasswordManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        await initializeDatabase();
        const [studentsData, lecturersData] = await Promise.all([
          studentOperations.getAll(),
          lecturerOperations.getAll()
        ]);

        const formattedUsers: User[] = [
          ...studentsData.map((student: any) => ({
            id: student.id.toString(),
            name: student.name,
            email: student.email,
            userType: "student" as const,
            registrationNumber: student.registration_number,
            lastLogin: new Date().toISOString().split('T')[0],
            passwordLastChanged: student.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            status: "active" as const
          })),
          ...lecturersData.map((lecturer: any) => ({
            id: lecturer.id.toString(),
            name: lecturer.name,
            email: lecturer.email,
            userType: "lecturer" as const,
            employeeId: lecturer.employee_id,
            lastLogin: new Date().toISOString().split('T')[0],
            passwordLastChanged: lecturer.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            status: "active" as const
          }))
        ];

        setUsers(formattedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
    loadResetLogs();
  }, []);

  const loadResetLogs = async () => {
    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/password-reset-logs');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setResetLogs(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading reset logs:', error);
    }
  };

  const [passwordResets, setPasswordResets] = useState<PasswordReset[]>([]);
  const [resetLogs, setResetLogs] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("all");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [automaticResetData, setAutomaticResetData] = useState({
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
    step: 1 // 1: Enter code, 2: Set new password
  });
  
  // Admin email state - editable and saved to database
  const [adminEmail, setAdminEmail] = useState("uj23hiueddhpna2y@ethereal.email");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isProcessingReset, setIsProcessingReset] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.registrationNumber && user.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (user.employeeId && user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedUserType === "all" || user.userType === selectedUserType;
    
    return matchesSearch && matchesType;
  });

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword || newPassword !== confirmPassword) {
      alert("Please select a user and ensure passwords match");
      return;
    }

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    // Validate password strength (at least one uppercase, one lowercase, one number, one special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)");
      return;
    }

    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/password-reset/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          userType: selectedUser.userType,
          newPassword: newPassword,
          adminEmail: "admin@must.ac.tz"
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update user in local state
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, passwordLastChanged: new Date().toISOString().split('T')[0], status: "active" as const }
            : user
        ));

        // Clear form
        setSelectedUser(null);
        setNewPassword("");
        setConfirmPassword("");
        
        alert(`Password successfully reset for ${result.data.userName}`);
        
        // Refresh logs
        loadResetLogs();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password. Please check server connection.');
    }
  };

  const handleUnlockUser = async (userId: string) => {
    if (!selectedUser) {
      alert("Please select a user first");
      return;
    }

    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/user/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          userType: selectedUser.userType
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update user in local state
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, status: "active" as const }
            : user
        ));
        alert(`Account unlocked for ${result.data.userName}`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error unlocking user:', error);
      alert('Failed to unlock account. Please check server connection.');
    }
  };

  const handleLockUser = async (userId: string) => {
    if (!selectedUser) {
      alert("Please select a user first");
      return;
    }

    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/user/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          userType: selectedUser.userType
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update user in local state
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, status: "locked" as const }
            : user
        ));
        alert(`Account locked for ${result.data.userName}`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error locking user:', error);
      alert('Failed to lock account. Please check server connection.');
    }
  };

  const handlePasswordResetRequest = (requestId: string, action: "approve" | "reject") => {
    setPasswordResets(passwordResets.map(request => 
      request.id === requestId 
        ? { ...request, status: action === "approve" ? "completed" : "rejected" }
        : request
    ));

    if (action === "approve") {
      // Generate temporary password
      const tempPassword = "TempPass" + Math.random().toString(36).substring(2, 8);
      alert(`Password reset approved. Temporary password: ${tempPassword}`);
    } else {
      alert("Password reset request rejected");
    }
  };

  const generateRandomPassword = () => {
    // Generate strong password with at least 12 characters
    // Including uppercase, lowercase, numbers, and special characters
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*";
    
    let password = "";
    
    // Ensure at least one character from each category
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    
    // Fill the rest with random characters from all categories
    const allChars = uppercase + lowercase + numbers + specialChars;
    for (let i = 4; i < 12; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password to avoid predictable patterns
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setNewPassword(password);
    setConfirmPassword(password);
  };

  // Automatic reset functions
  const handleSendResetCode = async () => {
    // No validation needed - admin email configuration only
    console.log('Sending reset code using admin email:', adminEmail);

    setIsProcessingReset(true);
    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/admin/configure-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: adminEmail
        })
      });

      const result = await response.json();

      if (result.success) {
        setAutomaticResetData(prev => ({ ...prev, step: 2 }));
        alert(`Admin email configured successfully: ${result.data.adminEmail}. System is ready to send reset codes.`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending reset code:', error);
      alert('Failed to send reset code. Please check server connection.');
    } finally {
      setIsProcessingReset(false);
    }
  };

  const handleVerifyAndReset = async () => {
    if (!automaticResetData.resetCode || !automaticResetData.newPassword || 
        automaticResetData.newPassword !== automaticResetData.confirmPassword) {
      alert("Please enter reset code and ensure passwords match");
      return;
    }

    if (automaticResetData.newPassword.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    setIsProcessingReset(true);
    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/password-reset/verify-and-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: automaticResetData.email,
          resetCode: automaticResetData.resetCode,
          newPassword: automaticResetData.newPassword,
          userType: automaticResetData.userType
        })
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setAutomaticResetData({
          resetCode: "",
          newPassword: "",
          confirmPassword: "",
          step: 1
        });
        
        alert(`Password successfully reset for ${result.data.userName}`);
        
        // Refresh logs and users
        loadResetLogs();
        
        // Reload users to update password change date
        const loadUsers = async () => {
          try {
            await initializeDatabase();
            const [studentsData, lecturersData] = await Promise.all([
              studentOperations.getAll(),
              lecturerOperations.getAll()
            ]);

            const formattedUsers: User[] = [
              ...studentsData.map((student: any) => ({
                id: student.id.toString(),
                name: student.name,
                email: student.email,
                userType: "student" as const,
                registrationNumber: student.registration_number,
                lastLogin: new Date().toISOString().split('T')[0],
                passwordLastChanged: student.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                status: "active" as const
              })),
              ...lecturersData.map((lecturer: any) => ({
                id: lecturer.id.toString(),
                name: lecturer.name,
                email: lecturer.email,
                userType: "lecturer" as const,
                employeeId: lecturer.employee_id,
                lastLogin: new Date().toISOString().split('T')[0],
                passwordLastChanged: lecturer.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                status: "active" as const
              }))
            ];

            setUsers(formattedUsers);
          } catch (error) {
            console.error('Error reloading users:', error);
          }
        };
        
        loadUsers();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error verifying reset code:', error);
      alert('Failed to reset password. Please check server connection.');
    } finally {
      setIsProcessingReset(false);
    }
  };

  const resetAutomaticForm = () => {
    setAutomaticResetData({
      resetCode: "",
      newPassword: "",
      confirmPassword: "",
      step: 1
    });
  };

  // Save admin email to database
  const handleSaveAdminEmail = async () => {
    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: adminEmail })
      });
      
      if (response.ok) {
        setIsEditingEmail(false);
        alert('Admin email updated successfully!');
      } else {
        alert('Failed to update admin email');
      }
    } catch (error) {
      console.error('Error saving admin email:', error);
      alert('Failed to save admin email');
    }
  };

  // Load admin email from database
  const loadAdminEmail = async () => {
    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/admin/email');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.adminEmail) {
          setAdminEmail(result.data.adminEmail);
        }
      }
    } catch (error) {
      console.error('Error loading admin email:', error);
    }
  };

  // Load admin email on component mount
  useEffect(() => {
    loadAdminEmail();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Password Management</h1>
          <p className="text-muted-foreground">Manage user passwords and account security</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">User Accounts</TabsTrigger>
          <TabsTrigger value="reset">Manual Reset</TabsTrigger>
          <TabsTrigger value="automatic">Automatic Reset</TabsTrigger>
          <TabsTrigger value="requests">Reset Requests</TabsTrigger>
          <TabsTrigger value="logs">Reset Logs</TabsTrigger>
        </TabsList>

        {/* User Accounts Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Account Management
              </CardTitle>
              <CardDescription>View and manage user accounts and their security status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="lecturer">Lecturers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${user.userType === 'student' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            {user.userType === 'student' ? 
                              <GraduationCap className="h-5 w-5 text-blue-600" /> : 
                              <Users className="h-5 w-5 text-green-600" />
                            }
                          </div>
                          <div>
                            <h4 className="font-semibold">{user.name}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.userType === 'student' ? `Reg: ${user.registrationNumber}` : `ID: ${user.employeeId}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right text-sm">
                            <p className="text-muted-foreground">Last Login: {user.lastLogin}</p>
                            <p className="text-muted-foreground">Password Changed: {user.passwordLastChanged}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant={user.status === 'active' ? 'default' : user.status === 'locked' ? 'destructive' : 'secondary'}>
                              {user.status}
                            </Badge>
                            
                            {user.status === 'locked' ? (
                              <Button size="sm" variant="outline" onClick={() => handleUnlockUser(user.id)}>
                                <Shield className="h-4 w-4 mr-1" />
                                Unlock
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => handleLockUser(user.id)}>
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Lock
                              </Button>
                            )}
                            
                            <Button size="sm" onClick={() => {
                              setSelectedUser(user);
                              setActiveTab("reset");
                            }}>
                              <Key className="h-4 w-4 mr-1" />
                              Reset Password
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Password Reset Tab */}
        <TabsContent value="reset" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Manual Password Reset
              </CardTitle>
              <CardDescription>Manually reset password for selected user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedUser ? (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Selected User:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedUser.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                      <p><span className="font-medium">Type:</span> {selectedUser.userType}</p>
                      <p><span className="font-medium">ID:</span> {selectedUser.registrationNumber || selectedUser.employeeId}</p>
                    </div>
                  </div>

                  {/* Email for Reset Code */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={generateRandomPassword} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Random Password
                    </Button>
                    <Button 
                      onClick={handleResetPassword} 
                      disabled={!newPassword || newPassword !== confirmPassword}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Reset Password
                    </Button>
                    <Button onClick={() => setSelectedUser(null)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No user selected</p>
                  <p className="text-sm">Select a user from the User Accounts tab to reset their password</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automatic Password Reset Tab */}
        <TabsContent value="automatic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Automatic Password Reset
              </CardTitle>
              <CardDescription>Send verification code to user's email for password reset</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {automaticResetData.step === 1 ? (
                // Step 1: Admin Email Configuration
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Admin Email Configuration</h4>
                    <p className="text-sm text-blue-700">
                      Configure the admin email address used for sending password reset codes.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="adminEmailConfig">Admin Email Address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="adminEmailConfig"
                          type="email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="Enter admin email address"
                          className="flex-1"
                          disabled={!isEditingEmail}
                        />
                        {isEditingEmail ? (
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleSaveAdminEmail}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Save
                            </Button>
                            <Button 
                              onClick={() => {
                                setIsEditingEmail(false);
                                loadAdminEmail(); // Reset to original value
                              }}
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => setIsEditingEmail(true)}
                            variant="outline"
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        This email will be used to send password reset codes to users
                      </p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700">
                        <strong>Current Status:</strong> Admin email is configured and ready to send reset codes.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Step 2: Admin Email Management Success
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Admin Email Configured Successfully</h4>
                    <p className="text-sm text-green-700">
                      The admin email has been configured and saved to the database. The system is now ready to send password reset codes.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700">
                        <strong>Current Admin Email:</strong> {adminEmail}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        This email will be used to send password reset codes to users
                      </p>
                    </div>
                    
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-700">
                        <strong>Next Steps:</strong>
                      </p>
                      <ul className="text-xs text-yellow-600 mt-1 space-y-1">
                        <li>• Users can now request password resets from their login pages</li>
                        <li>• Reset codes will be sent directly to their email addresses</li>
                        <li>• Configure SMTP settings in backend for real email delivery</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={resetAutomaticForm}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Configure Another Email
                    </Button>
                    <Button 
                      onClick={() => setIsEditingEmail(true)}
                      variant="outline"
                    >
                      Edit Current Email
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Password Reset Requests ({passwordResets.filter(r => r.status === 'pending').length})
              </CardTitle>
              <CardDescription>Manage user password reset requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {passwordResets.map((request) => (
                  <Card key={request.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{request.userName}</h4>
                          <div className="text-sm text-muted-foreground">
                            <p>Type: {request.userType}</p>
                            <p>Reason: {request.reason}</p>
                            <p>Requested: {request.requestDate}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            request.status === 'pending' ? 'secondary' :
                            request.status === 'completed' ? 'default' : 'destructive'
                          }>
                            {request.status}
                          </Badge>
                          
                          {request.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handlePasswordResetRequest(request.id, 'approve')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handlePasswordResetRequest(request.id, 'reject')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {passwordResets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No password reset requests</p>
                    <p className="text-sm">All requests have been processed</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reset Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Password Reset Logs ({resetLogs.length})
              </CardTitle>
              <CardDescription>View all password reset activities and attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resetLogs.map((log, index) => (
                  <Card key={log.id || index} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{log.user_name || 'Unknown User'}</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Email:</strong> {log.email}</p>
                            <p><strong>User Type:</strong> {log.user_type}</p>
                            <p><strong>Reset Code:</strong> {log.reset_code}</p>
                            <p><strong>Created:</strong> {new Date(log.created_at).toLocaleString()}</p>
                            <p><strong>Expires:</strong> {new Date(log.expires_at).toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={log.used ? 'default' : 'secondary'}>
                            {log.used ? 'Used' : 'Unused'}
                          </Badge>
                          <Badge variant={new Date(log.expires_at) > new Date() ? 'default' : 'destructive'}>
                            {new Date(log.expires_at) > new Date() ? 'Valid' : 'Expired'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {resetLogs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No password reset logs</p>
                    <p className="text-sm">Reset activities will appear here</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <Button 
                  onClick={loadResetLogs}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
