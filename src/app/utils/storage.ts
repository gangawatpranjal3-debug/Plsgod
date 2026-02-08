// Local storage utilities for study tracker

export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  name: string;
  targetTime: number | null; // in minutes
  timerDuration: number | null; // timer duration in minutes (optional)
  timerStartTime: string | null; // when the timer was started
  createdAt: string;
}

export interface Session {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  duration: number; // in minutes
  breakReason?: string; // reason for taking a break
}

const STORAGE_KEYS = {
  USERS: 'study_tracker_users',
  CURRENT_USER: 'study_tracker_current_user',
  TASKS: 'study_tracker_tasks',
  SESSIONS: 'study_tracker_sessions',
};

// User management
export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Task management
export const getTasks = (userId?: string): Task[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  const tasks = data ? JSON.parse(data) : [];
  return userId ? tasks.filter((t: Task) => t.userId === userId) : tasks;
};

export const saveTask = (task: Task): void => {
  const tasks = getTasks();
  tasks.push(task);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const updateTask = (taskId: string, updates: Partial<Task>): void => {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }
};

export const deleteTask = (taskId: string): void => {
  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== taskId);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
  
  // Also delete all sessions for this task
  const sessions = getSessions();
  const filteredSessions = sessions.filter((s) => s.taskId !== taskId);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filteredSessions));
};

// Session management
export const getSessions = (taskId?: string, userId?: string): Session[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  let sessions = data ? JSON.parse(data) : [];
  if (taskId) sessions = sessions.filter((s: Session) => s.taskId === taskId);
  if (userId) sessions = sessions.filter((s: Session) => s.userId === userId);
  return sessions;
};

export const saveSession = (session: Session): void => {
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
};

export const updateSession = (sessionId: string, updates: Partial<Session>): void => {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index !== -1) {
    sessions[index] = { ...sessions[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }
};

export const deleteSession = (sessionId: string): void => {
  const sessions = getSessions();
  const filtered = sessions.filter((s) => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
};

// Helper to generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};