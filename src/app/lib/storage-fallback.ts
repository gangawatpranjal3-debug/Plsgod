/**
 * LocalStorage fallback for when Supabase Edge Function is not available
 * This allows the app to work in offline/development mode
 */

const STORAGE_PREFIX = 'study_tracker_';

export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
  totalMinutes: number;
  sessionsCompleted: number;
  currentStreak: number;
  lastStudyDate: string | null;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  
  // Extended scheduling features
  date?: string; // YYYY-MM-DD format
  startTime?: string; // "HH:MM AM/PM" format
  endTime?: string; // "HH:MM AM/PM" format
  startDateTime?: string; // ISO string
  endDateTime?: string; // ISO string
  extended?: number; // Minutes extended
  isScheduled?: boolean; // Has time scheduling
  priority?: 'low' | 'medium' | 'high';
  targetTime?: number | null; // Target minutes for study
  type?: 'study' | 'scheduled' | 'both';
}

export interface StudySession {
  id: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  taskId: string | null;
  breakReason: string | null;
  date: string;
}

// Storage keys
const USERS_KEY = `${STORAGE_PREFIX}users`;
const TASKS_KEY = `${STORAGE_PREFIX}tasks`;
const SESSIONS_KEY = `${STORAGE_PREFIX}sessions`;
const CURRENT_USER_KEY = `${STORAGE_PREFIX}current_user`;

// Helper functions
function getFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// User operations
export const localStorageApi = {
  // Auth
  async createUser(username: string, password: string): Promise<User> {
    const users = getFromStorage<User>(USERS_KEY);
    
    // Check if username exists
    if (users.some(u => u.username === username)) {
      throw new Error('Username already exists');
    }

    const newUser: User = {
      id: generateId(),
      username,
      password, // In real app, this should be hashed
      createdAt: new Date().toISOString(),
      totalMinutes: 0,
      sessionsCompleted: 0,
      currentStreak: 0,
      lastStudyDate: null,
    };

    users.push(newUser);
    saveToStorage(USERS_KEY, users);
    
    // Set as current user
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    
    return newUser;
  },

  async login(username: string, password: string): Promise<User> {
    const users = getFromStorage<User>(USERS_KEY);
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  async getCurrentUser(): Promise<User | null> {
    const userData = localStorage.getItem(CURRENT_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Users
  async getUsers(): Promise<User[]> {
    return getFromStorage<User>(USERS_KEY);
  },

  async getUser(userId: string): Promise<User | null> {
    const users = getFromStorage<User>(USERS_KEY);
    return users.find(u => u.id === userId) || null;
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const users = getFromStorage<User>(USERS_KEY);
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
      throw new Error('User not found');
    }

    users[index] = { ...users[index], ...updates };
    saveToStorage(USERS_KEY, users);

    // Update current user if it's the same user
    const currentUser = await this.getCurrentUser();
    if (currentUser?.id === userId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[index]));
    }

    return users[index];
  },

  // Tasks
  async getTasks(userId: string): Promise<Task[]> {
    const tasks = getFromStorage<Task>(TASKS_KEY);
    return tasks.filter(t => t.userId === userId);
  },

  async createTask(userId: string, title: string): Promise<Task> {
    const tasks = getFromStorage<Task>(TASKS_KEY);
    
    const newTask: Task = {
      id: generateId(),
      userId,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    saveToStorage(TASKS_KEY, tasks);
    
    return newTask;
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const tasks = getFromStorage<Task>(TASKS_KEY);
    const index = tasks.findIndex(t => t.id === taskId);
    
    if (index === -1) {
      throw new Error('Task not found');
    }

    tasks[index] = { ...tasks[index], ...updates };
    saveToStorage(TASKS_KEY, tasks);
    
    return tasks[index];
  },

  async deleteTask(taskId: string): Promise<void> {
    const tasks = getFromStorage<Task>(TASKS_KEY);
    const filtered = tasks.filter(t => t.id !== taskId);
    saveToStorage(TASKS_KEY, filtered);
  },

  // Sessions
  async getSessions(userId: string): Promise<StudySession[]> {
    const sessions = getFromStorage<StudySession>(SESSIONS_KEY);
    return sessions.filter(s => s.userId === userId);
  },

  async createSession(userId: string, taskId: string | null = null): Promise<StudySession> {
    const sessions = getFromStorage<StudySession>(SESSIONS_KEY);
    
    const newSession: StudySession = {
      id: generateId(),
      userId,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      taskId,
      breakReason: null,
      date: new Date().toISOString().split('T')[0],
    };

    sessions.push(newSession);
    saveToStorage(SESSIONS_KEY, sessions);
    
    return newSession;
  },

  async updateSession(
    sessionId: string,
    updates: Partial<StudySession>
  ): Promise<StudySession> {
    const sessions = getFromStorage<StudySession>(SESSIONS_KEY);
    const index = sessions.findIndex(s => s.id === sessionId);
    
    if (index === -1) {
      throw new Error('Session not found');
    }

    sessions[index] = { ...sessions[index], ...updates };
    saveToStorage(SESSIONS_KEY, sessions);
    
    return sessions[index];
  },

  async endSession(
    sessionId: string,
    breakReason: string | null = null
  ): Promise<StudySession> {
    const sessions = getFromStorage<StudySession>(SESSIONS_KEY);
    const index = sessions.findIndex(s => s.id === sessionId);
    
    if (index === -1) {
      throw new Error('Session not found');
    }

    const endTime = new Date().toISOString();
    const startTime = new Date(sessions[index].startTime);
    const duration = Math.floor((new Date(endTime).getTime() - startTime.getTime()) / 1000 / 60);

    sessions[index] = {
      ...sessions[index],
      endTime,
      duration,
      breakReason,
    };
    saveToStorage(SESSIONS_KEY, sessions);

    // Update user stats
    const users = getFromStorage<User>(USERS_KEY);
    const userIndex = users.findIndex(u => u.id === sessions[index].userId);
    
    if (userIndex !== -1) {
      users[userIndex].totalMinutes += duration;
      users[userIndex].sessionsCompleted += 1;
      users[userIndex].lastStudyDate = sessions[index].date;
      saveToStorage(USERS_KEY, users);

      // Update current user if it's the same
      const currentUser = await this.getCurrentUser();
      if (currentUser?.id === users[userIndex].id) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
      }
    }

    return sessions[index];
  },

  // Leaderboard
  async getLeaderboard(): Promise<User[]> {
    const users = getFromStorage<User>(USERS_KEY);
    return users.sort((a, b) => b.totalMinutes - a.totalMinutes);
  },
};