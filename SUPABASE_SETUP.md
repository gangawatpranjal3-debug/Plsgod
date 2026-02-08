# Supabase Setup Instructions

## Quick Fix for Login Issues

Your login is failing because the required database table doesn't exist yet. Follow these steps to fix it:

### Step 1: Create the Database Table

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Copy and paste the SQL code below
5. Click **"Run"** or press `Ctrl+Enter`

```sql
-- Create the KV store table for your study tracker
CREATE TABLE IF NOT EXISTS kv_store_6b1e72e4 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Create an index on the key column for faster lookups
CREATE INDEX IF NOT EXISTS idx_kv_store_6b1e72e4_key ON kv_store_6b1e72e4(key);

-- Create an index for prefix searches (used for getting all users, tasks, sessions)
CREATE INDEX IF NOT EXISTS idx_kv_store_6b1e72e4_key_prefix ON kv_store_6b1e72e4(key text_pattern_ops);

-- Enable Row Level Security (RLS)
ALTER TABLE kv_store_6b1e72e4 ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows the service role to do everything
CREATE POLICY "Service role has full access" ON kv_store_6b1e72e4
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions to the service role
GRANT ALL ON kv_store_6b1e72e4 TO service_role;
GRANT ALL ON kv_store_6b1e72e4 TO anon;
```

### Step 2: Test Your Login

After running the SQL script:

1. Go back to your application
2. Try to create a new account or login
3. It should work now!

## What This Does

- **Creates the `kv_store_6b1e72e4` table**: This is where all your user data, tasks, and study sessions are stored
- **Adds indexes**: Makes database queries faster
- **Enables RLS (Row Level Security)**: Allows controlled access to the data
- **Sets up policies**: Allows your application to read/write data

## Troubleshooting

### Still getting errors?

1. **Check the Supabase Functions**: 
   - Go to https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni/functions
   - Make sure the Edge Function is deployed
   - Check the logs for any errors

2. **Verify the table was created**:
   - Go to https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni/database/tables
   - You should see `kv_store_6b1e72e4` in the list

3. **Check browser console**:
   - Open Developer Tools (F12)
   - Look at the Console tab for error messages
   - Look at the Network tab to see if API requests are failing

### Need to reset everything?

If you want to start fresh and delete all data:

```sql
-- Delete all data from the table
DELETE FROM kv_store_6b1e72e4;

-- Or drop the table completely and re-create it
DROP TABLE IF EXISTS kv_store_6b1e72e4 CASCADE;
-- Then run the CREATE TABLE script again from Step 1
```

## How Your Data is Structured

The app stores data in a key-value format:

- **Users**: `user:{userId}` → User object
- **Username Index**: `username:{username}` → userId (for login lookup)
- **Tasks**: `task:{taskId}` → Task object  
- **Sessions**: `session:{sessionId}` → Session object
- **Active Sessions**: `activeSession:{userId}` → sessionId

This allows efficient querying and real-time updates across all users.
