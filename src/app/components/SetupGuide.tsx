import { motion } from 'motion/react';
import { AlertCircle, Database, CheckCircle, ExternalLink, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useState } from 'react';
import { DiagnosticPanel } from './DiagnosticPanel';

export function SetupGuide() {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- Create the KV store table for your study tracker
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
GRANT ALL ON kv_store_6b1e72e4 TO anon;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <Card className="bg-zinc-900 border-zinc-800 p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">
                Database Setup Required
              </h1>
              <p className="text-gray-400">
                Your Supabase database needs to be initialized before you can use the study tracker.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white font-semibold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium mb-2">Open Supabase SQL Editor</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Click the button below to open your Supabase dashboard in a new tab:
                </p>
                <Button
                  onClick={() => window.open('https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni/sql/new', '_blank')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Open SQL Editor
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white font-semibold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium mb-2">Copy & Run SQL Script</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Copy the SQL script below and paste it into the SQL Editor, then click "Run":
                </p>
                <div className="relative">
                  <pre className="bg-black border border-zinc-700 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto max-h-64">
                    {sqlScript}
                  </pre>
                  <Button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 bg-zinc-800 hover:bg-zinc-700"
                    size="sm"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white font-semibold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium mb-2">Refresh This Page</h3>
                <p className="text-gray-400 text-sm mb-3">
                  After running the SQL script, refresh this page to start using the app:
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Database className="w-4 h-4" />
              What does this do?
            </h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• Creates a database table to store your study data</li>
              <li>• Sets up proper indexes for fast queries</li>
              <li>• Configures security policies</li>
              <li>• Enables the app to read and write data</li>
            </ul>
          </div>

          {/* Diagnostic Panel */}
          <div className="mt-6">
            <DiagnosticPanel />
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Need help? Check the <code className="text-blue-400">SUPABASE_SETUP.md</code> file for detailed instructions.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}