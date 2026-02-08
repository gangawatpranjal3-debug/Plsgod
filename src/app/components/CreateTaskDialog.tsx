import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { saveTask, generateId } from '../utils/storage';
import type { Task } from '../utils/storage';
import { BookOpen, Clock, Timer, Calendar, Target, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onTaskCreated: () => void;
}

export function CreateTaskDialog({ open, onOpenChange, userId, onTaskCreated }: CreateTaskDialogProps) {
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState<'study' | 'scheduled' | 'both'>('study');
  
  // Study task fields
  const [targetHours, setTargetHours] = useState('');
  const [targetMinutes, setTargetMinutes] = useState('');
  const [timerHours, setTimerHours] = useState('');
  const [timerMinutes, setTimerMinutes] = useState('');
  const [enableTimer, setEnableTimer] = useState(false);
  
  // Scheduled task fields
  const [isScheduled, setIsScheduled] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');
  const [endHour, setEndHour] = useState('10');
  const [endMinute, setEndMinute] = useState('00');
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('AM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskName.trim()) return;

    const hours = parseInt(targetHours) || 0;
    const minutes = parseInt(targetMinutes) || 0;
    const totalMinutes = hours * 60 + minutes;

    const tHours = parseInt(timerHours) || 0;
    const tMinutes = parseInt(timerMinutes) || 0;
    const totalTimerMinutes = tHours * 60 + tMinutes;

    // Convert time strings to Date objects for scheduled tasks
    let startTime, endTime, startDateTime, endDateTime;
    
    if (isScheduled || taskType === 'scheduled' || taskType === 'both') {
      startTime = `${startHour}:${startMinute} ${startPeriod}`;
      endTime = `${endHour}:${endMinute} ${endPeriod}`;
      
      // Create DateTime objects for today
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const startHr = startPeriod === 'PM' && startHour !== '12' 
        ? parseInt(startHour) + 12 
        : startPeriod === 'AM' && startHour === '12' 
        ? 0 
        : parseInt(startHour);
      
      const endHr = endPeriod === 'PM' && endHour !== '12' 
        ? parseInt(endHour) + 12 
        : endPeriod === 'AM' && endHour === '12' 
        ? 0 
        : parseInt(endHour);
      
      startDateTime = new Date(`${todayStr}T${String(startHr).padStart(2, '0')}:${startMinute}:00`).toISOString();
      endDateTime = new Date(`${todayStr}T${String(endHr).padStart(2, '0')}:${endMinute}:00`).toISOString();
    }

    const newTask: Task = {
      id: generateId(),
      userId,
      name: taskName,
      targetTime: totalMinutes > 0 ? totalMinutes : null,
      timerDuration: enableTimer && totalTimerMinutes > 0 ? totalTimerMinutes : null,
      timerStartTime: null,
      createdAt: new Date().toISOString(),
      type: taskType,
      
      // Scheduled task fields
      ...(isScheduled || taskType === 'scheduled' || taskType === 'both' ? {
        date: new Date().toISOString().split('T')[0],
        startTime,
        endTime,
        startDateTime,
        endDateTime,
        completed: false,
        extended: 0,
        isScheduled: true,
        priority,
      } : {}),
    };

    saveTask(newTask);
    toast.success(taskType === 'scheduled' ? 'Scheduled task created!' : 'Study task created!');
    onTaskCreated();
    
    // Reset form
    setTaskName('');
    setTaskType('study');
    setTargetHours('');
    setTargetMinutes('');
    setTimerHours('');
    setTimerMinutes('');
    setEnableTimer(false);
    setIsScheduled(false);
    setPriority('medium');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white rounded-3xl max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Create Task</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a study task, scheduled task, or both
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Task Name */}
          <div>
            <Label htmlFor="taskName" className="text-gray-300 mb-2 block">
              Task Name
            </Label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                id="taskName"
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="pl-11 bg-zinc-800 border-zinc-700 text-white h-12 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Electrostatics – Capacitance"
                required
              />
            </div>
          </div>

          {/* Task Type */}
          <div>
            <Label className="text-gray-300 mb-2 block">Task Type</Label>
            <Tabs value={taskType} onValueChange={(value) => setTaskType(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-zinc-800">
                <TabsTrigger value="study" className="data-[state=active]:bg-blue-600">
                  <Target className="w-4 h-4 mr-1" />
                  Study
                </TabsTrigger>
                <TabsTrigger value="scheduled" className="data-[state=active]:bg-purple-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  Scheduled
                </TabsTrigger>
                <TabsTrigger value="both" className="data-[state=active]:bg-gradient-to-r from-blue-600 to-purple-600">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Both
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Study Task Fields */}
          {(taskType === 'study' || taskType === 'both') && (
            <>
              <div>
                <Label className="text-gray-300 mb-2 block flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Target Time (Optional)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      type="number"
                      min="0"
                      value={targetHours}
                      onChange={(e) => setTargetHours(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white h-12 rounded-xl focus:ring-2 focus:ring-blue-500 text-center"
                      placeholder="Hours"
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center">Hours</p>
                  </div>
                  <div>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={targetMinutes}
                      onChange={(e) => setTargetMinutes(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white h-12 rounded-xl focus:ring-2 focus:ring-blue-500 text-center"
                      placeholder="Minutes"
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center">Minutes</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Timer Duration (Optional)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      type="number"
                      min="0"
                      value={timerHours}
                      onChange={(e) => setTimerHours(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white h-12 rounded-xl focus:ring-2 focus:ring-blue-500 text-center"
                      placeholder="Hours"
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center">Hours</p>
                  </div>
                  <div>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white h-12 rounded-xl focus:ring-2 focus:ring-blue-500 text-center"
                      placeholder="Minutes"
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center">Minutes</p>
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={enableTimer}
                    onChange={(e) => setEnableTimer(e.target.checked)}
                    className="mr-2 accent-blue-500"
                  />
                  <Label className="text-gray-300 cursor-pointer">Enable Timer</Label>
                </div>
              </div>
            </>
          )}

          {/* Scheduled Task Fields */}
          {(taskType === 'scheduled' || taskType === 'both') && (
            <>
              <div>
                <Label className="text-gray-300 mb-2 block">Priority</Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="accent-purple-500"
                  />
                  <Label className="text-gray-300 cursor-pointer">Set specific time</Label>
                </div>

                {isScheduled && (
                  <div className="space-y-3 mt-3">
                    {/* Start Time */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-1 block">Start Time</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Select value={startHour} onValueChange={setStartHour}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-10 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {Array.from({ length: 12 }, (_, i) => {
                              const hour = String(i + 1).padStart(2, '0');
                              return <SelectItem key={hour} value={hour}>{hour}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                        <Select value={startMinute} onValueChange={setStartMinute}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-10 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {['00', '15', '30', '45'].map(min => (
                              <SelectItem key={min} value={min}>{min}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={startPeriod} onValueChange={(value: any) => setStartPeriod(value)}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-10 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* End Time */}
                    <div>
                      <Label className="text-gray-300 text-sm mb-1 block">End Time</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Select value={endHour} onValueChange={setEndHour}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-10 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {Array.from({ length: 12 }, (_, i) => {
                              const hour = String(i + 1).padStart(2, '0');
                              return <SelectItem key={hour} value={hour}>{hour}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                        <Select value={endMinute} onValueChange={setEndMinute}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-10 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {['00', '15', '30', '45'].map(min => (
                              <SelectItem key={min} value={min}>{min}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={endPeriod} onValueChange={(value: any) => setEndPeriod(value)}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-10 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 h-12 border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg shadow-blue-500/20"
            >
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}