# StudyTrack - Premium Study Time Tracking Website

## 🎯 COMPLETE IMPLEMENTATION GUIDE

---

## ✅ TOOL USED

**Figma Make** - React + Tailwind CSS web application builder

---

## 📱 VISUAL LAYOUT DESCRIPTION

### Page 1: Authentication (Login/Signup)
**Layout:**
- Centered card design on black background
- Animated logo (gradient blue/purple timer icon)
- Tab switcher between Login and Signup
- Username and password input fields with icons
- Large gradient action button
- Premium glass-morphism effect on the auth card

**Design Details:**
- Dark theme (black #000000 background)
- Rounded corners (rounded-3xl = 24px)
- Soft shadows with color tints
- Smooth transitions and micro-animations
- Clean spacing (Apple-like margins)

### Page 2: Main Dashboard
**Layout Sections:**

1. **Header (Top)**
   - Logo + username greeting
   - Logout button (right)
   - Sticky positioned with backdrop blur

2. **Stats Overview (4 Cards Row)**
   - Today's Study Time
   - This Week's Study Time
   - All Time Study Time
   - Active Tasks Count
   - Each with gradient icon, large number, and label

3. **Main Grid (2 Columns on Desktop, 1 on Mobile)**
   
   **Left Column (Tasks Section):**
   - "New Task" button (gradient, elevated)
   - Task cards with:
     - Task name and metadata
     - Current time vs target time
     - Progress bar (blue gradient normal, orange/red for overtime)
     - Start/Stop button (green gradient for start, red for stop)
     - Sessions list (collapsible)
     - Delete option in menu

   **Right Column (Leaderboard):**
   - Trophy icon header
   - Ranked list of all users
   - Top 3 get special badges (gold, silver, bronze)
   - Current user highlighted in blue
   - Total study time per user
   - Sticky positioned

---

## 🛠️ BUILD INSTRUCTIONS (CLICK-BY-CLICK)

Since this is built in **Figma Make**, the application is ALREADY BUILT and running. Here's what's been created:

### ✅ What's Already Working:

1. **Authentication System**
   - Login with username/password
   - Signup for new users
   - Session persistence (stays logged in on refresh)
   - Logout functionality

2. **Task Management**
   - Create new tasks with optional target time
   - View all your tasks
   - Delete tasks (removes all associated sessions)

3. **Time Tracking**
   - Start study session (records timestamp)
   - Stop study session (calculates duration automatically)
   - Real-time timer display while running
   - All sessions saved with timestamps

4. **Dashboard & Stats**
   - Today's total study time
   - This week's total study time
   - All-time total study time
   - Active task count
   - Auto-updating when you start/stop sessions

5. **Leaderboard**
   - Shows all users ranked by total study time
   - Top 3 users get special badges
   - Your position highlighted

6. **Session History**
   - View all past sessions per task
   - Delete individual sessions
   - See exact start time and duration

### 🎨 Design Features Included:

✅ Dark mode by default (forced)
✅ Apple-like premium UI
✅ Gradient buttons and icons
✅ Smooth animations with Motion (formerly Framer Motion)
✅ Rounded cards (24px radius)
✅ Soft shadows with color tints
✅ High spacing and breathing room
✅ Responsive (works on mobile and desktop)
✅ Micro-interactions (hover states, transitions)

---

## 💾 DATABASE STRUCTURE (LocalStorage)

### Table 1: Users
```javascript
{
  id: string,              // Unique ID (timestamp + random)
  username: string,        // User's chosen username
  password: string,        // Password (stored as plain text - LOCAL ONLY)
  createdAt: string        // ISO timestamp of account creation
}
```

**Storage Key:** `study_tracker_users`
**Purpose:** Store all registered users

### Table 2: Current User (Session)
```javascript
{
  id: string,
  username: string,
  password: string,
  createdAt: string
}
```

**Storage Key:** `study_tracker_current_user`
**Purpose:** Track who is currently logged in

### Table 3: Tasks
```javascript
{
  id: string,              // Unique task ID
  userId: string,          // Owner's user ID
  name: string,            // Task name (e.g., "Electrostatics – Capacitance")
  targetTime: number|null, // Target time in MINUTES (null if no target)
  createdAt: string        // ISO timestamp of task creation
}
```

**Storage Key:** `study_tracker_tasks`
**Purpose:** Store all study tasks for all users

### Table 4: Sessions
```javascript
{
  id: string,              // Unique session ID
  taskId: string,          // Associated task ID
  userId: string,          // User who created this session
  startTime: string,       // ISO timestamp when session started
  endTime: string|null,    // ISO timestamp when session ended (null = running)
  duration: number         // Duration in MINUTES (calculated when stopped)
}
```

**Storage Key:** `study_tracker_sessions`
**Purpose:** Store all study sessions (time tracking records)

---

## ⏱️ TIME TRACKING LOGIC (EXACT EXPLANATION)

### Philosophy: TIMESTAMP-BASED (Not Real-Time Ticking)

**Why:** More accurate, survives page refreshes, minimal complexity

### How It Works:

#### 1. Starting a Session
```
User clicks "Start Session"
↓
System records current timestamp: new Date().toISOString()
↓
Creates new session: { startTime: "2026-02-08T10:30:00.000Z", endTime: null, duration: 0 }
↓
Saves to localStorage
```

#### 2. While Session is Running
```
Component checks every 1 second
↓
Calculates: (Current Time - Start Time) / 1000 / 60 = minutes elapsed
↓
Displays running duration in button: "Stop (45m)"
↓
NO DATA SAVED YET (only display updated)
```

#### 3. Stopping a Session
```
User clicks "Stop"
↓
Records end timestamp: new Date().toISOString()
↓
Calculates final duration: (End Time - Start Time) / 1000 / 60
↓
Updates session: { endTime: "2026-02-08T11:15:00.000Z", duration: 45 }
↓
Saves to localStorage
```

#### 4. Calculating Stats

**Today's Time:**
```
Filter sessions where:
  new Date(session.startTime).toDateString() === new Date().toDateString()
Sum all duration values
```

**This Week's Time:**
```
Calculate start of week (Sunday at 00:00)
Filter sessions where:
  new Date(session.startTime) >= weekStart
Sum all duration values
```

**All-Time Total:**
```
Sum duration of ALL completed sessions
```

**Task Progress:**
```
Sum all session durations for that task
Compare to targetTime
Calculate percentage: (actualTime / targetTime) * 100
If > 100, show as overtime
```

### Overtime Handling
```
IF task has targetTime AND actualTime > targetTime:
  overtime = actualTime - targetTime
  Display: "Overtime: Xh Ym"
  Progress bar turns orange/red gradient
```

### Editing/Honesty System
- Users can delete sessions manually
- Users can delete entire tasks
- No restrictions (trust-based among friends)
- All deletions are permanent

---

## ⚠️ LIMITATIONS (Without Backend)

### Data Storage
❌ **Data is LOCAL to each browser/device**
   - If you use Chrome on your laptop, data stays there
   - Won't sync to your phone or another computer
   - Clearing browser data = losing all records

❌ **No cloud backup**
   - If you clear cache, data is gone forever
   - Browser updates might clear data

❌ **No cross-device sync**
   - Each friend must use the same device each time

### Multi-User Limitations
❌ **No real authentication**
   - Passwords stored in plain text in localStorage
   - Anyone with browser access can see passwords (Inspect > Application > LocalStorage)
   - This is OK for trusted friends using separate devices

❌ **Leaderboard shows only users on this device**
   - If friend creates account on their computer, you won't see them
   - Workaround: Everyone uses one shared device/computer

### Security
❌ **Not suitable for sensitive data**
   - Passwords visible in browser storage
   - Anyone with device access can edit data manually

❌ **No password recovery**
   - If you forget password, no way to recover
   - Would need to manually edit localStorage

### Workarounds

**For Better Multi-User Experience:**
1. Use one shared computer/tablet that everyone accesses
2. Or accept that leaderboard only shows your own stats
3. Or connect to Supabase (free backend) for real sync

**For Data Backup:**
1. Export localStorage data manually:
   - Open browser console (F12)
   - Run: `console.log(localStorage)`
   - Copy and save the JSON
2. Import data:
   - Paste JSON back into localStorage

---

## ✅ FINAL CHECKLIST

### Authentication
- [x] Login page with username/password
- [x] Signup page to create new accounts
- [x] Session persistence (stay logged in)
- [x] Logout functionality
- [x] Error messages for invalid credentials
- [x] No email/OTP/verification required

### Task Management
- [x] Create new study tasks
- [x] Set optional target time (hours + minutes)
- [x] View all tasks in dashboard
- [x] Delete tasks (with confirmation)
- [x] Tasks show current vs target time

### Time Tracking
- [x] Start study session button
- [x] Stop study session button
- [x] Automatic timestamp recording (start)
- [x] Automatic timestamp recording (end)
- [x] Automatic duration calculation
- [x] Real-time running timer display
- [x] Sessions persist in storage

### Dashboard Stats
- [x] Today's total study time
- [x] This week's total study time
- [x] All-time total study time
- [x] Active tasks count
- [x] Auto-refresh when data changes

### Overtime Tracking
- [x] Compare actual vs target time
- [x] Show overtime amount when exceeded
- [x] Visual indicator (orange/red progress bar)
- [x] Allow continuing past target

### Session Management
- [x] View all sessions per task
- [x] Collapsible session list
- [x] Delete individual sessions
- [x] Show session date and time
- [x] Show session duration

### Leaderboard
- [x] Show all users ranked by total time
- [x] Top 3 users get special badges
- [x] Current user highlighted
- [x] Shows total study time per user
- [x] Auto-updates with new data

### Design Quality
- [x] Dark mode by default
- [x] Apple-like premium UI
- [x] Minimalist, clean design
- [x] Rounded cards (24px radius)
- [x] Soft shadows with color tints
- [x] Gradient buttons and accents
- [x] Smooth animations
- [x] High spacing and breathing room
- [x] Responsive (desktop + mobile)
- [x] Motivating and enjoyable to use

### User Experience
- [x] No technical knowledge required
- [x] Intuitive interface
- [x] Clear visual feedback
- [x] Confirmation dialogs for destructive actions
- [x] Error handling with friendly messages

---

## 🚀 HOW TO USE (USER GUIDE)

### First Time Setup

1. **Open the application** in your web browser
2. **Click "Sign Up"** tab
3. **Enter a username** (e.g., "john")
4. **Enter a password** (e.g., "study123")
5. **Click "Create Account"**
6. You're now logged in!

### Creating Your First Task

1. **Click "New Task"** button (top right, gradient blue/purple)
2. **Enter task name** (e.g., "Electrostatics – Capacitance")
3. **(Optional) Set target time:**
   - Hours: 2
   - Minutes: 30
   - Total target: 2h 30m
4. **Click "Create Task"**
5. Task appears in your dashboard!

### Tracking Study Time

1. **Find your task** in the task list
2. **Click "Start Session"** (green button)
3. Timer starts! Button now shows: "Stop (0m)"
4. **Study normally** - timer counts up automatically
5. **Click "Stop (Xm)"** when done
6. Session saved! Duration added to task total

### Viewing Your Stats

**Stats cards show:**
- Today: Total study time for today
- This Week: Total for current week (Sun-Sat)
- All Time: Total ever
- Active Tasks: Number of tasks created

**Task cards show:**
- Current time vs target time
- Progress bar (visual)
- Overtime warning if exceeded

### Managing Sessions

1. **Click the dropdown arrow** on a task (shows sessions count)
2. **View all past sessions** with dates and times
3. **Delete a session** by clicking trash icon
4. Sessions automatically update task totals

### Checking Leaderboard

1. **Look at right sidebar** (desktop) or scroll down (mobile)
2. **See all users ranked** by total study time
3. **Your name highlighted** in blue
4. **Top 3 users** get special badges:
   - 🏆 Gold (1st place)
   - 🥈 Silver (2nd place)
   - 🥉 Bronze (3rd place)

### Logging Out

1. **Click "Logout"** button (top right)
2. Returns to login screen
3. Your data is saved and will be there when you log back in

---

## 💡 TIPS FOR BEST EXPERIENCE

### For Accurate Tracking
- ✅ Start session EXACTLY when you begin studying
- ✅ Stop session immediately when taking a break
- ✅ Create new session for each study period
- ✅ Don't leave sessions running overnight

### For Friends Group
- ✅ Everyone use the same device/computer
- ✅ Or accept separate leaderboards per device
- ✅ Set honest targets to stay motivated
- ✅ Check leaderboard to encourage each other

### For Data Safety
- ✅ Don't clear browser cache
- ✅ Use the same browser consistently
- ✅ Bookmark the URL for easy access
- ✅ Consider exporting data weekly (see Limitations section)

### For Motivation
- ✅ Set realistic target times
- ✅ Track daily to see progress
- ✅ Compete with friends on leaderboard
- ✅ Celebrate milestones (10h, 50h, 100h)

---

## 🎨 DESIGN SYSTEM

### Colors
- **Background:** Black (#000000)
- **Cards:** Dark Gray (#18181B / zinc-900)
- **Borders:** Darker Gray (#27272A / zinc-800)
- **Text Primary:** White (#FFFFFF)
- **Text Secondary:** Gray (#A1A1AA / gray-400)

### Gradients
- **Primary:** Blue to Purple (#3B82F6 → #9333EA)
- **Success:** Green to Emerald (#22C55E → #10B981)
- **Warning:** Orange to Red (#F97316 → #EF4444)
- **Leaderboard 1st:** Yellow to Orange (#EAB308 → #F97316)

### Spacing
- **Cards:** 24px padding (p-6)
- **Gaps:** 16px between elements (gap-4)
- **Sections:** 32px margins (mb-8)

### Borders
- **Radius:** 24px (rounded-3xl)
- **Input Radius:** 12px (rounded-xl)
- **Button Radius:** 12px (rounded-xl)

### Shadows
- **Cards:** Soft elevation with color tint
- **Buttons:** Glow effect matching gradient (shadow-blue-500/20)

---

## 🔧 TECHNICAL DETAILS

### Technologies Used
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Motion** (Framer Motion) - Animations
- **date-fns** - Date formatting
- **Radix UI** - Accessible components
- **Lucide React** - Icons

### File Structure
```
/src/app/
  App.tsx                    # Main app entry
  /components/
    AuthPage.tsx             # Login/Signup page
    Dashboard.tsx            # Main dashboard
    TaskCard.tsx             # Individual task display
    CreateTaskDialog.tsx     # New task modal
    SessionsList.tsx         # Session history
    StatsCard.tsx            # Stat display card
    Leaderboard.tsx          # User rankings
  /utils/
    storage.ts               # LocalStorage operations
    timeCalculations.ts      # Time logic functions
```

### Browser Compatibility
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Any modern browser with localStorage support

---

## 📞 SUPPORT & NOTES

This is a **PRIVATE, PERSONAL-USE application** built for you and your friends. It's designed to work perfectly for small groups (2-10 people) using trusted devices.

**Remember:**
- This is NOT a public product
- No email/verification needed (by design)
- Trust-based system for friends
- Data stays local (privacy by default)
- Free forever, no subscriptions

**If you need:**
- Cloud sync across devices → Connect to Supabase (free)
- More users → Works fine, just manage localStorage
- Data export → Use browser console to copy localStorage

---

Enjoy tracking your study time! 📚⏱️✨
