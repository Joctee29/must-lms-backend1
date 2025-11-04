import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  BookOpen, 
  Clock, 
  Users,
  TrendingUp,
  Medal,
  Crown
} from "lucide-react";

export const Achievements = () => {
  const [activeTab, setActiveTab] = useState("badges");

  // Student's current stats
  const studentStats = {
    totalPoints: 2850,
    level: 7,
    nextLevelPoints: 3000,
    coursesCompleted: 12,
    badgesEarned: 8,
    rank: 15,
    totalStudents: 245
  };

  // Available badges
  const badges = [
    {
      id: 1,
      name: "First Steps",
      description: "Complete your first course",
      icon: BookOpen,
      earned: true,
      earnedDate: "2024-01-15",
      points: 100,
      rarity: "Common"
    },
    {
      id: 2,
      name: "Speed Learner",
      description: "Complete a course in under 2 weeks",
      icon: Clock,
      earned: true,
      earnedDate: "2024-02-03",
      points: 200,
      rarity: "Rare"
    },
    {
      id: 3,
      name: "Perfect Score",
      description: "Get 100% on any assessment",
      icon: Star,
      earned: true,
      earnedDate: "2024-02-20",
      points: 300,
      rarity: "Epic"
    },
    {
      id: 4,
      name: "Team Player",
      description: "Participate in 5 group discussions",
      icon: Users,
      earned: false,
      points: 250,
      rarity: "Rare",
      progress: 3,
      target: 5
    },
    {
      id: 5,
      name: "Knowledge Seeker",
      description: "Complete 10 courses",
      icon: Trophy,
      earned: true,
      earnedDate: "2024-03-10",
      points: 500,
      rarity: "Legendary"
    },
    {
      id: 6,
      name: "Rising Star",
      description: "Reach top 20 in leaderboard",
      icon: TrendingUp,
      earned: true,
      earnedDate: "2024-03-15",
      points: 400,
      rarity: "Epic"
    }
  ];

  // Leaderboard data
  const leaderboard = [
    { rank: 1, name: "Alice Johnson", points: 4250, level: 12, avatar: "AJ" },
    { rank: 2, name: "Bob Smith", points: 3980, level: 11, avatar: "BS" },
    { rank: 3, name: "Carol Davis", points: 3750, level: 10, avatar: "CD" },
    { rank: 4, name: "David Wilson", points: 3600, level: 10, avatar: "DW" },
    { rank: 5, name: "Eva Brown", points: 3450, level: 9, avatar: "EB" },
    { rank: 15, name: "You", points: studentStats.totalPoints, level: studentStats.level, avatar: "ME", isCurrentUser: true }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common": return "bg-gray-500";
      case "Rare": return "bg-blue-500";
      case "Epic": return "bg-purple-500";
      case "Legendary": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "Common": return "border-gray-300";
      case "Rare": return "border-blue-300";
      case "Epic": return "border-purple-300";
      case "Legendary": return "border-yellow-300";
      default: return "border-gray-300";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Achievements</h1>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Points</p>
            <p className="text-2xl font-bold text-primary">{studentStats.totalPoints}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="text-2xl font-bold text-primary">{studentStats.level}</p>
          </div>
        </div>
      </div>

      {/* Progress to Next Level */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Level Progress</h3>
            <span className="text-sm text-muted-foreground">
              {studentStats.totalPoints} / {studentStats.nextLevelPoints} XP
            </span>
          </div>
          <Progress 
            value={(studentStats.totalPoints / studentStats.nextLevelPoints) * 100} 
            className="h-3"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {studentStats.nextLevelPoints - studentStats.totalPoints} XP to reach Level {studentStats.level + 1}
          </p>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{studentStats.coursesCompleted}</p>
            <p className="text-sm text-muted-foreground">Courses Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{studentStats.badgesEarned}</p>
            <p className="text-sm text-muted-foreground">Badges Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Medal className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">#{studentStats.rank}</p>
            <p className="text-sm text-muted-foreground">Current Rank</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{studentStats.totalPoints}</p>
            <p className="text-sm text-muted-foreground">Total XP</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <Button
          variant={activeTab === "badges" ? "default" : "ghost"}
          onClick={() => setActiveTab("badges")}
          className="pb-2"
        >
          <Award className="h-4 w-4 mr-2" />
          Badges
        </Button>
        <Button
          variant={activeTab === "leaderboard" ? "default" : "ghost"}
          onClick={() => setActiveTab("leaderboard")}
          className="pb-2"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Leaderboard
        </Button>
      </div>

      {/* Badges Tab */}
      {activeTab === "badges" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const IconComponent = badge.icon;
            return (
              <Card 
                key={badge.id} 
                className={`${badge.earned ? getRarityBorder(badge.rarity) : 'border-gray-200 opacity-60'} 
                           ${badge.earned ? 'border-2' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-full ${badge.earned ? getRarityColor(badge.rarity) : 'bg-gray-300'}`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <Badge 
                      variant={badge.earned ? "default" : "secondary"}
                      className={badge.earned ? getRarityColor(badge.rarity) : ''}
                    >
                      {badge.rarity}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{badge.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                  
                  {badge.earned ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">Earned!</span>
                        <span className="text-sm text-muted-foreground">{badge.earnedDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Points:</span>
                        <span className="text-sm font-bold text-primary">+{badge.points} XP</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {badge.progress !== undefined && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Progress</span>
                            <span className="text-sm">{badge.progress}/{badge.target}</span>
                          </div>
                          <Progress value={(badge.progress / badge.target) * 100} className="h-2" />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Reward:</span>
                        <span className="text-sm font-bold text-primary">+{badge.points} XP</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Global Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div 
                  key={user.rank} 
                  className={`flex items-center justify-between p-3 rounded-lg border
                             ${user.isCurrentUser ? 'bg-primary/5 border-primary' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold
                                   ${user.rank === 1 ? 'bg-yellow-500 text-white' :
                                     user.rank === 2 ? 'bg-gray-400 text-white' :
                                     user.rank === 3 ? 'bg-amber-600 text-white' :
                                     user.isCurrentUser ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                      {user.rank <= 3 ? (
                        user.rank === 1 ? <Crown className="h-4 w-4" /> :
                        user.rank === 2 ? <Medal className="h-4 w-4" /> :
                        <Award className="h-4 w-4" />
                      ) : (
                        user.rank
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                        {user.avatar}
                      </div>
                      <div>
                        <p className={`font-medium ${user.isCurrentUser ? 'text-primary' : ''}`}>
                          {user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">Level {user.level}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{user.points} XP</p>
                    <p className="text-sm text-muted-foreground">Rank #{user.rank}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
