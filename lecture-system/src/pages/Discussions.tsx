import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  ThumbsUp, 
  ThumbsDown,
  Reply,
  Pin,
  Clock,
  Users,
  Eye,
  BookOpen,
  HelpCircle,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Send,
  Trash2,
  Paperclip,
  Image,
  Mic,
  X,
  FileText,
  Download
} from "lucide-react";

export const Discussions = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Real data states
  const [discussions, setDiscussions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lecturerPrograms, setLecturerPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Reply functionality states
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  // Fetch real data from database
  useEffect(() => {
    const fetchDiscussionsData = async () => {
      try {
        console.log('=== LECTURER DISCUSSIONS DATA FETCH ===');
        
        // Get current lecturer info
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        console.log('Current Lecturer:', currentUser);
        
        // Fetch lecturer's regular programs
        const programsResponse = await fetch('https://must-lms-backend.onrender.com/api/programs');
        let allPrograms = [];
        let allCourses = [];
        
        if (programsResponse.ok) {
          const programsResult = await programsResponse.json();
          console.log('Regular Programs Response:', programsResult);
          
          // Get lecturer's regular programs
          const lecturerPrograms = programsResult.data?.filter(program => 
            program.lecturer_name === currentUser.username || program.lecturer_id === currentUser.id
          ) || [];
          
          allPrograms = [...lecturerPrograms];
          allCourses = [...lecturerPrograms.map(program => program.name)];
        }
        
        // Fetch lecturer's short-term programs
        const shortTermResponse = await fetch('https://must-lms-backend.onrender.com/api/short-term-programs');
        if (shortTermResponse.ok) {
          const shortTermResult = await shortTermResponse.json();
          console.log('Short-Term Programs Response:', shortTermResult);
          
          // Get lecturer's short-term programs
          const lecturerShortTermPrograms = shortTermResult.data?.filter(program => 
            program.lecturer_name === currentUser.username || program.lecturer_id === currentUser.id
          ) || [];
          
          // Convert short-term programs to same format as regular programs
          const formattedShortTermPrograms = lecturerShortTermPrograms.map(program => ({
            id: `short-${program.id}`,
            name: program.title,
            lecturer_name: program.lecturer_name,
            lecturer_id: program.lecturer_id,
            type: 'short-term'
          }));
          
          allPrograms = [...allPrograms, ...formattedShortTermPrograms];
          allCourses = [...allCourses, ...formattedShortTermPrograms.map(program => program.name)];
        }
        
        setCourses(allCourses);
        setLecturerPrograms(allPrograms);
        console.log('All Lecturer Courses (Regular + Short-Term):', allCourses);
        
        // Filter discussions for lecturer's programs only - Backend handles filtering now
        const discussionsResponse = await fetch(
          `https://must-lms-backend.onrender.com/api/discussions?lecturer_id=${currentUser.id}&lecturer_username=${encodeURIComponent(currentUser.username)}`
        );
        if (discussionsResponse.ok) {
          const discussionsResult = await discussionsResponse.json();
          console.log('Discussions Response:', discussionsResult);
          
          const lecturerDiscussions = discussionsResult.data || [];
          
          setDiscussions(lecturerDiscussions);
          console.log('Lecturer Discussions (Backend Filtered):', lecturerDiscussions);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching discussions data:', error);
        // Keep empty arrays - no fake data
        setCourses([]);
        setLecturerPrograms([]);
        setDiscussions([]);
        setLoading(false);
      }
    };

    fetchDiscussionsData();
  }, []);

  const categories = [
    { id: "all", label: "All Discussions", count: discussions.length },
    { id: "help", label: "Help Requests", count: discussions.filter(d => d.category === "help").length },
    { id: "study-group", label: "Study Groups", count: discussions.filter(d => d.category === "study-group").length },
    { id: "resources", label: "Resources", count: discussions.filter(d => d.category === "resources").length },
    { id: "general", label: "General", count: discussions.filter(d => d.category === "general").length }
  ];

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesTab = activeTab === "all" || discussion.category === activeTab;
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });


  const handleReplyToDiscussion = async () => {
    if (!replyContent.trim() && !selectedFile) {
      alert("Please enter your reply or attach a file");
      return;
    }

    try {
      // Get current lecturer info
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('discussion_id', selectedDiscussion.id);
      formData.append('content', replyContent);
      formData.append('author', currentUser.username || 'Lecturer');
      formData.append('author_id', currentUser.id || '');
      formData.append('author_type', 'lecturer');
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      // Save reply to database
      const response = await fetch('https://must-lms-backend.onrender.com/api/discussion-replies', {
        method: 'POST',
        body: formData // Don't set Content-Type header - browser will set it with boundary
      });
      
      if (response.ok) {
        // Update discussion reply count
        setDiscussions(prev => prev.map(d => 
          d.id === selectedDiscussion.id 
            ? { ...d, replies: d.replies + 1, lastActivity: new Date().toISOString() }
            : d
        ));
        
        alert("Reply sent successfully!");
        setReplyContent("");
        setSelectedFile(null);
        setShowReplyForm(false);
        setSelectedDiscussion(null);
      } else {
        alert('Failed to send reply. Please check your connection.');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please check your connection.');
    }
  };
  
  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
    }
  };
  
  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
        setSelectedFile(audioFile);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks(chunks);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };
  
  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };
  
  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "help": return "bg-red-100 text-red-800";
      case "study-group": return "bg-blue-100 text-blue-800";
      case "resources": return "bg-green-100 text-green-800";
      case "general": return "bg-gray-100 text-gray-800";
      case "announcement": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // View replies functionality for lecturer
  const handleViewReplies = async (discussion) => {
    setSelectedDiscussion(discussion);
    setShowReplies(true);
    
    // Fetch replies for this discussion
    try {
      const response = await fetch(`https://must-lms-backend.onrender.com/api/discussions/${discussion.id}/replies`);
      if (response.ok) {
        const result = await response.json();
        setReplies(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
      setReplies([]);
    }
  };

  // Delete discussion functionality
  const handleDeleteDiscussion = async (discussionId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this discussion? This will permanently remove the discussion and all its replies. This action cannot be undone.'
    );
    
    if (!confirmDelete) return;
    
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const response = await fetch(`https://must-lms-backend.onrender.com/api/discussions/${discussionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          user_type: 'lecturer',
          username: currentUser.username
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Remove discussion from local state
        setDiscussions(prev => prev.filter(d => d.id !== discussionId));
        
        // Close modal if this discussion was being viewed
        if (selectedDiscussion && selectedDiscussion.id === discussionId) {
          setShowReplies(false);
          setSelectedDiscussion(null);
        }
        
        alert('Discussion deleted successfully!');
      } else {
        alert(result.error || 'Failed to delete discussion. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting discussion:', error);
      alert('Failed to delete discussion. Please check your connection.');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "help": return <HelpCircle className="h-4 w-4" />;
      case "study-group": return <UserPlus className="h-4 w-4" />;
      case "resources": return <BookOpen className="h-4 w-4" />;
      case "general": return <MessageSquare className="h-4 w-4" />;
      case "announcement": return <AlertCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Loading Discussions...</h3>
            <p className="text-muted-foreground">Fetching real discussion data from database</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Course Discussions</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">View and manage student discussions</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        <Input
          placeholder="Search discussions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 sm:pl-10 text-sm sm:text-base h-9 sm:h-10"
        />
      </div>

      {/* Category Tabs - Responsive Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeTab === category.id ? "default" : "outline"}
            onClick={() => setActiveTab(category.id)}
            className="whitespace-normal flex flex-col items-center justify-center text-xs sm:text-sm px-2 py-2 h-auto"
            size="sm"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-medium text-center text-xs sm:text-sm">
                {category.id === "all" ? "All Discussions" : 
                 category.id === "help" ? "Help & Support" :
                 category.id === "study-group" ? "Study Groups" :
                 category.id === "resources" ? "Resources" :
                 "General"}
              </span>
              <Badge variant={activeTab === category.id ? "secondary" : "outline"} className="text-xs px-1.5 py-0">
                {category.count}
              </Badge>
            </div>
          </Button>
        ))}
      </div>


      {/* Reply Form */}
      {showReplyForm && selectedDiscussion && (
        <Card>
          <CardHeader>
            <CardTitle>Reply to: {selectedDiscussion.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-gray-50 rounded border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Original message from {selectedDiscussion.author}:</p>
              <p className="text-sm mt-1">{selectedDiscussion.content}</p>
            </div>
            
            <Textarea
              placeholder="Type your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={3}
            />

            <div className="flex items-center justify-between">
              <div className="space-x-2">
                <Button variant="outline" onClick={() => {
                  setShowReplyForm(false);
                  setSelectedDiscussion(null);
                  setReplyContent("");
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleReplyToDiscussion}
                  disabled={!replyContent.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discussions List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredDiscussions.map((discussion) => (
          <Card key={discussion.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                {/* Avatar */}
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 hidden sm:block">
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-sm">
                    {discussion.authorInitials}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        {discussion.isPinned && (
                          <Pin className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        )}
                        <h3 className="font-semibold text-base sm:text-lg break-words">{discussion.title}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="truncate">{discussion.author}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">{discussion.program}</span>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span>{formatTimeAgo(discussion.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getCategoryColor(discussion.category)} flex-shrink-0 text-xs sm:text-sm`}>
                      {discussion.category}
                    </Badge>
                  </div>

                  {/* Content */}
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">{discussion.content}</p>

                  {/* Study Group Info */}
                  {discussion.category === 'study-group' && discussion.groupName && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <UserPlus className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Study Group: {discussion.groupName}</span>
                      </div>
                      <p className="text-sm text-blue-700">Leader: {discussion.groupLeader}</p>
                    </div>
                  )}

                  {/* Stats and Actions */}
                  <div className="flex flex-col gap-2 sm:gap-3 pt-1">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>{discussion.replies}</span>
                        <span className="hidden sm:inline">replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>{discussion.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>{discussion.views}</span>
                        <span className="hidden sm:inline">views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">Last {formatTimeAgo(discussion.lastActivity)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewReplies(discussion)}
                        className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                      >
                        <Reply className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden xs:inline">View Replies</span>
                        <span className="xs:hidden">{discussion.replies}</span>
                      </Button>
                      {discussion.category === 'help' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDiscussion(discussion);
                            setShowReplyForm(true);
                          }}
                          className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                        >
                          <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredDiscussions.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No discussions found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "No student discussions yet. Students will see your announcements here."}
          </p>
        </div>
      )}

      {/* Detailed Discussion View Modal - MATCHES STUDENT PORTAL STRUCTURE */}
      {showReplies && selectedDiscussion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold">Discussion Replies</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowReplies(false)}
              >
                ✕
              </Button>
            </div>

            {/* Original Discussion */}
            <div className="mb-6 p-4 sm:p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3 sm:gap-4">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                  <AvatarFallback className="bg-green-600 text-white font-semibold">
                    {selectedDiscussion.author?.charAt(0)?.toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2 flex-wrap">
                    <h4 className="font-semibold text-base sm:text-lg">{selectedDiscussion.title}</h4>
                    <Badge className={getCategoryColor(selectedDiscussion.category)} variant="outline">
                      {selectedDiscussion.category}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                    <span>{selectedDiscussion.author}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{selectedDiscussion.program}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{formatTimeAgo(selectedDiscussion.createdAt)}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">{selectedDiscussion.content}</p>
                </div>
              </div>
            </div>

            {/* Replies List */}
            <div className="mb-6">
              <h4 className="font-semibold text-base sm:text-lg mb-4">Replies ({replies.length})</h4>
              
              {replies.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No replies yet</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {replies.map((reply, index) => {
                    // Determine sender type and apply appropriate styling
                    const getSenderType = () => {
                      if (reply.author_type === 'lecturer') return 'lecturer';
                      if (reply.author_type === 'admin') return 'admin';
                      return 'student';
                    };

                    const senderType = getSenderType();
                    
                    const getBgColor = () => {
                      switch (senderType) {
                        case 'lecturer':
                          return 'bg-orange-50 border-orange-300';
                        case 'admin':
                          return 'bg-purple-50 border-purple-300';
                        default:
                          return 'bg-blue-50 border-blue-300';
                      }
                    };

                    const getBadgeColor = () => {
                      switch (senderType) {
                        case 'lecturer':
                          return 'bg-orange-100 text-orange-800';
                        case 'admin':
                          return 'bg-purple-100 text-purple-800';
                        default:
                          return 'bg-blue-100 text-blue-800';
                      }
                    };

                    // Get display name with proper info
                    const getDisplayName = () => {
                      if (reply.lecturer_name) {
                        return `${reply.lecturer_name}`;
                      }
                      if (senderType === 'lecturer' && reply.author) {
                        return `${reply.author}`;
                      }
                      if (senderType === 'admin') {
                        return `${reply.author || 'Admin'}`;
                      }
                      if (reply.leg_no) {
                        return `${reply.author || 'Student'} (${reply.leg_no})`;
                      }
                      return reply.author || 'Student';
                    };

                    // Get badge label
                    const getBadgeLabel = () => {
                      if (senderType === 'lecturer' || reply.lecturer_name) return 'LECTURER';
                      if (senderType === 'admin') return 'ADMIN';
                      if (reply.leg_no) {
                        return `STUDENT (${reply.leg_no})`;
                      }
                      return 'STUDENT';
                    };

                    return (
                      <div key={reply.id || index} className={`p-4 border rounded-lg ${getBgColor()} transition-colors`}>
                        <div className="flex items-start gap-3 mb-2">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className={`text-sm font-semibold ${getBadgeColor()}`}>
                              {reply.lecturer_name?.charAt(0)?.toUpperCase() || reply.author?.charAt(0)?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{getDisplayName()}</span>
                              <Badge className={`text-xs ${getBadgeColor()}`}>
                                {getBadgeLabel()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm mb-2 text-gray-700">{reply.content}</p>
                        
                        {/* File Attachment Display */}
                        {reply.file_url && (
                          <div className="mt-2 mb-2">
                            {reply.file_type === 'image' ? (
                              <div className="relative inline-block">
                                <img 
                                  src={`https://must-lms-backend.onrender.com${reply.file_url}`}
                                  alt={reply.file_name || 'Attached image'}
                                  className="max-w-xs max-h-64 rounded border cursor-pointer hover:opacity-90"
                                  onClick={() => window.open(`https://must-lms-backend.onrender.com${reply.file_url}`, '_blank')}
                                />
                                <a
                                  href={`https://must-lms-backend.onrender.com${reply.file_url}`}
                                  download={reply.file_name}
                                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
                                  title="Download image"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </div>
                            ) : reply.file_type === 'audio' ? (
                              <div className="flex items-center gap-2 p-3 bg-white border rounded">
                                <Mic className="h-5 w-5 text-blue-600" />
                                <audio controls className="flex-1">
                                  <source src={`https://must-lms-backend.onrender.com${reply.file_url}`} type="audio/webm" />
                                  <source src={`https://must-lms-backend.onrender.com${reply.file_url}`} type="audio/mpeg" />
                                  Your browser does not support audio playback.
                                </audio>
                                <a
                                  href={`https://must-lms-backend.onrender.com${reply.file_url}`}
                                  download={reply.file_name}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="Download audio"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </div>
                            ) : (
                              <a
                                href={`https://must-lms-backend.onrender.com${reply.file_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 bg-white border rounded hover:bg-gray-50"
                              >
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{reply.file_name || 'Attached file'}</p>
                                  <p className="text-xs text-gray-500">Click to view/download</p>
                                </div>
                                <Download className="h-4 w-4 text-gray-400" />
                              </a>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatTimeAgo(reply.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add Reply */}
            <div className="border-t pt-4 sm:pt-6">
              <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Reply</h4>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
              
              {/* File Upload Section */}
              <div className="mt-3 space-y-2">
                {/* Selected File Preview */}
                {selectedFile && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    {selectedFile.type.startsWith('image/') ? (
                      <Image className="h-4 w-4 text-blue-600" />
                    ) : selectedFile.type.startsWith('audio/') ? (
                      <Mic className="h-4 w-4 text-blue-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-blue-600" />
                    )}
                    <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                {/* File Upload Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="file"
                    id="file-upload-lecturer"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="file-upload-lecturer"
                    className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span>Attach File</span>
                  </label>
                  
                  <input
                    type="file"
                    id="image-upload-lecturer"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="image-upload-lecturer"
                    className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Image className="h-4 w-4" />
                    <span>Image</span>
                  </label>
                  
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                    >
                      <Mic className="h-4 w-4" />
                      <span>Record Voice</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg bg-red-50 text-red-600 hover:bg-red-100 animate-pulse"
                    >
                      <Mic className="h-4 w-4" />
                      <span>Stop Recording</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end mt-3 gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowReplies(false);
                    setReplyContent("");
                    setSelectedFile(null);
                  }}
                >
                  Close
                </Button>
                <Button 
                  onClick={handleReplyToDiscussion}
                  disabled={!replyContent.trim() && !selectedFile}
                >
                  Add Reply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
