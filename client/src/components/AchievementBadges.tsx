import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

type Achievement = {
  id: number;
  name: string;
  description: string;
  icon: string;
  points: number;
  requirement: number;
  category: string;
};

export default function AchievementBadges({ userId = 1 }: { userId?: number }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch achievements data
  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all possible achievements
        const allAchievements = await apiRequest("/api/achievements", {
          method: "GET",
        });
        setAchievements(allAchievements);
        
        // Fetch user's earned achievements
        const userEarnedAchievements = await apiRequest(`/api/achievements/user/${userId}`, {
          method: "GET",
        });
        setUserAchievements(userEarnedAchievements);
      } catch (err) {
        console.error("Failed to fetch achievements:", err);
        setError("Failed to load achievements data");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

  // Check if user has earned a specific achievement
  const hasEarnedAchievement = (achievementId: number) => {
    return userAchievements.some(ua => ua.id === achievementId);
  };

  // Get background color based on achievement category
  const getAchievementColor = (category: string, earned: boolean) => {
    if (!earned) return "bg-gray-800/30 border-gray-700/50 opacity-50";
    
    switch (category.toLowerCase()) {
      case "completion":
        return "bg-emerald-900/20 border-emerald-700/50";
      case "streak":
        return "bg-amber-900/20 border-amber-700/50";
      case "priority":
        return "bg-red-900/20 border-red-700/50";
      default:
        return "bg-blue-900/20 border-blue-700/50";
    }
  };

  // Get glow color based on achievement category
  const getGlowColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "completion":
        return "0 0 15px rgba(16, 185, 129, 0.5)";
      case "streak":
        return "0 0 15px rgba(245, 158, 11, 0.5)";
      case "priority":
        return "0 0 15px rgba(239, 68, 68, 0.5)";
      default:
        return "0 0 15px rgba(59, 130, 246, 0.5)";
    }
  };

  return (
    <motion.div
      className="w-full rounded-xl glass-panel neomorphic p-6 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold text-white mb-4">Achievements</h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center p-3 rounded-lg border border-gray-700/50">
              <Skeleton className="h-12 w-12 rounded-full mr-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-400">{error}</div>
      ) : achievements.length === 0 ? (
        <div className="py-8 text-center text-gray-400">No achievements available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => {
            const earned = hasEarnedAchievement(achievement.id);
            return (
              <motion.div
                key={achievement.id}
                className={cn(
                  "relative flex items-center p-4 rounded-lg border transition-all", 
                  getAchievementColor(achievement.category, earned)
                )}
                style={{
                  boxShadow: earned ? getGlowColor(achievement.category) : "none"
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: earned ? 1.03 : 1 }}
              >
                <div 
                  className={cn(
                    "w-12 h-12 flex items-center justify-center text-2xl rounded-full mr-3",
                    earned ? "opacity-100" : "opacity-50"
                  )}
                >
                  {achievement.icon}
                </div>
                <div>
                  <h3 className={cn("font-semibold", earned ? "text-white" : "text-gray-400")}>
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-gray-400">{achievement.description}</p>
                </div>
                {earned && (
                  <Badge className="absolute top-2 right-2 bg-purple-500/30 text-purple-300 border-purple-600">
                    +{achievement.points} pts
                  </Badge>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}