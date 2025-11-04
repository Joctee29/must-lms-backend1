import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Award, 
  BookOpen,
  Play,
  RotateCcw,
  Target
} from "lucide-react";

export const Quizzes = () => {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  const quizzes = [
    {
      id: 1,
      title: "Advanced Mathematics - Chapter 1",
      course: "Advanced Mathematics",
      questions: 10,
      timeLimit: 30,
      attempts: 2,
      maxAttempts: 3,
      bestScore: 85,
      status: "available",
      difficulty: "Medium",
      points: 100
    },
    {
      id: 2,
      title: "Physics Fundamentals Quiz",
      course: "Physics 101",
      questions: 15,
      timeLimit: 45,
      attempts: 0,
      maxAttempts: 2,
      bestScore: null,
      status: "available",
      difficulty: "Hard",
      points: 150
    },
    {
      id: 3,
      title: "Chemistry Basics Assessment",
      course: "Chemistry 101",
      questions: 8,
      timeLimit: 20,
      attempts: 3,
      maxAttempts: 3,
      bestScore: 92,
      status: "completed",
      difficulty: "Easy",
      points: 80
    },
    {
      id: 4,
      title: "Programming Logic Test",
      course: "Computer Science",
      questions: 12,
      timeLimit: 40,
      attempts: 1,
      maxAttempts: 3,
      bestScore: 78,
      status: "available",
      difficulty: "Hard",
      points: 120
    }
  ];

  const sampleQuestions = [
    {
      id: 1,
      question: "What is the derivative of x²?",
      options: ["2x", "x", "2", "x²"],
      correct: 0,
      explanation: "The derivative of x² is 2x using the power rule."
    },
    {
      id: 2,
      question: "Which of the following is a prime number?",
      options: ["15", "21", "17", "25"],
      correct: 2,
      explanation: "17 is a prime number as it's only divisible by 1 and itself."
    },
    {
      id: 3,
      question: "What is the value of π (pi) approximately?",
      options: ["3.14159", "2.71828", "1.41421", "1.73205"],
      correct: 0,
      explanation: "π (pi) is approximately 3.14159."
    }
  ];

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setQuizResults(null);
  };

  const selectAnswer = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = () => {
    let correctAnswers = 0;
    sampleQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / sampleQuestions.length) * 100);
    setQuizResults({
      score,
      correctAnswers,
      totalQuestions: sampleQuestions.length,
      passed: score >= 70
    });
    setQuizCompleted(true);
  };

  const retakeQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setQuizResults(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500";
      case "Medium": return "bg-yellow-500";
      case "Hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available": return "text-blue-600";
      case "completed": return "text-green-600";
      case "locked": return "text-gray-400";
      default: return "text-gray-600";
    }
  };

  if (selectedQuiz && !quizCompleted) {
    const question = sampleQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100;

    return (
      <div className="p-6 max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{selectedQuiz.title}</h1>
            <Button variant="outline" onClick={() => setSelectedQuiz(null)}>
              Exit Quiz
            </Button>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {sampleQuestions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                <Clock className="h-4 w-4 inline mr-1" />
                {selectedQuiz.timeLimit} minutes
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswers[currentQuestion]?.toString()}
              onValueChange={(value) => selectAnswer(currentQuestion, parseInt(value))}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <div className="flex space-x-2">
            {sampleQuestions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestion ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 ${selectedAnswers[index] !== undefined ? 'bg-green-100' : ''}`}
              >
                {index + 1}
              </Button>
            ))}
          </div>

          {currentQuestion === sampleQuestions.length - 1 ? (
            <Button onClick={submitQuiz} className="bg-green-600 hover:bg-green-700">
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={nextQuestion}>
              Next
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (quizCompleted && quizResults) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              quizResults.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {quizResults.passed ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {quizResults.passed ? 'Quiz Completed!' : 'Quiz Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">
              {quizResults.score}%
            </div>
            <p className="text-muted-foreground">
              You answered {quizResults.correctAnswers} out of {quizResults.totalQuestions} questions correctly
            </p>
            
            {quizResults.passed && (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <Award className="h-5 w-5" />
                <span>+{selectedQuiz.points} XP Earned!</span>
              </div>
            )}

            <div className="flex space-x-4 justify-center pt-4">
              <Button onClick={retakeQuiz} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
              <Button onClick={() => setSelectedQuiz(null)}>
                Back to Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quizzes & Assessments</h1>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {quizzes.filter(q => q.status === 'completed').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-blue-600">
              {quizzes.filter(q => q.status === 'available').length}
            </p>
          </div>
        </div>
      </div>

      {/* Quiz List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{quiz.course}</p>
                </div>
                <Badge className={getDifficultyColor(quiz.difficulty)}>
                  {quiz.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quiz Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="font-semibold">{quiz.questions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Limit</p>
                  <p className="font-semibold">{quiz.timeLimit}m</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Points</p>
                  <p className="font-semibold">{quiz.points} XP</p>
                </div>
              </div>

              {/* Attempts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Attempts</span>
                  <span className="text-sm">{quiz.attempts}/{quiz.maxAttempts}</span>
                </div>
                <Progress 
                  value={(quiz.attempts / quiz.maxAttempts) * 100} 
                  className="h-2"
                />
              </div>

              {/* Best Score */}
              {quiz.bestScore && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Best Score</span>
                  <span className="font-semibold text-primary">{quiz.bestScore}%</span>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${getStatusColor(quiz.status)}`}>
                  {quiz.status === 'available' ? 'Available' : 
                   quiz.status === 'completed' ? 'Completed' : 'Locked'}
                </span>
                {quiz.status === 'completed' && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>

              {/* Action Button */}
              <Button
                onClick={() => startQuiz(quiz)}
                disabled={quiz.attempts >= quiz.maxAttempts && quiz.status !== 'completed'}
                className="w-full"
                variant={quiz.status === 'completed' ? 'outline' : 'default'}
              >
                <Play className="h-4 w-4 mr-2" />
                {quiz.status === 'completed' ? 'Review Quiz' : 
                 quiz.attempts >= quiz.maxAttempts ? 'No Attempts Left' : 'Start Quiz'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
