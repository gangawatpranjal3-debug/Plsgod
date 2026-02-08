import { Session, Task } from './storage';

// Calculate total time spent on a task (in minutes)
export const calculateTaskTime = (sessions: Session[]): number => {
  return sessions.reduce((total, session) => {
    return total + (session.duration || 0);
  }, 0);
};

// Calculate time for today (in minutes)
export const calculateTodayTime = (sessions: Session[]): number => {
  const today = new Date().toDateString();
  return sessions
    .filter((session) => {
      const sessionDate = new Date(session.startTime).toDateString();
      return sessionDate === today;
    })
    .reduce((total, session) => total + (session.duration || 0), 0);
};

// Calculate time for this week (in minutes)
export const calculateWeekTime = (sessions: Session[]): number => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);

  return sessions
    .filter((session) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= weekStart;
    })
    .reduce((total, session) => total + (session.duration || 0), 0);
};

// Calculate time difference between start and end (in minutes)
export const calculateDuration = (startTime: string, endTime: string): number => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.floor((end - start) / 1000 / 60); // Convert ms to minutes
};

// Format minutes to readable string (e.g., "2h 30m" or "45m")
export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Get overtime (difference between actual and target)
export const calculateOvertime = (actualMinutes: number, targetMinutes: number | null): number => {
  if (targetMinutes === null) return 0;
  return Math.max(0, actualMinutes - targetMinutes);
};

// Check if task is running (has an active session)
export const isTaskRunning = (sessions: Session[]): Session | null => {
  const activeSession = sessions.find((s) => s.endTime === null);
  return activeSession || null;
};

// Get running session duration (for display)
export const getRunningDuration = (startTime: string): number => {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  return Math.floor((now - start) / 1000 / 60);
};
