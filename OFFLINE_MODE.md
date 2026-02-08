# Offline Mode (LocalStorage Fallback)

## What is Offline Mode?

The app now automatically works in **offline mode** when the Supabase Edge Function is not available. This means you can use the app immediately without waiting for the Supabase setup!

## How It Works

The app automatically detects if the Edge Function is reachable:

- **✅ Online Mode (Supabase)**: If the Edge Function is deployed and working, your data is stored in Supabase
- **⚠️ Offline Mode (LocalStorage)**: If the Edge Function is not available, your data is stored locally in your browser

You'll see a **connection status badge** in the bottom-right corner showing which mode you're in.

## Features in Offline Mode

All app features work normally in offline mode:

- ✅ User registration and login
- ✅ Create and manage tasks
- ✅ Track study sessions
- ✅ View leaderboard (with local users only)
- ✅ View user profiles
- ✅ All statistics and graphs

## Limitations of Offline Mode

⚠️ **Important limitations to be aware of:**

1. **Data is stored locally in your browser**
   - Only you can see your data
   - Clearing browser data will delete everything
   - Data doesn't sync between devices or browsers

2. **No multi-user collaboration**
   - Other users won't see your data
   - You won't see other users in the leaderboard (unless they're also in your browser's localStorage)

3. **Data won't transfer to Supabase**
   - If you later enable online mode, your offline data stays in localStorage
   - There's no automatic migration from offline to online

## Using the Connection Status Widget

Click on the **connection badge** (bottom-right) to:

- **View status**: See if you're online or offline
- **Recheck connection**: Test if the Edge Function is now available
- **Switch modes manually**: Toggle between online and offline mode
- **View diagnostics**: See which services are working

## When to Use Each Mode

### Use Offline Mode When:
- 🚀 You want to start using the app immediately
- 🧪 You're testing or developing
- 📱 You're the only user and don't need cloud storage
- ⚡ The Edge Function setup is taking time

### Use Online Mode When:
- 🌐 You want your data stored in the cloud
- 👥 Multiple users need to access the same leaderboard
- 🔄 You want to access your data from multiple devices
- 💾 You want proper data persistence and backups

## Switching from Offline to Online

When you're ready to switch to online mode:

1. **Deploy the Edge Function**
   - Follow the instructions in `EDGE_FUNCTION_TROUBLESHOOTING.md`
   - Or see `/setup` in the app

2. **Run the SQL Setup Script**
   - Follow the instructions in `QUICK_FIX.md`
   - This creates the database table

3. **Click "Recheck" in the Connection Status widget**
   - The app will detect that Supabase is now available
   - It will automatically switch to online mode

4. **Create a new account**
   - Your offline data won't transfer automatically
   - You'll need to start fresh with a new account in Supabase

## Data Storage Locations

### Offline Mode:
- Users: `localStorage.study_tracker_users`
- Tasks: `localStorage.study_tracker_tasks`
- Sessions: `localStorage.study_tracker_sessions`
- Current User: `localStorage.study_tracker_current_user`

### Online Mode:
- Everything stored in Supabase `kv_store_6b1e72e4` table

## Technical Details

### How Fallback Works

The API client automatically:

1. **Checks connection** on app load
2. **Tries online first** when you make a request
3. **Falls back to localStorage** if online request fails
4. **Caches the mode** to avoid repeated checks

### Console Messages

You'll see friendly console messages like:

```
🌐 Connection mode: Offline (LocalStorage) - Edge Function not reachable
```

or

```
🌐 Connection mode: Online (Supabase)
```

These are informational, not errors!

## FAQ

**Q: Will my offline data be lost if I switch to online mode?**  
A: No, offline data stays in localStorage. But it won't sync to Supabase. They're separate storage systems.

**Q: Can I export my offline data?**  
A: Not directly, but you can access it in browser DevTools (Application → Local Storage) and copy the JSON.

**Q: Which mode should I use?**  
A: If you're just trying out the app or testing, offline mode is perfect. For real use with multiple users, online mode is recommended.

**Q: Can I use both modes at the same time?**  
A: No, the app uses one mode at a time. But you can switch between them using the connection widget.

**Q: Is offline mode secure?**  
A: Data is stored in browser localStorage, which is only accessible to your browser. But it's not encrypted, so don't store sensitive information.

## Summary

Offline mode lets you **start using the app immediately** without any Supabase setup. It's perfect for testing, personal use, or while you're setting up the backend. When you're ready for cloud storage and multi-user features, just deploy the Edge Function and switch to online mode!
