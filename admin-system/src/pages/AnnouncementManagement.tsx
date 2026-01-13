import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Megaphone, 
  Plus, 
  Search, 
  Clock,
  Users,
  Eye,
  BookOpen,
  AlertCircle,
  Trash2,
  FileText,
  Upload,
  Building,
  GraduationCap
} from "lucide-react";

export const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    target_type: "all",
    target_value: "",
    file: null
  });

  // Target options data
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);

  // Fetch announcements and target options
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch announcements
        const announcementsResponse = await fetch('https://must-lms-backend.onrender.com/api/announcements');
        if (announcementsResponse.ok) {
          const result = await announcementsResponse.json();
          setAnnouncements(result.data || []);
        }

        // Fetch colleges
        const collegesResponse = await fetch('https://must-lms-backend.onrender.com/api/colleges');
        if (collegesResponse.ok) {
          const result = await collegesResponse.json();
          setColleges(result.data || []);
        }

        // Fetch departments
        const departmentsResponse = await fetch('https://must-lms-backend.onrender.com/api/departments');
        if (departmentsResponse.ok) {
          const result = await departmentsResponse.json();
          setDepartments(result.data || []);
        }

        // Fetch courses
        const coursesResponse = await fetch('https://must-lms-backend.onrender.com/api/courses');
        if (coursesResponse.ok) {
          const result = await coursesResponse.json();
          setCourses(result.data || []);
        }

        // Fetch programs (admin needs all programs)
        const programsResponse = await fetch('https://must-lms-backend.onrender.com/api/programs?user_type=admin');
        if (programsResponse.ok) {
          const result = await programsResponse.json();
          console.log('Programs loaded for announcements:', result.data?.length || 0);
          setPrograms(result.data || []);
        } else {
          console.error('Failed to fetch programs for announcements');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateAnnouncement = async () => {
    // Validation
    if (!newAnnouncement.title?.trim()) {
      alert('Please enter announcement title');
      return;
    }

    if (!newAnnouncement.content?.trim()) {
      alert('Please enter announcement content');
      return;
    }

    // Validate target audience selection
    if (newAnnouncement.target_type !== "all" && !newAnnouncement.target_value?.trim()) {
      alert(`Please select a ${newAnnouncement.target_type}`);
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Check if file is selected - use FormData for multipart upload
      if (newAnnouncement.file) {
        const formData = new FormData();
        formData.append('title', newAnnouncement.title.trim());
        formData.append('content', newAnnouncement.content.trim());
        formData.append('target_type', newAnnouncement.target_type);
        formData.append('target_value', newAnnouncement.target_value?.trim() || '');
        formData.append('created_by', currentUser.username || 'Admin');
        formData.append('created_by_id', currentUser.id || '');
        formData.append('created_by_type', 'admin');
        formData.append('file', newAnnouncement.file);

        console.log('Creating announcement with PDF file...');
        console.log('File name:', newAnnouncement.file.name);
        console.log('File size:', newAnnouncement.file.size);
        console.log('Target type:', newAnnouncement.target_type);
        console.log('Target value:', newAnnouncement.target_value);

        const response = await fetch('https://must-lms-backend.onrender.com/api/announcements', {
          method: 'POST',
          body: formData
        });

        const responseText = await response.text();
        console.log('Response status:', response.status);
        console.log('Response text:', responseText);

        if (response.ok) {
          try {
            const result = JSON.parse(responseText);
            setAnnouncements([result.data, ...announcements]);
            
            // Reset form
            setNewAnnouncement({
              title: "",
              content: "",
              target_type: "all",
              target_value: "",
              file: null
            });
            setShowCreateForm(false);
            
            alert('Announcement created successfully with PDF!');
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
            alert('Announcement created but could not parse response');
          }
        } else {
          console.error('Backend error response:', responseText);
          try {
            const errorData = JSON.parse(responseText);
            alert(`Failed to create announcement: ${errorData.error || 'Unknown error'}`);
          } catch {
            alert(`Failed to create announcement: ${response.statusText || 'Server error'}`);
          }
        }
      } else {
        // No file - use JSON endpoint
        const announcementData = {
          title: newAnnouncement.title.trim(),
          content: newAnnouncement.content.trim(),
          target_type: newAnnouncement.target_type,
          target_value: newAnnouncement.target_value?.trim() || null,
          created_by: currentUser.username || 'Admin',
          created_by_id: currentUser.id || null,
          created_by_type: 'admin',
          file_url: null,
          file_name: null
        };

        console.log('Creating announcement without file...', announcementData);

        const response = await fetch('https://must-lms-backend.onrender.com/api/announcements/json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(announcementData)
        });

        const responseText = await response.text();
        console.log('Response status:', response.status);
        console.log('Response text:', responseText);

        if (response.ok) {
          try {
            const result = JSON.parse(responseText);
            setAnnouncements([result.data, ...announcements]);
            
            // Reset form
            setNewAnnouncement({
              title: "",
              content: "",
              target_type: "all",
              target_value: "",
              file: null
            });
            setShowCreateForm(false);
            
            alert('Announcement created successfully!');
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
            alert('Announcement created but could not parse response');
          }
        } else {
          console.error('Backend error response:', responseText);
          try {
            const errorData = JSON.parse(responseText);
            alert(`Failed to create announcement: ${errorData.error || 'Unknown error'}`);
          } catch {
            alert(`Failed to create announcement: ${response.statusText || 'Server error'}`);
          }
        }
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert(`Failed to create announcement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this announcement?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`https://must-lms-backend.onrender.com/api/announcements/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAnnouncements(announcements.filter(a => a.id !== id));
        alert('Announcement deleted successfully!');
      } else {
        alert('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  const getTargetOptions = () => {
    switch (newAnnouncement.target_type) {
      case "college":
        return colleges.map(c => ({ value: c.name, label: c.name }));
      case "department":
        return departments.map(d => ({ value: d.name, label: d.name }));
      case "course":
        return courses.map(c => ({ value: c.name, label: c.name }));
      case "program":
        return programs.map(p => ({ value: p.name, label: p.name }));
      default:
        return [];
    }
  };

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case "all": return <Users className="h-4 w-4" />;
      case "college": return <Building className="h-4 w-4" />;
      case "department": return <BookOpen className="h-4 w-4" />;
      case "course": return <GraduationCap className="h-4 w-4" />;
      case "program": return <AlertCircle className="h-4 w-4" />;
      default: return <Megaphone className="h-4 w-4" />;
    }
  };

  const getTargetLabel = (targetType: string, targetValue: string) => {
    switch (targetType) {
      case "all": return "All Students";
      case "college": return `College: ${targetValue}`;
      case "department": return `Department: ${targetValue}`;
      case "course": return `Course: ${targetValue}`;
      case "program": return `Program: ${targetValue}`;
      default: return "General";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading announcements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-blue-600" />
            Announcement Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage announcements for students
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Announcement
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Announcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  placeholder="Enter announcement title"
                />
              </div>
              <div>
                <Label htmlFor="target_type">Target Audience *</Label>
                <Select
                  value={newAnnouncement.target_type}
                  onValueChange={(value) => setNewAnnouncement({...newAnnouncement, target_type: value, target_value: ""})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="college">Specific College</SelectItem>
                    <SelectItem value="department">Specific Department</SelectItem>
                    <SelectItem value="course">Specific Course</SelectItem>
                    <SelectItem value="program">Specific Program</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newAnnouncement.target_type !== "all" && (
              <div>
                <Label htmlFor="target_value">Select Target</Label>
                <Select
                  value={newAnnouncement.target_value}
                  onValueChange={(value) => setNewAnnouncement({...newAnnouncement, target_value: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTargetOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                placeholder="Enter announcement content"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="file">PDF Attachment (Optional)</Label>
              <div className="flex flex-col gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setNewAnnouncement({...newAnnouncement, file});
                    if (file) {
                      console.log('File selected:', {
                        name: file.name,
                        size: file.size,
                        type: file.type
                      });
                    }
                  }}
                />
                {newAnnouncement.file && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-md text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-blue-900">{newAnnouncement.file.name}</p>
                        <p className="text-xs text-blue-700">Size: {(newAnnouncement.file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewAnnouncement({...newAnnouncement, file: null})}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleCreateAnnouncement}
                disabled={
                  !newAnnouncement.title?.trim() || 
                  !newAnnouncement.content?.trim() ||
                  (newAnnouncement.target_type !== "all" && !newAnnouncement.target_value?.trim())
                }
              >
                Create Announcement
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No announcements found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "Create your first announcement"}
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getTargetIcon(announcement.target_type)}
                        {getTargetLabel(announcement.target_type, announcement.target_value)}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{announcement.content}</p>
                    
                    {announcement.file_name && (
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-red-600" />
                        <span className="text-sm">PDF: {announcement.file_name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Created {formatTimeAgo(announcement.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{announcement.views || 0} views</span>
                      </div>
                      <span>By {announcement.created_by}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
