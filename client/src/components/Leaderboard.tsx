import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LeaderboardEntry } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrophyIcon, MedalIcon, Award, Map, MapPin, Globe2, Users } from 'lucide-react';

export default function Leaderboard() {
  const [leaderboardType, setLeaderboardType] = useState<'global' | 'country' | 'region'>('global');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Default to user ID 1 for this demo
  const userId = 1;

  // Fetch leaderboard data based on type
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await apiRequest<LeaderboardEntry[]>(`/api/leaderboard/${leaderboardType}`, {
          method: "GET"
        });
        setLeaderboardData(data);

        // Get user's rank
        const rankData = await apiRequest<{rank: number}>(`/api/leaderboard/user/${userId}/${leaderboardType}`, {
          method: "GET"
        });
        setUserRank(rankData.rank);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        toast({
          title: "Error",
          description: "Failed to load leaderboard data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [leaderboardType, toast]);

  // Get appropriate icon for rank
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <TrophyIcon className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <MedalIcon className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return <span className="ml-1 text-gray-400">#{rank}</span>;
  };

  // Get badge color based on user level
  const getLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'bronze':
        return <Badge className="bg-amber-700 hover:bg-amber-800">{level}</Badge>;
      case 'silver':
        return <Badge className="bg-gray-400 hover:bg-gray-500">{level}</Badge>;
      case 'gold':
        return <Badge className="bg-yellow-400 hover:bg-yellow-500 text-black">{level}</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };
  
  // Get icon for leaderboard type
  const getTypeIcon = () => {
    switch (leaderboardType) {
      case 'global':
        return <Globe2 className="h-5 w-5 mr-2" />;
      case 'country':
        return <Map className="h-5 w-5 mr-2" />;
      case 'region':
        return <MapPin className="h-5 w-5 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="glass-panel neomorphic rounded-xl p-6 relative overflow-hidden w-full">
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-600/10 blur-2xl" />
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-white flex items-center">
            {getTypeIcon()} Leaderboard
          </h2>
          <p className="text-gray-400 text-sm">
            Compete with others and climb the ranks!
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Select
            value={leaderboardType}
            onValueChange={(value) => setLeaderboardType(value as any)}
          >
            <SelectTrigger className="w-[180px] bg-black/40 border-purple-900/50">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-purple-800">
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="country">Country</SelectItem>
              <SelectItem value="region">Regional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {userRank !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 p-4 rounded-lg bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-purple-700/30"
        >
          <h3 className="text-lg font-medium text-white mb-2">Your Ranking</h3>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="font-bold text-3xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                #{userRank}
              </span>
              <span className="ml-3 text-gray-300">
                {leaderboardType === 'global' ? 'Globally' : 
                 leaderboardType === 'country' ? 'In Your Country' : 'In Your Region'}
              </span>
            </div>
            <Button 
              variant="outline" 
              className="border-purple-700 bg-purple-950/30 hover:bg-purple-900/40"
            >
              <Users className="mr-2 h-4 w-4" />
              View Nearby
            </Button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-purple-900/40 bg-black/20">
          <table className="min-w-full divide-y divide-purple-900/40">
            <thead className="bg-black/30">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Level
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/40 bg-black/10">
              {leaderboardData.map((entry, index) => (
                <motion.tr 
                  key={entry.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={entry.userId === userId ? "bg-purple-900/30" : ""}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankIcon(entry.rank)}
                      {entry.rank > 3 && <span className="text-gray-400">#{entry.rank}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">{entry.username}</p>
                        <p className="text-xs text-gray-400">
                          {entry.region ? entry.region : entry.country ? entry.country : "Global"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getLevelBadge(entry.level)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="font-mono font-semibold text-white">{entry.score.toLocaleString()}</span>
                    <span className="text-xs text-purple-400 ml-1">pts</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}