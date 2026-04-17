import { motion } from 'framer-motion';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { MicroWinCelebration } from './MicroWinCelebration';
import { useUserStore } from '../../store/useUserStore';

interface DailyActionsPanelProps {
  currentNodeId: string;
}

export const DailyActionsPanel = ({ currentNodeId }: DailyActionsPanelProps) => {
  const { user, markActionComplete, getTodayDateString } = useUserStore();
  const [celebratingActionId, setCelebratingActionId] = useState<string | null>(null);

  const today = getTodayDateString();
  
  // Get today's actions
  const todayActions = user?.dailyActions?.filter(action => {
    const actionDate = action.date || (action.createdAt ? new Date(action.createdAt).toISOString().split('T')[0] : '');
    return actionDate === today;
  }) || [];

  // Calculate completion stats
  const completedCount = todayActions.filter(a => a.completed).length;
  const totalCount = todayActions.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggleComplete = (actionId: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted) {
      // Show celebration
      setCelebratingActionId(actionId);
      
      // Mark as complete
      markActionComplete(actionId, true);
      
      // Reset celebration after animation
      setTimeout(() => setCelebratingActionId(null), 600);
    } else {
      // Uncheck (no celebration)
      markActionComplete(actionId, false);
    }
  };

  const isRelatedToCurrentNode = (action: any) => {
    return action.nodeId === currentNodeId;
  };

  return (
    <div className="h-full flex flex-col bg-gray-950/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-lg font-bold text-white mb-1">Today's Actions</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-400">
            {completedCount}/{totalCount}
          </span>
        </div>
        {progressPercentage === 100 && totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-xs text-green-400 font-medium"
          >
            🎉 All done for today!
          </motion.div>
        )}
      </div>

      {/* Actions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {todayActions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No actions for today yet</p>
          </div>
        ) : (
          todayActions.map((action) => {
            const isRelated = isRelatedToCurrentNode(action);
            const isCompleted = action.completed;

            return (
              <motion.div
                key={action.id}
                className="relative group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  onClick={() => handleToggleComplete(action.id, isCompleted)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    isRelated
                      ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30'
                      : 'bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50'
                  }`}
                >
                  {/* Checkbox */}
                  <motion.div
                    className={`relative flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500 border-green-500'
                        : 'bg-gray-800 border-gray-600'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={
                      isCompleted
                        ? {
                            scale: [1, 1.2, 1],
                            transition: { duration: 0.3 },
                          }
                        : {}
                    }
                  >
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check size={16} className="text-white" />
                      </motion.div>
                    )}
                    
                    {/* Celebration for this specific action */}
                    {celebratingActionId === action.id && (
                      <MicroWinCelebration show={true} />
                    )}
                  </motion.div>

                  {/* Action Text */}
                  <div className="flex-1 text-left">
                    <p
                      className={`text-sm leading-snug ${
                        isCompleted
                          ? 'text-gray-500 line-through'
                          : 'text-gray-200'
                      }`}
                    >
                      {action.description || action.text || 'Unnamed action'}
                    </p>
                    {isRelated && (
                      <span className="text-xs text-purple-400 mt-1 inline-block">
                        Related to this node
                      </span>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
