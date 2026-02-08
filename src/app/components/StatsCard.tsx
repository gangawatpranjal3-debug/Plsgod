import { motion } from 'motion/react';
import { formatTime } from '../utils/timeCalculations';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient: string;
  isCount?: boolean;
}

export function StatsCard({ icon, label, value, gradient, isCount = false }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="relative group bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden"
    >
      {/* Decorative gradient orb */}
      <motion.div
        className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 blur-2xl rounded-full`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg text-white`}
          >
            {icon}
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent"
        >
          {isCount ? value : formatTime(value)}
        </motion.div>
        
        <div className="text-xs sm:text-sm text-gray-400 font-medium">{label}</div>
      </div>

      {/* Hover effect border */}
      <motion.div
        className={`absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        style={{
          background: `linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 100%)`,
        }}
      />
    </motion.div>
  );
}
