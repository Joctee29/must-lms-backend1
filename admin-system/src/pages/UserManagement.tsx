import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Mail,
  Phone,
  Shield,
  Check,
  X,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  phone: string;
  joinDate: string;
  department: string;
  lastLogin: string;
}

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@must.ac.tz",
      role: "Student",
      status: "Active",
      phone: "+255 123 456 789",
      joinDate: "2024-01-15",
      department: "General",
      lastLogin: "2024-01-19",
    },
    {
      id: 2,
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@must.ac.tz",
      role: "Lecturer",
      department: "Mathematics",
      status: "Active",
      lastLogin: "2024-01-20",
      phone: "+255 987 654 321",
      joinDate: "2023-08-15",
    },
    {
      id: 3,
      name: "John Mwalimu",
      email: "john.mwalimu@must.ac.tz",
      role: "Student",
      department: "Computer Science",
      status: "Active",
      lastLogin: "2024-01-19",
      phone: "+255 555 123 456",
      joinDate: "2024-01-10",
    },
    {
      id: 4,
      name: "Prof. Michael Chen",
      email: "michael.chen@must.ac.tz",
      role: "Professor",
      department: "Physics",
      status: "Active",
      lastLogin: "2024-01-18",
      phone: "+255 444 789 123",
      joinDate: "2022-09-01",
    },
    {
      id: 5,
      name: "Admin User",
      email: "admin@must.ac.tz",
      role: "Administrator",
      department: "IT Services",
      status: "Active",
      lastLogin: "2024-01-20",
      phone: "+255 111 222 333",
      joinDate: "2023-01-01",
    },
  ]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Student",
    phone: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<number | null>(null);

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const user = {
        id: users.length + 1,
        ...newUser,
        status: "Active",
        lastLogin: "Never",
        joinDate: new Date().toISOString().split('T')[0],
        department: newUser.role === "Student" ? "General" : "Faculty",
      };
      setUsers([...users, user]);
      setNewUser({ name: "", email: "", role: "Student", phone: "" });
      setShowAddForm(false);
      alert('User added successfully!');
    } else {
      alert('Please fill in all required fields (Name and Email)');
    }
  };

  const handleDeleteUser = (id: number) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== id));
      alert('User deleted successfully!');
    }
  };

  const handleToggleStatus = (id: number) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" }
        : user
    ));
    const user = users.find(u => u.id === id);
    const newStatus = user?.status === "Active" ? "Inactive" : "Active";
    alert(`User status changed to ${newStatus} successfully!`);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Administrator": return "bg-red-100 text-red-800";
      case "Professor": return "bg-purple-100 text-purple-800";
      case "Lecturer": return "bg-blue-100 text-blue-800";
      case "Student": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users, roles, and permissions
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-primary to-secondary text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
              <Input
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="Student">Student</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Administrator">Administrator</option>
              </select>
              <Input
                placeholder="Phone Number"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddUser} className="bg-green-600 text-white">
                <Check className="mr-2 h-4 w-4" />
                Add User
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button 
          variant="outline"
          onClick={() => alert('Filter functionality - coming soon!')}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">{user.department}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium">Status</p>
                    <Badge variant="default">{user.status}</Badge>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Last Login</p>
                    <p className="text-sm text-muted-foreground">{user.lastLogin}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleToggleStatus(user.id)}
                    variant="outline" 
                    size="sm"
                    className={user.status === "Active" ? "text-orange-600" : "text-green-600"}
                  >
                    {user.status === "Active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button 
                    onClick={() => setEditingUser(user.id)}
                    variant="outline" 
                    size="sm"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    onClick={() => handleDeleteUser(user.id)}
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No users found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};
