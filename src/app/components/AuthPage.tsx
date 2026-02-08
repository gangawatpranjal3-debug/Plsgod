import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Timer, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { auth } from '../utils/api';
import type { User as UserType } from '../utils/api';

interface AuthPageProps {
  onLogin: (user: UserType) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      let user: UserType;
      if (isSignup) {
        user = await auth.register(username, password);
      } else {
        user = await auth.login(username, password);
      }
      
      // Store user in localStorage for persistence
      localStorage.setItem('study_tracker_current_user', JSON.stringify(user));
      onLogin(user);
    } catch (err: any) {
      console.error('Authentication error:', err);
      
      // Provide more helpful error messages
      let errorMessage = err.message || 'An error occurred. Please try again.';
      
      // Check for common Supabase setup issues
      if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
        errorMessage = 'Database setup incomplete. Please check SUPABASE_SETUP.md and run the SQL setup script.';
        setShowSetupGuide(true);
      } else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (errorMessage.includes('CORS')) {
        errorMessage = 'Connection error. The Supabase Edge Function may need to be redeployed.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black flex items-center justify-center p-4 overflow-hidden">
      {/* Decorative background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.03, 0.05, 0.03],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-blue-500 to-purple-600 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.03, 0.05, 0.03],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="fixed bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-purple-500 to-pink-600 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <motion.div
            initial={{ scale: 0.5, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 mb-4 shadow-2xl shadow-blue-500/20"
          >
            <Timer className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2"
          >
            StudyTrack Pro
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-sm sm:text-base"
          >
            Track your study time with precision
          </motion.p>
        </div>

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-800/50"
        >
          <div className="mb-6">
            <div className="flex gap-2 p-1 bg-zinc-800/50 rounded-2xl">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsSignup(false);
                  setError('');
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
                  !isSignup
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsSignup(true);
                  setError('');
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
                  isSignup
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign Up
              </motion.button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="username" className="text-gray-300 mb-2 block text-sm sm:text-base">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-11 bg-zinc-800/50 border-zinc-700/50 text-white h-12 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300 mb-2 block text-sm sm:text-base">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 bg-zinc-800/50 border-zinc-700/50 text-white h-12 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"
              >
                <p className="text-red-400 text-sm">{error}</p>
                {showSetupGuide && (
                  <Button
                    type="button"
                    onClick={() => window.location.href = '/setup'}
                    className="mt-3 w-full bg-yellow-600 hover:bg-yellow-700"
                    size="sm"
                  >
                    View Setup Guide
                  </Button>
                )}
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Please wait...
                  </span>
                ) : (
                  isSignup ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        <p className="text-center text-gray-500 text-xs sm:text-sm mt-6">
          Private study tracker for personal use
        </p>

        {/* Setup hint for first-time users */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/setup'}
            className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm underline transition-colors"
          >
            First time? Run database setup
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}