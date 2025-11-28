import { motion } from 'framer-motion';
import { AlertTriangle, X, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface TrackingReminderProps {
  variant?: 'banner' | 'card' | 'toast';
  onDismiss?: () => void;
}

export const TrackingReminder = ({ variant = 'banner', onDismiss }: TrackingReminderProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (variant === 'toast') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="fixed bottom-24 right-4 z-40 max-w-sm"
      >
        <div className="glass rounded-xl p-4 border border-orange-500/30 shadow-lg shadow-orange-500/10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Have you tracked today?</p>
              <p className="text-xs text-gray-400 mt-1">
                Your AI needs data to measure your growth. Track now to close the loop.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-xl p-4 border border-purple-500/30"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">The Loop Needs Data</p>
            <p className="text-xs text-gray-400">
              Identity → Action → <span className="text-purple-400 font-semibold">Measurement</span> → Reinforcement
            </p>
          </div>
        </div>
        <div className="mt-3 p-2 rounded-lg bg-purple-500/10">
          <p className="text-xs text-gray-300">
            Without tracking, I can't see your progress. Every calorie, workout minute, and work hour tells your story.
          </p>
        </div>
      </motion.div>
    );
  }

  // Banner variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-orange-500/20 px-4 py-2"
    >
      <div className="flex items-center justify-center gap-2 text-sm">
        <AlertTriangle className="w-4 h-4 text-orange-400" />
        <span className="text-gray-300">
          <span className="text-orange-400 font-semibold">Tracking powers the loop.</span>
          {' '}Log your daily data to unlock AI insights.
        </span>
      </div>
    </motion.div>
  );
};

