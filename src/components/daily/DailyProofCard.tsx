import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Zap, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { getCompletionMessage } from '../../lib/generateDailyActions';
import { checkIn, updateActionStatus, updateNode, getDailyActions } from '../../lib/api';
import { cleanText } from '../../lib/cleanText';
import type { DailyAction } from '../../types';


export const DailyProofCard = () => {
  const navigate = useNavigate();
  const { user, setDailyActions, markActionComplete, addMessage, getTodayDateString } = useUserStore();
  const getStore = useUserStore.getState;
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [hasCheckedInToday, setHasCheckedInToday] = useState(() => {
    const today = getTodayDateString();
    const lastCheckInDate = localStorage.getItem('lastCheckInDate');

    // If last check-in date isn't today, treat as not checked in yet
    if (lastCheckInDate !== today) {
      localStorage.setItem('lastCheckInDate', today);
      return false;
    }

    return true;
  });

  // Helper to check if action is for today using date string (YYYY-MM-DD)
  const isActionForToday = (action: DailyAction): boolean => {
    const today = getTodayDateString();
    
    // Prefer the date field if available (most reliable)
    if (action.date) {
      return action.date === today;
    }
    
    // Fallback to createdAt date comparison
    if (!action.createdAt) return false;
    const actionDate = new Date(action.createdAt);
    return actionDate.toISOString().split('T')[0] === today;
  };

  // Load daily actions from backend on mount if none exist for today
  useEffect(() => {
    void (async () => {
      const today = getTodayDateString();
      const existingTodayActions = user?.dailyActions?.filter(a => {
        if (a.date) return a.date === today;
        if (a.createdAt) return new Date(a.createdAt).toISOString().split('T')[0] === today;
        return false;
      }) || [];
      
      // Only load from backend if we have no actions for today
      if (user?.identityNodes && existingTodayActions.length === 0) {
        try {
          // Load from backend for today (this will generate if none exist)
          const backendActions = await getDailyActions(today);
          if (backendActions && backendActions.length > 0) {
            const transformedActions: DailyAction[] = backendActions.map((a: any) => ({
              id: a.id,
              nodeId: a.node_id || a.nodeId || 'tracking',
              nodeName: a.node_name || a.nodeName || 'Daily Task',
              action: a.action_text || a.action || '',
              timeEstimate: a.time_estimate || a.timeEstimate || '5 min',
              completed: a.status === 'done' ? true : a.status === 'skipped' ? false : undefined,
              skipped: a.status === 'skipped',
              strengthChange: a.strength_change !== undefined && a.strength_change !== null ? a.strength_change : (a.status === 'done' || a.status === 'skipped' ? 0 : undefined),
              createdAt: a.date ? new Date(a.date + 'T00:00:00') : new Date(a.created_at || Date.now()),
              date: a.date || today,
            }));
            setDailyActions(transformedActions);
            console.log(`📋 Loaded ${transformedActions.length} actions for today (${today})`);
          }
        } catch (error) {
          console.error('Failed to load daily actions:', error);
        }
      }
    })();
  }, [user?.identityNodes, getTodayDateString, setDailyActions, getDailyActions]);

  const actions = user?.dailyActions || [];
  const todayActions = actions.filter(isActionForToday);
  const completedCount = todayActions.filter(a => a.completed === true).length;
  const totalCount = todayActions.length;
  const allMarked = todayActions.length > 0 && todayActions.every(a => a.completed !== undefined);
  const allCompleted = todayActions.length > 0 && todayActions.every(a => a.completed === true);
  const allTodayActionsComplete = allCompleted;

  // Auto-check-in when all today's actions are completed
  useEffect(() => {
    const performCheckIn = async () => {
      if (allTodayActionsComplete && !hasCheckedInToday) {
        console.log('✅ All actions complete!');
        
        // Dispatch event for calendar to update immediately
        window.dispatchEvent(new CustomEvent('actions-complete'));
        window.dispatchEvent(new CustomEvent('experiment-checkin'));
        
        // Mark as checked in today
        setHasCheckedInToday(true);
        
        // Do the actual check-in
        try {
          await checkIn();
          console.log('✅ Check-in successful');
        } catch (error) {
          console.error('Check-in failed:', error);
        }
      }
    };
    
    performCheckIn();
  }, [allTodayActionsComplete, hasCheckedInToday]);

  const handleMarkComplete = async (action: DailyAction, completed: boolean) => {
    // Update local state immediately for responsiveness
    markActionComplete(action.id, completed);
    const message = getCompletionMessage(completed, action.nodeName);
    setFeedbackMessage(message);
    
    if (!completed) {
      setShowReflection(true);
    }
    
    setTimeout(() => setFeedbackMessage(null), 5000);
    
    // Save to backend
    try {
      // Get the updated action from store to get the calculated strengthChange
      // Use getState() to get the latest state after markActionComplete
      const currentState = getStore();
      const updatedAction = currentState.user?.dailyActions?.find(a => a.id === action.id);
      const strengthChange = updatedAction?.strengthChange;
      
      // Update action status in backend (including strengthChange)
      await updateActionStatus(
        action.id, 
        completed ? 'done' : 'skipped',
        strengthChange
      );
      
      // If action has a node and strength change, update the node in backend
      if (action.nodeId && action.nodeId !== 'tracking' && strengthChange) {
        const node = user?.identityNodes.find(n => n.id === action.nodeId);
        if (node) {
          const newStrength = Math.max(0, Math.min(100, node.strength + strengthChange));
          await updateNode(action.nodeId, { strength: newStrength });
        }
      }
      
      // Dispatch event to notify other components (calendar, etc.)
      window.dispatchEvent(new CustomEvent('action-completed', { 
        detail: { actionId: action.id, completed } 
      }));
      
    } catch (error) {
      console.error('Failed to save action to backend:', error);
    }
  };

  const handleChangeTask = (action: DailyAction) => {
    // Create a new session for this task adaptation
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add a message to chat about adapting this task with context
    const adaptMessage = {
      id: `msg-adapt-${Date.now()}`,
      content: `I need to adapt today's task for "${cleanText(action.nodeName)}". The current task is: "${cleanText(action.action)}" — but this doesn't fit my day. Can you help me find a more realistic proof-move I can actually execute today?`,
      sender: 'user' as const,
      timestamp: new Date(),
      nodeId: action.nodeId,
      nodeName: cleanText(action.nodeName),
      context: 'daily-action' as const,
      sessionId: newSessionId
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
        {actions.map((action, index) => {
          const isToday = isActionForToday(action);
          const isPendingToday = action.completed === null && isToday && action.nodeId !== 'tracking';
          
          return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: 1, 
              x: 0
            }}
            transition={{ 
              delay: index * 0.1
            }}
            className={`p-4 rounded-xl border transition-all relative ${
              action.completed === true
                ? 'bg-green-500/10 border-green-500/30'
                : action.completed === false
                ? 'bg-red-500/10 border-red-500/30'
                : isPendingToday
                ? 'bg-purple-500/20 border-purple-500/50'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            {/* "Must be taken today" indicator */}
            {isPendingToday && (
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-gradient-to-b from-purple-400 to-blue-400 rounded-r-full" />
            )}
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
                    {cleanText(action.nodeName)}
                  </span>
                  {isPendingToday && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-purple-200 font-semibold border border-purple-400/50">
                      Today's proof-move
                    </span>
                  )}
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {action.timeEstimate}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${
                  action.completed !== null ? 'text-gray-400' : 'text-white'
                }`}>
                  {cleanText(action.action)}
                </p>
                
                {/* Strength change indicator - only show if action is completed and has a change */}
                {action.completed !== null && action.completed !== undefined && action.strengthChange !== undefined && action.strengthChange !== null && action.strengthChange !== 0 && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs mt-2 font-semibold flex items-center gap-1 ${
                      action.strengthChange > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    <span>{action.strengthChange > 0 ? '↑' : '↓'}</span>
                    <span>{Math.abs(action.strengthChange)}%</span>
                    <span className="text-gray-500 text-[10px]">strength change</span>
                  </motion.p>
                )}
              </div>

              {/* Action buttons - show for pending actions (completed is null or undefined) */}
              {(action.completed === null || action.completed === undefined) && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {/* Done / Skip buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleMarkComplete(action, true)}
                      className="w-9 h-9 rounded-lg bg-green-500/20 hover:bg-green-500/40 flex items-center justify-center text-green-400 transition-colors border border-green-500/30"
                      title="Mark as Done"
                    >
                      <Check className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleMarkComplete(action, false)}
                      className="w-9 h-9 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 transition-colors border border-red-500/30"
                      title="Didn't do it"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                  {/* Work on this / Change Task buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        // Create a new session for this task
                        const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        
                        // Add a context message to main chat with new session
                        const workMessage = {
                          id: `msg-work-${Date.now()}`,
                          content: `I want to work on my task: "${cleanText(action.action)}" for ${cleanText(action.nodeName)}. Help me make progress on this.`,
                          sender: 'user' as const,
                          timestamp: new Date(),
                          nodeId: action.nodeId,
                          nodeName: cleanText(action.nodeName),
                          context: 'daily-action' as const,
                          sessionId: newSessionId
                        };
                        addMessage(workMessage);
                        
                        // Navigate to dashboard chat
                        navigate('/dashboard');
                        setTimeout(() => {
                          const chatBtn = document.querySelector('[data-tab="chat"]');
                          if (chatBtn) (chatBtn as HTMLButtonElement).click();
                        }, 100);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 text-xs transition-colors border border-purple-500/30"
                      title="Start working on this task"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      Work
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleChangeTask(action)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs transition-colors border border-blue-500/30"
                      title="Change this task"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Change
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          );
        })}
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
