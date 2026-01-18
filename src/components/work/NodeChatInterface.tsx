import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from '../chat/MessageBubble';
import { ChatInput } from '../chat/ChatInput';
import { useUserStore } from '../../store/useUserStore';
import { sendChatMessage } from '../../lib/api';
import type { IdentityNode } from '../../types';

interface NodeChatInterfaceProps {
  node: IdentityNode;
}

export const NodeChatInterface = ({ node }: NodeChatInterfaceProps) => {
  const { user, addMessage } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages related to this node (or show all for context)
  const nodeMessages = user?.messages?.filter(msg => 
    msg.nodeId === node.id || !msg.nodeId // Show node-specific and general messages
  ) || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [nodeMessages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      content,
      sender: 'user' as const,
      timestamp: new Date(),
      nodeId: node.id,
      nodeName: node.label,
    };
    addMessage(userMessage);

    setIsLoading(true);

    try {
      // Send to API - the backend will handle node context
      const response = await sendChatMessage(content);

      // Add AI response
      const aiMessage = {
        id: `msg-${Date.now()}-ai`,
        content: response.response || response.message || "I'm here to help with your growth.",
        sender: 'ai' as const,
        timestamp: new Date(),
        nodeId: node.id,
      };
      addMessage(aiMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage = {
        id: `msg-${Date.now()}-error`,
        content: "Sorry, I couldn't process that message. Please try again.",
        sender: 'ai' as const,
        timestamp: new Date(),
        nodeId: node.id,
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-950/50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {nodeMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">👋</p>
              <p className="text-sm">Let's work on <span className="text-white font-semibold">{node.label}</span></p>
              <p className="text-xs mt-1">Ask me anything to get started</p>
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {nodeMessages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-gray-500 text-sm"
              >
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 bg-gray-500 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-500 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-500 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
                <span>Thinking...</span>
              </motion.div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder={`Talk about ${node.label}...`}
        />
      </div>
    </div>
  );
};
