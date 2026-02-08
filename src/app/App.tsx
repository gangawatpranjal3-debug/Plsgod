import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { SetupGuide } from './components/SetupGuide';
import { ConnectionStatus } from './components/ConnectionStatus';
import type { User } from './utils/api';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Enable dark mode
    document.documentElement.classList.add('dark');
    
    // Check for stored user session
    const storedUser = localStorage.getItem('study_tracker_current_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('study_tracker_current_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('study_tracker_current_user');
    setUser(null);
  };

  // Check if we're on the setup page
  if (window.location.pathname === '/setup') {
    return <SetupGuide />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {/* Decorative rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
          />
          <div className="w-12 h-12 m-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-black" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AuthPage onLogin={setUser} />
          <ConnectionStatus />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Dashboard user={user} onLogout={handleLogout} />
          <ConnectionStatus />
        </motion.div>
      )}
    </AnimatePresence>
  );
}