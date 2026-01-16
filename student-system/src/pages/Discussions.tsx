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
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

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
    
    // Get current student info
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // CR VALIDATION: Check if user is CR for general discussions
    if (newPost.category === "general") {
      try {
        const crCheckResponse = await fetch(
          `https://must-lms-backend.onrender.com/api/students/check-cr-by-username?username=${encodeURIComponent(currentUser.username || currentUser.registration_number)}`
        );
        const crCheckResult = await crCheckResponse.json();
        
        if (!crCheckResult.success || !crCheckResult.is_cr) {
          alert("Only Class Representatives (CRs) can create General Discussions. Please contact your CR or use other discussion types (Help & Support or Study Groups).");
          return;
        }
        
        console.log('✅ CR verified:', crCheckResult.student.name);
      } catch (error) {
        console.error('Error checking CR status:', error);
        alert("Failed to verify CR status. Please try again.");
        return;
      }
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
      
      const result = await response.json();
      
      if (!response.ok) {
        // Handle CR validation error from backend
        if (response.status === 403) {
          alert(result.error || "Only Class Representatives can create general discussions.");
          return;
        }
        alert(result.error || 'Failed to create discussion. Please check your connection.');
        return;
      }
      
      if (result.success) {
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
        alert(result.error || 'Failed to create discussion. Please check your connection.');
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
        let repliesData = result.data || [];
        
        // Sort replies: student replies first, then lecturer replies
        repliesData.sort((a, b) => {
          const aIsLecturer = a.author_type === 'lecturer' || a.lecturer_name;
          const bIsLecturer = b.author_type === 'lecturer' || b.lecturer_name;
          
          // If types are different, student (false) comes before lecturer (true)
          if (aIsLecturer !== bIsLecturer) {
            return aIsLecturer ? 1 : -1;
          }
          
          // If same type, keep original order (by creation time)
          return 0;
        });
        
        setReplies(repliesData);
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
    if ((!newReply.trim() && !selectedFile) || !selectedDiscussion) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('discussion_id', selectedDiscussion.id);
      formData.append('content', newReply);
      formData.append('author', currentUser.username || 'Anonymous');
      formData.append('author_id', currentUser.id || '');
      formData.append('author_type', 'student');
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      const response = await fetch('https://must-lms-backend.onrender.com/api/discussion-replies', {
        method: 'POST',
        body: formData // Don't set Content-Type header - browser will set it with boundary
      });
      
      if (response.ok) {
        const result = await response.json();
        setReplies(prev => [...prev, result.data]);
        setNewReply("");
        setSelectedFile(null);
        
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
      <div className="hidden sm:grid grid-cols-3 md:grid-cols-5 gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeTab === category.id ? "default" : "outline"}
            onClick={() => setActiveTab(category.id)}
            className="whitespace-normal flex flex-col items-center justify-center text-xs sm:text-sm px-2 py-3 h-auto"
            size="sm"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-medium text-center">{category.label}</span>
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {category.count}
              </Badge>
            </div>
          </Button>
        ))}
      </div>

      {/* Mobile Category Tabs - Horizontal Scroll */}
      <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeTab === category.id ? "default" : "outline"}
            onClick={() => setActiveTab(category.id)}
            className="whitespace-nowrap flex-shrink-0 text-xs px-2.5 py-1.5 h-8"
            size="sm"
          >
            <span className="font-medium">{category.id === "all" ? "All" : category.id === "help" ? "Help" : category.id === "study-group" ? "Groups" : category.id === "resources" ? "Res" : "Gen"}</span>
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
                        <span className="truncate">{discussion.course}</span>
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
                        onClick={() => handleLike(discussion.id)}
                        className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                      >
                        <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden xs:inline">Like</span>
                        <span className="xs:hidden">{discussion.likes}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewReplies(discussion)}
                        className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                      >
                        <Reply className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden xs:inline">Reply</span>
                        <span className="xs:hidden">{discussion.replies}</span>
                      </Button>
                      {canDeleteDiscussion(discussion) && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteDiscussion(discussion.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden xs:inline">Delete</span>
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
                    if (reply.author_type === 'lecturer') return 'lecturer';
                    if (reply.author_type === 'admin') return 'admin';
                    return 'student';
                  };

                  const senderType = getSenderType();
                  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                  const isOwnMessage = reply.author_id === currentUser.id || reply.created_by === currentUser.username;
                  
                  // Apply different background colors based on sender type
                  const getBgColor = () => {
                    if (isOwnMessage && senderType === 'student') {
                      return 'bg-cyan-50 border-cyan-300'; // Own messages (lighter cyan)
                    }
                    switch (senderType) {
                      case 'lecturer':
                        return 'bg-orange-50 border-orange-300'; // Lecturer messages (orange)
                      case 'admin':
                        return 'bg-purple-50 border-purple-300'; // Admin messages (purple)
                      default:
                        return 'bg-blue-50 border-blue-300'; // Other student messages (blue)
                    }
                  };

                  const getBadgeColor = () => {
                    if (isOwnMessage && senderType === 'student') {
                      return 'bg-cyan-200 text-cyan-900'; // Own messages badge
                    }
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
                    // Lecturer check - show program name instead of lecturer name
                    if (reply.lecturer_name || senderType === 'lecturer') {
                      return `${selectedDiscussion.program || 'Program'}`;
                    }
                    // Admin check
                    if (senderType === 'admin') {
                      return `${reply.author || 'Admin'}`;
                    }
                    // For students, show name and leg no if available
                    if (reply.leg_no) {
                      return `${reply.author || 'Student'} (${reply.leg_no})`;
                    }
                    return reply.author || 'Student';
                  };

                  // Get badge label with better lecturer detection
                  const getBadgeLabel = () => {
                    if (senderType === 'lecturer' || reply.lecturer_name) return 'LECTURER';
                    if (senderType === 'admin') return 'Admin';
                    // For students, show STUDENT with registration number if available
                    if (reply.leg_no) {
                      return `STUDENT (${reply.leg_no})`;
                    }
                    return 'STUDENT';
                  };

                  return (
                    <div key={reply.id} className={`p-4 border rounded-lg ${getBgColor()} transition-colors`}>
                      <div className="flex items-start gap-3 mb-2">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={getBadgeColor()}>
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
                })
              )}
            </div>

            {/* Add Reply */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Reply</h4>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
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
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span>Attach File</span>
                  </label>
                  
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="image-upload"
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
                    setNewReply("");
                    setSelectedFile(null);
                  }}
                >
                  Close
                </Button>
                <Button 
                  onClick={handleAddReply}
                  disabled={!newReply.trim() && !selectedFile}
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
