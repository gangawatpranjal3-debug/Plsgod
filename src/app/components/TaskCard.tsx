import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Play,
  Square,
  Trash2,
  MoreVertical,
  Clock,
  Target,
  AlertCircle,
  Edit,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import {
  saveSession,
  updateSession,
  deleteTask,
  deleteSession,
  generateId,
  getCurrentUser,
  updateTask,
} from '../utils/storage';
import type { Task, Session } from '../utils/storage';
import {
  calculateTaskTime,
  formatTime,
  isTaskRunning,
  calculateDuration,
  getRunningDuration,
} from '../utils/timeCalculations';
import { SessionsList } from './SessionsList';
import { BreakReasonDialog } from './BreakReasonDialog';
import { soundManager } from '../utils/sound';

interface TaskCardProps {
  task: Task;
  sessions: Session[];
  onRefresh: () => void;
}

export function TaskCard({ task, sessions, onRefresh }: TaskCardProps) {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [isBreakDialogOpen, setIsBreakDialogOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(task.completed);

  useEffect(() => {
    const running = isTaskRunning(sessions);
    setActiveSession(running);
    
    if (running) {
      setCurrentDuration(getRunningDuration(running.startTime));
      
      // Update every second
      const interval = setInterval(() => {
        setCurrentDuration(getRunningDuration(running.startTime));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [sessions]);

  // Update local state when task prop changes
  useEffect(() => {
    setIsCompleted(task.completed);
  }, [task.completed]);

  const totalTime = calculateTaskTime(sessions);
  const displayTime = activeSession ? totalTime + currentDuration : totalTime;
  const progress = task.targetTime ? (displayTime / task.targetTime) * 100 : 0;
  const isOvertime = task.targetTime && displayTime > task.targetTime;

  const handleStartSession = () => {
    soundManager.playStart();
    const user = getCurrentUser();
    if (!user) return;

    const newSession: Session = {
      id: generateId(),
      taskId: task.id,
      userId: user.id,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
    };

    saveSession(newSession);
    onRefresh();
  };

  const handleStopSession = () => {
    soundManager.playStop();
    if (!activeSession) return;
    setIsBreakDialogOpen(true);
  };

  const handleBreakReasonSubmit = (reason: string) => {
    if (!activeSession) return;

    const endTime = new Date().toISOString();
    const duration = calculateDuration(activeSession.startTime, endTime);

    updateSession(activeSession.id, {
      endTime,
      duration,
      breakReason: reason,
    });

    setIsBreakDialogOpen(false);
    onRefresh();
  };

  const handleCompleteTask = () => {
    soundManager.playCompletion();
    
    // Fire confetti from the center of the screen
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    updateTask(task.id, { completed: true });
    setIsCompleted(true);
    onRefresh();
  };

  const handleDeleteTask = () => {
    if (window.confirm('Delete this task and all its sessions?')) {
      deleteTask(task.id);
      onRefresh();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        borderColor: isCompleted ? 'rgba(34, 197, 94, 0.3)' : activeSession ? 'rgba(59, 130, 246, 0.3)' : 'rgba(39, 39, 42, 1)' 
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.01 }}
      className={`bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 shadow-lg ${
        activeSession ? 'shadow-blue-500/10' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-lg font-medium transition-all ${isCompleted ? 'text-gray-400 line-through decoration-zinc-600' : 'text-white'}`}>
              {task.name}
            </h3>
            {task.type && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                task.type === 'study' ? 'bg-blue-500/20 text-blue-400' :
                task.type === 'scheduled' ? 'bg-purple-500/20 text-purple-400' :
                'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300'
              }`}>
                {task.type === 'study' ? 'Study' : task.type === 'scheduled' ? 'Scheduled' : 'Both'}
              </span>
            )}
            {isCompleted && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
              >
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </motion.div>
            )}
            {activeSession && !isCompleted && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
              />
            )}
          </div>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{formatTime(displayTime)}</span>
            </div>
            {task.targetTime && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <Target className="w-4 h-4" />
                <span>{formatTime(task.targetTime)}</span>
              </div>
            )}
            {task.startTime && task.endTime && (
              <div className="flex items-center gap-1.5 text-purple-400">
                <Calendar className="w-4 h-4" />
                <span>{task.startTime} - {task.endTime}</span>
              </div>
            )}
            {task.priority && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {task.priority}
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-zinc-800 border-zinc-700 text-white rounded-xl">
            {task.isScheduled && !isCompleted && (
              <DropdownMenuItem
                onClick={handleCompleteTask}
                className="text-green-400 hover:text-green-300 hover:bg-green-500/10 cursor-pointer rounded-lg"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Complete
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleDeleteTask}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer rounded-lg"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progress Bar */}
      {task.targetTime && (
        <div className="mb-4">
          <Progress
            value={Math.min(progress, 100)}
            className="h-2 bg-zinc-800"
            indicatorClassName={
              isOvertime
                ? 'bg-gradient-to-r from-orange-500 to-red-500'
                : 'bg-gradient-to-r from-blue-500 to-purple-600'
            }
          />
          {isOvertime && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 text-orange-400 text-sm mt-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span>
                Overtime: {formatTime(displayTime - task.targetTime)}
              </span>
            </motion.div>
          )}
        </div>
      )}

      {/* Timer Controls */}
      <div className="flex gap-3">
        {activeSession ? (
          <>
            <Button
              onClick={handleStopSession}
              className="flex-1 h-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-red-500/10"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <Square className="w-4 h-4 mr-2 relative z-10" />
              <span className="relative z-10">Stop ({formatTime(currentDuration)})</span>
            </Button>
          </>
        ) : (
          !isCompleted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleStartSession}
                  className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl shadow-lg shadow-green-500/20 group relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                  <Play className="w-4 h-4 mr-2" />
                  Start Session
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start tracking time for this task</p>
              </TooltipContent>
            </Tooltip>
          )
        )}
        
        {task.isScheduled && !isCompleted && !activeSession && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleCompleteTask}
                variant="outline"
                className="h-12 border-zinc-700 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30 rounded-xl transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mark task as complete</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Sessions List */}
      {sessions.length > 0 && (
        <SessionsList
          sessions={sessions}
          onRefresh={onRefresh}
        />
      )}

      {/* Break Reason Dialog */}
      <BreakReasonDialog
        open={isBreakDialogOpen}
        onOpenChange={setIsBreakDialogOpen}
        onSubmit={handleBreakReasonSubmit}
      />
    </motion.div>
  );
}