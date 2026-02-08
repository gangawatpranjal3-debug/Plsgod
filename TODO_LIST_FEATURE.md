# Daily Schedule To-Do List Feature

## Overview
A premium time-based task scheduling system that allows users to plan their day with timed tasks, real-time status updates, and task extension capabilities.

## Features Implemented

### 1. **Daily Schedule Component**
- Located above the Leaderboard in the sidebar
- Real-time task status updates (every second)
- Automatic status transitions based on current time
- Premium feature badge with Crown icon

### 2. **Task Scheduling**
- **Start Time Selection**: Hour, Minute, AM/PM dropdowns
- **End Time Selection**: Hour, Minute, AM/PM dropdowns
- **Validation**: Ensures end time is after start time
- **Task Title**: User-defined description

### 3. **Task Status System**
The system tracks three distinct task states:

#### 🔵 **Upcoming Tasks** (Future)
- Gray clock icon
- Standard zinc background
- Shows scheduled time range
- Visible but not interactive

#### ⚡ **Active Tasks** (Current)
- Blue pulsing Play icon
- Gradient background (blue to purple)
- "Active Now" badge
- **Extension Options Available**:
  - +10 minutes button (Blue)
  - +30 minutes button (Purple)
  - +1 hour button (Orange)
- Shows extended time badge (+Xmin)
- Premium badge visible
- Fun reaction emojis on extension (🚀, 💪, ⚡, 🔥, ✨)

#### ⏹️ **Expired Tasks** (Past)
- Gray X icon
- Faded appearance (50% opacity)
- "Time Expired" badge (red)
- Uninteractive - no extension possible
- Visual distinction from active/future tasks

### 4. **Task Extension System**
When a task is active, users can extend it dynamically:
- **+10 minutes**: Quick extension for short tasks
- **+30 minutes**: Medium extension
- **+1 hour**: Long extension
- Extensions are cumulative and tracked
- Success toast with random reaction emoji
- Extended time displayed in badge

### 5. **Task Completion**
- Mark as complete button (turns green)
- Completed tasks show with strikethrough
- Can undo completion
- Completed tasks appear faded

### 6. **History View (Last 7 Days)**
- Toggle between "Today" and "History" views
- Shows tasks grouped by date
- Displays day of week and full date
- Task count badge for each day
- Scrollable area for long history
- Empty state when no history exists

### 7. **Storage System**
- **Local Storage**: All tasks saved to `study_tracker_todos` key
- **Per-User Storage**: Tasks filtered by userId
- **Daily Reset Ready**: Tasks include date field for daily filtering
- **Cloud-Ready**: Structure supports cloud sync (Supabase)
- **Format**: JSON array with full task details

### 8. **Visual States & UI**
- Active tasks have glowing borders and backgrounds
- Online indicator pulsing animation
- Smooth transitions between states
- Responsive design
- Premium branding throughout
- Color-coded actions

### 9. **Leaderboard Enhancements**
The leaderboard now features improved online status visualization:

#### Online Users (Highlighted)
- **Pulsing Green Indicator**: Animated green dot in top-right corner
- **Special Background**: Green-tinted background (green-500/5)
- **Green Border**: Subtle green border (green-500/20)
- **"Online" Badge**: Green outlined badge next to username
- **Active Task Display**: Shows current task with Play icon
- **Enhanced Hover**: Brighter green tint on hover

#### Offline Users
- Standard zinc background
- No special indicators
- Normal hover state

#### Current User
- Blue-tinted background (blue-500/10)
- Blue border (blue-500/20)
- "(You)" text indicator
- Maintains online status if active

### 10. **Premium Features**
- Crown icon in header and footer
- "Premium Feature" label
- Special styling for active tasks
- Extension capabilities marked as premium

## Technical Implementation

### Data Structure
```typescript
interface TodoItem {
  id: string;
  userId: string;
  title: string;
  startTime: string; // "HH:MM AM/PM" format
  endTime: string; // "HH:MM AM/PM" format
  startDateTime: string; // ISO string for comparison
  endDateTime: string; // ISO string for comparison
  createdAt: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  extended: number; // minutes extended
}
```

### Status Detection Algorithm
```typescript
const getTaskStatus = (todo: TodoItem): 'future' | 'active' | 'past' => {
  const now = currentTime.getTime();
  const start = new Date(todo.startDateTime).getTime();
  const end = new Date(todo.endDateTime).getTime();

  if (now < start) return 'future';
  if (now >= start && now <= end) return 'active';
  return 'past';
}
```

### Time Extension Logic
- Parses current endDateTime
- Adds specified minutes
- Updates ISO string
- Tracks cumulative extension
- Shows success notification

### Layout Changes
- **Before**: Leaderboard only in sidebar
- **After**: To-Do List above, Leaderboard below
- Both components in a vertical stack (space-y-6)
- Both scroll naturally without sticky positioning

## User Experience Flow

1. **Scheduling a Task**
   - Click "Schedule" button
   - Enter task title
   - Select start time (hour, minute, AM/PM)
   - Select end time (hour, minute, AM/PM)
   - Click "Schedule Task"
   - See success toast

2. **Task Lifecycle**
   - Task appears as "Upcoming" before start time
   - Automatically becomes "Active" at start time
   - Extension buttons appear when active
   - Can extend multiple times while active
   - Becomes "Past" and uninteractive after end time

3. **Viewing History**
   - Click "History" button
   - See last 7 days of tasks
   - Grouped by date with counts
   - Scroll through history
   - Click "Today" to return

4. **Task Management**
   - Mark tasks as complete at any time
   - Undo completion if needed
   - View extended time badges
   - See real-time status updates

## Notifications & Feedback

- **Success Toasts**:
  - "Task scheduled successfully! 🎯"
  - "Extended by X minutes! [random emoji]"
  - "Task removed"

- **Error Toasts**:
  - "Please enter a task title"
  - "End time must be after start time"

- **Visual Feedback**:
  - Pulsing animations for active tasks
  - Smooth transitions between states
  - Color changes on hover
  - Badge updates in real-time

## Premium Branding

The feature is marked as premium throughout:
- Crown icon in header
- Premium badge on active tasks
- "Premium Feature" footer text
- Special gradient styling
- Enhanced interactivity

## Future Enhancements (Not Yet Implemented)

1. **Cloud Sync**: Currently using localStorage, ready for Supabase
2. **Notifications**: Browser notifications when task starts/ends
3. **Task Templates**: Save frequently used schedules
4. **Recurring Tasks**: Daily/weekly repetition
5. **Task Categories**: Color-coded task types
6. **Priority Levels**: High/Medium/Low priority
7. **Reminders**: 5/10/15 minute warnings
8. **Statistics**: Daily completion rates

## Storage Notes

- Tasks are stored in localStorage under `study_tracker_todos`
- Each user's tasks are filtered by `userId`
- Tasks include `date` field for daily filtering
- Structure is ready for cloud sync
- No automatic deletion (manual cleanup needed)

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Color contrast meets WCAG standards
- Focus states clearly visible
- Screen reader friendly

## Browser Support

- Modern browsers with ES6+ support
- LocalStorage required
- Animations use CSS and Motion/React
- Responsive design for mobile/tablet/desktop
