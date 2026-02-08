# Quick Fix Guide - Supabase Login Issues

## The Problem
You're getting errors because:
1. The database table doesn't exist yet (most common)
2. The Edge Function might not be deployed

## The Solution (5 minutes)

### Step 1: Check if Edge Function is Deployed
1. Go to: https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni/functions
2. Look for a function named `make-server-6b1e72e4`
3. Check if it shows as "Deployed" and "Active"

**If the function is NOT there or NOT deployed:**
- The Edge Function needs to be deployed first
- This should have been done when you connected Supabase
- If it's missing, you may need to reconnect Supabase or redeploy the function

**If the function IS deployed, continue to Step 2:**

### Step 2: Open Supabase SQL Editor
Click this link: https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni/sql/new

### Step 3: Copy & Paste This SQL
```sql
CREATE TABLE IF NOT EXISTS kv_store_6b1e72e4 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kv_store_6b1e72e4_key ON kv_store_6b1e72e4(key);
CREATE INDEX IF NOT EXISTS idx_kv_store_6b1e72e4_key_prefix ON kv_store_6b1e72e4(key text_pattern_ops);

ALTER TABLE kv_store_6b1e72e4 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access" ON kv_store_6b1e72e4
  FOR ALL
  USING (true)
  WITH CHECK (true);

GRANT ALL ON kv_store_6b1e72e4 TO service_role;
GRANT ALL ON kv_store_6b1e72e4 TO anon;
```

### Step 4: Click "Run" (or press Ctrl+Enter)

### Step 5: Refresh Your App
Go back to your app and try logging in again. It should work now!

---

## Still Having Issues?

### Error: "relation does not exist"
- You skipped Step 3 above. Run the SQL script.

### Error: "Network error" or "Failed to fetch"
1. Check your internet connection
2. Make sure the Supabase Edge Function is deployed:
   - Go to: https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni/functions
   - Look for `make-server-6b1e72e4`
   - It should show as "Deployed" and "Active"

### Error: "CORS" or "Cross-origin"
- The Edge Function might need to be redeployed
- Contact support or check the Supabase logs

### Can See the Login Page but Can't Submit
- Open browser DevTools (F12)
- Check the Console tab for errors
- Check the Network tab to see if API requests are being made

---

## How to Test if Everything is Working

1. **Test Database Connection:**
   - Go to: https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni/database/tables
   - You should see `kv_store_6b1e72e4` in the table list

2. **Test API Endpoint:**
   - Open this URL in your browser:
   - `https://wlutqenwyfphumbmxqni.supabase.co/functions/v1/make-server-6b1e72e4/health`
   - You should see: `{"status":"ok"}`
   - If you get a 404 or error, the Edge Function isn't deployed

3. **Test Login:**
   - Try creating a new account with any username/password
   - If successful, you'll be logged in immediately
   - You can verify by checking the database:
     - Go to the table viewer
     - You should see your user data in `kv_store_6b1e72e4`

---

## Understanding the Error Messages

When you see an error in the login form, here's what it means:

- **"Database setup incomplete..."** → Run the SQL script above
- **"Network error..."** → Check your internet or Supabase status
- **"Connection failed..."** → Edge Function is offline or not deployed
- **"Invalid username or password"** → Wrong credentials (this is normal!)
- **"Username already exists"** → That username is taken, try another

---

## Need More Help?

1. Check `SUPABASE_SETUP.md` for detailed setup instructions
2. Visit `/setup` in your app for an interactive setup guide
3. Check the browser console (F12) for detailed error messages
4. Verify your Supabase project is active and not paused