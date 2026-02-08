# Edge Function Troubleshooting Guide

## Issue: "API health check failed"

This error means the Supabase Edge Function is not responding. Here's how to fix it.

---

## Quick Check

Visit this URL in your browser:
```
https://wlutqenwyfphumbmxqni.supabase.co/functions/v1/make-server-6b1e72e4/health
```

**Expected Result:** `{"status":"ok"}`

**If you see an error:** Continue with the steps below.

---

## Step 1: Check if Edge Function is Deployed

1. Go to your Supabase Functions Dashboard:
   https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni/functions

2. Look for a function named: `make-server-6b1e72e4`

3. Check its status:
   - **✅ Deployed & Active** → Go to Step 2
   - **❌ Not Deployed / Inactive** → Go to Step 3
   - **❌ Doesn't Exist** → Go to Step 4

---

## Step 2: Edge Function is Deployed (But Not Working)

If the function is deployed but still not responding:

### A. Check Function Logs
1. Go to: https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni/functions
2. Click on `make-server-6b1e72e4`
3. Click on "Logs" tab
4. Look for any error messages

Common errors:
- **"Module not found"** → Function code has issues
- **"Environment variable not set"** → Missing env vars
- **"Timeout"** → Function is taking too long

### B. Test the Health Endpoint
Open your browser console (F12) and run:
```javascript
fetch('https://wlutqenwyfphumbmxqni.supabase.co/functions/v1/make-server-6b1e72e4/health', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdXRxZW53eWZwaHVtYm14cW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTkzNjUsImV4cCI6MjA4NjA5NTM2NX0.rxShfnmFPX1yGy6FJdeZWpKo4-6CC2cFI-JtGSIa2y4'
  }
}).then(r => r.json()).then(console.log).catch(console.error);
```

### C. Check CORS Settings
Make sure the Edge Function has CORS enabled. The server code should include:
```typescript
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
```

---

## Step 3: Edge Function Not Deployed or Inactive

### Option A: Redeploy from Figma Make
1. This function was likely created when you connected Supabase in Figma Make
2. You may need to reconnect or trigger a redeployment
3. Check if there's a "Deploy" or "Redeploy" button in the Supabase dashboard

### Option B: Manual Deployment (Advanced)
If you have access to the function code:
1. Install Supabase CLI: https://supabase.com/docs/guides/cli
2. Login: `supabase login`
3. Link project: `supabase link --project-ref wlutqenwyfphumbmxqni`
4. Deploy: `supabase functions deploy make-server-6b1e72e4`

---

## Step 4: Edge Function Doesn't Exist

This means the function was never created. This likely happened because:
1. The Supabase connection in Figma Make didn't complete fully
2. The deployment failed silently
3. The function was deleted

### Solution: Reconnect Supabase in Figma Make

The Edge Function code exists in your project at:
- `/supabase/functions/server/index.tsx` (main server code)
- `/supabase/functions/server/kv_store.tsx` (database utilities)

You'll need to use Figma Make's Supabase connection feature to deploy this function.

**Note:** I cannot directly deploy Edge Functions - this must be done through Figma Make's UI or the Supabase CLI.

---

## Step 5: Verify Environment Variables

The Edge Function needs these environment variables to work:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (secret)

These are automatically set by Supabase when the function is deployed through the dashboard.

To check:
1. Go to: https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni/functions
2. Click on `make-server-6b1e72e4`
3. Click "Settings" or "Environment Variables"
4. Verify both variables are set

---

## Alternative: Use Supabase Directly Instead of Edge Functions

If Edge Functions continue to have issues, you could refactor the app to use Supabase's direct database access instead of the REST API pattern. This would involve:

1. Creating proper database tables (instead of KV store)
2. Using `@supabase/supabase-js` client directly
3. Removing the Edge Function dependency

However, this is a significant refactor and the Edge Function approach should work once deployed correctly.

---

## Testing After Fixes

After making changes, test in this order:

### 1. Health Check
```bash
curl https://wlutqenwyfphumbmxqni.supabase.co/functions/v1/make-server-6b1e72e4/health
```
Should return: `{"status":"ok"}`

### 2. Get Users (tests database connection)
```bash
curl https://wlutqenwyfphumbmxqni.supabase.co/functions/v1/make-server-6b1e72e4/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdXRxZW53eWZwaHVtYm14cW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTkzNjUsImV4cCI6MjA4NjA5NTM2NX0.rxShfnmFPX1yGy6FJdeZWpKo4-6CC2cFI-JtGSIa2y4"
```

### 3. Try the App
- Go to your app
- Try to create an account
- Should work if both tests above passed

---

## Common Error Messages Explained

| Error | Meaning | Solution |
|-------|---------|----------|
| `Failed to fetch` | Function not reachable | Check if deployed |
| `404 Not Found` | Function doesn't exist | Deploy the function |
| `500 Internal Server Error` | Function crashed | Check logs |
| `relation does not exist` | Database table not created | Run SQL setup |
| `CORS error` | CORS not configured | Check CORS settings |
| `Unauthorized` | Missing/invalid auth token | Check Authorization header |

---

## Still Not Working?

1. **Check Supabase Status**: https://status.supabase.com
2. **Check Project Status**: Make sure your project isn't paused
3. **Check Browser Console**: Look for detailed error messages
4. **Check Network Tab**: See exactly what requests are failing
5. **Use Diagnostic Panel**: Visit `/setup` in your app to run diagnostics

---

## Summary

The most common cause of "API health check failed" is:
1. **Edge Function not deployed** → Deploy it from Supabase dashboard or CLI
2. **Function crashed** → Check logs for errors
3. **CORS issues** → Verify CORS headers in function code

Once the function is deployed and responding to the `/health` endpoint, run the SQL setup script to create the database table, and your app will work!
