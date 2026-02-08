# StudyTrack - Multi-User Study Tracker

A modern study tracking application with real-time multi-user support, built with React, TypeScript, and Supabase.

## 🚀 Quick Start

### First Time Setup

Your login is currently failing because the Supabase database needs to be initialized. Follow these steps:

1. **Run the SQL Setup Script**
   - Open: https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni/sql/new
   - Copy the SQL from `QUICK_FIX.md` or `SUPABASE_SETUP.md`
   - Paste and click "Run"

2. **Refresh Your App**
   - Come back to this page and refresh
   - Try creating an account - it should work now!

3. **Alternative: Use the Setup Guide**
   - Visit `/setup` in your app for an interactive setup wizard

### Already Set Up?

Just log in or create an account to start tracking your study sessions!

## ✨ Features

- **Multi-User Support**: Real-time leaderboard showing all registered users
- **Session Tracking**: Track study sessions with start/end times and break reasons
- **Task Management**: Create and manage multiple study tasks with target times
- **Timeline View**: Visualize your study history with today's and all-time views
- **User Profiles**: Click any user on the leaderboard to see their detailed stats
- **Online Status**: See who's currently online and what they're studying
- **Cloud Sync**: All data synced to Supabase - accessible from any device

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4
- **UI Components**: Radix UI, Motion (Framer Motion)
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: Supabase PostgreSQL with KV store pattern
- **API**: REST API built with Hono
- **Charts**: Recharts

## 📁 Project Structure

```
/src/app/
├── components/
│   ├── AuthPage.tsx          # Login/signup page
│   ├── Dashboard.tsx          # Main app dashboard
│   ├── Leaderboard.tsx        # Multi-user leaderboard
│   ├── TaskCard.tsx           # Individual task cards
│   ├── SessionsList.tsx       # Session history
│   ├── DailyTimelineView.tsx  # Timeline visualization
│   ├── UserDetailsDialog.tsx  # User profile modal
│   ├── SetupGuide.tsx         # Interactive setup guide
│   └── ui/                    # Reusable UI components
├── utils/
│   ├── api.ts                 # API client for Supabase
│   ├── storage.ts             # Data persistence utilities
│   └── timeCalculations.ts   # Time formatting helpers
└── App.tsx                    # Main app component

/supabase/functions/server/
├── index.tsx                  # Main Edge Function with all API routes
└── kv_store.tsx              # KV store interface for database
```

## 🔧 API Endpoints

All endpoints are available at:
`https://wlutqenwyfphumbmxqni.supabase.co/functions/v1/make-server-6b1e72e4`

### Authentication
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Login existing user

### Users
- `GET /users` - Get all users (for leaderboard)
- `GET /users/:userId` - Get specific user details
- `POST /users/:userId/activity` - Update user's last active timestamp
- `GET /users/:userId/active-session` - Get user's current study session

### Tasks
- `GET /tasks?userId={id}` - Get tasks for a user
- `POST /tasks` - Create new task
- `PUT /tasks/:taskId` - Update task
- `DELETE /tasks/:taskId` - Delete task

### Sessions
- `GET /sessions?userId={id}` - Get sessions for a user
- `POST /sessions` - Start new study session
- `PUT /sessions/:sessionId` - Update session (end time, break reason)
- `DELETE /sessions/:sessionId` - Delete session

## 🗄️ Database Schema

The app uses a Key-Value store pattern with a single table:

```sql
CREATE TABLE kv_store_6b1e72e4 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

### Data Keys
- `user:{userId}` - User records
- `username:{username}` - Username-to-ID index
- `task:{taskId}` - Task records
- `session:{sessionId}` - Session records
- `activeSession:{userId}` - Active session tracker

## 🐛 Troubleshooting

### "Cannot find" or "relation does not exist" error
→ **Solution**: Run the SQL setup script from `QUICK_FIX.md`

### "API health check failed" or "Network error"
→ **Solution**: Edge Function not deployed. See `EDGE_FUNCTION_TROUBLESHOOTING.md`

### "Failed to fetch" error
→ **Solution**: Check internet connection and verify Edge Function is deployed at:
https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni/functions

### Can't see other users in leaderboard
→ **Solution**: Make sure they've created accounts after the database setup

### Lost session data after refresh
→ **Solution**: This is normal - the app uses localStorage for session persistence. You'll be auto-logged in.

### Interactive Diagnostics
→ Visit `/setup` in your app to run automatic diagnostic checks

## 📚 Documentation

- `QUICK_FIX.md` - Fast 5-minute setup guide
- `SUPABASE_SETUP.md` - Detailed setup instructions
- `STUDY_TRACKER_GUIDE.md` - Original app documentation
- `MULTI_USER_BACKEND_GUIDE.md` - Backend architecture details

## 🔐 Security Notes

⚠️ **Important**: Passwords are currently stored in plain text for development purposes. In production, you should:
- Hash passwords using bcrypt or similar
- Implement proper JWT-based authentication
- Add rate limiting to prevent abuse
- Use Supabase Auth instead of custom auth

## 🚦 Online Status

Users are considered "online" if they've been active in the last 5 minutes. Activity is tracked by:
- Logging in
- Starting/stopping study sessions
- Creating/updating tasks
- The app periodically updating the user's `lastActive` timestamp

## 📊 Features Breakdown

### Leaderboard
- Shows all registered users sorted by total study time
- Real-time online/offline indicators
- Displays current study task for online users
- Click any user to view detailed stats

### Timeline View
- Toggle between "Today" and "All Time" views
- Bar chart showing study time distribution
- Hover to see exact durations
- Color-coded by study intensity

### Session Management
- Start/stop sessions with one click
- Add break reasons when stopping
- View complete session history
- Delete sessions if needed

### Task Cards
- Create unlimited study tasks
- Set optional target times
- Track total time spent per task
- Visual progress indicators
- Delete tasks and associated sessions

## 🎨 UI/UX Features

- Dark mode by default
- Smooth animations with Motion
- Responsive design (mobile & desktop)
- Real-time updates
- Loading states
- Error handling with helpful messages
- Toast notifications

## 🔄 Data Flow

1. User creates account → Stored in Supabase
2. User creates task → Stored in Supabase
3. User starts session → Creates session record
4. User stops session → Updates session with end time
5. Leaderboard refreshes → Fetches all users and their stats
6. All changes sync across devices/browsers in real-time

## 📝 License

Private project for personal use.

## 🤝 Support

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Verify the database table exists in Supabase
3. Check the Edge Function logs in Supabase dashboard
4. Review the troubleshooting guides in the docs folder

---

**Need immediate help?** Check `QUICK_FIX.md` for the fastest solution!