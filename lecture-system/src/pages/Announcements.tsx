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
  Send,
  FileText
} from "lucide-react";

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lecturerPrograms, setLecturerPrograms] = useState([]);
  
  // Form state
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    program: "",
    priority: "normal"
  });

  // Fetch lecturer programs and announcements
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('=== LECTURER ANNOUNCEMENTS FETCH ===');
        
        // Get current lecturer info
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        console.log('Current Lecturer:', currentUser);
        
        if (!currentUser.username) {
          console.error('No username found for lecturer');
          return;
        }

        let allPrograms = [];
        
        // Fetch lecturer's regular programs (with lecturer_username filter)
        const programsResponse = await fetch(
          `https://must-lms-backend.onrender.com/api/programs?lecturer_username=${encodeURIComponent(currentUser.username)}`
        );
        
        if (programsResponse.ok) {
          const programsResult = await programsResponse.json();
          console.log('Regular Programs Response:', programsResult.data?.length || 0);
          allPrograms = programsResult.data || [];
        } else {
          console.error('Failed to fetch regular programs');
        }
        
        // Fetch lecturer's short-term programs (with lecturer_username filter)
        const shortTermResponse = await fetch(
          `https://must-lms-backend.onrender.com/api/short-term-programs?lecturer_username=${encodeURIComponent(currentUser.username)}`
        );
        
        if (shortTermResponse.ok) {
          const shortTermResult = await shortTermResponse.json();
          console.log('Short-Term Programs Response:', shortTermResult.data?.length || 0);
          
          // Convert short-term programs to same format as regular programs
          const formattedShortTermPrograms = (shortTermResult.data || []).map(program => ({
            id: `short-${program.id}`,
            name: program.title,
            lecturer_name: program.lecturer_name,
            lecturer_id: program.lecturer_id,
            type: 'short-term'
          }));
          
          allPrograms = [...allPrograms, ...formattedShortTermPrograms];
        } else {
          console.error('Failed to fetch short-term programs');
        }
        
        console.log('All Lecturer Programs (Regular + Short-Term):', allPrograms.length);
        setLecturerPrograms(allPrograms);

        // Fetch announcements created by this lecturer - use dedicated endpoint
        const announcementsResponse = await fetch(
          `https://must-lms-backend.onrender.com/api/announcements/lecturer?lecturer_id=${currentUser.id}`
        );
        if (announcementsResponse.ok) {
          const result = await announcementsResponse.json();
          const lecturerAnnouncements = result.data || [];
          
          console.log('Lecturer Announcements:', lecturerAnnouncements);
          setAnnouncements(lecturerAnnouncements);
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
    if (!newAnnouncement.title || !newAnnouncement.content || !newAnnouncement.program) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // CRITICAL FIX: Ensure exact program name is used for targeting
      const selectedProgram = lecturerPrograms.find(p => p.name === newAnnouncement.program);
      
      const announcementData = {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        target_type: 'program',
        target_value: newAnnouncement.program, // This must match EXACTLY with student's program names
        created_by: currentUser.username || 'Lecturer',
        created_by_id: currentUser.id || null,
        created_by_type: 'lecturer',
        file_url: null,
        file_name: null
      };

      console.log('=== CREATING LECTURER ANNOUNCEMENT ===');
      console.log('Announcement Data:', announcementData);
      console.log('Selected Program:', selectedProgram);
      console.log('IMPORTANT: This announcement will ONLY be visible to students enrolled in program:', announcementData.target_value);

      const response = await fetch('https://must-lms-backend.onrender.com/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Announcement Created:', result.data);
        console.log('✅ Announcement will be filtered by backend to show ONLY to students in:', result.data.target_value);
        
        setAnnouncements([result.data, ...announcements]);
        
        // Reset form
        setNewAnnouncement({
          title: "",
          content: "",
          program: "",
          priority: "normal"
        });
        setShowCreateForm(false);
        
        alert(`✅ Announcement sent successfully!\n\nThis announcement will ONLY be visible to students enrolled in:\n"${announcementData.target_value}"\n\nOther students will NOT see this announcement.`);
      } else {
        const errorText = await response.text();
        console.error('Failed to create announcement:', errorText);
        alert('Failed to create announcement. Please try again.');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement. Please check your connection and try again.');
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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            Announcements
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Create and send announcements to students
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Announcement</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Announcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label htmlFor="program">Select Program *</Label>
              <Select
                value={newAnnouncement.program}
                onValueChange={(value) => setNewAnnouncement({...newAnnouncement, program: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a program" />
                </SelectTrigger>
                <SelectContent>
                  {lecturerPrograms.map((program) => (
                    <SelectItem key={program.id} value={program.name}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {program.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <Select
                value={newAnnouncement.priority}
                onValueChange={(value) => setNewAnnouncement({...newAnnouncement, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            <div className="flex gap-2">
              <Button onClick={handleCreateAnnouncement} className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send Announcement
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
              {searchTerm ? "Try adjusting your search terms" : "Create your first announcement for your students"}
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-3">
                  {/* Header with Title and Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg mb-2 break-words">{announcement.title}</h3>
                      <Badge variant="outline" className="flex items-center gap-1 text-xs w-fit">
                        <BookOpen className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate max-w-[150px] sm:max-w-none">{announcement.target_value}</span>
                      </Badge>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Content */}
                  <p className="text-sm sm:text-base text-muted-foreground break-words">{announcement.content}</p>
                  
                  {/* Stats - Mobile Optimized Grid */}
                  <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="whitespace-nowrap">Sent {formatTimeAgo(announcement.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{announcement.views || 0} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">To students in {announcement.target_value}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
