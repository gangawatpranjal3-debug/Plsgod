import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, RefreshCw, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { checkConnection, isOnlineMode, setConnectionMode } from '../utils/api';
import { soundManager } from '../utils/sound';

export function ConnectionStatus() {
  const [online, setOnline] = useState(isOnlineMode());
  const [checking, setChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [justSwitched, setJustSwitched] = useState(false);

  useEffect(() => {
    // Update status every 30 seconds
    const interval = setInterval(() => {
      const isOnline = isOnlineMode();
      if (isOnline !== online) {
        setOnline(isOnline);
        soundManager.playNotification();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [online]);

  const handleRecheck = async () => {
    setChecking(true);
    const isOnline = await checkConnection();
    setOnline(isOnline);
    setChecking(false);
    setJustSwitched(true);
    soundManager.playNotification();
    setTimeout(() => setJustSwitched(false), 2000);
  };

  const handleToggleMode = () => {
    const newMode = !online;
    setConnectionMode(newMode);
    setOnline(newMode);
    setJustSwitched(true);
    soundManager.playNotification();
    setTimeout(() => setJustSwitched(false), 2000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        {/* Status Badge */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDetails(!showDetails)}
          className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-2xl transition-all backdrop-blur-xl border-2 ${
            online
              ? 'bg-green-500/90 hover:bg-green-600 border-green-400/50 shadow-green-500/30'
              : 'bg-amber-500/90 hover:bg-amber-600 border-amber-400/50 shadow-amber-500/30'
          } text-white text-xs sm:text-sm font-medium`}
        >
          {checking ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.div>
          ) : online ? (
            <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : (
            <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
          <span className="hidden sm:inline">{online ? 'Online' : 'Offline'}</span>
        </motion.button>

        {/* Details Panel */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bottom-full right-0 mb-3 w-64 sm:w-80 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800/50 rounded-2xl shadow-2xl p-4 sm:p-5"
            >
              <div className="mb-4">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  {online ? <Wifi className="w-4 h-4 text-green-400" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
                  Connection Status
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {online
                    ? 'Connected to Supabase backend'
                    : 'Using local storage (offline mode)'}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  {online ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-amber-500" />
                  )}
                  <span className="text-gray-300">Edge Function</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-gray-300">Local Storage</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {justSwitched && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-xs"
                  >
                    ✓ Mode switched to {online ? 'Online' : 'Offline'}
                  </motion.div>
                )}
              </AnimatePresence>

              {!online && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg"
                >
                  <p className="text-amber-400 text-xs">
                    ⚠️ Edge Function not available. Data is stored locally and won't sync.
                  </p>
                </motion.div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleRecheck}
                  disabled={checking}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs"
                >
                  {checking ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      <span className="hidden sm:inline">Checking...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Recheck</span>
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={handleToggleMode}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  {online ? 'Offline' : 'Online'}
                </Button>
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-800/50">
                <p className="text-gray-500 text-xs">
                  Offline mode uses localStorage. Online mode requires the Supabase Edge Function.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}