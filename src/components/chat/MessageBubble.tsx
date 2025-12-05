import { motion } from 'framer-motion';
import { Bot, User, Target, Zap, MessageSquare } from 'lucide-react';
import { cleanText } from '../../lib/cleanText';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

// Get context styling and icon
const getContextStyle = (context?: string, nodeName?: string) => {
  if (!context || context === 'general' || !nodeName) return null;
  
  if (context === 'work-session') {
    return {
      icon: Target,
      label: `Working on: ${nodeName}`,
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/40',
      textColor: 'text-purple-300',
      iconColor: 'text-purple-400'
    };
  }
  
  if (context === 'daily-action') {
    return {
      icon: Zap,
      label: `Daily Action: ${nodeName}`,
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-300',
      iconColor: 'text-emerald-400'
    };
  }
  
  return null;
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  const contextStyle = getContextStyle(message.context, message.nodeName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-teal-500 to-blue-500'
      }`}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      <div className={`max-w-[70%] ${isUser ? 'text-right' : 'text-left'}`}>
        {/* Context tag - shows what node/action this message relates to */}
        {contextStyle && (
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 mb-1.5 rounded-lg text-xs ${contextStyle.bgColor} ${contextStyle.borderColor} border`}>
            <contextStyle.icon className={`w-3 h-3 ${contextStyle.iconColor}`} />
            <span className={contextStyle.textColor}>{contextStyle.label}</span>
          </div>
        )}
        
        <div className={`inline-block rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
            : contextStyle 
              ? `glass ${contextStyle.borderColor} border`
              : 'glass text-gray-100'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {cleanText(message.content)}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-1 px-2">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
};

