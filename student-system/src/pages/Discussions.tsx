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
  Trash2
} from "lucide-react";

export const Discussions = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ 
    title: "", 
    content: "", 
    category: "general", 
    program: "",
    groupMembers: [],
    groupLeader: "",
    groupName: ""
  });

  const [memberName, setMemberName] = useState("");
  const [memberRegNo, setMemberRegNo] = useState("");

  const addGroupMember = () => {
    if (memberName.trim() && memberRegNo.trim()) {
      const newMember = {
        name: memberName.trim(),
        regNo: memberRegNo.trim()
      };
      
      // Check if member already exists
      const exists = newPost.groupMembers.some(
        member => member.regNo.toLowerCase() === memberRegNo.toLowerCase()
      );
      
      if (!exists) {
        setNewPost(prev => ({
          ...prev,
          groupMembers: [...prev.groupMembers, newMember]
        }));
        setMemberName("");
        setMemberRegNo("");
      } else {
        alert("Member with this registration number already exists!");
      }
    } else {
      alert("Please enter both name and registration number");
    }
  };

  const removeGroupMember = (regNo) => {
    setNewPost(prev => ({
      ...prev,
      groupMembers: prev.groupMembers.filter(member => member.regNo !== regNo)
    }));
  };

  // Real data states
  const [programs, setPrograms] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Reply functionality states
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  // Fetch real data from database - OPTIMIZED VERSION
  useEffect(() => {
    const fetchDiscussionsData = async () => {
      try {
        console.log('=== DISCUSSIONS FETCH (OPTIMIZED) ===');
        
        // Get current student info from localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (!currentUser.username) {
          console.error('No username found in localStorage');
          setPrograms([]);
          setDiscussions([]);
          setLoading(false);
          return;
        }
        
        console.log('Fetching data for:', currentUser.username);
        
        // Fetch student's programs - single optimized API call
        try {
          const studentsResponse = await fetch(`https://must-lms-backend.onrender.com/api/students/me?username=${encodeURIComponent(currentUser.username)}`);
          if (studentsResponse.ok) {
            const studentsResult = await studentsResponse.json();
            const currentStudent = studentsResult.data;
            
            if (currentStudent) {
              const programsResponse = await fetch(`https://must-lms-backend.onrender.com/api/students/${currentStudent.id}/programs`);
              if (programsResponse.ok) {
                const programsResult = await programsResponse.json();
                setPrograms(programsResult.data || []);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching programs:', error);
          setPrograms([]);
        }
        
        // Fetch discussions with backend filtering - single API call
        const discussionsResponse = await fetch(
          `https://must-lms-backend.onrender.com/api/discussions?student_username=${encodeURIComponent(currentUser.username)}`
        );
        
        if (!discussionsResponse.ok) {
          throw new Error(`HTTP error! status: ${discussionsResponse.status}`);
        }
        
        const discussionsResult = await discussionsResponse.json();
        
        if (!discussionsResult.success) {
          throw new Error(discussionsResult.error || 'Failed to fetch discussions');
        }
        
        const filteredDiscussions = discussionsResult.data || [];
        console.log(`✅ Received ${filteredDiscussions.length} filtered discussions from backend`);
        console.log('💬 Discussions details:', filteredDiscussions.map(d => ({
          title: d.title,
          program: d.program,
          category: d.category,
          author: d.author
        })));
        
        // Backend already filtered - just set the data!
        setDiscussions(filteredDiscussions);
        setLoading(false);
        
      } catch (error) {
        console.error('❌ Error fetching discussions:', error);
        alert('Failed to load discussions. Please refresh the page.');
        setPrograms([]);
        setDiscussions([]);
        setLoading(false);
      }
    };

    fetchDiscussionsData();
  }, []);

  const categories = [
    { id: "all", label: "All Discussions", count: discussions.length },
    { id: "help", label: "Help & Support", count: discussions.filter(d => d.category === "help").length },
    { id: "study-group", label: "Study Groups", count: discussions.filter(d => d.category === "study-group").length },
    { id: "resources", label: "Resources", count: discussions.filter(d => d.category === "resources").length },
    { id: "general", label: "General", count: discussions.filter(d => d.category === "general").length }
  ];

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesTab = activeTab === "all" || discussion.category === activeTab;
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For study-group category, filter by group membership
    if (matchesTab && matchesSearch && discussion.category === "study-group") {
      // Get current student's registration number
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // If discussion has group_members, check if student is in the list
      if (discussion.group_members) {
        try {
          const groupMembers = JSON.parse(discussion.group_members);
          // Check if current user's registration number is in the group members
          const isMember = groupMembers.some(member => 
            member.regNo && member.regNo.toLowerCase() === currentUser.registration_number?.toLowerCase()
          );
          return isMember;
        } catch (e) {
          console.error('Error parsing group members:', e);
          return false;
        }
      }
      // If no group_members field, show all study groups as fallback
      return true;
    }
    
    return matchesTab && matchesSearch;
  });

  const handleCreatePost = async () => {
    // Validation
    if (!newPost.title.trim()) {
      alert("Please enter a discussion title");
      return;
    }
    
    if (!newPost.program) {
      alert("Please select a program");
      return;
    }
    
    if (!newPost.category) {
      alert("Please select a discussion type");
      return;
    }
    
    if (!newPost.content.trim()) {
      alert("Please enter discussion content");
      return;
    }
    
    // Study group specific validation
    if (newPost.category === "study-group") {
      if (!newPost.groupName.trim()) {
        alert("Please enter a group name");
        return;
      }
      if (!newPost.groupLeader.trim()) {
        alert("Please enter the group leader's name");
        return;
      }
      if (newPost.groupMembers.length === 0) {
        alert("Please add at least one group member");
        return;
      }
    }
    
    try {
      console.log("Creating new post:", newPost);
      
      // Get current student info
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Prepare discussion data for database
      const discussionData = {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        program: newPost.program,
        author: currentUser.username || 'Anonymous Student',
        author_id: currentUser.id || null,
        group_name: newPost.groupName || null,
        group_leader: newPost.groupLeader || null,
        group_members: JSON.stringify(newPost.groupMembers) || null,
        status: 'active'
      };
      
      // Save to database
      const response = await fetch('https://must-lms-backend.onrender.com/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(discussionData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Discussion saved to database:', result);
        
        // Add to local discussions array
        const newDiscussion = {
          id: result.data.id,
          title: newPost.title,
          content: newPost.content,
          author: currentUser.username || 'Anonymous Student',
          authorInitials: (currentUser.username || 'AS').split(' ').map(n => n[0]).join('').toUpperCase(),
          program: newPost.program,
          category: newPost.category,
          replies: 0,
          likes: 0,
          views: 0,
          isPinned: false,
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          groupName: newPost.groupName,
          groupLeader: newPost.groupLeader,
          groupMembers: newPost.groupMembers
        };
        
        setDiscussions(prev => [newDiscussion, ...prev]);
        
        // Handle study group member notifications
        if (newPost.category === "study-group" && newPost.groupMembers.length > 0) {
          try {
            // Create notifications for each group member
            const notifications = newPost.groupMembers.map(member => ({
              discussion_id: result.data.id,
              student_reg_no: member.regNo,
              student_name: member.name,
              group_name: newPost.groupName,
              group_leader: newPost.groupLeader,
              program: newPost.program,
              notification_type: 'group_invitation'
            }));
            
            // Send notifications to backend
            await fetch('https://must-lms-backend.onrender.com/api/study-group-notifications', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ notifications })
            });
            
            console.log('Study group notifications sent to members:', newPost.groupMembers);
          } catch (notificationError) {
            console.error('Error sending study group notifications:', notificationError);
          }
        }
        
        // Show success message based on category
        if (newPost.category === "help") {
          alert(`Private discussion created with ${newPost.program} lecturer. They will be notified.`);
        } else if (newPost.category === "study-group") {
          const memberCount = newPost.groupMembers.length;
          alert(`Study group "${newPost.groupName}" created for ${newPost.program}. ${memberCount} members have been notified and the lecturer can now monitor this group.`);
        } else if (newPost.category === "general") {
          alert(`General discussion posted to ${newPost.program}. All students and lecturers can participate.`);
        } else {
          alert(`Discussion created successfully for ${newPost.program}.`);
        }
      } else {
        alert('Failed to create discussion. Please check your connection.');
        return;
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
      alert('Failed to create discussion. Please check your connection.');
      return;
    }
    
    // Reset form
    setNewPost({ 
      title: "", 
      content: "", 
      category: "general", 
      program: "",
      groupMembers: [],
      groupLeader: "",
      groupName: ""
    });
    setMemberName("");
    setMemberRegNo("");
    setShowNewPost(false);
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
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Reply functionality
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

  // Delete discussion functionality (only for discussion creator)
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
          user_type: 'student',
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
        alert(result.error || 'Failed to delete discussion. You can only delete your own discussions.');
      }
    } catch (error) {
      console.error('Error deleting discussion:', error);
      alert('Failed to delete discussion. Please check your connection.');
    }
  };

  // Check if current user can delete the discussion
  const canDeleteDiscussion = (discussion) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return discussion.author === currentUser.username || discussion.author_id == currentUser.id;
  };

  const handleAddReply = async () => {
    if (!newReply.trim() || !selectedDiscussion) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    try {
      const response = await fetch('https://must-lms-backend.onrender.com/api/discussion-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discussion_id: selectedDiscussion.id,
          content: newReply,
          author: currentUser.username || 'Anonymous',
          author_id: currentUser.id || null,
          author_type: 'student'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setReplies(prev => [...prev, result.data]);
        setNewReply("");
        
        // Update discussion reply count
        setDiscussions(prev => prev.map(d => 
          d.id === selectedDiscussion.id 
            ? { ...d, replies: d.replies + 1 }
            : d
        ));
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleLike = async (discussionId) => {
    try {
      const response = await fetch(`https://must-lms-backend.onrender.com/api/discussions/${discussionId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setDiscussions(prev => prev.map(d => 
          d.id === discussionId 
            ? { ...d, likes: d.likes + 1 }
            : d
        ));
      }
    } catch (error) {
      console.error('Error liking discussion:', error);
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
        <h1 className="text-3xl font-bold">Program Discussions</h1>
        <Button onClick={() => setShowNewPost(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Discussion
        </Button>
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

      {/* Category Tabs - Mobile Responsive */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeTab === category.id ? "default" : "outline"}
            onClick={() => setActiveTab(category.id)}
            className="whitespace-nowrap flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
            size="sm"
          >
            <span className="hidden sm:inline">{category.label}</span>
            <span className="sm:hidden">
              {category.id === "all" ? "All" : 
               category.id === "help" ? "Help" :
               category.id === "study-group" ? "Groups" :
               category.id === "resources" ? "Resources" :
               "General"}
            </span>
            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-1 sm:px-2">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Discussion title..."
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            
            {/* Program Selection - Required for all categories */}
            <div>
              <label className="text-sm font-medium">Select Program *</label>
              <Select value={newPost.program} onValueChange={(value) => setNewPost({ ...newPost, program: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.length === 0 ? (
                    <SelectItem value="no-programs" disabled>
                      <div className="flex items-center gap-2 text-gray-500">
                        <BookOpen className="h-4 w-4" />
                        No programs available
                      </div>
                    </SelectItem>
                  ) : (
                    programs.map((program) => (
                      <SelectItem key={program.id} value={program.name}>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          {program.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Category Selection */}
            <div>
              <label className="text-sm font-medium">Discussion Type *</label>
              <Select value={newPost.category} onValueChange={(value) => setNewPost({ ...newPost, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select discussion type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      General Discussion (CR Only)
                    </div>
                  </SelectItem>
                  <SelectItem value="help">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Help & Support (Private with Lecturer)
                    </div>
                  </SelectItem>
                  <SelectItem value="study-group">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Study Groups
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="What would you like to discuss?"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
            />

            {/* Study Group Specific Fields */}
            {newPost.category === "study-group" && (
              <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800">Study Group Details</h4>
                <div>
                  <label className="text-sm font-medium">Group Name *</label>
                  <Input
                    placeholder="e.g., Mathematics Study Group"
                    value={newPost.groupName}
                    onChange={(e) => setNewPost({ ...newPost, groupName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Group Leader Name *</label>
                  <Input
                    placeholder="Enter group leader's full name"
                    value={newPost.groupLeader}
                    onChange={(e) => setNewPost({ ...newPost, groupLeader: e.target.value })}
                  />
                </div>
                
                {/* Add Group Members Section */}
                <div>
                  <label className="text-sm font-medium">Add Group Members *</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <Input
                      placeholder="Member full name"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                    />
                    <Input
                      placeholder="Registration number"
                      value={memberRegNo}
                      onChange={(e) => setMemberRegNo(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={addGroupMember}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add Member
                    </Button>
                  </div>
                </div>

                {/* Display Added Members */}
                {newPost.groupMembers.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Group Members ({newPost.groupMembers.length})</label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                      {newPost.groupMembers.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                          <div>
                            <span className="font-medium">{member.name}</span>
                            <span className="text-sm text-gray-600 ml-2">({member.regNo})</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeGroupMember(member.regNo)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-blue-600">
                  The course lecturer will be able to see this group and monitor activities. Only group members and the lecturer can access group discussions.
                </p>
              </div>
            )}

            {/* Help & Support Info */}
            {newPost.category === "help" && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Private Communication</span>
                </div>
                <p className="text-sm text-green-700">
                  This will create a private discussion with your course lecturer. Only you and the lecturer can see this conversation.
                </p>
              </div>
            )}

            {/* General Discussion Info */}
            {newPost.category === "general" && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-800">Class Representative Only</span>
                </div>
                <p className="text-sm text-orange-700">
                  Only Class Representatives (CR) can start general discussions for the selected course.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setShowNewPost(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePost}
                  disabled={
                    !newPost.title.trim() || 
                    !newPost.program || 
                    !newPost.category || 
                    !newPost.content.trim() ||
                    (newPost.category === "study-group" && (!newPost.groupName.trim() || !newPost.groupLeader.trim() || newPost.groupMembers.length === 0))
                  }
                >
                  Post Discussion
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discussions List */}
      <div className="space-y-4">
        {filteredDiscussions.map((discussion) => (
          <Card key={discussion.id} className="hover:shadow-md transition-shadow">
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
                    <Badge className={getCategoryColor(discussion.category)}>
                      {discussion.category}
                    </Badge>
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground">{discussion.content}</p>

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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleLike(discussion.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Like ({discussion.likes})
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewReplies(discussion)}
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Reply ({discussion.replies})
                      </Button>
                      {canDeleteDiscussion(discussion) && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteDiscussion(discussion.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
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
            {searchTerm ? "Try adjusting your search terms" : "Be the first to start a discussion!"}
          </p>
        </div>
      )}

      {/* Replies Modal */}
      {showReplies && selectedDiscussion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Discussion Replies</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowReplies(false)}
              >
                ✕
              </Button>
            </div>

            {/* Original Discussion */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">{selectedDiscussion.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{selectedDiscussion.content}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>By {selectedDiscussion.author}</span>
                <span>{formatTimeAgo(selectedDiscussion.createdAt)}</span>
              </div>
            </div>

            {/* Replies List */}
            <div className="space-y-4 mb-6">
              {replies.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No replies yet. Be the first to reply!</p>
              ) : (
                replies.map((reply) => {
                  // Determine sender type and apply appropriate styling
                  const getSenderType = () => {
                    if (reply.created_by_type === 'lecturer') return 'lecturer';
                    if (reply.created_by_type === 'admin') return 'admin';
                    return 'student';
                  };

                  const senderType = getSenderType();
                  
                  // Apply different background colors based on sender type
                  const getBgColor = () => {
                    switch (senderType) {
                      case 'lecturer':
                        return 'bg-orange-50 border-orange-200';
                      case 'admin':
                        return 'bg-purple-50 border-purple-200';
                      default:
                        return 'bg-blue-50 border-blue-200';
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

                  // Get display name - prefer lecturer_name if available, fallback to created_by
                  const getDisplayName = () => {
                    if (reply.lecturer_name) {
                      return `${reply.lecturer_name} (Lecturer)`;
                    }
                    if (senderType === 'admin') {
                      return `${reply.created_by || 'Admin'} (Admin)`;
                    }
                    return reply.created_by || 'Student';
                  };

                  return (
                    <div key={reply.id} className={`p-4 border rounded-lg ${getBgColor()} transition-colors`}>
                      <div className="flex items-start gap-3 mb-2">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={getBadgeColor()}>
                            {reply.lecturer_name?.charAt(0)?.toUpperCase() || reply.created_by?.charAt(0)?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{getDisplayName()}</span>
                            <Badge className={`text-xs ${getBadgeColor()}`}>
                              {senderType.charAt(0).toUpperCase() + senderType.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm mb-2 text-gray-700">{reply.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatTimeAgo(reply.created_at)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Reply */}
            <div className="border-t pt-4">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Write your reply..."
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={handleAddReply}
                  disabled={!newReply.trim()}
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
