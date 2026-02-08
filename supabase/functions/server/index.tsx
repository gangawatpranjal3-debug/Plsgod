import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

// Types
interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
  lastActive?: string;
}

interface Task {
  id: string;
  userId: string;
  name: string;
  targetTime: number | null;
  createdAt: string;
}

interface Session {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  breakReason?: string;
}

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-6b1e72e4/health", (c) => {
  return c.json({ status: "ok" });
});

// Helper function to generate IDs
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ===== USER ROUTES =====

// Register new user
app.post("/make-server-6b1e72e4/auth/register", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ error: "Username and password are required" }, 400);
    }

    // Check if username already exists
    const existingUsers = await kv.getByPrefix("user:");
    const userExists = existingUsers.some((u: User) => u.username === username);
    
    if (userExists) {
      return c.json({ error: "Username already exists" }, 400);
    }

    const user: User = {
      id: generateId(),
      username,
      password, // In production, this should be hashed!
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}`, user);
    await kv.set(`username:${username}`, user.id); // Index for quick lookup

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: `Registration failed: ${error}` }, 500);
  }
});

// Login user
app.post("/make-server-6b1e72e4/auth/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ error: "Username and password are required" }, 400);
    }

    // Get user ID from username index
    const userId = await kv.get(`username:${username}`);
    if (!userId) {
      return c.json({ error: "Invalid username or password" }, 401);
    }

    // Get user data
    const user = await kv.get(`user:${userId}`) as User;
    if (!user || user.password !== password) {
      return c.json({ error: "Invalid username or password" }, 401);
    }

    // Update last active
    user.lastActive = new Date().toISOString();
    await kv.set(`user:${user.id}`, user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: `Login failed: ${error}` }, 500);
  }
});

// Get all users for leaderboard
app.get("/make-server-6b1e72e4/users", async (c) => {
  try {
    const users = await kv.getByPrefix("user:");
    
    // Remove passwords and return
    const usersWithoutPasswords = users.map((user: User) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return c.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error("Get users error:", error);
    return c.json({ error: `Failed to get users: ${error}` }, 500);
  }
});

// Get specific user details
app.get("/make-server-6b1e72e4/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const user = await kv.get(`user:${userId}`) as User;
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const { password, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Get user error:", error);
    return c.json({ error: `Failed to get user: ${error}` }, 500);
  }
});

// Update user activity (for online status)
app.post("/make-server-6b1e72e4/users/:userId/activity", async (c) => {
  try {
    const userId = c.req.param("userId");
    const user = await kv.get(`user:${userId}`) as User;
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    user.lastActive = new Date().toISOString();
    await kv.set(`user:${user.id}`, user);

    return c.json({ success: true });
  } catch (error) {
    console.error("Update activity error:", error);
    return c.json({ error: `Failed to update activity: ${error}` }, 500);
  }
});

// ===== TASK ROUTES =====

// Get all tasks for a user
app.get("/make-server-6b1e72e4/tasks", async (c) => {
  try {
    const userId = c.req.query("userId");
    
    const allTasks = await kv.getByPrefix("task:");
    
    // If userId is not provided or is 'all', return all tasks
    if (!userId || userId === 'all') {
      return c.json({ tasks: allTasks });
    }

    // Otherwise filter by userId
    const userTasks = allTasks.filter((task: Task) => task.userId === userId);
    
    return c.json({ tasks: userTasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    return c.json({ error: `Failed to get tasks: ${error}` }, 500);
  }
});

// Create a new task
app.post("/make-server-6b1e72e4/tasks", async (c) => {
  try {
    const { userId, name, targetTime } = await c.req.json();
    
    if (!userId || !name) {
      return c.json({ error: "userId and name are required" }, 400);
    }

    const task: Task = {
      id: generateId(),
      userId,
      name,
      targetTime: targetTime || null,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`task:${task.id}`, task);
    
    return c.json({ task });
  } catch (error) {
    console.error("Create task error:", error);
    return c.json({ error: `Failed to create task: ${error}` }, 500);
  }
});

// Update a task
app.put("/make-server-6b1e72e4/tasks/:taskId", async (c) => {
  try {
    const taskId = c.req.param("taskId");
    const updates = await c.req.json();
    
    const task = await kv.get(`task:${taskId}`) as Task;
    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }

    const updatedTask = { ...task, ...updates };
    await kv.set(`task:${taskId}`, updatedTask);
    
    return c.json({ task: updatedTask });
  } catch (error) {
    console.error("Update task error:", error);
    return c.json({ error: `Failed to update task: ${error}` }, 500);
  }
});

// Delete a task
app.delete("/make-server-6b1e72e4/tasks/:taskId", async (c) => {
  try {
    const taskId = c.req.param("taskId");
    
    await kv.del(`task:${taskId}`);
    
    // Also delete all sessions for this task
    const allSessions = await kv.getByPrefix("session:");
    const taskSessions = allSessions.filter((s: Session) => s.taskId === taskId);
    await Promise.all(taskSessions.map((s: Session) => kv.del(`session:${s.id}`)));
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete task error:", error);
    return c.json({ error: `Failed to delete task: ${error}` }, 500);
  }
});

// ===== SESSION ROUTES =====

// Get sessions
app.get("/make-server-6b1e72e4/sessions", async (c) => {
  try {
    const userId = c.req.query("userId");
    const taskId = c.req.query("taskId");
    
    let sessions = await kv.getByPrefix("session:");
    
    if (userId) {
      sessions = sessions.filter((s: Session) => s.userId === userId);
    }
    if (taskId) {
      sessions = sessions.filter((s: Session) => s.taskId === taskId);
    }
    
    return c.json({ sessions });
  } catch (error) {
    console.error("Get sessions error:", error);
    return c.json({ error: `Failed to get sessions: ${error}` }, 500);
  }
});

// Create a new session (start studying)
app.post("/make-server-6b1e72e4/sessions", async (c) => {
  try {
    const { userId, taskId } = await c.req.json();
    
    if (!userId || !taskId) {
      return c.json({ error: "userId and taskId are required" }, 400);
    }

    const session: Session = {
      id: generateId(),
      userId,
      taskId,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
    };

    await kv.set(`session:${session.id}`, session);
    await kv.set(`activeSession:${userId}`, session.id); // Track active session
    
    return c.json({ session });
  } catch (error) {
    console.error("Create session error:", error);
    return c.json({ error: `Failed to create session: ${error}` }, 500);
  }
});

// Update a session (end studying or add break reason)
app.put("/make-server-6b1e72e4/sessions/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param("sessionId");
    const updates = await c.req.json();
    
    const session = await kv.get(`session:${sessionId}`) as Session;
    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    const updatedSession = { ...session, ...updates };
    
    // If ending the session, clear the active session marker
    if (updates.endTime) {
      await kv.del(`activeSession:${session.userId}`);
    }
    
    await kv.set(`session:${sessionId}`, updatedSession);
    
    return c.json({ session: updatedSession });
  } catch (error) {
    console.error("Update session error:", error);
    return c.json({ error: `Failed to update session: ${error}` }, 500);
  }
});

// Delete a session
app.delete("/make-server-6b1e72e4/sessions/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param("sessionId");
    const session = await kv.get(`session:${sessionId}`) as Session;
    
    if (session) {
      await kv.del(`activeSession:${session.userId}`);
    }
    
    await kv.del(`session:${sessionId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete session error:", error);
    return c.json({ error: `Failed to delete session: ${error}` }, 500);
  }
});

// Get active session for a user (for online status)
app.get("/make-server-6b1e72e4/users/:userId/active-session", async (c) => {
  try {
    const userId = c.req.param("userId");
    const activeSessionId = await kv.get(`activeSession:${userId}`);
    
    if (!activeSessionId) {
      return c.json({ session: null });
    }

    const session = await kv.get(`session:${activeSessionId}`) as Session;
    return c.json({ session });
  } catch (error) {
    console.error("Get active session error:", error);
    return c.json({ error: `Failed to get active session: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);