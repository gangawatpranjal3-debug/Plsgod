import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Award, Circle, Play } from 'lucide-react';
import { users, sessions, tasks, isUserOnline } from '../utils/api';
import type { User, Session, Task } from '../utils/api';
import { calculateTaskTime, formatTime } from '../utils/timeCalculations';
import { UserDetailsDialog } from './UserDetailsDialog';
import { Badge } from './ui/badge';

interface LeaderboardProps {
  currentUserId: string;
}

interface UserStats {
  user: User;
  totalTime: number;
  rank: number;
  isOnline: boolean;
  currentTask: Task | null;
}

export function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        // Fetch all data from backend
        const allUsers = await users.getAll();
        const allSessions = await sessions.getByUserId(''); // Empty string returns all
        const allTasks = await tasks.getAll();

        // For each user, calculate stats
        const stats: UserStats[] = allUsers.map((user) => {
          const userSessions = allSessions.filter((s: Session) => s.userId === user.id);
          const totalTime = calculateTaskTime(userSessions);
          
          // Check if user has an active session
          const activeSession = userSessions.find((s: Session) => s.endTime === null);
          const hasActiveSession = !!activeSession;
          
          // Also check last active time (within 5 minutes)
          const isRecentlyActive = isUserOnline(user.lastActive);
          const isOnline = hasActiveSession || isRecentlyActive;
          
          // Get current task
          let currentTask: Task | null = null;
          if (activeSession) {
            currentTask = allTasks.find((t: Task) => t.id === activeSession.taskId) || null;
          }

          return { user, totalTime, rank: 0, isOnline, currentTask };
        });
        
        // Sort by total time and assign ranks
        const rankedStats = stats
          .sort((a, b) => b.totalTime - a.totalTime)
          .map((stat, index) => ({ ...stat, rank: index + 1 }));

        setLeaderboard(rankedStats);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
    
    // Refresh every 10 seconds to update online status and rankings
    const interval = setInterval(loadLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-400" />;
      default:
        return null;
    }
  };

  const getRankGradient = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500 to-orange-500';
      case 2:
        return 'from-gray-400 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-zinc-700 to-zinc-800';
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 backdrop-blur-xl rounded-3xl p-6 border border-zinc-800/50 shadow-2xl overflow-hidden h-full"
      >
        {/* Decorative background */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-yellow-500 to-orange-500 opacity-10 blur-3xl rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20"
            >
              <Trophy className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                Leaderboard
              </h2>
              <p className="text-xs text-gray-500">Top performers</p>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mx-auto mb-3 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full"
                />
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No data yet</p>
              </div>
            ) : (
              leaderboard.map((stat, index) => (
                <motion.div
                  key={stat.user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUserClick(stat.user)}
                  className={`group relative flex items-center gap-3 p-4 rounded-2xl transition-all cursor-pointer border ${
                    stat.user.id === currentUserId
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : stat.isOnline
                      ? 'bg-gradient-to-r from-green-500/5 to-emerald-500/5 border-green-500/20 hover:border-green-500/40 shadow-lg hover:shadow-green-500/10'
                      : 'bg-zinc-800/30 border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700'
                  }`}
                >
                  {/* Rank Badge */}
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRankGradient(
                      stat.rank
                    )} flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0`}
                  >
                    {getRankIcon(stat.rank) || stat.rank}
                  </motion.div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate flex items-center gap-2 mb-1">
                      <span className="text-white">{stat.user.username}</span>
                      {stat.user.id === currentUserId && (
                        <Badge className="bg-blue-500 text-white text-xs border-0">
                          You
                        </Badge>
                      )}
                      {stat.isOnline && (
                        <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10 text-xs">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-1" />
                          Online
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 font-mono font-medium">
                      {formatTime(stat.totalTime)}
                    </div>
                    {stat.isOnline && stat.currentTask && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center gap-1.5 text-xs text-green-400 mt-2 bg-green-500/10 px-2 py-1 rounded-lg"
                      >
                        <Play className="w-3 h-3" />
                        <span className="truncate">{stat.currentTask.name}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Hover arrow indicator */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="text-gray-500 group-hover:text-white transition-colors"
                  >
                    →
                  </motion.div>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800/50 text-xs text-gray-500 text-center">
            Click on any user to see detailed stats
          </div>
        </div>
      </motion.div>

      {/* User Details Dialog */}
      <UserDetailsDialog
        user={selectedUser}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </>
  );
}