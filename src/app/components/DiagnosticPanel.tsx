import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface DiagnosticCheck {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  action?: {
    label: string;
    url: string;
  };
}

export function DiagnosticPanel() {
  const [checks, setChecks] = useState<DiagnosticCheck[]>([
    {
      name: 'Edge Function',
      status: 'pending',
      message: 'Checking if API is reachable...',
    },
    {
      name: 'Database Table',
      status: 'pending',
      message: 'Checking database setup...',
    },
  ]);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    // Check 1: Edge Function health
    try {
      const healthResponse = await fetch(
        'https://wlutqenwyfphumbmxqni.supabase.co/functions/v1/make-server/health',
        {
          headers: {
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdXRxZW53eWZwaHVtYm14cW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTkzNjUsImV4cCI6MjA4NjA5NTM2NX0.rxShfnmFPX1yGy6FJdeZWpKo4-6CC2cFI-JtGSIa2y4',
          },
        }
      );

      if (healthResponse.ok) {
        setChecks((prev) =>
          prev.map((check) =>
            check.name === 'Edge Function'
              ? {
                  ...check,
                  status: 'success',
                  message: '✓ Edge Function is deployed and responding',
                }
              : check
          )
        );

        // Check 2: Database table (try to fetch users)
        try {
          const usersResponse = await fetch(
            'https://wlutqenwyfphumbmxqni.supabase.co/functions/v1/make-server/users',
            {
              headers: {
                Authorization:
                  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdXRxZW53eWZwaHVtYm14cW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTkzNjUsImV4cCI6MjA4NjA5NTM2NX0.rxShfnmFPX1yGy6FJdeZWpKo4-6CC2cFI-JtGSIa2y4',
              },
            }
          );

          if (usersResponse.ok) {
            setChecks((prev) =>
              prev.map((check) =>
                check.name === 'Database Table'
                  ? {
                      ...check,
                      status: 'success',
                      message: '✓ Database table is configured correctly',
                    }
                  : check
              )
            );
          } else {
            const errorData = await usersResponse.json().catch(() => ({}));
            const errorMsg = errorData.error || 'Unknown error';

            if (errorMsg.includes('relation') || errorMsg.includes('does not exist')) {
              setChecks((prev) =>
                prev.map((check) =>
                  check.name === 'Database Table'
                    ? {
                        ...check,
                        status: 'error',
                        message: '✗ Database table not found - Run SQL setup script',
                        action: {
                          label: 'Open SQL Editor',
                          url: 'https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni/sql/new',
                        },
                      }
                    : check
                )
              );
            } else {
              setChecks((prev) =>
                prev.map((check) =>
                  check.name === 'Database Table'
                    ? {
                        ...check,
                        status: 'error',
                        message: `✗ Database error: ${errorMsg}`,
                      }
                    : check
                )
              );
            }
          }
        } catch (dbError) {
          setChecks((prev) =>
            prev.map((check) =>
              check.name === 'Database Table'
                ? {
                    ...check,
                    status: 'error',
                    message: '✗ Could not check database - Connection failed',
                  }
                : check
            )
          );
        }
      } else {
        setChecks((prev) =>
          prev.map((check) =>
            check.name === 'Edge Function'
              ? {
                  ...check,
                  status: 'error',
                  message: `✗ Edge Function returned status ${healthResponse.status}`,
                  action: {
                    label: 'View Functions Dashboard',
                    url: 'https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni/functions',
                  },
                }
              : check
          )
        );

        setChecks((prev) =>
          prev.map((check) =>
            check.name === 'Database Table'
              ? {
                  ...check,
                  status: 'warning',
                  message: '⚠ Cannot check - Edge Function is not responding',
                }
              : check
          )
        );
      }
    } catch (error) {
      setChecks((prev) =>
        prev.map((check) =>
          check.name === 'Edge Function'
            ? {
                ...check,
                status: 'error',
                message: '✗ Edge Function is not deployed or not reachable',
                action: {
                  label: 'View Functions Dashboard',
                  url: 'https://supabase.com/dashboard/project/wlutqenwyfphumbmxqni/functions',
                },
              }
            : check
        )
      );

      setChecks((prev) =>
        prev.map((check) =>
          check.name === 'Database Table'
            ? {
                ...check,
                status: 'warning',
                message: '⚠ Cannot check - Edge Function is not responding',
              }
            : check
        )
      );
    }
  };

  const getStatusIcon = (status: DiagnosticCheck['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const allPassed = checks.every((check) => check.status === 'success');
  const hasErrors = checks.some((check) => check.status === 'error');

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">System Diagnostics</h3>
        <p className="text-sm text-gray-400">
          Checking if everything is configured correctly
        </p>
      </div>

      <div className="space-y-3">
        {checks.map((check, index) => (
          <motion.div
            key={check.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-3 bg-zinc-800 rounded-lg"
          >
            <div className="flex-shrink-0 mt-0.5">{getStatusIcon(check.status)}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white text-sm">{check.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{check.message}</div>
              {check.action && (
                <Button
                  size="sm"
                  className="mt-2 h-7 text-xs bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open(check.action!.url, '_blank')}
                >
                  {check.action.label}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800">
        {allPassed ? (
          <div className="flex items-center gap-2 text-green-500 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>All systems operational! You can now use the app.</span>
          </div>
        ) : hasErrors ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <XCircle className="w-4 h-4" />
              <span>Issues detected. Follow the actions above to fix them.</span>
            </div>
            <Button
              size="sm"
              onClick={runDiagnostics}
              className="w-full bg-zinc-700 hover:bg-zinc-600"
            >
              Recheck
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-yellow-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Some checks are still running...</span>
          </div>
        )}
      </div>
    </Card>
  );
}