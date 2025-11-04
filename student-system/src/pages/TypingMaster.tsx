import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Keyboard, 
  Timer, 
  Target, 
  Award,
  CheckCircle,
  XCircle,
  RotateCcw,
  Play,
  Pause
} from "lucide-react";

interface TypingMasterProps {
  gameId: number;
  currentLevel: number;
  onExit: () => void;
  onLevelComplete: (newLevel: number) => void;
}

interface TypingLesson {
  id: number;
  level: number;
  title: string;
  difficulty: string;
  description: string;
  text: string;
  timeLimit: number; // in seconds
  targetWPM: number;
  targetAccuracy: number;
}

export const TypingMaster = ({ gameId, currentLevel, onExit, onLevelComplete }: TypingMasterProps) => {
  const [actualLevel, setActualLevel] = useState(currentLevel);
  const [currentLesson, setCurrentLesson] = useState<TypingLesson | null>(null);
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [gameState, setGameState] = useState<'ready' | 'typing' | 'completed' | 'failed'>('ready');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [pressedKey, setPressedKey] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate 50 unique typing lessons with progressive word count and difficulty
  const generateLesson = (level: number): TypingLesson => {
    const generateTypingLesson = (lvl: number): TypingLesson => {
      // Base word count increases with level
      const baseWordCount = Math.min(5 + (lvl * 2), 150);
      const timeLimit = Math.max(120 - (lvl * 2), 30);
      const targetWPM = Math.min(10 + lvl, 60);
      const targetAccuracy = Math.min(80 + lvl, 98);
      
      const lessons = [
        // Level 1-10: Home Row and Basic Keys (5-25 words)
        { level: 1, title: "Home Row Start", text: "asdf jkl; asdf jkl; sad lad ask" },
        { level: 2, title: "Home Row Words", text: "sad lad ask flask dad fad had lass glass fall" },
        { level: 3, title: "Home Row Sentences", text: "A sad lad had a flask. Dad asks for a glass. Fall has glass." },
        { level: 4, title: "Adding G and H", text: "glad hash gash flag hall shall gas has lag sag hag" },
        { level: 5, title: "Home Row Mastery", text: "A glad lad has a flag. Dad shall ask for glass. Fall has hash." },
        { level: 6, title: "Top Row Q W E R", text: "qwer were wear tear dear fear gear hear near year" },
        { level: 7, title: "Top Row T Y U I", text: "tyui quit your tire wire fire hire tire quite write" },
        { level: 8, title: "Top Row O P", text: "port pour poor door floor proof troop group soup loop" },
        { level: 9, title: "Mixed Rows", text: "The quick writer types fast. Your port is ready for the quest today." },
        { level: 10, title: "Bottom Row Z X C", text: "zxc zero exit code zone apex race pace face lace trace" },
        
        // Level 11-20: Complete Alphabet (30-50 words)
        { level: 11, title: "Bottom Row V B N M", text: "vbnm very best name move have been never more time come" },
        { level: 12, title: "All Letters", text: "The quick brown fox jumps over the lazy dog every single day without fail." },
        { level: 13, title: "Common Words", text: "about after again against all almost alone along already also although always among and another any" },
        { level: 14, title: "Frequent Terms", text: "anyone anything appear around because become before begin being believe between both bring build business call came" },
        { level: 15, title: "Daily Vocabulary", text: "cannot case change come could country course create day did different does down during each early even" },
        { level: 16, title: "Essential Words", text: "every example experience fact family far feel few find first follow for from get give good government" },
        { level: 17, title: "Important Terms", text: "great group hand have help here high home however important include information into just know large last" },
        { level: 18, title: "Key Phrases", text: "later learn leave let life little long look made make man many may might most move much" },
        { level: 19, title: "Core Vocabulary", text: "must need never new next now number of off old on once only or other our out" },
        { level: 20, title: "Basic Sentences", text: "People place point program provide public put question right said same say school see seem service set she should." },
        
        // Level 21-30: Sentences and Paragraphs (60-90 words)
        { level: 21, title: "Simple Paragraphs", text: "Learning to type efficiently requires consistent practice and dedication. Focus on accuracy first, then gradually increase your speed. Remember to keep your fingers positioned correctly on the home row keys at all times." },
        { level: 22, title: "Educational Content", text: "Education is the foundation of personal and professional growth. Students must develop strong study habits, critical thinking skills, and effective communication abilities to succeed in their academic and career pursuits." },
        { level: 23, title: "Technology Topics", text: "Technology continues to evolve at an unprecedented pace, transforming how we work, communicate, and live our daily lives. From smartphones to artificial intelligence, these innovations shape our modern world in countless ways." },
        { level: 24, title: "Business Writing", text: "Effective business communication requires clarity, professionalism, and attention to detail. Whether writing emails, reports, or presentations, professionals must convey their ideas clearly and persuasively to achieve their objectives and build strong relationships." },
        { level: 25, title: "Scientific Text", text: "Scientific research involves systematic investigation and experimentation to discover new knowledge and understand natural phenomena. Researchers must follow rigorous methodologies, analyze data carefully, and draw evidence-based conclusions to contribute meaningfully to their fields." },
        { level: 26, title: "Programming Concepts", text: "Programming is the art of telling another human being what one wants the computer to do. Good code is its own best documentation. First solve the problem, then write the code. Debugging is twice as hard as writing code." },
        { level: 27, title: "Historical Context", text: "Throughout history, human civilization has been shaped by technological innovations, cultural exchanges, and social movements. Each generation builds upon the achievements of previous ones, creating a continuous chain of progress and development that defines our collective human experience." },
        { level: 28, title: "Environmental Issues", text: "Environmental conservation has become one of the most pressing challenges of our time. Climate change, pollution, and resource depletion threaten the delicate balance of ecosystems worldwide, requiring immediate action from individuals, communities, and governments to protect our planet for future generations." },
        { level: 29, title: "Health and Wellness", text: "Maintaining good health requires a balanced approach that includes regular exercise, proper nutrition, adequate sleep, and stress management. Physical fitness, mental well-being, and social connections all contribute to overall quality of life and longevity in meaningful ways." },
        { level: 30, title: "Cultural Diversity", text: "Cultural diversity enriches our communities by bringing together different perspectives, traditions, and ways of thinking. When people from various backgrounds collaborate and share their unique experiences, they create innovative solutions and foster mutual understanding that benefits everyone involved." },
        
        // Level 31-40: Technical and Professional Content (100-120 words)
        { level: 31, title: "Software Development", text: "Software development is a complex process that involves planning, designing, coding, testing, and maintaining applications. Modern programming languages provide powerful tools and frameworks to build robust solutions. Developers must consider user experience, performance, security, and scalability when creating software systems that meet business requirements and user needs effectively." },
        { level: 32, title: "Data Science", text: "Data science combines statistical analysis, machine learning, and domain expertise to extract meaningful insights from large datasets. Data scientists use various tools and techniques to clean, process, and analyze information, helping organizations make informed decisions based on empirical evidence rather than intuition or guesswork alone." },
        { level: 33, title: "Artificial Intelligence", text: "Artificial intelligence represents a paradigm shift in how we approach problem-solving and automation. Machine learning algorithms can analyze vast datasets to identify patterns and make predictions that would be impossible for humans to detect manually, revolutionizing industries from healthcare to finance and transportation." },
        { level: 34, title: "Cybersecurity", text: "Cybersecurity has become increasingly important as our reliance on digital systems grows. Organizations must implement comprehensive security measures to protect sensitive data, prevent unauthorized access, and maintain system integrity. This includes firewalls, encryption, access controls, regular updates, and employee training programs." },
        { level: 35, title: "Project Management", text: "Effective project management requires careful planning, resource allocation, risk assessment, and stakeholder communication. Project managers must coordinate team efforts, monitor progress, adapt to changing requirements, and ensure deliverables meet quality standards within budget and timeline constraints while maintaining team morale and productivity." },
        { level: 36, title: "Digital Marketing", text: "Digital marketing encompasses various online strategies including search engine optimization, social media marketing, content creation, email campaigns, and paid advertising. Successful digital marketers analyze consumer behavior, track campaign performance, and adjust strategies based on data-driven insights to maximize return on investment." },
        { level: 37, title: "Financial Analysis", text: "Financial analysis involves examining financial statements, market trends, and economic indicators to evaluate investment opportunities and business performance. Analysts use various metrics and ratios to assess profitability, liquidity, and solvency, providing recommendations that guide strategic decision-making and risk management processes." },
        { level: 38, title: "Supply Chain Management", text: "Supply chain management coordinates the flow of goods, services, and information from suppliers to customers. This complex process involves procurement, production, inventory management, logistics, and distribution. Effective supply chain strategies reduce costs, improve efficiency, and enhance customer satisfaction through timely delivery and quality products." },
        { level: 39, title: "Human Resources", text: "Human resources management focuses on recruiting, developing, and retaining talented employees who contribute to organizational success. HR professionals handle compensation, benefits, performance evaluation, training programs, and workplace policies while ensuring compliance with labor laws and promoting positive company culture and employee engagement." },
        { level: 40, title: "Strategic Planning", text: "Strategic planning involves setting long-term organizational goals, analyzing competitive landscapes, and developing comprehensive action plans to achieve sustainable growth. Leaders must consider market conditions, resource constraints, technological changes, and stakeholder expectations when formulating strategies that position their organizations for future success." },
        
        // Level 41-50: Advanced Academic and Professional Content (130-200+ words)
        { level: 41, title: "Research Methodology", text: "Research methodology encompasses the systematic approaches and techniques used to conduct scientific investigations and gather reliable data. Researchers must carefully design studies, select appropriate sampling methods, choose valid measurement instruments, and employ rigorous analytical procedures to ensure their findings are credible, reproducible, and contribute meaningfully to existing knowledge in their respective fields of study." },
        { level: 42, title: "Economic Theory", text: "Economic theory provides frameworks for understanding how individuals, businesses, and governments make decisions about resource allocation in conditions of scarcity. Microeconomic principles examine individual behavior and market dynamics, while macroeconomic concepts address broader issues such as inflation, unemployment, economic growth, and monetary policy that affect entire economies and international trade relationships." },
        { level: 43, title: "International Relations", text: "International relations study the complex interactions between nation-states, international organizations, and non-governmental actors in the global political arena. This field examines diplomacy, conflict resolution, trade agreements, security alliances, and multilateral cooperation efforts that shape world politics and influence domestic policies across different countries and regions worldwide." },
        { level: 44, title: "Biomedical Research", text: "Biomedical research advances our understanding of human health and disease through systematic investigation of biological processes, genetic factors, and therapeutic interventions. Scientists conduct clinical trials, laboratory experiments, and epidemiological studies to develop new treatments, improve diagnostic methods, and identify preventive measures that enhance quality of life and extend human longevity." },
        { level: 45, title: "Environmental Science", text: "Environmental science integrates physical, biological, and social sciences to study environmental problems and develop sustainable solutions. Researchers examine ecosystem dynamics, pollution impacts, climate change effects, and conservation strategies while considering economic, political, and ethical dimensions of environmental challenges that require interdisciplinary approaches and collaborative efforts from multiple stakeholders." },
        { level: 46, title: "Philosophical Inquiry", text: "Philosophical inquiry explores fundamental questions about existence, knowledge, values, reason, mind, and language through critical analysis and logical argumentation. Philosophers examine concepts such as truth, justice, beauty, and meaning while developing systematic theories that help us understand the nature of reality, consciousness, morality, and human experience in all its complexity and diversity." },
        { level: 47, title: "Literary Analysis", text: "Literary analysis involves careful examination of written works to understand their themes, structures, stylistic elements, and cultural significance. Scholars analyze narrative techniques, character development, symbolism, and historical contexts to interpret meaning and evaluate artistic merit while considering how literature reflects and shapes social values, beliefs, and human experiences across different time periods and cultures." },
        { level: 48, title: "Technological Innovation", text: "Technological innovation drives economic growth and social progress by creating new products, services, and processes that improve efficiency and quality of life. Innovation ecosystems involve research institutions, private companies, government agencies, and venture capital firms working together to transform scientific discoveries into practical applications that address real-world challenges and create value for society." },
        { level: 49, title: "Global Governance", text: "Global governance refers to the complex system of institutions, processes, and norms that coordinate international cooperation and address transnational challenges such as climate change, terrorism, pandemics, and economic instability. This involves formal organizations like the United Nations, informal networks, regional bodies, and civil society groups working together to manage global affairs and promote peace, security, and sustainable development." },
        { level: 50, title: "Future Perspectives", text: "The rapid advancement of technology has fundamentally transformed the way we communicate, work, and live our daily lives. From the invention of the printing press to the development of the internet, each technological breakthrough has created new opportunities while simultaneously disrupting existing paradigms. Today's digital revolution continues this tradition, offering unprecedented possibilities for innovation and collaboration across global networks, artificial intelligence systems, and virtual reality environments that will shape the future of human civilization in ways we are only beginning to understand and appreciate." }
      ];
      
      if (lvl <= 50 && lessons[lvl - 1]) {
        const lesson = lessons[lvl - 1];
        return {
          id: lvl,
          level: lvl,
          title: lesson.title,
          difficulty: lvl <= 15 ? "Beginner" : lvl <= 30 ? "Intermediate" : lvl <= 40 ? "Advanced" : "Expert",
          description: `Level ${lvl}: ${lesson.title} - ${lesson.text.split(' ').length} words`,
          text: lesson.text,
          timeLimit: timeLimit,
          targetWPM: targetWPM,
          targetAccuracy: targetAccuracy
        };
      }
      
      // Fallback for any missing levels
      return {
        id: lvl,
        level: lvl,
        title: `Advanced Typing Level ${lvl}`,
        difficulty: "Expert",
        description: `Master level ${lvl} typing challenge`,
        text: `This is level ${lvl} of the typing master challenge. Each level becomes progressively more difficult with longer texts and higher requirements.`,
        timeLimit: Math.max(60 - lvl, 30),
        targetWPM: Math.min(10 + lvl, 60),
        targetAccuracy: Math.min(80 + lvl, 98)
      };
    };
    
    return generateTypingLesson(level);
  };

  // Initialize lesson
  useEffect(() => {
    const lesson = generateLesson(actualLevel);
    setCurrentLesson(lesson);
    setTimeLeft(lesson.timeLimit);
    setUserInput("");
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setGameState('ready');
    setErrors(0);
    setWpm(0);
    setAccuracy(100);
  }, [actualLevel]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0 && gameState === 'typing') {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'typing') {
      setGameState('completed');
      setIsActive(false);
      checkResults();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, gameState]);

  // Calculate WPM and accuracy in real-time
  useEffect(() => {
    if (startTime && userInput.length > 0) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      const wordsTyped = userInput.trim().split(' ').length;
      const currentWpm = Math.round(wordsTyped / timeElapsed) || 0;
      setWpm(currentWpm);

      // Calculate accuracy
      const correctChars = calculateCorrectChars();
      const totalChars = userInput.length;
      const currentAccuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
      setAccuracy(currentAccuracy);
    }
  }, [userInput, startTime]);

  const calculateCorrectChars = (): number => {
    if (!currentLesson) return 0;
    let correct = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === currentLesson.text[i]) {
        correct++;
      }
    }
    return correct;
  };

  const startTyping = () => {
    setGameState('typing');
    setIsActive(true);
    setStartTime(Date.now());
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const pauseTyping = () => {
    setIsActive(false);
    setGameState('ready');
  };

  const resetLesson = () => {
    if (!currentLesson) return;
    setUserInput("");
    setTimeLeft(currentLesson.timeLimit);
    setIsActive(false);
    setGameState('ready');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentLesson || gameState !== 'typing') return;

    const value = e.target.value;
    const lastChar = value[value.length - 1];
    const expectedChar = currentLesson.text[value.length - 1];

    // Prevent typing beyond the text length
    if (value.length > currentLesson.text.length) return;

    // Show pressed key on virtual keyboard
    if (lastChar) {
      setPressedKey(lastChar.toLowerCase());
      setTimeout(() => setPressedKey(""), 200);
    }

    setUserInput(value);

    // Check if lesson is completed
    if (value.length === currentLesson.text.length) {
      setGameState('completed');
      setIsActive(false);
      checkResults();
    }

    // Count errors
    if (lastChar && lastChar !== expectedChar) {
      setErrors(prev => prev + 1);
    }
  };

  // Handle keyboard events for visual feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'typing') {
        setPressedKey(e.key.toLowerCase());
      }
    };

    const handleKeyUp = () => {
      setTimeout(() => setPressedKey(""), 100);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const checkResults = () => {
    if (!currentLesson) return;

    const finalAccuracy = accuracy;
    const finalWpm = wpm;

    // Check if user passed the level
    const passedWpm = finalWpm >= currentLesson.targetWPM;
    const passedAccuracy = finalAccuracy >= currentLesson.targetAccuracy;

    if (passedWpm && passedAccuracy) {
      // Level completed successfully
      setTimeout(() => {
        nextLevel();
      }, 2000);
    } else {
      setGameState('failed');
    }
  };

  const nextLevel = () => {
    const newLevel = actualLevel + 1;
    if (newLevel <= 50) {
      setActualLevel(newLevel);
      onLevelComplete(newLevel);
      
      const nextLesson = generateLesson(newLevel);
      setCurrentLesson(nextLesson);
      setTimeLeft(nextLesson.timeLimit);
      setUserInput("");
      setGameState('ready');
      setIsActive(false);
      setStartTime(null);
      setWpm(0);
      setAccuracy(100);
      setErrors(0);
      setCurrentWordIndex(0);
      setCurrentCharIndex(0);
    } else {
      alert("🎉 Congratulations! You've mastered all 50 typing levels!");
      onExit();
    }
  };

  const renderText = () => {
    if (!currentLesson) return null;

    return currentLesson.text.split('').map((char, index) => {
      let className = "text-lg font-mono ";
      
      if (index < userInput.length) {
        // Already typed
        if (userInput[index] === char) {
          className += "bg-green-200 text-green-800"; // Correct
        } else {
          className += "bg-red-200 text-red-800"; // Error
        }
      } else if (index === userInput.length) {
        // Current character
        className += "bg-blue-200 text-blue-800 animate-pulse";
      } else {
        // Not yet typed
        className += "text-gray-600";
      }

      return (
        <span key={index} className={className}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  if (!currentLesson) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onExit} className="text-gray-700 border-gray-300">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Exit Typing Master
        </Button>
        
        <div className="flex items-center space-x-4">
          <Badge className="bg-green-600 text-white px-4 py-2 text-lg font-bold">
            Level {actualLevel} / 50
          </Badge>
          <Badge className="bg-blue-600 text-white px-3 py-1">
            Typing Master Pro
          </Badge>
          <div className="bg-white px-3 py-1 rounded-lg border">
            <span className="text-gray-600 text-sm">Progress: </span>
            <span className="font-bold text-gray-800">{Math.round((actualLevel / 50) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Time Left</p>
                <p className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-blue-600'}`}>
                  {timeLeft}s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Keyboard className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Speed (WPM)</p>
                <p className="text-2xl font-bold text-green-600">{wpm}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold text-purple-600">{accuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">{errors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Info */}
      <Card className="mb-6 bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-green-500" />
            <span>{currentLesson.title}</span>
            <Badge className={
              currentLesson.difficulty === "Beginner" ? "bg-green-100 text-green-800" :
              currentLesson.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-800" :
              currentLesson.difficulty === "Advanced" ? "bg-orange-100 text-orange-800" :
              "bg-red-100 text-red-800"
            }>
              {currentLesson.difficulty}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{currentLesson.description}</p>
          <div className="flex space-x-4 text-sm text-gray-500">
            <span>Target Speed: {currentLesson.targetWPM} WPM</span>
            <span>Target Accuracy: {currentLesson.targetAccuracy}%</span>
            <span>Time Limit: {currentLesson.timeLimit}s</span>
          </div>
        </CardContent>
      </Card>

      {/* Typing Area */}
      <Card className="mb-6 bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Typing Practice</span>
            <div className="flex space-x-2">
              {gameState === 'ready' && (
                <Button onClick={startTyping} className="bg-green-600 hover:bg-green-700">
                  <Play className="mr-2 h-4 w-4" />
                  Start Typing
                </Button>
              )}
              {gameState === 'typing' && (
                <Button onClick={pauseTyping} variant="outline">
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button onClick={resetLesson} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Text to type */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 min-h-[120px]">
            <div className="leading-relaxed">
              {renderText()}
            </div>
          </div>

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            disabled={gameState !== 'typing'}
            className="w-full p-4 text-lg font-mono border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder={gameState === 'ready' ? "Click 'Start Typing' to begin..." : "Type the text above..."}
          />

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{userInput.length} / {currentLesson.text.length} characters</span>
            </div>
            <Progress 
              value={(userInput.length / currentLesson.text.length) * 100} 
              className="h-2"
            />
          </div>

          {/* Game State Messages */}
          {gameState === 'completed' && wpm >= currentLesson.targetWPM && accuracy >= currentLesson.targetAccuracy && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-bold text-green-700">🎉 Excellent Typing!</span>
              </div>
              <p className="text-green-600 mb-2">
                Congratulations! You completed this lesson successfully!
              </p>
              <div className="text-sm text-green-600 space-y-1">
                <p>✅ Speed: {wpm} WPM (Target: {currentLesson.targetWPM} WPM)</p>
                <p>✅ Accuracy: {accuracy}% (Target: {currentLesson.targetAccuracy}%)</p>
                <p>✅ Ready for next level!</p>
              </div>
            </div>
          )}

          {gameState === 'failed' && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-bold text-red-700">Practice More Needed</span>
              </div>
              <p className="text-red-600 mb-2">
                Keep practicing! You need to meet both speed and accuracy targets.
              </p>
              <div className="text-sm text-red-600 space-y-1">
                <p>Speed: {wpm} WPM (Need: {currentLesson.targetWPM} WPM)</p>
                <p>Accuracy: {accuracy}% (Need: {currentLesson.targetAccuracy}%)</p>
              </div>
              <Button onClick={resetLesson} className="mt-3 bg-orange-600 hover:bg-orange-700">
                🔄 Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Virtual Keyboard */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Keyboard className="h-5 w-5 text-blue-500" />
            <span>Interactive Keyboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            {/* Top Row */}
            <div className="flex justify-center mb-2 space-x-1">
              {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map(key => (
                <div
                  key={key}
                  className={`w-8 h-8 flex items-center justify-center rounded border font-mono text-sm font-bold transition-all duration-150 ${
                    pressedKey === key 
                      ? 'bg-blue-500 text-white border-blue-600 shadow-lg transform scale-110' 
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {key.toUpperCase()}
                </div>
              ))}
            </div>
            
            {/* Home Row */}
            <div className="flex justify-center mb-2 space-x-1">
              {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'].map(key => (
                <div
                  key={key}
                  className={`w-8 h-8 flex items-center justify-center rounded border font-mono text-sm font-bold transition-all duration-150 ${
                    pressedKey === key 
                      ? 'bg-green-500 text-white border-green-600 shadow-lg transform scale-110' 
                      : 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                  }`}
                >
                  {key === ';' ? ';' : key.toUpperCase()}
                </div>
              ))}
            </div>
            
            {/* Bottom Row */}
            <div className="flex justify-center mb-4 space-x-1">
              {['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'].map(key => (
                <div
                  key={key}
                  className={`w-8 h-8 flex items-center justify-center rounded border font-mono text-sm font-bold transition-all duration-150 ${
                    pressedKey === key 
                      ? 'bg-purple-500 text-white border-purple-600 shadow-lg transform scale-110' 
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {[',', '.', '/'].includes(key) ? key : key.toUpperCase()}
                </div>
              ))}
            </div>
            
            {/* Spacebar */}
            <div className="flex justify-center mb-4">
              <div
                className={`w-48 h-8 flex items-center justify-center rounded border font-mono text-sm font-bold transition-all duration-150 ${
                  pressedKey === ' ' 
                    ? 'bg-yellow-500 text-white border-yellow-600 shadow-lg transform scale-105' 
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                SPACEBAR
              </div>
            </div>
            
            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="inline-block w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></span>Home Row (Base Position)</p>
              <p><span className="inline-block w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></span>Top Row</p>
              <p><span className="inline-block w-4 h-4 bg-purple-100 border border-purple-300 rounded mr-2"></span>Bottom Row</p>
              <p className="mt-2 font-semibold">Watch the keys light up as you type!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
