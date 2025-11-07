import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  Video, 
  Image, 
  Download, 
  Eye, 
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  PlayCircle,
  FileVideo,
  File,
  Folder
} from "lucide-react";

export const ContentManager = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [newContent, setNewContent] = useState({
    title: "",
    description: "",
    program: "",
    type: "document",
    file: null
  });

  const [lecturerPrograms, setLecturerPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fileInputKey, setFileInputKey] = useState(0); // For resetting file input

  // Fetch lecturer's programs from database
  useEffect(() => {
    const fetchLecturerPrograms = async () => {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
          setLoading(false);
          return;
        }

        const user = JSON.parse(currentUser);
        console.log('=== CONTENT MANAGER DATA FETCH ===');
        console.log('Current User:', user);
        
        // Fetch lecturer's regular programs using efficient endpoint
        const response = await fetch(`https://must-lms-backend.onrender.com/api/programs?lecturer_username=${encodeURIComponent(user.username)}`);
        let allPrograms = [];
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            allPrograms = [...result.data];
            console.log('Lecturer Regular Programs:', allPrograms.length);
          }
        }
        
        // Fetch lecturer's short-term programs using efficient endpoint
        const shortTermResponse = await fetch(`https://must-lms-backend.onrender.com/api/short-term-programs?lecturer_username=${encodeURIComponent(user.username)}`);
        if (shortTermResponse.ok) {
          const shortTermResult = await shortTermResponse.json();
          if (shortTermResult.success) {
            const lecturerShortTermPrograms = shortTermResult.data || [];
            console.log('Lecturer Short-Term Programs:', lecturerShortTermPrograms.length);
            
            // Convert short-term programs to same format as regular programs
            const formattedShortTermPrograms = lecturerShortTermPrograms.map(program => ({
              id: `short-${program.id}`,
              name: program.title,
              lecturer_name: program.lecturer_name,
              lecturer_id: program.lecturer_id,
              type: 'short-term'
            }));
            
            allPrograms = [...allPrograms, ...formattedShortTermPrograms];
          }
        }
        
        console.log('Total Programs:', allPrograms.length);
        setLecturerPrograms(allPrograms);
      } catch (error) {
        console.error('Error fetching lecturer programs:', error);
        // Show empty state when error occurs - no fake data
        setLecturerPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLecturerPrograms();
  }, []);

  const [content, setContent] = useState([]);

  // Load existing content from database
  useEffect(() => {
    const loadContent = async () => {
      try {
        // Initialize content table first
        await fetch('https://must-lms-backend.onrender.com/api/content/init', { method: 'POST' });
        
        // Fetch existing content
        const response = await fetch('https://must-lms-backend.onrender.com/api/content');
        if (response.ok) {
          const result = await response.json();
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          
          console.log('=== CONTENT FETCH ===');
          console.log('All Content:', result.data);
          
          // Filter content for current lecturer
          const lecturerContent = result.data?.filter(content => 
            content.lecturer_name === currentUser.username ||
            content.lecturer_id === currentUser.id ||
            content.created_by === currentUser.username
          ) || [];
          
          console.log('Filtered Lecturer Content:', lecturerContent);
          
          // Format content for display
          const formattedContent = lecturerContent.map(item => ({
            id: item.id,
            title: item.title,
            type: item.content_type,
            program: item.program_name,
            size: item.file_size || "N/A",
            uploadDate: item.upload_date?.split('T')[0] || new Date().toISOString().split('T')[0],
            downloads: 0,
            views: 0,
            status: item.status || "published",
            fileUrl: item.file_url || "#",
            thumbnail: null
          }));
          
          setContent(formattedContent);
        }
      } catch (error) {
        console.error('Error loading content:', error);
        // Keep content empty if error - no fake data
      }
    };

    loadContent();
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type based on selected content type
      const isValidFile = validateFileType(file, newContent.type);
      
      if (!isValidFile) {
        alert(`Invalid file type for ${newContent.type}. Please select a valid file.`);
        event.target.value = ''; // Clear the input
        return;
      }
      
      setNewContent({...newContent, file});
      
      // Simulate upload progress
      setIsUploading(true);
      setUploadProgress(0);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const validateFileType = (file, contentType) => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    switch (contentType) {
      case 'document':
        return fileName.endsWith('.pdf') || 
               fileName.endsWith('.doc') || 
               fileName.endsWith('.docx') || 
               fileName.endsWith('.ppt') || 
               fileName.endsWith('.pptx') || 
               fileName.endsWith('.xls') || 
               fileName.endsWith('.xlsx') || 
               fileName.endsWith('.zip') ||
               fileType.includes('pdf') ||
               fileType.includes('document') ||
               fileType.includes('presentation') ||
               fileType.includes('spreadsheet');
      
      case 'video':
        return fileName.endsWith('.mp4') || 
               fileName.endsWith('.avi') || 
               fileName.endsWith('.mov') || 
               fileName.endsWith('.wmv') ||
               fileType.startsWith('video/');
      
      case 'image':
        return fileName.endsWith('.jpg') || 
               fileName.endsWith('.jpeg') || 
               fileName.endsWith('.png') || 
               fileName.endsWith('.gif') ||
               fileType.startsWith('image/');
      
      default:
        return true;
    }
  };

  const handleContentTypeChange = (newType) => {
    setNewContent({...newContent, type: newType, file: null});
    setFileInputKey(prev => prev + 1); // Reset file input
    setUploadProgress(0);
    setIsUploading(false);
  };

  const getAcceptedFileTypes = (contentType) => {
    switch (contentType) {
      case 'document':
        return '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip';
      case 'video':
        return 'video/*,.mp4,.avi,.mov,.wmv';
      case 'image':
        return 'image/*,.jpg,.jpeg,.png,.gif';
      default:
        return '*/*';
    }
  };

  const getFileTypeDescription = (contentType) => {
    switch (contentType) {
      case 'document':
        return 'PDF, Word, PowerPoint, Excel, ZIP files';
      case 'video':
        return 'MP4, AVI, MOV, WMV video files';
      case 'image':
        return 'JPG, PNG, GIF image files';
      default:
        return 'All file types';
    }
  };

  const handleUploadContent = async () => {
    if (!newContent.title || !newContent.file || !newContent.program) {
      alert('Please fill in all required fields and select a file');
      return;
    }
    
    // File size validation (50MB limit for Render free tier)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (newContent.file.size > MAX_FILE_SIZE) {
      alert(`File too large! Maximum size: 50MB\nYour file: ${(newContent.file.size / (1024 * 1024)).toFixed(1)}MB\n\nPlease compress or choose a smaller file.`);
      return;
    }
    
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      console.log('=== STARTING CONTENT UPLOAD ===');
      console.log('File name:', newContent.file.name);
      console.log('File size:', `${(newContent.file.size / (1024 * 1024)).toFixed(1)} MB`);
      console.log('File type:', newContent.file.type);
      
      // Upload actual file to backend
      const formData = new FormData();
      formData.append('title', newContent.title);
      formData.append('description', newContent.description);
      formData.append('program', newContent.program);
      formData.append('type', newContent.type);
      formData.append('lecturer_id', currentUser.id || '');
      formData.append('lecturer_name', currentUser.name || currentUser.username || 'Lecturer');
      formData.append('file_size', `${(newContent.file.size / (1024 * 1024)).toFixed(1)} MB`);
      formData.append('file', newContent.file); // ACTUAL FILE
      
      setIsUploading(true);
      setUploadProgress(10);
      
      const response = await fetch('https://must-lms-backend.onrender.com/api/content/upload', {
        method: 'POST',
        body: formData // Send FormData with actual file
      });
      
      setUploadProgress(90);
      
      if (response.ok) {
        const result = await response.json();
        
        console.log('=== CONTENT UPLOAD SUCCESS ===');
        console.log('Backend Response:', result);
        console.log('Program Name Saved:', result.data.program_name);
        console.log('File URL:', result.data.file_url);
        
        // Add uploaded content to list
        const newItem = {
          id: result.data.id,
          title: result.data.title,
          type: result.data.content_type,
          program: result.data.program_name,
          size: `${(newContent.file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadDate: result.data.upload_date?.split('T')[0] || new Date().toISOString().split('T')[0],
          downloads: 0,
          views: 0,
          status: result.data.status || "published",
          fileUrl: result.data.file_url || "#",
          thumbnail: null
        };
        
        setContent([newItem, ...content]);
        setUploadProgress(100);
        alert('✅ Content uploaded successfully!\n\nNote: Files are stored temporarily on Render free tier. For permanent storage, consider upgrading or using cloud storage (Cloudinary, AWS S3).');
      } else {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      
      // More detailed error message
      if (error.message.includes('Failed to fetch')) {
        alert('❌ Failed to upload content.\n\nPossible causes:\n1. Server connection issue\n2. File too large (max 50MB)\n3. Network timeout\n\nPlease try:\n- Check internet connection\n- Use smaller file\n- Try again in a moment');
      } else {
        alert(`❌ Failed to upload content.\n\nError: ${error.message}\n\nPlease check server connection and try again.`);
      }
      return; // Don't add to local state if server fails
    }
    
    // Reset form
    setNewContent({
      title: "",
      description: "",
      program: "",
      type: "document",
      file: null
    });
    setShowUploadForm(false);
    setUploadProgress(0);
    setFileInputKey(prev => prev + 1); // Reset file input
  };

  const deleteContent = async (id) => {
    try {
      const response = await fetch(`https://must-lms-backend.onrender.com/api/content/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setContent(content.filter(item => item.id !== id));
        alert('Content deleted successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      if (error.message.includes('fetch')) {
        alert('Cannot connect to server. Please ensure backend is running on port 5000.');
      } else {
        alert(`Failed to delete content: ${error.message}`);
      }
    }
  };

  const filteredContent = content.filter(item => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.program && item.program.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case "video": return <Video className="h-5 w-5" />;
      case "document": return <FileText className="h-5 w-5" />;
      case "image": return <Image className="h-5 w-5" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "video": return "bg-red-100 text-red-800";
      case "document": return "bg-blue-100 text-blue-800";
      case "image": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Manager</h1>
        <Button onClick={() => setShowUploadForm(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Content
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          {["all", "video", "document", "image"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab)}
              size="sm"
            >
              {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle>Upload New Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Content Title</label>
                <Input
                  placeholder="Enter content title..."
                  value={newContent.title}
                  onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Program</label>
                {loading ? (
                  <div className="w-full border rounded px-3 py-2 bg-gray-50">
                    Loading programs...
                  </div>
                ) : (
                  <select
                    value={newContent.program}
                    onChange={(e) => setNewContent({...newContent, program: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Program</option>
                    {lecturerPrograms.map((program) => (
                      <option key={program.id} value={program.name}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                )}
                {lecturerPrograms.length === 0 && !loading && (
                  <p className="text-xs text-orange-600 mt-1">
                    No programs assigned. Contact admin to assign programs.
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  Content Type
                  {getTypeIcon(newContent.type)}
                </label>
                <select
                  value={newContent.type}
                  onChange={(e) => handleContentTypeChange(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white"
                >
                  <option value="document">📄 Document (PDF, DOC, PPT, Excel, ZIP)</option>
                  <option value="video">🎥 Video (MP4, AVI, MOV, WMV)</option>
                  <option value="image">🖼️ Image (JPG, PNG, GIF)</option>
                </select>
                <div className={`text-xs mt-1 p-2 rounded-md ${getTypeColor(newContent.type)}`}>
                  <strong>Accepted files:</strong> {getFileTypeDescription(newContent.type)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">File Upload</label>
                <Input
                  key={fileInputKey} // This will reset the input when content type changes
                  type="file"
                  onChange={handleFileUpload}
                  accept={getAcceptedFileTypes(newContent.type)}
                  className="cursor-pointer"
                />
                <div className="text-xs mt-1">
                  {newContent.file ? (
                    <div className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded-md">
                      <span>✅</span>
                      <span>
                        <strong>Selected:</strong> {newContent.file.name} 
                        <span className="text-green-600"> ({(newContent.file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground p-2 bg-gray-50 rounded-md">
                      📁 Choose a {newContent.type} file to upload
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Content description..."
                value={newContent.description}
                onChange={(e) => setNewContent({...newContent, description: e.target.value})}
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uploading...</span>
                  <span className="text-sm">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex space-x-2">
              <Button 
                onClick={handleUploadContent} 
                disabled={!newContent.title || !newContent.file || !newContent.program || isUploading}
              >
                Upload Content
              </Button>
              <Button variant="outline" onClick={() => setShowUploadForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(item.type)}
                  <Badge className={getTypeColor(item.type)}>
                    {item.type}
                  </Badge>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
              <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{item.program}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Thumbnail for videos */}
              {item.type === "video" && (
                <div className="relative bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                  <PlayCircle className="h-12 w-12 text-gray-400" />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {item.size}
                  </div>
                </div>
              )}

              {/* File info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">{item.size}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded</p>
                  <p className="font-medium">{item.uploadDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Downloads</p>
                  <p className="font-medium">{item.downloads}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Views</p>
                  <p className="font-medium">{item.views}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log('=== VIEW CONTENT DEBUG (LECTURER) ===');
                    console.log('Content Item:', item);
                    console.log('File URL:', item.fileUrl);
                    
                    // Validate file URL
                    if (!item.fileUrl) {
                      alert('Error: File URL is missing. Please re-upload this content.');
                      console.error('Missing fileUrl for content:', item);
                      return;
                    }
                    
                    // Handle different file types for viewing
                    const fileExtension = item.fileUrl?.split('.').pop()?.toLowerCase();
                    console.log('File Extension:', fileExtension);
                    
                    const viewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'txt', 'html'];
                    const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
                    
                    const fullUrl = `https://must-lms-backend.onrender.com${item.fileUrl}`;
                    console.log('Full URL:', fullUrl);
                    
                    if (viewableTypes.includes(fileExtension)) {
                      // Open directly in browser for viewable files
                      console.log('Opening viewable file:', fullUrl);
                      window.open(fullUrl, '_blank');
                    } else if (videoTypes.includes(fileExtension)) {
                      // Create video player page for video files
                      const videoContent = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>Video: ${item.title}</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 20px; background: #000; margin: 0; }
                            .container { max-width: 1200px; margin: 0 auto; }
                            .header { text-align: center; margin-bottom: 20px; color: white; }
                            .video-container { text-align: center; margin: 20px 0; }
                            video { width: 100%; max-width: 800px; height: auto; border-radius: 10px; }
                            .info { background: white; padding: 20px; border-radius: 10px; margin-top: 20px; }
                            .label { font-weight: bold; color: #333; }
                          </style>
                        </head>
                        <body>
                          <div class="container">
                            <div class="header">
                              <h1>${item.title}</h1>
                            </div>
                            
                            <div class="video-container">
                              <video controls>
                                <source src="https://must-lms-backend.onrender.com${item.fileUrl}" type="video/${fileExtension}">
                                Your browser does not support the video tag.
                              </video>
                            </div>
                            
                            <div class="info">
                              <p><span class="label">Program:</span> ${item.program}</p>
                              <p><span class="label">Content Type:</span> ${item.type}</p>
                              <p><span class="label">File Size:</span> ${item.size}</p>
                              <p><span class="label">Upload Date:</span> ${item.uploadDate}</p>
                              <p><span class="label">Views:</span> ${item.views}</p>
                              <p><span class="label">Downloads:</span> ${item.downloads}</p>
                            </div>
                          </div>
                        </body>
                        </html>
                      `;
                      
                      const blob = new Blob([videoContent], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      window.open(url, '_blank');
                    } else {
                      // For non-viewable files (DOC, PPT, Excel), create preview page
                      const previewContent = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>Content Preview: ${item.title}</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                            .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
                            .info { margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
                            .label { font-weight: bold; color: #333; }
                            .download-btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                            .file-icon { font-size: 48px; margin: 20px 0; }
                          </style>
                        </head>
                        <body>
                          <div class="container">
                            <div class="header">
                              <div class="file-icon">${item.type === 'video' ? 'VIDEO' : item.type === 'document' ? 'DOCUMENT' : 'FILE'}</div>
                              <h1>${item.title}</h1>
                              <p style="color: #666;">Content Preview</p>
                            </div>
                            
                            <div class="info">
                              <p><span class="label">Program:</span> ${item.program}</p>
                              <p><span class="label">Content Type:</span> ${item.type}</p>
                              <p><span class="label">File Size:</span> ${item.size}</p>
                              <p><span class="label">Upload Date:</span> ${item.uploadDate}</p>
                              <p><span class="label">Views:</span> ${item.views}</p>
                              <p><span class="label">Downloads:</span> ${item.downloads}</p>
                            </div>
                            
                            <div style="text-align: center; margin-top: 30px;">
                              <p>This is a preview of your uploaded content.</p>
                              <p>File type: ${fileExtension?.toUpperCase() || 'Unknown'}</p>
                              <a href="https://must-lms-backend.onrender.com${item.fileUrl}" class="download-btn" download>
                                Download ${item.title}
                              </a>
                            </div>
                          </div>
                        </body>
                        </html>
                      `;
                      
                      const blob = new Blob([previewContent], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      window.open(url, '_blank');
                    }
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteContent(item.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Content */}
      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No content found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "Upload your first content to get started"}
          </p>
        </div>
      )}

      {/* Supported File Types Info */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Supported File Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </h4>
              <ul className="text-sm space-y-1">
                <li>• PDF files</li>
                <li>• Microsoft Word (DOC, DOCX)</li>
                <li>• PowerPoint (PPT, PPTX)</li>
                <li>• Excel (XLS, XLSX)</li>
                <li>• ZIP archives</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Video className="h-4 w-4 mr-2" />
                Videos
              </h4>
              <ul className="text-sm space-y-1">
                <li>• MP4 format</li>
                <li>• AVI format</li>
                <li>• MOV format</li>
                <li>• WMV format</li>
                <li>• Max size: 500MB</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Image className="h-4 w-4 mr-2" />
                Images
              </h4>
              <ul className="text-sm space-y-1">
                <li>• JPEG/JPG format</li>
                <li>• PNG format</li>
                <li>• GIF format</li>
                <li>• Max size: 10MB</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
