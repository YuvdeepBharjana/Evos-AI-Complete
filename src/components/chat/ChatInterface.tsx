import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useUserStore } from '../../store/useUserStore';
import { extractIdentityFromChat } from '../../lib/extractIdentityFromChat';
import { sendChatMessage, checkApiHealth } from '../../lib/api';
import type { Message } from '../../types';

// Fallback AI responses when API is unavailable
const generateLocalResponse = (userMessage: string, userName: string): string => {
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
  const { user, addMessage, addNodes } = useUserStore();
  const [isTyping, setIsTyping] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [user?.chatHistory]);

  // Check if API is available on mount
  useEffect(() => {
    checkApiHealth().then(setApiAvailable);
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!user) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date()
    };
    addMessage(userMessage);

    // Extract identity from user message and add new nodes
    const newNodes = extractIdentityFromChat(content, user.identityNodes);
    if (newNodes.length > 0) {
      addNodes(newNodes);
    }

    // Show typing indicator
    setIsTyping(true);

    try {
      let aiResponseText: string;

      if (apiAvailable) {
        // Use OpenAI API
        const history = user.chatHistory.map(m => ({
          content: m.content,
          sender: m.sender
        }));
        aiResponseText = await sendChatMessage(content, history);
      } else {
        // Fallback to local response
        await new Promise(resolve => setTimeout(resolve, 1000));
        aiResponseText = generateLocalResponse(content, user.name);
      }
      
      // If new identity nodes were found, mention it
      if (newNodes.length > 0) {
        aiResponseText += `\n\n✨ I noticed something! I've added ${newNodes.length} new insight${newNodes.length > 1 ? 's' : ''} to your identity mirror: ${newNodes.map(n => n.label).join(', ')}.`;
      }
      
      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        content: aiResponseText,
        sender: 'ai',
        timestamp: new Date()
      };
      addMessage(aiResponse);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        content: "I'm having trouble connecting right now. Let's try again in a moment.",
        sender: 'ai',
        timestamp: new Date()
      };
      addMessage(errorResponse);
    } finally {
      setIsTyping(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full">
      {/* API Status Indicator */}
      <div className="px-6 pt-2">
        <div className={`text-xs flex items-center gap-1.5 ${apiAvailable ? 'text-green-400' : 'text-yellow-400'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${apiAvailable ? 'bg-green-400' : 'bg-yellow-400'}`} />
          {apiAvailable ? 'AI Connected' : 'Using local mode'}
        </div>
      </div>

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
              <p className="text-sm text-gray-500 mb-4">
                Start by sharing what's on your mind, or ask me anything!
              </p>
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <p className="text-xs text-orange-300">
                  <span className="font-bold">💡 Pro tip:</span> The more you track (calories, exercise, work hours), the better I understand your patterns and can help you grow.
                </p>
              </div>
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
            <motion.div 
              className="w-9 h-9 flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <img 
                src="/evos-logo.svg" 
                alt="Evos" 
                className="w-8 h-8 invert opacity-80"
              />
            </motion.div>
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
                    className="w-2 h-2 bg-purple-400 rounded-full"
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
