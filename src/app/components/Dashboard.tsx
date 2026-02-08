import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Timer,
  Plus,
  Play,
  Square,
  LogOut,
  Trophy,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  LayoutGrid,
  CalendarDays,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { getTasks, getSessions, setCurrentUser } from '../utils/storage';
import type { User, Task, Session } from '../utils/storage';
import { calculateTodayTime, calculateWeekTime, calculateTaskTime } from '../utils/timeCalculations';
import { TaskCard } from './TaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';
import { StatsCard } from './StatsCard';
import { Leaderboard } from './Leaderboard';
import { DailyTimelineView } from './DailyTimelineView';
import { PomodoroTimer } from './PomodoroTimer';
import { ToDoList } from './ToDoList';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState<'tasks' | 'timeline'>('tasks');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Load tasks and sessions
  useEffect(() => {
    const loadedTasks = getTasks(user.id);
    const loadedSessions = getSessions(undefined, user.id);
    setTasks(loadedTasks);
    setSessions(loadedSessions);
  }, [user.id, refreshTrigger]);

  // Calculate stats
  const todayTime = calculateTodayTime(sessions);
  const weekTime = calculateWeekTime(sessions);
  const totalTime = calculateTaskTime(sessions);
  const activeTasks = tasks.length;

  const handleLogout = () => {
    setCurrentUser(null);
    onLogout();
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.05, 0.03],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.03, 0.05, 0.03],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-500 to-pink-600 blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-2xl sticky top-0 z-50 shadow-xl shadow-black/20"
      >
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/20"
              >
                <Timer className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  StudyTrack Pro
                </h1>
                <p className="text-sm text-gray-400">Welcome back, <span className="text-blue-400 font-medium">{user.username}</span></p>
              </div>
            </motion.div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <StatsCard
            icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
            label="Today"
            value={todayTime}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatsCard
            icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
            label="This Week"
            value={weekTime}
            gradient="from-purple-500 to-pink-500"
          />
          <StatsCard
            icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
            label="All Time"
            value={totalTime}
            gradient="from-orange-500 to-red-500"
          />
          <StatsCard
            icon={<Target className="w-4 h-4 sm:w-5 sm:h-5" />}
            label="Active Tasks"
            value={activeTasks}
            isCount
            gradient="from-green-500 to-emerald-500"
          />
        </motion.div>

        {/* View Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="inline-flex gap-1 sm:gap-2 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800/50 backdrop-blur-xl shadow-lg">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView('tasks')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base ${
                activeView === 'tasks'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Tasks</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView('timeline')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base ${
                activeView === 'timeline'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Timeline</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Main Grid Layout - Premium 3-Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column - Pomodoro Timer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 order-1"
          >
            <PomodoroTimer userId={user.id} />
          </motion.div>

          {/* Center Column - Tasks/Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-6 order-3 lg:order-2 h-full flex flex-col"
          >
            <AnimatePresence mode="wait">
              {activeView === 'tasks' ? (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 backdrop-blur-xl rounded-3xl p-6 border border-zinc-800/50 shadow-2xl h-full flex flex-col relative overflow-hidden"
                >
                  {/* Decorative background */}
                  <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-500 opacity-10 blur-3xl rounded-full pointer-events-none" />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3 flex-none">
                      <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                        Your Tasks
                      </h2>
                      <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                      >
                        <Plus className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">New Task</span>
                      </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      {tasks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4 border border-zinc-800"
                          >
                            <Timer className="w-10 h-10 text-gray-600" />
                          </motion.div>
                          <h3 className="text-xl font-medium mb-2 text-gray-300">No tasks yet</h3>
                          <p className="text-gray-500 mb-6">
                            Create your first study task to start tracking
                          </p>
                          <Button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 rounded-xl shadow-lg"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Task
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4 pb-4">
                          <AnimatePresence mode="popLayout">
                            {tasks.map((task, index) => (
                              <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                transition={{ 
                                  delay: index * 0.05,
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 30
                                }}
                              >
                                <TaskCard
                                  task={task}
                                  sessions={sessions.filter((s) => s.taskId === task.id)}
                                  onRefresh={handleRefresh}
                                />
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <DailyTimelineView userId={user.id} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column - Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 order-2 lg:order-3"
          >
            <Leaderboard currentUserId={user.id} />
          </motion.div>
        </div>
      </main>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        userId={user.id}
        onTaskCreated={handleRefresh}
      />
    </div>
  );
}