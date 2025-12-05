import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled = false }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass rounded-2xl p-4 flex gap-3 items-end">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Share your thoughts, goals, or ask anything..."
        disabled={disabled}
        className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 resize-none focus:outline-none min-h-[40px] max-h-32 overflow-y-auto break-words whitespace-pre-wrap"
        rows={1}
        style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
      />
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className={`p-3 rounded-xl transition-all ${
          input.trim() && !disabled
            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
        }`}
      >
        <Send size={20} />
      </motion.button>
    </div>
  );
};

