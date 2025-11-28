import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, X, Clock, Sparkles, CheckCircle } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { sendWorkSessionMessage, checkApiHealth } from '../lib/api';
import type { Message } from '../types';

export const WorkSessionPage = () => {
  const navigate = useNavigate();
  const { activeWorkSession, addWorkSessionMessage, endWorkSession } = useUserStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageSent = useRef(false);
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
    checkApiHealth().then(setApiAvailable);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeWorkSession?.messages]);

  useEffect(() => {
    if (!activeWorkSession) {
      navigate('/mirror');
    }
  }, [activeWorkSession, navigate]);

  useEffect(() => {
    if (activeWorkSession && activeWorkSession.messages.length === 0 && !initialMessageSent.current) {
      initialMessageSent.current = true;
      const initialMessage: Message = {
        id: `msg-${Date.now()}`,
        content: `Let's focus on ${activeWorkSession.nodeName} together.\n\nI'm here to help you make progress. Tell me:\n• What specific aspect do you want to work on?\n• What's your goal for this session?`,
        sender: 'ai',
        timestamp: new Date(),
        nodeId: activeWorkSession.nodeId
      };
      addWorkSessionMessage(initialMessage);
    }
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
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="font-mono text-white">{formatDuration(sessionDuration)}</span>
            </div>
            
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
          {activeWorkSession.messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-purple-500 text-white'
                  : 'glass border border-white/10'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </motion.div>
          ))}
          
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
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Share your progress on ${activeWorkSession.nodeName}...`}
            className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
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
    </div>
  );
};

