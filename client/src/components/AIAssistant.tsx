import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, Clock, Lightbulb, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Tip = {
  id: number;
  type: "productivity" | "time" | "motivation";
  text: string;
};

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

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTips, setCurrentTips] = useState<Tip[]>([]);

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

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
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
            className="fixed bottom-24 right-6 w-80 z-40"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="glass-panel border-none overflow-hidden">
              <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mr-3">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Ideas Cloud</h3>
                    <p className="text-xs text-gray-400">AI productivity assistant</p>
                  </div>
                </div>
              </div>

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
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}