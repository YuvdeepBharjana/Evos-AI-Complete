import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Zap, Clock, RefreshCw, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { generateDailyActions, getCompletionMessage } from '../../lib/generateDailyActions';
import type { DailyAction } from '../../types';

export const DailyProofCard = () => {
  const navigate = useNavigate();
  const { user, setDailyActions, markActionComplete, addMessage } = useUserStore();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState('');

  useEffect(() => {
    if (user?.identityNodes && (!user.dailyActions || user.dailyActions.length === 0)) {
      const actions = generateDailyActions(user.identityNodes);
      setDailyActions(actions);
    }
  }, [user?.identityNodes]);

  const actions = user?.dailyActions || [];
  const completedCount = actions.filter(a => a.completed === true).length;
  const totalCount = actions.length;
  const allMarked = actions.every(a => a.completed !== null);

  const handleMarkComplete = (action: DailyAction, completed: boolean) => {
    markActionComplete(action.id, completed);
    const message = getCompletionMessage(completed, action.nodeName);
    setFeedbackMessage(message);
    
    if (!completed) {
      setShowReflection(true);
    }
    
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleChangeTask = (action: DailyAction) => {
    // Add a message to chat about adapting this task
    const adaptMessage = {
      id: `msg-adapt-${Date.now()}`,
      content: `I need to adapt today's task for "${action.nodeName}". The current task is: "${action.action}" — but this doesn't fit my day. Can you help me find a more realistic proof-move I can actually execute today?`,
      sender: 'user' as const,
      timestamp: new Date()
    };
    addMessage(adaptMessage);
    
    // Navigate to chat
    navigate('/dashboard');
    // Small delay to ensure navigation, then switch to chat tab
    setTimeout(() => {
      const chatBtn = document.querySelector('[data-tab="chat"]');
      if (chatBtn) (chatBtn as HTMLButtonElement).click();
    }, 100);
  };

  const handleReflectionSubmit = () => {
    if (reflectionText.trim()) {
      // Save reflection as a message for context
      const reflectionMessage = {
        id: `msg-reflect-${Date.now()}`,
        content: `[Reflection on missed task] ${reflectionText}`,
        sender: 'user' as const,
        timestamp: new Date()
      };
      addMessage(reflectionMessage);
    }
    setShowReflection(false);
    setReflectionText('');
  };

  const regenerateActions = () => {
    if (user?.identityNodes) {
      const actions = generateDailyActions(user.identityNodes);
      setDailyActions(actions);
    }
  };

  if (!user || actions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="text-center text-gray-400">
          <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Generating your proof-moves...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header - New messaging */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Daily Proof-Moves</h3>
              <p className="text-xs text-gray-400">
                {completedCount}/{totalCount} executed
              </p>
            </div>
          </div>
          <button
            onClick={regenerateActions}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            title="Generate new tasks"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / totalCount) * 100}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* New CTA messaging */}
      <div className="px-4 py-3 border-b border-white/5 bg-black/20">
        <p className="text-xs text-gray-400">
          <span className="text-purple-400 font-semibold">Not suggestions. Proof.</span>
          {' '}Binary behaviors you either do or don't. Tap{' '}
          <span className="text-blue-400">Change Task</span>
          {' '}to adapt through chat.
        </p>
      </div>

      {/* Actions list */}
      <div className="p-4 space-y-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border transition-all ${
              action.completed === true
                ? 'bg-green-500/10 border-green-500/30'
                : action.completed === false
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Status indicator */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                action.completed === true
                  ? 'bg-green-500'
                  : action.completed === false
                  ? 'bg-red-500'
                  : 'bg-gradient-to-br from-purple-500/50 to-blue-500/50'
              }`}>
                {action.completed === true ? (
                  <Check className="w-4 h-4 text-white" />
                ) : action.completed === false ? (
                  <X className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-xs font-bold text-white">{index + 1}</span>
                )}
              </div>

              {/* Action content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                    {action.nodeName}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {action.timeEstimate}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${
                  action.completed !== null ? 'text-gray-400' : 'text-white'
                }`}>
                  {action.action}
                </p>
                
                {/* Strength change indicator */}
                {action.strengthChange !== undefined && action.strengthChange !== null && (
                  <p className={`text-xs mt-2 font-medium ${
                    action.strengthChange > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {action.strengthChange > 0 ? '↑' : '↓'} {Math.abs(action.strengthChange)}% strength
                  </p>
                )}
              </div>

              {/* Action buttons */}
              {action.completed === null && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleMarkComplete(action, true)}
                      className="w-8 h-8 rounded-lg bg-green-500/20 hover:bg-green-500/40 flex items-center justify-center text-green-400 transition-colors"
                      title="Done"
                    >
                      <Check className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleMarkComplete(action, false)}
                      className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 transition-colors"
                      title="Didn't do it"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                  {/* Change Task button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChangeTask(action)}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Change Task
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feedback message */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 pb-4"
          >
            <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <p className="text-sm text-purple-200">{feedbackMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reflection modal */}
      <AnimatePresence>
        {showReflection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-bold text-white mb-2">
                What blocked you?
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                This is data. The system learns from what stops you — be specific.
              </p>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Time, energy, clarity, fear, distraction..."
                className="w-full h-24 bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowReflection(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-white/5"
                >
                  Skip
                </button>
                <button
                  onClick={handleReflectionSubmit}
                  className="flex-1 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 flex items-center justify-center gap-2"
                >
                  Log it
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All complete */}
      {allMarked && completedCount === totalCount && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-t border-green-500/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-green-400">All proof-moves executed.</p>
              <p className="text-sm text-gray-400">
                Tomorrow's tasks will be harder. You can handle harder.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* CTA Footer */}
      <div className="px-4 py-3 bg-black/30 border-t border-white/5">
        <p className="text-xs text-center text-gray-500">
          Don't do more. <span className="text-purple-400">Do what changes you.</span>
        </p>
      </div>
    </motion.div>
  );
};
