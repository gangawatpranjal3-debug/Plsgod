import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Trash2, Clock, Coffee } from 'lucide-react';
import { Button } from './ui/button';
import { deleteSession } from '../utils/storage';
import type { Session } from '../utils/storage';
import { formatTime } from '../utils/timeCalculations';
import { format } from 'date-fns';

interface SessionsListProps {
  sessions: Session[];
  onRefresh: () => void;
}

export function SessionsList({ sessions, onRefresh }: SessionsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedSessions = sessions.filter((s) => s.endTime !== null);

  if (completedSessions.length === 0) return null;

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('Delete this study session?')) {
      deleteSession(sessionId);
      onRefresh();
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-sm text-gray-400 hover:text-white transition-colors mb-2"
      >
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {completedSessions.length} session{completedSessions.length !== 1 ? 's' : ''}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 overflow-hidden"
          >
            {completedSessions
              .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
              .map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-3 text-sm"
                >
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">
                      {formatTime(session.duration)}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {format(new Date(session.startTime), 'MMM d, yyyy • h:mm a')}
                    </div>
                    {session.breakReason && (
                      <div className="flex items-center gap-1.5 text-orange-400 text-xs mt-1">
                        <Coffee className="w-3 h-3" />
                        <span>{session.breakReason}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDeleteSession(session.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}