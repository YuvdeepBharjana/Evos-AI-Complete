import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useUserStore } from '../../store/useUserStore';
import type { Message } from '../../types';

// Mock AI responses based on context
const generateAIResponse = (userMessage: string, userName: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return `Hey ${userName}! I've been learning about you through our conversations. How can I help you today?`;
  }
  
  if (lowerMessage.includes('goal') || lowerMessage.includes('achieve')) {
    return `I've been tracking your goals. Based on your identity profile, I see you're working on several important objectives. Would you like to break one down into actionable steps?`;
  }
  
  if (lowerMessage.includes('habit') || lowerMessage.includes('routine')) {
    return `Habits are all about consistency. I notice from your profile that you're building some strong patterns. What specific habit would you like to strengthen?`;
  }
  
  if (lowerMessage.includes('struggle') || lowerMessage.includes('difficult')) {
    return `I understand. Looking at your identity mirror, I can see the challenges you're facing. Remember, every struggle is an opportunity for growth. Let's work through this together.`;
  }
  
  if (lowerMessage.includes('mirror') || lowerMessage.includes('profile')) {
    return `Your identity mirror is constantly evolving as we learn more about you. Check it out to see your strengths, habits, and areas of growth visualized in real-time!`;
  }
  
  return `That's interesting, ${userName}. I'm continuously learning about your patterns and preferences. How does this connect to your current goals?`;
};

export const ChatInterface = () => {
  const { user, addMessage } = useUserStore();
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [user?.chatHistory]);

  const handleSendMessage = (content: string) => {
    if (!user) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date()
    };
    addMessage(userMessage);

    // Simulate AI typing
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        content: generateAIResponse(content, user.name),
        sender: 'ai',
        timestamp: new Date()
      };
      addMessage(aiResponse);
      setIsTyping(false);
    }, 1500);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {user.chatHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="glass rounded-3xl p-8 max-w-md mx-auto">
              <h3 className="text-2xl font-bold gradient-text mb-4">
                Welcome to Your AI Companion
              </h3>
              <p className="text-gray-400 mb-4">
                I'm here to help you grow, track your progress, and understand yourself better.
              </p>
              <p className="text-sm text-gray-500">
                Start by sharing what's on your mind, or ask me anything!
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {user.chatHistory.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </>
        )}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🤖
              </motion.div>
            </div>
            <div className="glass rounded-2xl px-4 py-3">
              <motion.div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-800">
        <ChatInput onSend={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
};

