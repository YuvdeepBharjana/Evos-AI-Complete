/**
 * Premarket Calibration Page
 * 
 * Chatbot interface for premarket analysis and plan creation.
 */

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send, Lock } from 'lucide-react';
import { useTradingDayStore } from '../store/useTradingDayStore';
import { coachPremarketAnalysis } from '../lib/api';
import { MessageBubble } from '../components/chat/MessageBubble';
import type { Message } from '../types';
import type { TradingDay } from '../types/tradingDay';
import { ActiveTradingPlanPanel } from '../features/premarket/components/ActiveTradingPlanPanel';

export function PremarketCalibrationPage() {
  const {
    currentDay,
    initializeToday,
    setPremarketPlan,
    isTradingUnlocked,
  } = useTradingDayStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPremarketCommitted = currentDay?.preMarketCompleted && currentDay?.preMarketPlan;
  const tradingUnlocked = isTradingUnlocked();

  // Initialize today on mount
  useEffect(() => {
    initializeToday();
  }, [initializeToday]);

  // Welcome message on mount
  useEffect(() => {
    if (messages.length === 0 && !isPremarketCommitted) {
      const welcomeMessage: Message = {
        id: 'welcome',
        sender: 'assistant',
        content: "Hey! I'm your Premarket Analysis Coach. Share your raw thoughts about today's market—your bias, setups, levels, whatever's on your mind. I'll help you structure it into a clear, executable trading plan.",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, isPremarketCommitted]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading || isPremarketCommitted) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await coachPremarketAnalysis({
        userAnalysis: userMessage.content,
        context: {
          date: today,
          session: 'premarket'
        }
      });

      // Create assistant response with refined analysis
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: result.refinedAnalysis,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-commit if structured plan is valid
      if (result.structuredPlan) {
        setPremarketPlan(result.refinedAnalysis, result.structuredPlan);
        
        const commitMessage: Message = {
          id: `commit-${Date.now()}`,
          sender: 'assistant',
          content: '✅ Plan committed and locked for today. Trading is now unlocked.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, commitMessage]);
      }

    } catch (err: any) {
      console.error('Premarket coach error:', err);
      setError(err.message || 'Premarket analysis failed. Try again.');
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        content: `❌ Error: ${err.message || 'Failed to analyze. Please try again.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentDay) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-white text-lg">Initializing today's checklist...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white">
      <div className="max-w-4xl mx-auto py-8 px-4 h-screen flex flex-col">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Premarket Calibration</h1>
          <p className="text-gray-400">Chat with your AI coach to build today's trading plan</p>
        </div>

        {/* Trading Locked Banner */}
        {!tradingUnlocked && !isPremarketCommitted && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-400/30 text-center">
            <p className="text-red-400 font-semibold">
              🔒 Complete premarket calibration to unlock trading
            </p>
          </div>
        )}

        {/* Active Plan Panel (when committed) */}
        {isPremarketCommitted && (
          <div className="mb-6">
            <ActiveTradingPlanPanel 
              structuredPlan={currentDay.preMarketStructuredPlan}
              preMarketPlan={currentDay.preMarketPlan}
              timestamp={currentDay.preMarketTimestamp}
            />
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing your analysis...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        {!isPremarketCommitted ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your market thoughts, bias, setups, levels..."
                disabled={loading}
                className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none min-h-[60px] max-h-32 overflow-y-auto break-words"
                rows={2}
              />
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                className={`p-3 rounded-xl transition-all ${
                  input.trim() && !loading
                    ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4 text-center">
            <Lock className="w-5 h-5 mx-auto mb-2 text-green-400" />
            <p className="text-green-400 font-semibold">Plan locked for today</p>
          </div>
        )}
      </div>
    </div>
  );
}
