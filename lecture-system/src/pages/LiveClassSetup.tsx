import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  Play, 
  BookOpen,
  Globe,
  Monitor,
  Mic,
  Camera,
  Share,
  MessageSquare,
  Award,
  CheckCircle
} from "lucide-react";

interface LiveClassSetupProps {
  courseId?: string;
  courseName?: string;
  onStartClass?: (classData: any) => void;
  onCancel?: () => void;
}

export const LiveClassSetup = ({ courseId, courseName, onStartClass, onCancel }: LiveClassSetupProps) => {
  const [classDetails, setClassDetails] = useState({
    title: "",
    description: "",
    duration: 60,
    maxStudents: 50,
    recordSession: true,
    allowQuestions: true,
    enableChat: true,
    enableScreenShare: true,
    googleClassroomSync: true,
    participationPoints: 10,
    startTime: "",
    endTime: ""
  });

  const [isStarting, setIsStarting] = useState(false);

  const handleStartClass = async () => {
    if (!classDetails.title || !classDetails.startTime) {
      alert("Please fill in all required fields");
      return;
    }

    setIsStarting(true);
    
    // Simulate class creation and Google Classroom sync
    const classData = {
      id: Date.now(),
      courseId,
      courseName,
      ...classDetails,
      status: "live",
      participants: [],
      startedAt: new Date().toISOString(),
      googleClassroomLink: `https://classroom.google.com/c/${Math.random().toString(36).substr(2, 9)}`
    };

    // Simulate API call delay
    setTimeout(() => {
      setIsStarting(false);
      if (onStartClass) {
        onStartClass(classData);
      }
    }, 2000);
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    if (!startTime) return "";
    const start = new Date(`2024-01-01T${startTime}`);
    start.setMinutes(start.getMinutes() + duration);
    return start.toTimeString().slice(0, 5);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Video className="h-8 w-8 text-green-600" />
            Start Live Class
          </h1>
          {courseName && (
            <p className="text-muted-foreground mt-1">
              Setting up live class for: <span className="font-semibold text-green-600">{courseName}</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Details Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Class Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Class Title *</label>
              <Input
                placeholder="Enter class title..."
                value={classDetails.title}
                onChange={(e) => setClassDetails({...classDetails, title: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Brief description of the class..."
                value={classDetails.description}
                onChange={(e) => setClassDetails({...classDetails, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time *</label>
                <Input
                  type="time"
                  value={classDetails.startTime}
                  onChange={(e) => setClassDetails({
                    ...classDetails, 
                    startTime: e.target.value,
                    endTime: calculateEndTime(e.target.value, classDetails.duration)
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  min="15"
                  max="180"
                  value={classDetails.duration}
                  onChange={(e) => {
                    const duration = parseInt(e.target.value);
                    setClassDetails({
                      ...classDetails, 
                      duration,
                      endTime: calculateEndTime(classDetails.startTime, duration)
                    });
                  }}
                />
              </div>
            </div>

            {classDetails.endTime && (
              <div className="p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-700">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Class will end at: <strong>{classDetails.endTime}</strong>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Max Students</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={classDetails.maxStudents}
                  onChange={(e) => setClassDetails({...classDetails, maxStudents: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Participation Points</label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={classDetails.participationPoints}
                  onChange={(e) => setClassDetails({...classDetails, participationPoints: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Class Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Record Session</p>
                    <p className="text-sm text-muted-foreground">Save class for later viewing</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={classDetails.recordSession}
                  onChange={(e) => setClassDetails({...classDetails, recordSession: e.target.checked})}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Enable Chat</p>
                    <p className="text-sm text-muted-foreground">Allow students to chat</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={classDetails.enableChat}
                  onChange={(e) => setClassDetails({...classDetails, enableChat: e.target.checked})}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Share className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Screen Share</p>
                    <p className="text-sm text-muted-foreground">Allow screen sharing</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={classDetails.enableScreenShare}
                  onChange={(e) => setClassDetails({...classDetails, enableScreenShare: e.target.checked})}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Allow Questions</p>
                    <p className="text-sm text-muted-foreground">Students can ask questions</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={classDetails.allowQuestions}
                  onChange={(e) => setClassDetails({...classDetails, allowQuestions: e.target.checked})}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Google Classroom Sync</p>
                    <p className="text-sm text-muted-foreground">Auto-sync with Google Classroom</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={classDetails.googleClassroomSync}
                  onChange={(e) => setClassDetails({...classDetails, googleClassroomSync: e.target.checked})}
                  className="w-4 h-4"
                />
              </div>
            </div>

            {/* Achievement Points Info */}
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Achievement Points</h4>
              </div>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• Full attendance: {classDetails.participationPoints} points</p>
                <p>• Active participation: +{Math.round(classDetails.participationPoints * 0.5)} bonus points</p>
                <p>• Question asking: +{Math.round(classDetails.participationPoints * 0.3)} points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        
        <Button 
          onClick={handleStartClass}
          disabled={!classDetails.title || !classDetails.startTime || isStarting}
          className="bg-green-600 hover:bg-green-700 text-white px-8"
        >
          {isStarting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Starting Class...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Live Class
            </>
          )}
        </Button>
      </div>

      {/* Preview */}
      {classDetails.title && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Class Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Title:</strong> {classDetails.title}</p>
                <p><strong>Course:</strong> {courseName}</p>
                <p><strong>Duration:</strong> {classDetails.duration} minutes</p>
              </div>
              <div>
                <p><strong>Max Students:</strong> {classDetails.maxStudents}</p>
                <p><strong>Points:</strong> {classDetails.participationPoints}</p>
                <p><strong>Google Classroom:</strong> {classDetails.googleClassroomSync ? "✅ Enabled" : "❌ Disabled"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
