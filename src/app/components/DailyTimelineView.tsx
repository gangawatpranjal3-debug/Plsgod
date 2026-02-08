import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Coffee, Play, Square, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { getSessions, getTasks } from '../utils/storage';
import type { Session, Task } from '../utils/storage';
import { formatTime } from '../utils/timeCalculations';

interface TimelineEntry {
  type: 'start' | 'end';
  time: Date;
  session: Session;
  task: Task | undefined;
}

interface DailyTimelineViewProps {
  userId: string;
}

export function DailyTimelineView({ userId }: DailyTimelineViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [allTimeEntries, setAllTimeEntries] = useState<TimelineEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'alltime'>('today');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    const sessions = getSessions(undefined, userId);
    const tasks = getTasks(userId);
    
    let rangeStart: Date;
    let rangeEnd: Date;
    
    // Calculate range based on selection
    if (timeRange === 'day') {
      rangeStart = startOfDay(selectedDate);
      rangeEnd = endOfDay(selectedDate);
    } else if (timeRange === 'week') {
      rangeStart = startOfWeek(selectedDate);
      rangeEnd = endOfWeek(selectedDate);
    } else {
      rangeStart = startOfMonth(selectedDate);
      rangeEnd = endOfMonth(selectedDate);
    }

    // Filter sessions for the selected range
    const daySessions = sessions.filter((session) => {
      const start = new Date(session.startTime);
      const end = session.endTime ? new Date(session.endTime) : new Date();
      
      return (
        isWithinInterval(start, { start: rangeStart, end: rangeEnd }) ||
        isWithinInterval(end, { start: rangeStart, end: rangeEnd })
      );
    });

    // Create timeline entries for selected range
    const entries: TimelineEntry[] = [];
    daySessions.forEach((session) => {
      const task = tasks.find((t) => t.id === session.taskId);
      
      entries.push({
        type: 'start',
        time: new Date(session.startTime),
        session,
        task,
      });
      
      if (session.endTime) {
        entries.push({
          type: 'end',
          time: new Date(session.endTime),
          session,
          task,
        });
      }
    });

    // Sort by time
    entries.sort((a, b) => a.time.getTime() - b.time.getTime());
    setTimelineEntries(entries);

    // Create all-time timeline entries
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

    // Sort by time (newest first for all-time view)
    allEntries.sort((a, b) => b.time.getTime() - a.time.getTime());
    setAllTimeEntries(allEntries);
  }, [userId, selectedDate, timeRange]);

  const totalStudyTime = timelineEntries
    .filter((e) => e.type === 'end' && e.session.duration)
    .reduce((sum, e) => sum + (e.session.duration || 0), 0);

  const allTimeTotalStudyTime = allTimeEntries
    .filter((e) => e.type === 'end' && e.session.duration)
    .reduce((sum, e) => sum + (e.session.duration || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-none">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Study Timeline</h2>
            <p className="text-sm text-gray-400">Track your study sessions</p>
          </div>
        </div>
      </div>

      {/* Tabs for Today vs All Time */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'today' | 'alltime')} className="w-full flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-2 mb-6 flex-none">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="alltime">All Time</TabsTrigger>
        </TabsList>

        {/* Today Tab */}
        <TabsContent value="today" className="space-y-6 flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden">
          <div className="space-y-6 flex-none">
            {/* Time Range Filter */}
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => setTimeRange('day')}
                variant={timeRange === 'day' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-lg"
              >
                Day
              </Button>
              <Button
                onClick={() => setTimeRange('week')}
                variant={timeRange === 'week' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-lg"
              >
                Week
              </Button>
              <Button
                onClick={() => setTimeRange('month')}
                variant={timeRange === 'month' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-lg"
              >
                Month
              </Button>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-between bg-zinc-800 rounded-xl p-3">
              <Button
                onClick={() => {
                  if (timeRange === 'day') setSelectedDate(subDays(selectedDate, 1));
                  else if (timeRange === 'week') setSelectedDate(subWeeks(selectedDate, 1));
                  else setSelectedDate(subMonths(selectedDate, 1));
                }}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-zinc-700 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <div className="font-medium">
                  {timeRange === 'day' && format(selectedDate, 'EEEE, MMMM d')}
                  {timeRange === 'week' && `${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d, yyyy')}`}
                  {timeRange === 'month' && format(selectedDate, 'MMMM yyyy')}
                </div>
                {timeRange === 'day' && (
                  <div className="text-sm text-gray-400">{format(selectedDate, 'yyyy')}</div>
                )}
              </div>
              
              <Button
                onClick={() => {
                  if (timeRange === 'day') setSelectedDate(addDays(selectedDate, 1));
                  else if (timeRange === 'week') setSelectedDate(addWeeks(selectedDate, 1));
                  else setSelectedDate(addMonths(selectedDate, 1));
                }}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-zinc-700 rounded-lg"
                disabled={
                  (timeRange === 'day' && format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) ||
                  (timeRange === 'week' && startOfWeek(selectedDate).getTime() === startOfWeek(new Date()).getTime()) ||
                  (timeRange === 'month' && startOfMonth(selectedDate).getTime() === startOfMonth(new Date()).getTime())
                }
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Total Time */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Study Time</span>
                <span className="text-2xl font-semibold text-white">{formatTime(totalStudyTime)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
            {timelineEntries.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-500">No study sessions in this {timeRange === 'day' ? 'day' : timeRange === 'week' ? 'week' : 'month'}</p>
              </div>
            ) : (
              timelineEntries.map((entry, index) => (
                <motion.div
                  key={`${entry.session.id}-${entry.type}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
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
                          {format(entry.time, 'h:mm:ss a')}
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

        {/* All Time Tab */}
        <TabsContent value="alltime" className="space-y-6 flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden">
          <div className="space-y-6 flex-none">
            {/* Total Time */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Study Time (All Time)</span>
                <span className="text-2xl font-semibold text-white">{formatTime(allTimeTotalStudyTime)}</span>
              </div>
            </div>
          </div>

          {/* All Time Timeline */}
          <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
            {allTimeEntries.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-500">No study sessions yet</p>
              </div>
            ) : (
              allTimeEntries.map((entry, index) => (
                <motion.div
                  key={`${entry.session.id}-${entry.type}-all`}
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
                    {index < allTimeEntries.length - 1 && (
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
    </motion.div>
  );
}