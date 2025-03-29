import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

type LeaderboardEntry = {
  userId: number;
  username: string;
  score: number;
  level: string;
  region?: string;
  country?: string;
  rank: number;
};

export default function Leaderboard() {
  const [leaderboardType, setLeaderboardType] = useState<"global" | "country" | "region">("global");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiRequest(`/api/leaderboard/${leaderboardType}?limit=10`, {
          method: "GET",
        });
        setEntries(data);
        
        // For demo purposes, fetch rank for user ID 1
        try {
          const rankData = await apiRequest(`/api/leaderboard/user/1/${leaderboardType}`, {
            method: "GET",
          });
          if (rankData && rankData.rank) {
            setUserRank(rankData.rank);
          }
        } catch (err) {
          console.error("Could not fetch user rank:", err);
          setUserRank(null);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setError("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [leaderboardType]);

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "bronze":
        return "text-amber-600 bg-amber-100 border-amber-300";
      case "silver":
        return "text-slate-600 bg-slate-100 border-slate-300";
      case "gold":
        return "text-yellow-600 bg-yellow-100 border-yellow-300";
      case "platinum":
        return "text-emerald-600 bg-emerald-100 border-emerald-300";
      case "diamond":
        return "text-sky-600 bg-sky-100 border-sky-300";
      default:
        return "text-gray-600 bg-gray-100 border-gray-300";
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-slate-400";
    if (rank === 3) return "text-amber-600";
    return "text-gray-500";
  };

  return (
    <motion.div
      className="w-full rounded-xl glass-panel neomorphic p-6 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Leaderboard</h2>
        <Tabs
          defaultValue="global"
          value={leaderboardType}
          onValueChange={(value) => setLeaderboardType(value as "global" | "country" | "region")}
          className="ml-auto"
        >
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="country">Country</TabsTrigger>
            <TabsTrigger value="region">Region</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {userRank !== null && (
        <div className="relative p-3 mb-4 rounded-lg bg-gray-800/30 border border-gray-700 text-center">
          <span className="text-sm text-gray-400">Your Rank</span>
          <div className="text-2xl font-bold text-white">{userRank}</div>
          <div className="absolute top-1 right-1">
            <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-600">
              {leaderboardType}
            </Badge>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-400">Loading leaderboard data...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-400">{error}</div>
      ) : entries.length === 0 ? (
        <div className="py-8 text-center text-gray-400">No leaderboard entries found</div>
      ) : (
        <div className="space-y-3 mt-4">
          {entries.map((entry, index) => (
            <motion.div
              key={`${entry.userId}-${index}`}
              className="relative flex items-center p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className={cn("w-8 h-8 flex items-center justify-center font-bold rounded-full mr-3", getRankColor(entry.rank))}>
                {entry.rank}
              </div>
              <div>
                <h3 className="font-semibold text-white">{entry.username}</h3>
                <div className="text-sm text-gray-400">
                  {entry.region && entry.region !== "Global" && (
                    <span className="mr-2">{entry.region}</span>
                  )}
                  {entry.country && entry.country !== "Global" && (
                    <span>{entry.country}</span>
                  )}
                </div>
              </div>
              <div className="ml-auto flex flex-col items-end">
                <span className="text-lg font-bold text-purple-400">{entry.score} pts</span>
                <Badge variant="outline" className={cn("text-xs", getLevelColor(entry.level))}>
                  {entry.level}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}