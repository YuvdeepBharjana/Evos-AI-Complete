import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, X, Clock, Sparkles, CheckCircle, History, Trash2 } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { 
  sendWorkSessionMessage, 
  checkApiHealth, 
  getWorkSessionMessages,
  saveWorkSessionMessage,
  clearWorkSessionMessages
} from '../lib/api';
import type { Message } from '../types';

export const WorkSessionPage = () => {
  const navigate = useNavigate();
  const { activeWorkSession, addWorkSessionMessage, endWorkSession } = useUserStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyLoaded = useRef(false);
  const [apiAvailable, setApiAvailable] = useState(false);

  // Check API availability
  useEffect(() => {
    checkApiHealth().then((health) => setApiAvailable(health.ok && health.aiAvailable));
  }, []);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeWorkSession?.messages]);

  // Redirect if no active session
  useEffect(() => {
    if (!activeWorkSession) {
      navigate('/mirror');
    }
  }, [activeWorkSession, navigate]);

  // Load previous session history
  useEffect(() => {
    const loadHistory = async () => {
      if (!activeWorkSession || historyLoaded.current) return;
      historyLoaded.current = true;
      
      try {
        const previousMessages = await getWorkSessionMessages(activeWorkSession.nodeId, 30);
        
        if (previousMessages && previousMessages.length > 0) {
          setHasHistory(true);
          
          // Add a divider message showing this is previous history
          const historyHeader: Message = {
            id: `msg-history-header`,
            content: `📜 Previous session history (${previousMessages.length} messages)\n\nPick up where you left off...`,
            sender: 'ai',
            timestamp: new Date(),
            nodeId: activeWorkSession.nodeId
          };
          addWorkSessionMessage(historyHeader);
          
          // Add previous messages
          previousMessages.forEach((msg, index) => {
            const message: Message = {
              id: `msg-history-${index}`,
              content: msg.content,
              sender: msg.role === 'user' ? 'user' : 'ai',
              timestamp: new Date(msg.created_at),
              nodeId: activeWorkSession.nodeId
            };
            addWorkSessionMessage(message);
          });
          
          // Add a continuation message
          const continueMessage: Message = {
            id: `msg-continue`,
            content: `Welcome back! Ready to continue working on ${activeWorkSession.nodeName}?\n\nWhat would you like to focus on today?`,
            sender: 'ai',
            timestamp: new Date(),
            nodeId: activeWorkSession.nodeId
          };
          addWorkSessionMessage(continueMessage);
        } else {
          // No history - show initial message
          const initialMessage: Message = {
            id: `msg-${Date.now()}`,
            content: `Let's focus on ${activeWorkSession.nodeName} together.\n\nI'm here to help you make progress. Tell me:\n• What specific aspect do you want to work on?\n• What's your goal for this session?`,
            sender: 'ai',
            timestamp: new Date(),
            nodeId: activeWorkSession.nodeId
          };
          addWorkSessionMessage(initialMessage);
        }
      } catch (error) {
        console.error('Failed to load session history:', error);
        // Fallback to initial message
        const initialMessage: Message = {
          id: `msg-${Date.now()}`,
          content: `Let's focus on ${activeWorkSession.nodeName} together.\n\nI'm here to help you make progress. Tell me:\n• What specific aspect do you want to work on?\n• What's your goal for this session?`,
          sender: 'ai',
          timestamp: new Date(),
          nodeId: activeWorkSession.nodeId
        };
        addWorkSessionMessage(initialMessage);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    loadHistory();
  }, [activeWorkSession]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateAIResponse = (userMessage: string): string => {
    const node = activeWorkSession?.nodeName.toLowerCase() || '';
    
    if (userMessage.toLowerCase().includes('done') || userMessage.toLowerCase().includes('finished')) {
      return `Excellent work! It sounds like you've made real progress on ${activeWorkSession?.nodeName}. Would you like to wrap up this session?`;
    }
    
    if (userMessage.toLowerCase().includes('stuck') || userMessage.toLowerCase().includes('help')) {
      return `I hear you. Being stuck is part of growth. Let's break this down:\n\n1. What's the smallest possible step you could take right now?\n2. What would make this 10% easier?`;
    }

    const responses = [
      `That's a great insight about your ${node}. What would taking action on this look like today?`,
      `I can see you're thinking deeply about ${node}. What's one thing you could do in the next 5 minutes?`,
      `Working on ${node} takes courage. What action can you commit to right now?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async () => {
    if (!input.trim() || !activeWorkSession) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date(),
      nodeId: activeWorkSession.nodeId
    };
    addWorkSessionMessage(userMessage);
    
    // Save user message to backend
    saveWorkSessionMessage(activeWorkSession.nodeId, 'user', input);
    
    const userInput = input;
    setInput('');

    setIsTyping(true);
    
    try {
      let responseText: string;
      
      if (apiAvailable) {
        const history = activeWorkSession.messages.map(m => ({
          content: m.content,
          sender: m.sender
        }));
        responseText = await sendWorkSessionMessage(userInput, activeWorkSession.nodeName, history);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        responseText = generateAIResponse(userInput);
      }
      
      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        content: responseText,
        sender: 'ai',
        timestamp: new Date(),
        nodeId: activeWorkSession.nodeId
      };
      addWorkSessionMessage(aiResponse);
      
      // Save AI response to backend
      saveWorkSessionMessage(activeWorkSession.nodeId, 'assistant', responseText);
    } catch (error) {
      const errorResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        content: "I'm having trouble connecting. Let's keep working - what progress have you made?",
        sender: 'ai',
        timestamp: new Date(),
        nodeId: activeWorkSession.nodeId
      };
      addWorkSessionMessage(errorResponse);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = async () => {
    if (!activeWorkSession) return;
    
    await clearWorkSessionMessages(activeWorkSession.nodeId);
    setShowClearModal(false);
    setHasHistory(false);
    
    // Navigate back and start fresh
    navigate('/mirror');
  };

  const handleEndSession = (quality: 'low' | 'medium' | 'high' | 'exceptional' | 'none') => {
    if (quality === 'none') {
      const summary = `Session on ${activeWorkSession?.nodeName} ended with no work done.`;
      endWorkSession(0, summary);
      navigate('/mirror');
      return;
    }
    const baseChange = Math.min(sessionDuration / 60, 5);
    const qualityMultipliers = { low: 0.5, medium: 1, high: 1.5, exceptional: 2 };
    const strengthChange = Math.round(baseChange * qualityMultipliers[quality]);
    
    const summary = `Worked on ${activeWorkSession?.nodeName} for ${formatDuration(sessionDuration)}. Strength +${strengthChange}%.`;
    
    endWorkSession(strengthChange, summary);
    navigate('/mirror');
  };

  if (!activeWorkSession) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex flex-col">
      <header className="glass border-b border-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Work Session</h1>
              <p className="text-sm text-purple-400">{activeWorkSession.nodeName}</p>
            </div>
            {hasHistory && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <History className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-300">Continuing session</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="font-mono text-white">{formatDuration(sessionDuration)}</span>
            </div>
            
            {hasHistory && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowClearModal(true)}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                title="Clear session history"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEndModal(true)}
              className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              End Session
            </motion.button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-3 text-gray-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"
                />
                <span>Loading session history...</span>
              </div>
            </div>
          ) : (
            activeWorkSession.messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-purple-500 text-white'
                    : message.id.includes('history-header')
                    ? 'glass border border-purple-500/30 bg-purple-500/10'
                    : 'glass border border-white/10'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </motion.div>
            ))
          )}
          
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-3">
              <motion.div 
                className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <img 
                  src="/evos-logo.svg" 
                  alt="Evos" 
                  className="w-8 h-8 invert opacity-80"
                />
              </motion.div>
              <div className="glass border border-white/10 p-4 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="glass border-t border-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Share your progress on ${activeWorkSession.nodeName}...`}
            className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none min-h-[48px] max-h-32 overflow-y-auto break-words"
            rows={1}
            style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* End Session Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">End Work Session</h3>
                  <p className="text-gray-400 text-sm">Duration: {formatDuration(sessionDuration)}</p>
                </div>
                <button onClick={() => setShowEndModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-300 mb-4">
                How would you rate your work on <strong>{activeWorkSession.nodeName}</strong>?
              </p>

              <div className="space-y-2">
                {[
                  { key: 'exceptional', label: '🌟 Exceptional', change: '+8-10%' },
                  { key: 'high', label: '💪 High Quality', change: '+5-7%' },
                  { key: 'medium', label: '👍 Solid Work', change: '+3-5%' },
                  { key: 'low', label: '😐 Light Effort', change: '+1-2%' },
                  { key: 'none', label: '❌ No Work Done', change: '0%' },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleEndSession(option.key as any)}
                    className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-left transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{option.label}</p>
                      <span className="text-green-400 text-sm">{option.change}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear History Modal */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Clear Session History?</h3>
                  <p className="text-gray-400 text-sm">This will delete all previous messages for this node.</p>
                </div>
                <button onClick={() => setShowClearModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-300 mb-6">
                Are you sure you want to clear the conversation history for <strong>{activeWorkSession.nodeName}</strong>? 
                This cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearHistory}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium"
                >
                  Clear History
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
