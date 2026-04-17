import { motion } from 'framer-motion';
import { Sun, Moon, TrendingUp, TrendingDown, Star, AlertCircle } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

export const EndOfDaySummary = () => {
  const { user, generateDailySummary, getTodayDateString } = useUserStore();
  
  const summary = user?.lastDailySummary;
  const today = getTodayDateString();
  
  // Check if the summary is from today
  const isSummaryFromToday = summary && 
    new Date(summary.date).toISOString().split('T')[0] === today;
  
  // Only show the summary if it's from today
  if (!summary || !isSummaryFromToday) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 text-center"
      >
        <Moon className="w-12 h-12 mx-auto mb-4 text-purple-400 opacity-50" />
        <h3 className="font-bold text-white mb-2">End-of-Day Summary</h3>
        <p className="text-sm text-gray-400 mb-4">
          Complete your daily actions to generate your summary
        </p>
        <button
          onClick={generateDailySummary}
          className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm transition-colors"
        >
          Generate Summary
        </button>
      </motion.div>
    );
  }

  const isPositiveDay = summary.actionsCompleted >= summary.actionsFailed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className={`p-4 ${isPositiveDay ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-r from-orange-500/20 to-red-500/20'}`}>
        <div className="flex items-center gap-3">
          {isPositiveDay ? (
            <Sun className="w-8 h-8 text-yellow-400" />
          ) : (
            <Moon className="w-8 h-8 text-purple-400" />
          )}
          <div>
            <h3 className="font-bold text-white">Today's Summary</h3>
            <p className="text-xs text-gray-400">
              {new Date(summary.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-3 gap-4 border-b border-white/10">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">{summary.actionsCompleted}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400">{summary.actionsFailed}</p>
          <p className="text-xs text-gray-500">Missed</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${summary.totalStrengthChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {summary.totalStrengthChange >= 0 ? '+' : ''}{summary.totalStrengthChange}%
          </p>
          <p className="text-xs text-gray-500">Net Change</p>
        </div>
      </div>

      {/* Highlights */}
      <div className="p-4 space-y-3">
        {summary.topPerformingNode && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <Star className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-xs text-gray-400">Top Performer</p>
              <p className="text-sm font-medium text-white">{summary.topPerformingNode}</p>
            </div>
          </div>
        )}
        
        {summary.needsAttentionNode && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-xs text-gray-400">Needs Attention</p>
              <p className="text-sm font-medium text-white">{summary.needsAttentionNode}</p>
            </div>
          </div>
        )}
      </div>

      {/* Reflection */}
      <div className="p-4 border-t border-white/10">
        <p className="text-sm text-gray-300 italic leading-relaxed">
          "{summary.reflection}"
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Tomorrow is another chance to prove who you are becoming.
        </p>
      </div>

      {/* Alignment Score */}
      <div className="p-4 bg-white/5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Identity Alignment</span>
          <div className="flex items-center gap-2">
            {summary.alignmentScore >= 70 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-orange-400" />
            )}
            <span className="font-bold text-white">{summary.alignmentScore}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

