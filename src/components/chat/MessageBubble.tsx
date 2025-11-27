import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';

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
        <div className={`inline-block rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
            : 'glass text-gray-100'
        }`}>
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1 px-2">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
};

