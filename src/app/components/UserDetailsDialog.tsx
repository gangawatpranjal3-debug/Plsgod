import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, TrendingUp, Clock, Trophy, Play, Square, Coffee } from 'lucide-react';
import { format, startOfDay, subDays, isWithinInterval } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { getSessions, getTasks } from '../utils/storage';
import type { User, Session, Task } from '../utils/storage';
import { formatTime, calculateTaskTime } from '../utils/timeCalculations';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DayData {
  date: string;
  minutes: number;
  sessions: number;
}

interface TaskData {
  name: string;
  minutes: number;
}

interface TimelineEntry {
  type: 'start' | 'end';
  time: Date;
  session: Session;
  task: Task | undefined;
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  const [dailyData, setDailyData] = useState<DayData[]>([]);
  const [taskData, setTaskData] = useState<TaskData[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');

  useEffect(() => {
    if (!user) return;

    const sessions = getSessions(undefined, user.id);
    const tasks = getTasks(user.id);
    
    // Calculate total stats
    const total = calculateTaskTime(sessions);
    const completedSessions = sessions.filter(s => s.endTime !== null);
    setTotalTime(total);
    setTotalSessions(completedSessions.length);

    // Prepare daily data for last 14 days
    const days: DayData[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const daySessions = sessions.filter(s => {
        if (!s.endTime) return false;
        const sessionDate = new Date(s.startTime);
        return isWithinInterval(sessionDate, { start: dayStart, end: dayEnd });
      });

      const dayMinutes = daySessions.reduce((sum, s) => sum + s.duration, 0);

      days.push({
        date: format(date, 'MMM d'),
        minutes: dayMinutes,
        sessions: daySessions.length,
      });
    }
    setDailyData(days);

    // Prepare task data
    const taskMap = new Map<string, number>();
    sessions.forEach(session => {
      const task = tasks.find(t => t.id === session.taskId);
      const taskName = task?.name || 'Unknown Task';
      taskMap.set(taskName, (taskMap.get(taskName) || 0) + session.duration);
    });

    const taskArray: TaskData[] = Array.from(taskMap.entries())
      .map(([name, minutes]) => ({ name, minutes }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);
    
    setTaskData(taskArray);

    // Prepare timeline entries
    const allEntries: TimelineEntry[] = [];
    sessions.forEach((session) => {
      const task = tasks.find((t) => t.id === session.taskId);
      
      allEntries.push({
        type: 'start',
        time: new Date(session.startTime),
        session,
        task,
      });
      
      if (session.endTime) {
        allEntries.push({
          type: 'end',
          time: new Date(session.endTime),
          session,
          task,
        });
      }
    });

    // Sort by time (newest first)
    allEntries.sort((a, b) => b.time.getTime() - a.time.getTime());
    setTimelineEntries(allEntries);
  }, [user]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white rounded-3xl max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            {user.username}'s Study Stats
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            View detailed statistics and activity history for {user.username}.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'timeline')} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="overview">Overview & Graphs</TabsTrigger>
            <TabsTrigger value="timeline">Detailed Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">Total Time</span>
                </div>
                <div className="text-2xl font-semibold">{formatTime(totalTime)}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-purple-400 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">Sessions</span>
                </div>
                <div className="text-2xl font-semibold">{totalSessions}</div>
              </div>
            </div>

            {/* Daily Activity Chart */}
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Last 14 Days Activity
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#71717a"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${value}m`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value: number) => [`${formatTime(value)}`, 'Study Time']}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMinutes)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Top Tasks Chart */}
            {taskData.length > 0 && (
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Top 5 Tasks
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={taskData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis
                      type="number"
                      stroke="#71717a"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `${value}m`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#71717a"
                      style={{ fontSize: '12px' }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value: number) => [formatTime(value), 'Time']}
                    />
                    <Bar dataKey="minutes" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Member Since */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-zinc-800">
              Member since {format(new Date(user.createdAt), 'MMMM d, yyyy')}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Complete Activity History</span>
                <span className="text-xl font-semibold text-white">{totalSessions} Sessions</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {timelineEntries.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-500">No study sessions yet</p>
                </div>
              ) : (
                timelineEntries.map((entry, index) => (
                  <motion.div
                    key={`${entry.session.id}-${entry.type}-timeline`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.5) }}
                    className="flex items-start gap-4"
                  >
                    {/* Timeline dot and line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          entry.type === 'start'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {entry.type === 'start' ? (
                          <Play className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </div>
                      {index < timelineEntries.length - 1 && (
                        <div className="w-0.5 h-8 bg-zinc-800 my-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-zinc-800/50 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-white">
                            {entry.type === 'start' ? 'Started' : 'Stopped'} {entry.task?.name || 'Unknown Task'}
                          </div>
                          <div className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                            <Clock className="w-3.5 h-3.5" />
                            {format(entry.time, 'MMM d, yyyy - h:mm:ss a')}
                          </div>
                        </div>
                        {entry.type === 'end' && entry.session.duration && (
                          <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-sm font-medium">
                            {formatTime(entry.session.duration)}
                          </div>
                        )}
                      </div>

                      {entry.type === 'end' && entry.session.breakReason && (
                        <div className="flex items-center gap-1.5 text-orange-400 text-sm mt-2 pt-2 border-t border-zinc-700">
                          <Coffee className="w-4 h-4" />
                          <span>Break reason: {entry.session.breakReason}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}