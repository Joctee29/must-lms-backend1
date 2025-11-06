import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Megaphone, 
  Search, 
  Clock,
  Users,
  Eye,
  BookOpen,
  AlertCircle,
  Download,
  FileText,
  Building,
  GraduationCap
} from "lucide-react";

export const AnnouncementsNews = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch announcements from database - OPTIMIZED VERSION
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        console.log('=== STUDENT ANNOUNCEMENTS FETCH (OPTIMIZED) ===');
        
        // Get current student info from localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (!currentUser.username) {
          console.error('No username found in localStorage');
          setAnnouncements([]);
          setLoading(false);
          return;
        }
        
        console.log('Fetching announcements for:', currentUser.username);
        
        // Fetch announcements with student filtering from backend
        // Backend handles ALL filtering logic - no need for frontend filtering!
        const announcementsResponse = await fetch(
          `https://must-lms-backend.onrender.com/api/announcements?student_username=${encodeURIComponent(currentUser.username)}`
        );
        
        if (!announcementsResponse.ok) {
          throw new Error(`HTTP error! status: ${announcementsResponse.status}`);
        }
        
        const result = await announcementsResponse.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch announcements');
        }
        
        const filteredAnnouncements = result.data || [];
        
        console.log(`✅ Received ${filteredAnnouncements.length} filtered announcements from backend`);
        console.log('📢 Announcements details:', filteredAnnouncements.map(a => ({
          title: a.title,
          target: `${a.target_type}: ${a.target_value}`,
          created_by: `${a.created_by} (${a.created_by_type})`
        })));
        
        // Backend already filtered - just set the data!
        setAnnouncements(filteredAnnouncements);
        setLoading(false);
        
      } catch (error) {
        console.error('❌ Error fetching announcements:', error);
        // Show user-friendly error
        alert('Failed to load announcements. Please refresh the page.');
        setAnnouncements([]);
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
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

  const handleDownloadPDF = (announcement) => {
    if (announcement.file_url) {
      console.log('=== PDF DOWNLOAD DEBUG ===');
      console.log('Original file_url:', announcement.file_url);
      console.log('Announcement object:', announcement);
      
      // Enhanced file URL construction - backend serves files via /content path
      let fileUrl = announcement.file_url;
      
      // Strategy 1: If file_url starts with /announcements/, replace with /content/
      if (fileUrl.startsWith('/announcements/')) {
        fileUrl = fileUrl.replace('/announcements/', '/content/');
      }
      // Strategy 2: If file_url already starts with /content/, keep it as is
      else if (fileUrl.startsWith('/content/')) {
        // Already correct, no change needed
      }
      // Strategy 3: If file_url doesn't start with /, add /content/ prefix
      else if (!fileUrl.startsWith('/')) {
        fileUrl = `/content/${fileUrl}`;
      }
      
      const fullUrl = `https://must-lms-backend.onrender.com${fileUrl}`;
      console.log('Fixed file URL:', fullUrl);
      
      // Direct download without HEAD check - let browser handle file existence
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = announcement.title || 'announcement.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('PDF download initiated for:', announcement.title);
      console.log('Download URL:', fullUrl);
    }
  };

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
            Announcements & News
          </h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with important announcements and news from your institution
          </p>
        </div>
      </div>

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
              {searchTerm ? "Try adjusting your search terms" : "No announcements available at the moment"}
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {announcement.created_by?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{announcement.title}</h3>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getTargetIcon(announcement.target_type)}
                            {getTargetLabel(announcement.target_type, announcement.target_value)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(announcement.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-muted-foreground">{announcement.content}</p>

                    {/* PDF Download */}
                    {announcement.file_url && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium">PDF Attachment</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPDF(announcement)}
                          className="ml-auto"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Posted {formatTimeAgo(announcement.created_at)}</span>
                      </div>
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
