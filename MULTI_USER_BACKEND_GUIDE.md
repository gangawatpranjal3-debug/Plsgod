# Multi-User Backend Implementation Guide

## Overview
Your Study Tracker app now has a fully functional backend powered by Supabase! This enables real multi-user functionality where all users can see each other in the leaderboard, track online/offline status, and view detailed user statistics.

## What Changed

### Before (localStorage only)
- ❌ Each user could only see themselves
- ❌ Data stored locally per browser
- ❌ No way to see other users
- ❌ No online/offline status tracking

### After (Supabase Backend)
- ✅ Real leaderboard showing ALL registered users
- ✅ See who's online vs offline
- ✅ See what task others are currently studying
- ✅ Data persists across devices and browsers
- ✅ View any user's detailed stats and session history

## How It Works

### Backend Architecture
The app uses a three-tier architecture:
```
Frontend (React) → Server (Hono/Deno) → Database (Supabase KV Store)
```

### API Endpoints Created

**Authentication:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login existing user

**Users:**
- `GET /users` - Get all users (for leaderboard)
- `GET /users/:userId` - Get specific user details
- `POST /users/:userId/activity` - Update last active timestamp
- `GET /users/:userId/active-session` - Check if user has active session

**Tasks:**
- `GET /tasks?userId=X` - Get tasks for a user (or all tasks if userId='all')
- `POST /tasks` - Create new task
- `PUT /tasks/:taskId` - Update task
- `DELETE /tasks/:taskId` - Delete task

**Sessions:**
- `GET /sessions?userId=X` - Get sessions (filtered by userId or all)
- `POST /sessions` - Start new study session
- `PUT /sessions/:sessionId` - Update session (end time, break reason)
- `DELETE /sessions/:sessionId` - Delete session

### Online Status Detection
A user is considered "online" if:
1. They have an active study session (endTime === null), OR
2. Their lastActive timestamp is within the last 5 minutes

The leaderboard automatically refreshes every 10 seconds to update online status and rankings.

## Testing Multi-User Functionality

### To see multiple users in the leaderboard:

1. **Option 1: Different Browsers**
   - Open app in Chrome, create user "Alice"
   - Open app in Firefox, create user "Bob"
   - Both users will appear in each other's leaderboards!

2. **Option 2: Incognito/Private Windows**
   - Open normal window, create user "Alice"
   - Open incognito window, create user "Bob"
   - Both can see each other

3. **Option 3: Different Devices**
   - Open app on your phone, create user "Alice"
   - Open app on your laptop, create user "Bob"
   - Both devices will show both users

### Testing Online Status:

1. User A starts a study session
2. User B will see User A with a green dot (online) and the task name
3. User A stops studying
4. After 5 minutes, User A will show as offline (gray dot)

## Key Features

### Leaderboard
- Shows ALL registered users ranked by total study time
- Green dot = online/studying
- Gray dot = offline
- Displays current task for online users
- Click any user to see their detailed stats

### User Details Dialog
- View any user's complete profile
- See their total study time
- Browse all their tasks
- View detailed session history with timestamps
- See break reasons for each session

### Data Persistence
- All data is stored in Supabase's cloud database
- Works across devices and browsers
- No data loss when clearing browser cache
- Session persistence via localStorage token

## Important Notes

### Security
- Passwords are NOT hashed (for prototype purposes)
- Do not use real passwords
- This is for study tracking, not sensitive data

### Privacy
- All user data is public within the app
- Any user can see any other user's:
  - Username
  - Study sessions
  - Tasks
  - Total time studied
  - Online/offline status

### Performance
- Leaderboard auto-refreshes every 10 seconds
- All data fetched from cloud database
- Optimized queries to minimize API calls

## Migration from localStorage

The app still uses localStorage for:
- Storing current user session (after login)
- Nothing else!

All study data (users, tasks, sessions) now lives in Supabase.

## Troubleshooting

### "I can't see other users"
- Make sure other users are actually registered
- Check browser console for API errors
- Verify Supabase connection is active

### "Online status not updating"
- Wait up to 10 seconds for automatic refresh
- Check if user actually has an active session
- Verify lastActive timestamp is being updated

### "API errors"
- Check browser console for error messages
- Verify Supabase backend is running
- Check network tab for failed requests

## Next Steps

You can now:
- Register multiple test users
- Create study sessions
- Watch the leaderboard update in real-time
- Track who's studying what
- Compare your progress with others
- View detailed analytics for any user

Enjoy your fully functional multi-user study tracker! 🎉
