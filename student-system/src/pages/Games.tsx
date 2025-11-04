import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProgrammingChallenge } from "./ProgrammingChallenge";
import { TypingMaster } from "./TypingMaster";
import { 
  Code, 
  Trophy, 
  Star, 
  Play, 
  Clock, 
  Target,
  Award,
  Zap,
  BookOpen,
  Users,
  Gamepad2
} from "lucide-react";

export const Games = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [playingGame, setPlayingGame] = useState<{gameId: number, language: string, currentLevel: number} | null>(null);
  const [gameProgress, setGameProgress] = useState<{[key: number]: number}>({1: 1, 2: 1, 3: 1}); // Track level for each game

  const programmingGames = [
    {
      id: 1,
      title: "C Programming Mastery",
      description: "Complete C programming course from basics to advanced with 120 interactive levels and real coding challenges",
      language: "C",
      difficulty: "All Levels",
      levels: 120,
      completedLevels: 0,
      points: 0,
      maxPoints: 12000,
      estimatedTime: "15-20 hours",
      topics: [
        "Variables & Data Types", "Control Structures", "Functions", "Arrays", 
        "Pointers", "Strings", "Structures", "File I/O", "Dynamic Memory", 
        "Linked Lists", "Stacks & Queues", "Trees", "Sorting Algorithms"
      ],
      status: "Ready to Start",
      icon: "🔧",
      color: "bg-blue-500",
      currentLevel: gameProgress[1] || 1,
      nextChallenge: "Hello World Program",
      playable: true
    },
    {
      id: 2,
      title: "C++ Programming Mastery",
      description: "Comprehensive C++ programming course with 150 levels covering OOP, STL, and modern C++ features",
      language: "C++",
      difficulty: "All Levels",
      levels: 120,
      completedLevels: 0,
      points: 0,
      maxPoints: 12000,
      estimatedTime: "15-20 hours",
      topics: [
        "Basic Syntax", "Classes & Objects", "Inheritance", "Polymorphism", 
        "Templates", "STL Containers", "Algorithms", "Exception Handling",
        "Smart Pointers", "Lambda Functions", "Move Semantics", "Concurrency",
        "Design Patterns", "Modern C++ Features"
      ],
      status: "Ready to Start",
      icon: "⚡",
      color: "bg-purple-500",
      currentLevel: gameProgress[2] || 1,
      nextChallenge: "Hello C++ Program",
      playable: true
    },
    {
      id: 3,
      title: "Typing Master Pro",
      description: "Master touch typing with interactive lessons, real-time feedback, and speed tracking",
      language: "English",
      difficulty: "All Levels",
      levels: 50,
      completedLevels: 0,
      points: 0,
      maxPoints: 5000,
      estimatedTime: "10-15 hours",
      topics: [
        "Home Row Keys", "Top Row Keys", "Bottom Row Keys", "Numbers", 
        "Special Characters", "Speed Building", "Accuracy Training", "Word Practice",
        "Sentence Practice", "Paragraph Typing", "Professional Documents"
      ],
      status: "Ready to Start",
      icon: "⌨️",
      color: "bg-green-500",
      currentLevel: gameProgress[3] || 1,
      nextChallenge: "Learn Home Row Keys",
      playable: true
    }
  ];

  const achievements = [
    { name: "First Steps", description: "Complete your first programming challenge", earned: true },
    { name: "Code Warrior", description: "Complete 10 programming challenges", earned: true },
    { name: "Syntax Master", description: "Complete a level without any syntax errors", earned: true },
    { name: "Speed Coder", description: "Complete a challenge in under 2 minutes", earned: false },
    { name: "Problem Solver", description: "Complete 5 advanced challenges", earned: false },
    { name: "C Expert", description: "Complete all C programming games", earned: false },
    { name: "C++ Master", description: "Complete all C++ programming games", earned: false }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Not Started": return "bg-gray-100 text-gray-800";
      case "Locked": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleStartGame = (gameId: number) => {
    const game = programmingGames.find(g => g.id === gameId);
    if (game && game.playable) {
      // Start the appropriate game type
      setPlayingGame({
        gameId: game.id,
        language: game.language,
        currentLevel: game.currentLevel
      });
    } else {
      alert("This game is not available yet. Please check back later.");
    }
  };

  const handleExitGame = () => {
    setPlayingGame(null);
  };

  const handleLevelComplete = (gameId: number, newLevel: number) => {
    setGameProgress(prev => ({
      ...prev,
      [gameId]: newLevel
    }));
  };

  const totalPoints = programmingGames.reduce((sum, game) => sum + game.points, 0);
  const maxTotalPoints = programmingGames.reduce((sum, game) => sum + game.maxPoints, 0);

  // If playing a game, show the appropriate game interface
  if (playingGame) {
    if (playingGame.gameId === 3) {
      // Typing Master Game
      return (
        <TypingMaster
          gameId={playingGame.gameId}
          currentLevel={playingGame.currentLevel}
          onExit={handleExitGame}
          onLevelComplete={(newLevel) => handleLevelComplete(playingGame.gameId, newLevel)}
        />
      );
    } else {
      // Programming Challenge Games (C and C++)
      return (
        <ProgrammingChallenge
          gameId={playingGame.gameId}
          language={playingGame.language}
          currentLevel={playingGame.currentLevel}
          onExit={handleExitGame}
          onLevelComplete={(newLevel) => handleLevelComplete(playingGame.gameId, newLevel)}
        />
      );
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Gamepad2 className="h-8 w-8 text-primary" />
            Programming Games
          </h1>
          <p className="text-muted-foreground">
            Learn C and C++ programming through interactive games and challenges
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{totalPoints} Points</div>
          <div className="text-sm text-muted-foreground">Total Earned</div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Available</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programmingGames.length}</div>
            <p className="text-xs text-muted-foreground">C & C++ Programming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((totalPoints / maxTotalPoints) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Overall Completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {achievements.filter(a => a.earned).length}/{achievements.length}
            </div>
            <p className="text-xs text-muted-foreground">Badges Earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Games</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programmingGames.filter(g => g.status === "In Progress").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently Playing</p>
          </CardContent>
        </Card>
      </div>

      {/* Programming Games */}
      <div className="grid gap-6 lg:grid-cols-2">
        {programmingGames.map((game) => (
          <Card key={game.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-lg ${game.color} flex items-center justify-center text-white text-xl`}>
                    {game.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{game.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getDifficultyColor(game.difficulty)}>
                    {game.difficulty}
                  </Badge>
                  <Badge className={getStatusColor(game.status)}>
                    {game.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{game.completedLevels}/{game.levels} levels ({Math.round((game.completedLevels / game.levels) * 100)}%)</span>
                </div>
                <Progress value={(game.completedLevels / game.levels) * 100} className="h-3" />
              </div>

              {/* Current Level & Next Challenge */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">Current Level:</span>
                    <span className="font-bold text-blue-600">{game.currentLevel}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Next Challenge:</span>
                    <p className="text-gray-800 mt-1">{game.nextChallenge}</p>
                  </div>
                </div>
              </div>

              {/* Game Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span>{game.language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{game.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span>{game.points}/{game.maxPoints} pts</span>
                </div>
              </div>

              {/* Topics */}
              <div>
                <div className="text-sm font-medium mb-2">Topics Covered:</div>
                <div className="flex flex-wrap gap-1">
                  {game.topics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-lg py-3" 
                onClick={() => handleStartGame(game.id)}
                disabled={!game.playable}
              >
                <Play className="mr-2 h-5 w-5" />
                PLAY NOW
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Programming Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  achievement.earned 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {achievement.earned ? (
                    <Trophy className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <Star className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={`font-medium ${
                    achievement.earned ? 'text-yellow-800' : 'text-gray-600'
                  }`}>
                    {achievement.name}
                  </span>
                </div>
                <p className={`text-xs ${
                  achievement.earned ? 'text-yellow-700' : 'text-gray-500'
                }`}>
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
