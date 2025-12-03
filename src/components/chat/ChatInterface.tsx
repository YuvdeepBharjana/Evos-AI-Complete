import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useUserStore } from '../../store/useUserStore';
import { extractIdentityFromChat } from '../../lib/extractIdentityFromChat';
import { sendChatMessage, checkApiHealth, createNode } from '../../lib/api';
import { cleanText } from '../../lib/cleanText';
import type { Message, IdentityNode, NodeType } from '../../types';

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

  // Parse explicit node creation requests
  const parseExplicitNodeCreation = (message: string, existingNodes: IdentityNode[]): IdentityNode[] => {
    const lowerMessage = message.toLowerCase();
    const newNodes: IdentityNode[] = [];
    
    // Check for explicit node creation patterns
    const nodeCreationPatterns = [
      /(?:add|create|make|new)\s+(?:a\s+)?(?:node|identity\s+node)\s+(?:called|named|with\s+label|:)?\s*["']?([^"'.!?]+)["']?/i,
      /(?:add|create|make)\s+["']?([^"'.!?]+)["']?\s+(?:as\s+)?(?:a\s+)?(?:node|identity\s+node)/i,
      /(?:add|create)\s+(?:a\s+)?(goal|habit|trait|emotion|struggle|interest)\s+(?:called|named)?\s*["']?([^"'.!?]+)["']?/i,
    ];
    
    const existingLabels = new Set(existingNodes.map(n => n.label.toLowerCase()));
    
    for (const pattern of nodeCreationPatterns) {
      const match = message.match(pattern);
      if (match) {
        let nodeLabel = '';
        let nodeType: NodeType = 'goal';
        
        // Check if type is specified
        const typeMatch = lowerMessage.match(/(goal|habit|trait|emotion|struggle|interest)/);
        if (typeMatch) {
          nodeType = typeMatch[1] as NodeType;
          nodeLabel = match[2] || match[1];
        } else {
          nodeLabel = match[1] || match[2];
        }
        
        // Clean up the label
        nodeLabel = nodeLabel.trim().replace(/^["']|["']$/g, '').slice(0, 50);
        
        if (nodeLabel.length > 2 && !existingLabels.has(nodeLabel.toLowerCase())) {
          existingLabels.add(nodeLabel.toLowerCase());
          
          // Determine default strength based on type
          let strength = 50;
          let status: 'mastered' | 'active' | 'developing' | 'neglected' = 'developing';
          
          if (nodeType === 'goal') {
            strength = 60;
            status = 'active';
          } else if (nodeType === 'struggle') {
            strength = 40;
            status = 'developing';
          } else if (nodeType === 'habit') {
            strength = 55;
            status = 'active';
          } else if (nodeType === 'trait') {
            strength = 65;
            status = 'active';
          }
          
          newNodes.push({
            id: `node-chat-${uuidv4()}`,
            label: cleanText(nodeLabel.charAt(0).toUpperCase() + nodeLabel.slice(1)),
            type: nodeType,
            strength,
            status,
            connections: [],
            lastUpdated: new Date(),
            createdAt: new Date(),
            description: `Created from chat: "${message.slice(0, 100)}"`
          });
        }
      }
    }
    
    return newNodes;
  };

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

    // Check for explicit node creation first
    const explicitNodes = parseExplicitNodeCreation(content, user.identityNodes);
    
    // Also extract identity from user message (natural language patterns)
    const extractedNodes = extractIdentityFromChat(content, user.identityNodes);
    
    // Combine and deduplicate nodes
    const allNewNodes = [...explicitNodes, ...extractedNodes];
    const uniqueNodes = allNewNodes.filter((node, index, self) => 
      index === self.findIndex(n => n.label.toLowerCase() === node.label.toLowerCase())
    );
    
    if (uniqueNodes.length > 0) {
      addNodes(uniqueNodes);
      // Also save to backend
      try {
        for (const node of uniqueNodes) {
          await createNode(node);
        }
      } catch (error) {
        console.error('Failed to save nodes to backend:', error);
        // Continue anyway - nodes are in local store
      }
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
      
      // Parse AI response for node creation commands
      const aiSuggestedNodes: IdentityNode[] = [];
      const nodePattern = /\[ADD_NODE:(\w+):([^:]+):(\d+)\]/g;
      let match;
      
      while ((match = nodePattern.exec(aiResponseText)) !== null) {
        const [fullMatch, type, label, strengthStr] = match;
        const nodeType = type.toLowerCase() as NodeType;
        const strength = parseInt(strengthStr, 10);
        const cleanLabel = cleanText(label.trim());
        
        // Check if node already exists
        const existingLabels = new Set(user.identityNodes.map(n => n.label.toLowerCase()));
        if (!existingLabels.has(cleanLabel.toLowerCase()) && 
            ['goal', 'habit', 'trait', 'emotion', 'struggle', 'interest'].includes(nodeType)) {
          aiSuggestedNodes.push({
            id: `node-ai-${uuidv4()}`,
            label: cleanLabel,
            type: nodeType,
            strength: Math.min(100, Math.max(1, strength)),
            status: strength >= 70 ? 'active' : 'developing',
            connections: [],
            lastUpdated: new Date(),
            createdAt: new Date(),
            description: 'Identified by AI from conversation'
          });
        }
        
        // Remove the command from the response text
        aiResponseText = aiResponseText.replace(fullMatch, '').trim();
      }
      
      // Add AI-suggested nodes
      if (aiSuggestedNodes.length > 0) {
        addNodes(aiSuggestedNodes);
        // Save to backend
        try {
          for (const node of aiSuggestedNodes) {
            await createNode(node);
          }
        } catch (error) {
          console.error('Failed to save AI-suggested nodes to backend:', error);
        }
      }
      
      // Combine all new nodes for the confirmation message
      const allNewNodes = [...uniqueNodes, ...aiSuggestedNodes];
      
      // If new identity nodes were found, mention it
      if (allNewNodes.length > 0 && !aiResponseText.includes('identity mirror')) {
        const nodeLabels = allNewNodes.map(n => n.label).join(', ');
        aiResponseText += `\n\n✨ Added to your identity mirror: ${nodeLabels}.`;
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
