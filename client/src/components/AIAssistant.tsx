import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  X, 
  Clock, 
  Lightbulb, 
  CheckCircle2,
  MessageSquare, 
  BarChart, 
  Calendar as CalendarIcon, 
  Zap,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useTasks } from "@/hooks/use-tasks";

type Tip = {
  id: number;
  type: "productivity" | "time" | "motivation";
  text: string;
};

type AIMessage = {
  id: string;
  type: "user" | "ai";
  text: string;
  timestamp: Date;
};

// Productivity tips
const tips: Tip[] = [
  {
    id: 1,
    type: "productivity",
    text: "Try the Pomodoro Technique: 25 minutes of focused work followed by a 5-minute break."
  },
  {
    id: 2,
    type: "time",
    text: "Group similar tasks together to minimize context switching and maximize efficiency."
  },
  {
    id: 3,
    type: "motivation",
    text: "Completed tasks release dopamine! Break large projects into smaller, achievable tasks."
  },
  {
    id: 4,
    type: "productivity",
    text: "Set your Most Important Tasks (MITs) at the beginning of each day for better focus."
  },
  {
    id: 5,
    type: "time",
    text: "Block time on your calendar for deep work sessions with no distractions."
  },
  {
    id: 6,
    type: "motivation",
    text: "Visualize your progress with the task completion chart to stay motivated."
  },
  {
    id: 7,
    type: "productivity",
    text: "Use the 2-minute rule: If a task takes less than 2 minutes, do it immediately."
  },
  {
    id: 8,
    type: "time",
    text: "Schedule your most challenging tasks when your energy levels are highest."
  }
];

// AI responses for specific keywords
const aiResponses = [
  {
    keywords: ["procrastinate", "procrastination", "delay", "putting off"],
    response: "Procrastination often happens when tasks feel overwhelming. Try breaking your tasks into smaller steps and commit to just working on the first step for 5 minutes."
  },
  {
    keywords: ["focus", "concentrate", "distracted", "attention"],
    response: "To improve focus, try the Pomodoro technique (25 minutes of focused work, 5-minute break), put your phone on DND mode, and use apps that block distracting websites during work sessions."
  },
  {
    keywords: ["stress", "overwhelm", "burnout", "anxious"],
    response: "When feeling overwhelmed, try priority mapping: list all tasks, mark what's urgent vs. important, and focus on the urgent-important quadrant first. Also build in short breaks to practice deep breathing."
  },
  {
    keywords: ["morning", "routine", "productive day", "start day"],
    response: "A productive morning routine might include: setting 3 MIT (Most Important Tasks), avoiding email for the first hour, and tackling your hardest task when your energy is highest, usually in the morning."
  },
  {
    keywords: ["meeting", "meetings", "call", "conference"],
    response: "Make meetings more productive by always having an agenda, setting a timer, and ending with clear action items assigned to specific people with deadlines."
  },
  {
    keywords: ["tired", "energy", "exhausted", "fatigue"],
    response: "To combat fatigue, try taking short 10-minute walks, doing desk stretches between tasks, staying hydrated, and scheduling challenging tasks during your natural energy peaks."
  }
];

// Generate a random ID for messages
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTips, setCurrentTips] = useState<Tip[]>([]);
  const [activeTab, setActiveTab] = useState("ideas");
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: generateId(),
      type: "ai",
      text: "Hi there! I'm your TaskFlow AI Assistant. How can I help you with your productivity today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { tasks = [], stats = { totalTasks: 0, dueToday: 0, completed: 0, highPriority: 0 } } = useTasks();

  // Reposition the floating button to avoid overlapping
  const buttonPosition = "fixed top-20 right-6 z-50";
  
  const toggleAssistant = () => {
    if (!isOpen) {
      // Generate 3 random tips when opening
      const randomTips = [...tips]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setCurrentTips(randomTips);
    }
    setIsOpen(!isOpen);
  };

  const getIconForTipType = (type: Tip["type"]) => {
    switch (type) {
      case "productivity":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "time":
        return <Clock className="h-4 w-4 text-blue-400" />;
      case "motivation":
        return <Lightbulb className="h-4 w-4 text-yellow-400" />;
    }
  };

  // Process user message and generate AI response
  const processUserMessage = (userMessage: string) => {
    // Add user message
    const userMsg: AIMessage = {
      id: generateId(),
      type: "user",
      text: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    
    // Find a matching response based on keywords
    let aiResponseText = "I'll help you optimize your workflow. Could you tell me more about your specific productivity challenge?";
    
    // Check for task-related queries
    if (userMessage.toLowerCase().includes("how many tasks")) {
      aiResponseText = `You currently have ${stats.totalTasks} total tasks, with ${stats.dueToday} due today and ${stats.completed} already completed.`;
    } 
    // Check for high priority task question
    else if (userMessage.toLowerCase().includes("high priority") || userMessage.toLowerCase().includes("urgent")) {
      aiResponseText = `You have ${stats.highPriority} high priority tasks. Remember to address these first for optimal productivity.`;
    }
    // Check if asking about most pressing task
    else if (userMessage.toLowerCase().includes("next task") || userMessage.toLowerCase().includes("what should i do")) {
      if (tasks.length > 0) {
        const incompleteTasks = tasks.filter(t => t.status !== "complete");
        if (incompleteTasks.length > 0) {
          const highPriorityTasks = incompleteTasks.filter(t => t.priority === "high");
          if (highPriorityTasks.length > 0) {
            aiResponseText = `I recommend focusing on "${highPriorityTasks[0].title}" next, as it's marked as high priority.`;
          } else {
            aiResponseText = `I suggest working on "${incompleteTasks[0].title}" next.`;
          }
        } else {
          aiResponseText = "Great job! You've completed all your tasks. Consider adding new ones or taking a well-deserved break.";
        }
      }
    }
    // Check for keyword matches
    else {
      for (const response of aiResponses) {
        const hasMatch = response.keywords.some(keyword => 
          userMessage.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (hasMatch) {
          aiResponseText = response.response;
          break;
        }
      }
    }
    
    // Add AI response after a small delay to simulate thinking
    setTimeout(() => {
      const aiMsg: AIMessage = {
        id: generateId(),
        type: "ai",
        text: aiResponseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      
      // Scroll to the bottom of messages
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 800);
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      processUserMessage(inputMessage);
      setInputMessage("");
    }
  };

  // Handle pressing Enter to send
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating button - repositioned */}
      <div className={buttonPosition}>
        <motion.button
          className={`rounded-full p-3.5 flex items-center justify-center ${
            isOpen
              ? "bg-gray-700 text-gray-300"
              : "bg-gradient-to-r from-blue-600 to-purple-600 neon-border"
          }`}
          onClick={toggleAssistant}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Brain className="h-6 w-6 text-white" />
          )}
        </motion.button>
      </div>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-20 right-6 w-80 z-40"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="glass-panel border-none overflow-hidden">
              <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mr-3">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">TaskFlow AI</h3>
                      <p className="text-xs text-gray-400">Your productivity partner</p>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b border-gray-700">
                  <TabsList className="w-full bg-transparent border-b border-gray-700 rounded-none h-auto p-0">
                    <TabsTrigger 
                      value="ideas" 
                      className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 py-2"
                    >
                      <Lightbulb className="h-4 w-4 mr-1" />
                      Ideas
                    </TabsTrigger>
                    <TabsTrigger 
                      value="chat" 
                      className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-400 py-2"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger 
                      value="insights" 
                      className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-pink-400 data-[state=active]:border-b-2 data-[state=active]:border-pink-400 py-2"
                    >
                      <BarChart className="h-4 w-4 mr-1" />
                      Insights
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="ideas" className="m-0">
                  <div className="p-4 max-h-80 overflow-y-auto">
                    <div className="space-y-3">
                      {currentTips.map((tip) => (
                        <motion.div
                          key={tip.id}
                          className="p-3 rounded-lg neomorphic"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex">
                            <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center mr-2 flex-shrink-0">
                              {getIconForTipType(tip.type)}
                            </div>
                            <p className="text-sm text-gray-300">{tip.text}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 border-none"
                        onClick={() => {
                          const newTips = [...tips]
                            .sort(() => 0.5 - Math.random())
                            .slice(0, 3);
                          setCurrentTips(newTips);
                        }}
                      >
                        Get New Ideas
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="chat" className="m-0 flex flex-col h-80">
                  <div className="flex-1 p-3 overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`mb-3 flex ${
                          message.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === "user"
                              ? "bg-blue-600 text-white ml-auto"
                              : "neomorphic text-gray-200"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-3 border-t border-gray-700">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex items-center gap-2"
                    >
                      <Input
                        placeholder="Ask me anything about productivity..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-gray-800 border-gray-700 text-white"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="shrink-0 bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="m-0">
                  <div className="p-4 max-h-80 overflow-y-auto">
                    <div className="glass-panel rounded-lg p-3 mb-3">
                      <div className="flex items-center mb-2">
                        <CalendarIcon className="text-blue-400 h-4 w-4 mr-2" />
                        <h4 className="text-sm font-medium text-white">Daily Analysis</h4>
                      </div>
                      <p className="text-xs text-gray-300">
                        Your most productive day is Thursday. Consider scheduling important tasks for that day.
                      </p>
                    </div>

                    <div className="glass-panel rounded-lg p-3 mb-3">
                      <div className="flex items-center mb-2">
                        <Clock className="text-purple-400 h-4 w-4 mr-2" />
                        <h4 className="text-sm font-medium text-white">Time Patterns</h4>
                      </div>
                      <p className="text-xs text-gray-300">
                        You tend to complete most tasks between 10 AM and 12 PM. This might be your peak focus period.
                      </p>
                    </div>

                    <div className="glass-panel rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <Zap className="text-yellow-400 h-4 w-4 mr-2" />
                        <h4 className="text-sm font-medium text-white">Task Optimization</h4>
                      </div>
                      <p className="text-xs text-gray-300">
                        Breaking down large tasks has improved your completion rate by 27% this week.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}