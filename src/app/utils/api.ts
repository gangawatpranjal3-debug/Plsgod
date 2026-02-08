// API client for communicating with the backend
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { localStorageApi } from '../lib/storage-fallback';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server`;

// Connection mode tracking
let useOnlineMode = false; // Start in offline mode by default
let connectionCheckInProgress = false;
let connectionChecked = false;

// Check if online mode is available
export async function checkConnection(): Promise<boolean> {
  if (connectionCheckInProgress) return useOnlineMode;
  
  connectionCheckInProgress = true;
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    
    useOnlineMode = response.ok;
    connectionChecked = true;
    console.log(`✓ Connection mode: ${useOnlineMode ? 'Online (Supabase)' : 'Offline (LocalStorage)'}`);
  } catch (error) {
    useOnlineMode = false;
    connectionChecked = true;
    console.log('✗ Connection mode: Offline (LocalStorage) - Edge Function not reachable');
  } finally {
    connectionCheckInProgress = false;
  }
  
  return useOnlineMode;
}

// Get current connection mode
export function isOnlineMode(): boolean {
  return useOnlineMode;
}

// Manually set connection mode
export function setConnectionMode(online: boolean): void {
  useOnlineMode = online;
  console.log(`🌐 Connection mode manually set to: ${online ? 'Online' : 'Offline'}`);
}

// Check connection on module load
checkConnection();

// Types (matching backend)
export interface User {
  id: string;
  username: string;
  createdAt: string;
  lastActive?: string;
}

export interface Task {
  id: string;
  userId: string;
  name: string;
  targetTime: number | null; // Target time for study sessions (in minutes)
  createdAt: string;
  
  // Daily scheduling features
  date?: string; // YYYY-MM-DD format - for daily tasks
  startTime?: string; // "HH:MM AM/PM" format
  endTime?: string; // "HH:MM AM/PM" format
  startDateTime?: string; // ISO string for comparison
  endDateTime?: string; // ISO string for comparison
  completed?: boolean; // For daily tasks
  extended?: number; // Minutes extended for scheduled tasks
  isScheduled?: boolean; // true if has time scheduling
  priority?: 'low' | 'medium' | 'high'; // Task priority
  type?: 'study' | 'scheduled' | 'both'; // Task type
}

export interface Session {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  breakReason?: string;
}

// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `API request failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    throw error;
  }
}

// ===== AUTH API =====

export const auth = {
  async register(username: string, password: string): Promise<User> {
    if (!useOnlineMode) {
      const user = await localStorageApi.createUser(username, password);
      return {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
      };
    }
    
    try {
      const result = await apiRequest<{ user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      return result.user;
    } catch (error) {
      useOnlineMode = false;
      const user = await localStorageApi.createUser(username, password);
      return {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
      };
    }
  },

  async login(username: string, password: string): Promise<User> {
    if (!useOnlineMode) {
      const user = await localStorageApi.login(username, password);
      return {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
      };
    }
    
    try {
      const result = await apiRequest<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      return result.user;
    } catch (error) {
      useOnlineMode = false;
      const user = await localStorageApi.login(username, password);
      return {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
      };
    }
  },
};

// ===== USER API =====

export const users = {
  async getAll(): Promise<User[]> {
    if (!useOnlineMode) {
      const localUsers = await localStorageApi.getLeaderboard();
      return localUsers.map(u => ({
        id: u.id,
        username: u.username,
        createdAt: u.createdAt,
        lastActive: u.lastStudyDate || undefined,
      }));
    }
    
    try {
      const result = await apiRequest<{ users: User[] }>('/users');
      return result.users;
    } catch (error) {
      useOnlineMode = false;
      const localUsers = await localStorageApi.getLeaderboard();
      return localUsers.map(u => ({
        id: u.id,
        username: u.username,
        createdAt: u.createdAt,
        lastActive: u.lastStudyDate || undefined,
      }));
    }
  },

  async getById(userId: string): Promise<User> {
    if (!useOnlineMode) {
      const user = await localStorageApi.getUser(userId);
      if (!user) throw new Error('User not found');
      return {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
        lastActive: user.lastStudyDate || undefined,
      };
    }
    
    try {
      const result = await apiRequest<{ user: User }>(`/users/${userId}`);
      return result.user;
    } catch (error) {
      useOnlineMode = false;
      const user = await localStorageApi.getUser(userId);
      if (!user) throw new Error('User not found');
      return {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
        lastActive: user.lastStudyDate || undefined,
      };
    }
  },

  async updateActivity(userId: string): Promise<void> {
    if (!useOnlineMode) {
      return;
    }
    
    try {
      await apiRequest(`/users/${userId}/activity`, {
        method: 'POST',
      });
    } catch (error) {
      useOnlineMode = false;
    }
  },

  async getActiveSession(userId: string): Promise<Session | null> {
    if (!useOnlineMode) {
      const sessions = await localStorageApi.getSessions(userId);
      const activeSession = sessions.find(s => !s.endTime);
      if (!activeSession) return null;
      
      return {
        id: activeSession.id,
        taskId: activeSession.taskId || '',
        userId: activeSession.userId,
        startTime: activeSession.startTime,
        endTime: activeSession.endTime,
        duration: activeSession.duration,
        breakReason: activeSession.breakReason || undefined,
      };
    }
    
    try {
      const result = await apiRequest<{ session: Session | null }>(
        `/users/${userId}/active-session`
      );
      return result.session;
    } catch (error) {
      useOnlineMode = false;
      const sessions = await localStorageApi.getSessions(userId);
      const activeSession = sessions.find(s => !s.endTime);
      if (!activeSession) return null;
      
      return {
        id: activeSession.id,
        taskId: activeSession.taskId || '',
        userId: activeSession.userId,
        startTime: activeSession.startTime,
        endTime: activeSession.endTime,
        duration: activeSession.duration,
        breakReason: activeSession.breakReason || undefined,
      };
    }
  },
};

// ===== TASK API =====

export const tasks = {
  async getAll(): Promise<Task[]> {
    if (!useOnlineMode) {
      return [];
    }
    
    try {
      const allTasks = await apiRequest<{ tasks: Task[] }>('/tasks?userId=all');
      return allTasks.tasks;
    } catch (error) {
      useOnlineMode = false;
      return [];
    }
  },

  async getByUserId(userId: string): Promise<Task[]> {
    if (!userId || userId === 'all') {
      return this.getAll();
    }
    
    if (!useOnlineMode) {
      const tasks = await localStorageApi.getTasks(userId);
      return tasks.map(t => ({
        id: t.id,
        userId: t.userId,
        name: t.title,
        targetTime: null,
        createdAt: t.createdAt,
      }));
    }
    
    try {
      const result = await apiRequest<{ tasks: Task[] }>(`/tasks?userId=${userId}`);
      return result.tasks;
    } catch (error) {
      useOnlineMode = false;
      const tasks = await localStorageApi.getTasks(userId);
      return tasks.map(t => ({
        id: t.id,
        userId: t.userId,
        name: t.title,
        targetTime: null,
        createdAt: t.createdAt,
      }));
    }
  },

  async create(userId: string, name: string, targetTime: number | null): Promise<Task> {
    if (!useOnlineMode) {
      const task = await localStorageApi.createTask(userId, name);
      return {
        id: task.id,
        userId: task.userId,
        name: task.title,
        targetTime: task.targetTime || null,
        createdAt: task.createdAt,
        date: task.date,
        startTime: task.startTime,
        endTime: task.endTime,
        startDateTime: task.startDateTime,
        endDateTime: task.endDateTime,
        completed: task.completed,
        extended: task.extended,
        isScheduled: task.isScheduled,
        priority: task.priority,
        type: task.type,
      };
    }
    
    try {
      const result = await apiRequest<{ task: Task }>('/tasks', {
        method: 'POST',
        body: JSON.stringify({ userId, name, targetTime }),
      });
      return result.task;
    } catch (error) {
      useOnlineMode = false;
      const task = await localStorageApi.createTask(userId, name);
      return {
        id: task.id,
        userId: task.userId,
        name: task.title,
        targetTime: task.targetTime || null,
        createdAt: task.createdAt,
        date: task.date,
        startTime: task.startTime,
        endTime: task.endTime,
        startDateTime: task.startDateTime,
        endDateTime: task.endDateTime,
        completed: task.completed,
        extended: task.extended,
        isScheduled: task.isScheduled,
        priority: task.priority,
        type: task.type,
      };
    }
  },

  async update(taskId: string, updates: Partial<Task>): Promise<Task> {
    if (!useOnlineMode) {
      const task = await localStorageApi.updateTask(taskId, {
        title: updates.name,
        completed: false,
      });
      return {
        id: task.id,
        userId: task.userId,
        name: task.title,
        targetTime: null,
        createdAt: task.createdAt,
      };
    }
    
    try {
      const result = await apiRequest<{ task: Task }>(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return result.task;
    } catch (error) {
      useOnlineMode = false;
      const task = await localStorageApi.updateTask(taskId, {
        title: updates.name,
        completed: false,
      });
      return {
        id: task.id,
        userId: task.userId,
        name: task.title,
        targetTime: null,
        createdAt: task.createdAt,
      };
    }
  },

  async delete(taskId: string): Promise<void> {
    if (!useOnlineMode) {
      await localStorageApi.deleteTask(taskId);
      return;
    }
    
    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      useOnlineMode = false;
      await localStorageApi.deleteTask(taskId);
    }
  },
};

// ===== SESSION API =====

export const sessions = {
  async getByUserId(userId: string): Promise<Session[]> {
    if (!useOnlineMode) {
      const sessions = await localStorageApi.getSessions(userId);
      return sessions.map(s => ({
        id: s.id,
        taskId: s.taskId || '',
        userId: s.userId,
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.duration,
        breakReason: s.breakReason || undefined,
      }));
    }
    
    try {
      const result = await apiRequest<{ sessions: Session[] }>(
        `/sessions?userId=${userId}`
      );
      return result.sessions;
    } catch (error) {
      useOnlineMode = false;
      const sessions = await localStorageApi.getSessions(userId);
      return sessions.map(s => ({
        id: s.id,
        taskId: s.taskId || '',
        userId: s.userId,
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.duration,
        breakReason: s.breakReason || undefined,
      }));
    }
  },

  async getByTaskId(taskId: string): Promise<Session[]> {
    if (!useOnlineMode) {
      return [];
    }
    
    try {
      const result = await apiRequest<{ sessions: Session[] }>(
        `/sessions?taskId=${taskId}`
      );
      return result.sessions;
    } catch (error) {
      useOnlineMode = false;
      return [];
    }
  },

  async create(userId: string, taskId: string): Promise<Session> {
    if (!useOnlineMode) {
      const session = await localStorageApi.createSession(userId, taskId);
      return {
        id: session.id,
        taskId: session.taskId || '',
        userId: session.userId,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        breakReason: session.breakReason || undefined,
      };
    }
    
    try {
      const result = await apiRequest<{ session: Session }>('/sessions', {
        method: 'POST',
        body: JSON.stringify({ userId, taskId }),
      });
      return result.session;
    } catch (error) {
      useOnlineMode = false;
      const session = await localStorageApi.createSession(userId, taskId);
      return {
        id: session.id,
        taskId: session.taskId || '',
        userId: session.userId,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        breakReason: session.breakReason || undefined,
      };
    }
  },

  async update(sessionId: string, updates: Partial<Session>): Promise<Session> {
    if (!useOnlineMode) {
      const session = await localStorageApi.updateSession(sessionId, {
        endTime: updates.endTime || null,
        duration: updates.duration || 0,
        breakReason: updates.breakReason || null,
      });
      return {
        id: session.id,
        taskId: session.taskId || '',
        userId: session.userId,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        breakReason: session.breakReason || undefined,
      };
    }
    
    try {
      const result = await apiRequest<{ session: Session }>(`/sessions/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return result.session;
    } catch (error) {
      useOnlineMode = false;
      const session = await localStorageApi.updateSession(sessionId, {
        endTime: updates.endTime || null,
        duration: updates.duration || 0,
        breakReason: updates.breakReason || null,
      });
      return {
        id: session.id,
        taskId: session.taskId || '',
        userId: session.userId,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        breakReason: session.breakReason || undefined,
      };
    }
  },

  async delete(sessionId: string): Promise<void> {
    if (!useOnlineMode) {
      return;
    }
    
    try {
      await apiRequest(`/sessions/${sessionId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      useOnlineMode = false;
    }
  },
};

// Helper function to check if a user is online (active in last 5 minutes)
export function isUserOnline(lastActive?: string): boolean {
  if (!lastActive) return false;
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return new Date(lastActive).getTime() > fiveMinutesAgo;
}

// Helper to generate unique IDs (client-side only for optimistic updates)
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};