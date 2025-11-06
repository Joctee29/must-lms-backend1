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
  Trash2
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
        
        // Fetch lecturer's short-term programs using lecturer-specific endpoint
        const shortTermResponse = await fetch(`https://must-lms-backend.onrender.com/api/short-term-programs/lecturer/${currentUser.id}`);
        if (shortTermResponse.ok) {
          const shortTermResult = await shortTermResponse.json();
          console.log('Short-Term Programs Response:', shortTermResult);
          
          // Programs are already filtered by backend
          const lecturerShortTermPrograms = shortTermResult.data || [];
          
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
        
        // Filter discussions for lecturer's programs only
        const discussionsResponse = await fetch('https://must-lms-backend.onrender.com/api/discussions');
        if (discussionsResponse.ok) {
          const discussionsResult = await discussionsResponse.json();
          console.log('Discussions Response:', discussionsResult);
          
          const allDiscussions = discussionsResult.data || [];
          
          const lecturerDiscussions = allDiscussions.filter(discussion => 
            allPrograms.some(program => program.name === discussion.program)
          );
          
          setDiscussions(lecturerDiscussions);
          console.log('Lecturer Discussions:', lecturerDiscussions);
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
    if (!replyContent.trim()) {
      alert("Please enter your reply");
      return;
    }

    try {
      // Get current lecturer info
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Prepare reply data
      const replyData = {
        discussion_id: selectedDiscussion.id,
        content: replyContent,
        author: currentUser.username || 'Lecturer',
        author_id: currentUser.id || null,
        author_type: 'lecturer'
      };
      
      // Save reply to database
      const response = await fetch('https://must-lms-backend.onrender.com/api/discussion-replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(replyData)
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Discussions</h1>
          <p className="text-muted-foreground">View and manage student discussions</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search discussions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeTab === category.id ? "default" : "outline"}
            onClick={() => setActiveTab(category.id)}
            className="whitespace-nowrap"
          >
            {category.label}
            <Badge variant="secondary" className="ml-2">
              {category.count}
            </Badge>
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
      <div className="space-y-4">
        {filteredDiscussions.map((discussion) => (
          <Card 
            key={discussion.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewReplies(discussion)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white">
                    {discussion.authorInitials}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {discussion.isPinned && (
                          <Pin className="h-4 w-4 text-yellow-500" />
                        )}
                        <h3 className="font-semibold text-lg">{discussion.title}</h3>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{discussion.author}</span>
                        <span>•</span>
                        <span>{discussion.course}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(discussion.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getCategoryColor(discussion.category)}>
                        {getCategoryIcon(discussion.category)}
                        <span className="ml-1">{discussion.category}</span>
                      </Badge>
                      {discussion.priority === 'high' && (
                        <Badge variant="destructive">High Priority</Badge>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground">{discussion.content}</p>

                  {/* Study Group Info */}
                  {discussion.category === 'study-group' && discussion.groupName && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <UserPlus className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Study Group: {discussion.groupName}</span>
                      </div>
                      <p className="text-sm text-green-700">Leader: {discussion.groupLeader}</p>
                      {discussion.groupMembers && discussion.groupMembers.length > 0 && (
                        <p className="text-sm text-green-700">Members: {discussion.groupMembers.length}</p>
                      )}
                    </div>
                  )}

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{discussion.replies} replies</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{discussion.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{discussion.views} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Last activity {formatTimeAgo(discussion.lastActivity)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {discussion.category === 'help' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedDiscussion(discussion);
                            setShowReplyForm(true);
                          }}
                        >
                          <Reply className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Pin className="h-4 w-4 mr-1" />
                        {discussion.isPinned ? 'Unpin' : 'Pin'}
                      </Button>
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

      {/* Detailed Discussion View Modal */}
      {showReplies && selectedDiscussion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Discussion Details</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteDiscussion(selectedDiscussion.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowReplies(false)}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Original Discussion */}
            <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-green-600 text-white">
                    {selectedDiscussion.author?.charAt(0)?.toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-lg">{selectedDiscussion.title}</h4>
                    <Badge className={getCategoryColor(selectedDiscussion.category)}>
                      {selectedDiscussion.category}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-3">{selectedDiscussion.content}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      By {selectedDiscussion.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTimeAgo(selectedDiscussion.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      Program: {selectedDiscussion.program}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Replies</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{replies.length}</p>
                <p className="text-sm text-green-600">Student responses</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Likes</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{selectedDiscussion.likes || 0}</p>
                <p className="text-sm text-green-600">Students liked this</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">Views</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">{selectedDiscussion.views || 0}</p>
                <p className="text-sm text-purple-600">Total views</p>
              </div>
            </div>

            {/* Student Replies */}
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Student Replies ({replies.length})
              </h4>
              
              {replies.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No replies yet. Students haven't responded to this discussion.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {replies.map((reply, index) => (
                    <div key={reply.id || index} className="p-4 bg-white border rounded-lg shadow-sm">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-600 text-white text-sm">
                            {reply.author?.charAt(0)?.toUpperCase() || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{reply.author}</span>
                            <Badge variant="outline" className="text-xs">
                              {reply.author_type === 'lecturer' ? 'Lecturer' : 'Student'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(reply.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lecturer Reply Section */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-lg mb-4">Reply as Lecturer</h4>
              <div className="space-y-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your response to students..."
                  className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setShowReplies(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={handleReplyToDiscussion}
                    disabled={!replyContent.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
