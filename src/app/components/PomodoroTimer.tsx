import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Play, Pause, RotateCcw, Plus, Coffee, Trophy, Frown, Angry, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { formatTime } from '../utils/timeCalculations';
import { soundManager } from '../utils/sound';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface PomodoroTimerProps {
  userId: string;
}

type PresetType = '50-10' | '90-10' | 'custom';
type TimerState = 'idle' | 'studying' | 'break' | 'paused';

export function PomodoroTimer({ userId }: PomodoroTimerProps) {
  const [preset, setPreset] = useState<PresetType>('50-10');
  const [studyDuration, setStudyDuration] = useState(50);
  const [breakDuration, setBreakDuration] = useState(10);
  const [customStudy, setCustomStudy] = useState('25');
  const [customBreak, setCustomBreak] = useState('5');
  const [isMuted, setIsMuted] = useState(false);
  
  const [state, setState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(50 * 60); // in seconds
  const [isStudyPhase, setIsStudyPhase] = useState(true);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Update durations when preset changes
    if (preset === '50-10') {
      setStudyDuration(50);
      setBreakDuration(10);
      if (state === 'idle') {
        setTimeLeft(50 * 60);
      }
    } else if (preset === '90-10') {
      setStudyDuration(90);
      setBreakDuration(10);
      if (state === 'idle') {
        setTimeLeft(90 * 60);
      }
    } else {
      const study = parseInt(customStudy) || 25;
      const breakTime = parseInt(customBreak) || 5;
      setStudyDuration(study);
      setBreakDuration(breakTime);
      if (state === 'idle') {
        setTimeLeft(study * 60);
      }
    }
  }, [preset, customStudy, customBreak, state]);

  useEffect(() => {
    if (state === 'studying' || state === 'break') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer completed
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          // Optional tick sound every second if not muted
          // if (!isMuted) soundManager.playTick();
          return prev - 1;
        });
      }, 1000);
    } else if (state === 'paused' || state === 'idle') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state, isMuted]);

  const handleTimerComplete = () => {
    if (!isMuted) soundManager.playCompletion();
    
    if (isStudyPhase) {
      // Study phase complete - start break
      setIsStudyPhase(false);
      setTimeLeft(breakDuration * 60);
      setState('break');
      setCompletedPomodoros((prev) => prev + 1);
    } else {
      // Break complete - return to idle
      setIsStudyPhase(true);
      setTimeLeft(studyDuration * 60);
      setState('idle');
    }
  };

  const handleStart = () => {
    if (!isMuted) soundManager.playStart();
    setState(isStudyPhase ? 'studying' : 'break');
  };

  const handlePause = () => {
    if (!isMuted) soundManager.playStop();
    setState('paused');
  };

  const handleReset = () => {
    setState('idle');
    setIsStudyPhase(true);
    setTimeLeft(studyDuration * 60);
  };

  const handleExtendTime = (minutes: number) => {
    if (!isMuted) soundManager.playNotification();
    setTimeLeft((prev) => prev + minutes * 60);
  };
  
  const toggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = isStudyPhase
    ? ((studyDuration * 60 - timeLeft) / (studyDuration * 60)) * 100
    : ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 h-full relative overflow-hidden"
    >
      {/* Background Pulse Effect when active */}
      {(state === 'studying' || state === 'break') && (
        <motion.div
          animate={{ opacity: [0, 0.05, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inset-0 bg-gradient-to-br ${
            isStudyPhase ? 'from-blue-500 to-purple-500' : 'from-orange-500 to-red-500'
          } pointer-events-none`}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Timer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Pomodoro</h2>
            <p className="text-sm text-gray-400">Focus timer</p>
          </div>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-gray-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMuted ? 'Unmute sounds' : 'Mute sounds'}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Preset Selection */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => setPreset('50-10')}
          variant={preset === '50-10' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 rounded-lg"
        >
          50/10
        </Button>
        <Button
          onClick={() => setPreset('90-10')}
          variant={preset === '90-10' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 rounded-lg"
        >
          90/10
        </Button>
        <Button
          onClick={() => setPreset('custom')}
          variant={preset === 'custom' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 rounded-lg"
        >
          Custom
        </Button>
      </div>

      {/* Custom Time Inputs */}
      {preset === 'custom' && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Study (min)</label>
            <input
              type="number"
              value={customStudy}
              onChange={(e) => setCustomStudy(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-center"
              min="1"
              disabled={state !== 'idle'}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Break (min)</label>
            <input
              type="number"
              value={customBreak}
              onChange={(e) => setCustomBreak(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-center"
              min="1"
              disabled={state !== 'idle'}
            />
          </div>
        </div>
      )}

      {/* Timer Display */}
      <div className="relative mb-6">
        {/* Progress Circle */}
        <svg className="w-full h-64" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="rgb(39, 39, 42)"
            strokeWidth="12"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={isStudyPhase ? 'rgb(59, 130, 246)' : 'rgb(251, 146, 60)'}
            strokeWidth="12"
            strokeDasharray={`${(progress / 100) * 565.48} 565.48`}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            className="transition-all duration-1000"
          />
        </svg>

        {/* Timer Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl font-bold tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-gray-400 mt-2 flex items-center gap-2">
            {isStudyPhase ? (
              <>
                <Timer className="w-4 h-4" />
                <span>Study Time</span>
              </>
            ) : (
              <>
                <Coffee className="w-4 h-4" />
                <span>Break Time</span>
              </>
            )}
          </div>
          {completedPomodoros > 0 && (
            <div className="text-sm text-green-400 mt-1 flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              {completedPomodoros} completed
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-4">
        {state === 'idle' && (
          <Button
            onClick={handleStart}
            className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl"
          >
            <Play className="w-5 h-5 mr-2" />
            Start
          </Button>
        )}
        
        {(state === 'studying' || state === 'break') && (
          <>
            <Button
              onClick={handlePause}
              className="flex-1 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-xl"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="h-12 border-zinc-700 rounded-xl"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </>
        )}
        
        {state === 'paused' && (
          <>
            <Button
              onClick={handleStart}
              className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Resume
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="h-12 border-zinc-700 rounded-xl"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      {/* Extend Time Buttons (Only during study phase) */}
      {state === 'studying' && isStudyPhase && (
        <div className="space-y-3">
          <div className="text-xs text-gray-400 text-center">Need more time?</div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExtendTime(10)}
              variant="outline"
              size="sm"
              className="flex-1 border-zinc-700 rounded-lg"
            >
              <Plus className="w-3 h-3 mr-1" />
              10 min
              <Frown className="w-4 h-4 ml-2 text-yellow-500" />
            </Button>
            <Button
              onClick={() => handleExtendTime(60)}
              variant="outline"
              size="sm"
              className="flex-1 border-zinc-700 rounded-lg"
            >
              <Plus className="w-3 h-3 mr-1" />
              1 hour
              <Angry className="w-4 h-4 ml-2 text-red-500" />
            </Button>
          </div>
        </div>
      )}

      {/* Completion Message */}
      <AnimatePresence>
        {state === 'idle' && completedPomodoros > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 text-center"
          >
            <Trophy className="w-12 h-12 mx-auto mb-2 text-green-400" />
            <div className="font-semibold text-green-400">Great Job!</div>
            <div className="text-sm text-gray-400">You completed {completedPomodoros} Pomodoro sessions</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
