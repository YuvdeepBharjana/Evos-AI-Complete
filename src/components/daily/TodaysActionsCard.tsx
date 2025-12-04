import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, XCircle, TrendingUp, TrendingDown, 
  Zap, Clock, Target, Trophy
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { cleanText } from '../../lib/cleanText';
import type { DailyAction } from '../../types';

export const TodaysActionsCard = () => {
  const { user } = useUserStore();
  
  // Helper to check if a date is today
  const isToday = (date: Date | string | undefined): boolean => {
    if (!date) return false;
    const d = new Date(date);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };
  
  // Filter actions for today only
  const todaysActions = useMemo(() => {
    if (!user?.dailyActions) return [];
    return user.dailyActions.filter(action => isToday(action.createdAt));
  }, [user?.dailyActions]);
  
  // Separate completed and pending actions
  const completedActions = todaysActions.filter(a => a.completed === true);
  const skippedActions = todaysActions.filter(a => a.completed === false);
  const pendingActions = todaysActions.filter(a => a.completed === null);
  
  // Calculate totals
  const totalStrengthGain = completedActions.reduce((sum, a) => sum + (a.strengthChange || 0), 0);
  const totalStrengthLoss = skippedActions.reduce((sum, a) => sum + (a.strengthChange || 0), 0);
  const netChange = totalStrengthGain + totalStrengthLoss;
  
  if (todaysActions.length === 0) {
    return null; // Don't show if no actions today
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Today's Summary</h3>
              <p className="text-xs text-gray-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          {/* Net change badge */}
          {(completedActions.length > 0 || skippedActions.length > 0) && (
            <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
              netChange > 0 
                ? 'bg-green-500/20 text-green-400' 
                : netChange < 0 
                ? 'bg-red-500/20 text-red-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {netChange > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : netChange < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              <span className="font-bold">
                {netChange > 0 ? '+' : ''}{netChange}%
              </span>
              <span className="text-xs opacity-75">Net Change</span>
            </div>
          )}
        </div>
        
        {/* Progress stats */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            </div>
            <span className="text-gray-300">{completedActions.length}</span>
            <span className="text-gray-500">Completed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <span className="text-gray-300">{skippedActions.length}</span>
            <span className="text-gray-500">Missed</span>
          </div>
          {pendingActions.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <span className="text-gray-300">{pendingActions.length}</span>
              <span className="text-gray-500">Pending</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions List */}
      <div className="p-4 space-y-3">
        {/* Completed Actions */}
        <AnimatePresence>
          {completedActions.map((action, index) => (
            <ActionRow 
              key={action.id} 
              action={action} 
              index={index}
              type="completed"
            />
          ))}
        </AnimatePresence>
        
        {/* Skipped Actions */}
        <AnimatePresence>
          {skippedActions.map((action, index) => (
            <ActionRow 
              key={action.id} 
              action={action} 
              index={completedActions.length + index}
              type="skipped"
            />
          ))}
        </AnimatePresence>
        
        {/* Pending Actions (subtle) */}
        {pendingActions.length > 0 && completedActions.length > 0 && (
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-gray-500 mb-2">Still pending:</p>
            {pendingActions.map((action) => (
              <div 
                key={action.id}
                className="text-sm text-gray-500 py-1 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                {cleanText(action.nodeName)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Complete Message */}
      {completedActions.length === todaysActions.length && todaysActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-t border-green-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-400">All tasks completed!</p>
              <p className="text-xs text-gray-400">
                +{totalStrengthGain}% total strength gained today
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Individual action row component
interface ActionRowProps {
  action: DailyAction;
  index: number;
  type: 'completed' | 'skipped';
}

const ActionRow = ({ action, index, type }: ActionRowProps) => {
  const isCompleted = type === 'completed';
  const strengthChange = action.strengthChange || 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={`p-3 rounded-xl border ${
        isCompleted 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-red-500/10 border-red-500/30'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Status icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isCompleted ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {isCompleted ? (
            <CheckCircle className="w-4 h-4 text-white" />
          ) : (
            <XCircle className="w-4 h-4 text-white" />
          )}
        </div>
        
        {/* Action info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isCompleted 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-red-500/20 text-red-300'
            }`}>
              {cleanText(action.nodeName)}
            </span>
            {action.timeEstimate && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {action.timeEstimate}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-300 truncate">
            {cleanText(action.action)}
          </p>
        </div>
        
        {/* Strength change */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
          strengthChange > 0 
            ? 'bg-green-500/20 text-green-400' 
            : strengthChange < 0 
            ? 'bg-red-500/20 text-red-400'
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {strengthChange > 0 ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : strengthChange < 0 ? (
            <TrendingDown className="w-3.5 h-3.5" />
          ) : (
            <Zap className="w-3.5 h-3.5" />
          )}
          <span className="text-sm font-bold">
            {strengthChange > 0 ? '+' : ''}{strengthChange}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

