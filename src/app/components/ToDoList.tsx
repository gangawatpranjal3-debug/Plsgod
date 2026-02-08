import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Calendar,
  Crown,
  History,
  Timer as TimerIcon,
  Circle,
  Sparkles,
  Zap,
  Target,
} from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface TodoItem {
  id: string;
  userId: string;
  title: string;
  startTime?: string; // Optional: "HH:MM AM/PM" format
  endTime?: string; // Optional: "HH:MM AM/PM" format
  startDateTime?: string; // Optional: ISO string for comparison
  endDateTime?: string; // Optional: ISO string for comparison
  createdAt: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  extended: number; // minutes extended
  isScheduled: boolean; // true if has time, false for simple tasks
  priority?: 'low' | 'medium' | 'high';
}

interface ToDoListProps {
  userId: string;
}

const STORAGE_KEY = 'study_tracker_todos';

export function ToDoList({ userId }: ToDoListProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');
  const [endHour, setEndHour] = useState('10');
  const [endMinute, setEndMinute] = useState('00');
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('AM');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'scheduled' | 'simple'>('all');

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load todos from storage
  useEffect(() => {
    loadTodos();
  }, [userId]);

  const loadTodos = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allTodos: TodoItem[] = JSON.parse(stored);
        const userTodos = allTodos.filter((t) => t.userId === userId);
        setTodos(userTodos);
      }
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  const saveTodos = (updatedTodos: TodoItem[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allTodos: TodoItem[] = stored ? JSON.parse(stored) : [];
      
      // Remove old todos for this user and add updated ones
      const otherUserTodos = allTodos.filter((t) => t.userId !== userId);
      const newAllTodos = [...otherUserTodos, ...updatedTodos];
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAllTodos));
      setTodos(updatedTodos);
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  };

  const parseTime = (hour: string, minute: string, period: 'AM' | 'PM', dateStr: string) => {
    let hours = parseInt(hour);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const date = new Date(dateStr);
    date.setHours(hours, parseInt(minute), 0, 0);
    return date;
  };

  const formatTime = (hour: string, minute: string, period: 'AM' | 'PM') => {
    return `${hour}:${minute} ${period}`;
  };

  const handleCreateTodo = () => {
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    let newTodo: TodoItem;

    if (isScheduled) {
      const startDateTime = parseTime(startHour, startMinute, startPeriod, today);
      const endDateTime = parseTime(endHour, endMinute, endPeriod, today);

      if (endDateTime <= startDateTime) {
        toast.error('End time must be after start time');
        return;
      }

      newTodo = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title: title.trim(),
        startTime: formatTime(startHour, startMinute, startPeriod),
        endTime: formatTime(endHour, endMinute, endPeriod),
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        createdAt: new Date().toISOString(),
        date: today,
        completed: false,
        extended: 0,
        isScheduled: true,
        priority,
      };
    } else {
      newTodo = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title: title.trim(),
        createdAt: new Date().toISOString(),
        date: today,
        completed: false,
        extended: 0,
        isScheduled: false,
        priority,
      };
    }

    const updatedTodos = [...todos, newTodo];
    saveTodos(updatedTodos);
    
    setTitle('');
    setPriority('medium');
    setIsDialogOpen(false);
    
    const reactions = ['🎯', '✨', '🚀', '💪', '⚡'];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    toast.success(`Task created! ${reaction}`);
  };

  const handleExtendTask = (todoId: string, minutes: number) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === todoId && todo.endDateTime) {
        const newEndDateTime = new Date(todo.endDateTime);
        newEndDateTime.setMinutes(newEndDateTime.getMinutes() + minutes);
        
        return {
          ...todo,
          endDateTime: newEndDateTime.toISOString(),
          extended: todo.extended + minutes,
        };
      }
      return todo;
    });
    
    saveTodos(updatedTodos);
    
    const reactions = ['🚀', '💪', '⚡', '🔥', '✨'];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    toast.success(`Extended by ${minutes} minutes! ${reaction}`);
  };

  const handleToggleComplete = (todoId: string) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updatedTodos);
    
    const todo = todos.find((t) => t.id === todoId);
    if (todo && !todo.completed) {
      const celebrations = ['🎉', '✅', '🌟', '💯', '🎊'];
      const celebration = celebrations[Math.floor(Math.random() * celebrations.length)];
      toast.success(`Great work! ${celebration}`);
    }
  };

  const handleDeleteTodo = (todoId: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== todoId);
    saveTodos(updatedTodos);
    toast.success('Task removed');
  };

  const getTaskStatus = (todo: TodoItem): 'future' | 'active' | 'past' | 'none' => {
    if (!todo.isScheduled || !todo.startDateTime || !todo.endDateTime) return 'none';
    
    const now = currentTime.getTime();
    const start = new Date(todo.startDateTime).getTime();
    const end = new Date(todo.endDateTime).getTime();

    if (now < start) return 'future';
    if (now >= start && now <= end) return 'active';
    return 'past';
  };

  const getTodayTodos = () => {
    const today = new Date().toISOString().split('T')[0];
    let dayTodos = todos.filter((t) => t.date === today);
    
    if (activeFilter === 'scheduled') {
      dayTodos = dayTodos.filter((t) => t.isScheduled);
    } else if (activeFilter === 'simple') {
      dayTodos = dayTodos.filter((t) => !t.isScheduled);
    }
    
    return dayTodos.sort((a, b) => {
      if (a.isScheduled && b.isScheduled && a.startDateTime && b.startDateTime) {
        return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  const getLast7DaysTodos = () => {
    const today = new Date();
    const last7Days: { date: string; todos: TodoItem[] }[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      let dayTodos = todos.filter((t) => t.date === dateStr);
      
      if (activeFilter === 'scheduled') {
        dayTodos = dayTodos.filter((t) => t.isScheduled);
      } else if (activeFilter === 'simple') {
        dayTodos = dayTodos.filter((t) => !t.isScheduled);
      }
      
      dayTodos.sort((a, b) => {
        if (a.isScheduled && b.isScheduled && a.startDateTime && b.startDateTime) {
          return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      
      if (dayTodos.length > 0) {
        last7Days.push({ date: dateStr, todos: dayTodos });
      }
    }
    
    return last7Days;
  };

  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'from-red-500 to-orange-500';
      case 'medium':
        return 'from-yellow-500 to-orange-500';
      case 'low':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityBadgeColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'border-red-500/30 text-red-400 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10';
      case 'low':
        return 'border-blue-500/30 text-blue-400 bg-blue-500/10';
      default:
        return 'border-gray-500/30 text-gray-400 bg-gray-500/10';
    }
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const renderTodoItem = (todo: TodoItem, showDate: boolean = false) => {
    const status = getTaskStatus(todo);
    const isActive = status === 'active';
    const isPast = status === 'past';
    const isFuture = status === 'future';
    const isSimple = !todo.isScheduled;

    return (
      <motion.div
        key={todo.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, x: -20 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={`group relative p-5 rounded-2xl border transition-all duration-300 ${
          todo.completed
            ? 'bg-zinc-900/50 border-zinc-800/50 opacity-60'
            : isActive
            ? 'bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-500/30 shadow-xl shadow-blue-500/20'
            : isSimple
            ? 'bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-zinc-800 hover:border-zinc-700 shadow-lg hover:shadow-xl'
            : isPast
            ? 'bg-zinc-900/70 border-zinc-800 opacity-50'
            : 'bg-gradient-to-br from-zinc-900 to-zinc-900/70 border-zinc-800 hover:border-zinc-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {/* Decorative gradient orb */}
        {!todo.completed && (isActive || isSimple) && (
          <div className={`absolute -top-1 -right-1 w-20 h-20 bg-gradient-to-br ${getPriorityColor(todo.priority)} opacity-20 blur-2xl rounded-full`} />
        )}

        {/* Premium Badge */}
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-3 -right-3 z-10"
          >
            <Badge className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white border-0 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
              Active Now
            </Badge>
          </motion.div>
        )}

        <div className="flex items-start gap-4 relative z-10">
          {/* Checkbox/Status Icon */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToggleComplete(todo.id)}
            className="flex-shrink-0 mt-0.5 cursor-pointer group/check"
          >
            {todo.completed ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-6 h-6 rounded-full bg-gradient-to-br ${getPriorityColor(todo.priority)} flex items-center justify-center shadow-lg`}
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
              </motion.div>
            ) : isActive ? (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50"
              >
                <Play className="w-3 h-3 text-white" />
              </motion.div>
            ) : (
              <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                isPast
                  ? 'border-gray-600'
                  : `border-gray-400 group-hover/check:border-${todo.priority === 'high' ? 'red' : todo.priority === 'medium' ? 'yellow' : 'blue'}-500 group-hover/check:shadow-lg`
              } flex items-center justify-center`}>
                {isSimple && !isPast && (
                  <Circle className="w-3 h-3 text-gray-600 group-hover/check:text-gray-400" />
                )}
                {isPast && <XCircle className="w-4 h-4 text-gray-600" />}
              </div>
            )}
          </motion.button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4
                className={`font-medium text-lg transition-all duration-200 ${
                  todo.completed
                    ? 'line-through text-gray-500'
                    : isPast
                    ? 'text-gray-500'
                    : 'text-white'
                }`}
              >
                {todo.title}
              </h4>
              
              {/* Priority Indicator */}
              {!todo.completed && todo.priority && (
                <Badge variant="outline" className={`${getPriorityBadgeColor(todo.priority)} text-xs flex-shrink-0`}>
                  {todo.priority === 'high' && <Zap className="w-3 h-3 mr-1" />}
                  {todo.priority === 'medium' && <Target className="w-3 h-3 mr-1" />}
                  {todo.priority}
                </Badge>
              )}
            </div>

            {showDate && (
              <p className="text-xs text-gray-500 mb-2">
                {new Date(todo.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}

            {/* Time info for scheduled tasks */}
            {todo.isScheduled && todo.startTime && todo.endTime && (
              <div className="flex items-center gap-3 text-sm mb-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <TimerIcon className="w-4 h-4" />
                  <span className="font-mono">
                    {todo.startTime} - {todo.endTime}
                  </span>
                </div>
                {todo.extended > 0 && (
                  <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10 text-xs">
                    +{todo.extended}min
                  </Badge>
                )}
                {isActive && (
                  <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-500/20 text-xs animate-pulse">
                    Live
                  </Badge>
                )}
              </div>
            )}

            {/* Simple task timestamp */}
            {!todo.isScheduled && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>
                  Added {new Date(todo.createdAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}

            {/* Actions */}
            {!isPast && !todo.completed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 flex items-center gap-2 flex-wrap"
              >
                {isActive && todo.isScheduled && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleExtendTask(todo.id, 10)}
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      10 min
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleExtendTask(todo.id, 30)}
                      className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      30 min
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleExtendTask(todo.id, 60)}
                      className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/10"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      1 hr
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="ml-auto text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {isPast && !todo.completed && (
              <div className="mt-3">
                <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10 text-xs">
                  Time Expired
                </Badge>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const todayTodos = getTodayTodos();
  const last7DaysTodos = getLast7DaysTodos();
  const stats = {
    total: todayTodos.length,
    completed: todayTodos.filter((t) => t.completed).length,
    active: todayTodos.filter((t) => getTaskStatus(t) === 'active').length,
    scheduled: todayTodos.filter((t) => t.isScheduled).length,
    simple: todayTodos.filter((t) => !t.isScheduled).length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-900/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-zinc-800 shadow-2xl overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 blur-3xl rounded-full" />

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-blue-500/20"
            >
              <Calendar className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Daily Tasks
                <Crown className="w-5 h-5 text-yellow-500" />
              </h2>
              <p className="text-sm text-gray-500">Smart task management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all"
            >
              <History className="w-4 h-4 mr-1" />
              {showHistory ? 'Today' : 'History'}
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-2xl">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    Create Task
                  </DialogTitle>
                  <DialogDescription>
                    Add a new task to your daily schedule.
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={isScheduled ? 'scheduled' : 'simple'} onValueChange={(v) => setIsScheduled(v === 'scheduled')} className="mt-4">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="simple" className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Quick Task
                    </TabsTrigger>
                    <TabsTrigger value="scheduled" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Scheduled
                    </TabsTrigger>
                  </TabsList>

                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium">Task Title</Label>
                      <Input
                        id="title"
                        placeholder="What do you need to do?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 mt-2 h-11"
                        autoFocus
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Priority</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <Button
                          type="button"
                          variant={priority === 'low' ? 'default' : 'outline'}
                          onClick={() => setPriority('low')}
                          className={priority === 'low' ? 'bg-blue-500 hover:bg-blue-600' : 'border-zinc-700 hover:border-blue-500'}
                        >
                          Low
                        </Button>
                        <Button
                          type="button"
                          variant={priority === 'medium' ? 'default' : 'outline'}
                          onClick={() => setPriority('medium')}
                          className={priority === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : 'border-zinc-700 hover:border-yellow-500'}
                        >
                          Medium
                        </Button>
                        <Button
                          type="button"
                          variant={priority === 'high' ? 'default' : 'outline'}
                          onClick={() => setPriority('high')}
                          className={priority === 'high' ? 'bg-red-500 hover:bg-red-600' : 'border-zinc-700 hover:border-red-500'}
                        >
                          High
                        </Button>
                      </div>
                    </div>

                    <TabsContent value="scheduled" className="space-y-4 mt-0">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Start Time */}
                        <div>
                          <Label className="text-sm font-medium">Start Time</Label>
                          <div className="flex gap-2 mt-2">
                            <Select value={startHour} onValueChange={setStartHour}>
                              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {hours.map((h) => (
                                  <SelectItem key={h} value={h}>
                                    {h}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={startMinute} onValueChange={setStartMinute}>
                              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {minutes.map((m) => (
                                  <SelectItem key={m} value={m}>
                                    {m}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={startPeriod}
                              onValueChange={(v) => setStartPeriod(v as 'AM' | 'PM')}
                            >
                              <SelectTrigger className="bg-zinc-800 border-zinc-700 w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* End Time */}
                        <div>
                          <Label className="text-sm font-medium">End Time</Label>
                          <div className="flex gap-2 mt-2">
                            <Select value={endHour} onValueChange={setEndHour}>
                              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {hours.map((h) => (
                                  <SelectItem key={h} value={h}>
                                    {h}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={endMinute} onValueChange={setEndMinute}>
                              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {minutes.map((m) => (
                                  <SelectItem key={m} value={m}>
                                    {m}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={endPeriod}
                              onValueChange={(v) => setEndPeriod(v as 'AM' | 'PM')}
                            >
                              <SelectTrigger className="bg-zinc-800 border-zinc-700 w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <Button
                      onClick={handleCreateTodo}
                      className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 h-11 shadow-lg"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Task
                    </Button>
                  </div>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Bar */}
        {!showHistory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-5 gap-3 mb-6"
          >
            <div className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/50">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/30">
              <p className="text-xs text-green-400 mb-1">Done</p>
              <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
            </div>
            <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/30">
              <p className="text-xs text-blue-400 mb-1">Active</p>
              <p className="text-2xl font-bold text-blue-400">{stats.active}</p>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/30">
              <p className="text-xs text-purple-400 mb-1">Scheduled</p>
              <p className="text-2xl font-bold text-purple-400">{stats.scheduled}</p>
            </div>
            <div className="bg-pink-500/10 rounded-xl p-3 border border-pink-500/30">
              <p className="text-xs text-pink-400 mb-1">Quick</p>
              <p className="text-2xl font-bold text-pink-400">{stats.simple}</p>
            </div>
          </motion.div>
        )}

        {/* Filter Tabs */}
        {!showHistory && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={activeFilter === 'all' ? 'default' : 'ghost'}
              onClick={() => setActiveFilter('all')}
              className={activeFilter === 'all' ? 'bg-white text-black hover:bg-gray-200' : 'text-gray-400 hover:text-white'}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={activeFilter === 'scheduled' ? 'default' : 'ghost'}
              onClick={() => setActiveFilter('scheduled')}
              className={activeFilter === 'scheduled' ? 'bg-purple-500 hover:bg-purple-600' : 'text-gray-400 hover:text-white'}
            >
              <Clock className="w-3 h-3 mr-1" />
              Scheduled
            </Button>
            <Button
              size="sm"
              variant={activeFilter === 'simple' ? 'default' : 'ghost'}
              onClick={() => setActiveFilter('simple')}
              className={activeFilter === 'simple' ? 'bg-pink-500 hover:bg-pink-600' : 'text-gray-400 hover:text-white'}
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Quick
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {!showHistory ? (
          // Today's Tasks
          <div className="space-y-4">
            {todayTodos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-gray-600" />
                </div>
                <p className="text-gray-500 mb-2">No tasks yet</p>
                <p className="text-sm text-gray-600">Click "New Task" to get started</p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {todayTodos.map((todo) => renderTodoItem(todo))}
              </AnimatePresence>
            )}
          </div>
        ) : (
          // 7-Day History
          <ScrollArea className="h-[600px] pr-4">
            {last7DaysTodos.length === 0 ? (
              <div className="text-center py-16">
                <History className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                <p className="text-gray-500">No task history yet</p>
              </div>
            ) : (
              <div className="space-y-8">
                {last7DaysTodos.map(({ date, todos: dayTodos }) => (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                      <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2 px-4">
                        <Calendar className="w-4 h-4" />
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                        <Badge variant="outline" className="ml-2 border-zinc-700">
                          {dayTodos.length}
                        </Badge>
                      </h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                    </div>
                    <div className="space-y-4">
                      {dayTodos.map((todo) => renderTodoItem(todo, false))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </div>

      {/* Footer Info */}
      <div className="relative z-10 mt-8 pt-6 border-t border-zinc-800">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              <span>Quick Task</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Completed</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Crown className="w-3 h-3 text-yellow-500" />
            <span>Premium Feature</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}