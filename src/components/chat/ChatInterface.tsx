import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useUserStore } from '../../store/useUserStore';
import { extractIdentityFromChat } from '../../lib/extractIdentityFromChat';
import { sendChatMessage, checkApiHealth, createNode } from '../../lib/api';
import { cleanText } from '../../lib/cleanText';
import type { Message, IdentityNode, NodeType } from '../../types';
import { 
  MessageSquare, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  Zap,
  Clock
} from 'lucide-react';

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

// Group messages by date
interface ChatSession {
  date: string;
  dateLabel: string;
  messages: Message[];
  preview: string;
  context?: string;
  nodeName?: string;
}

const groupMessagesByDate = (messages: Message[]): ChatSession[] => {
  const groups: Record<string, Message[]> = {};
  
  messages.forEach(msg => {
    const date = new Date(msg.timestamp).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
  });
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  return Object.entries(groups)
    .map(([date, msgs]) => {
      const firstUserMsg = msgs.find(m => m.sender === 'user');
      const preview = firstUserMsg 
        ? cleanText(firstUserMsg.content).substring(0, 40) + (firstUserMsg.content.length > 40 ? '...' : '')
        : 'New conversation';
      
      // Get context from first message with context
      const contextMsg = msgs.find(m => m.context && m.nodeName);
      
      let dateLabel = date;
      if (date === today) dateLabel = 'Today';
      else if (date === yesterday) dateLabel = 'Yesterday';
      else dateLabel = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return {
        date,
        dateLabel,
        messages: msgs,
        preview,
        context: contextMsg?.context,
        nodeName: contextMsg?.nodeName
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
};

export const ChatInterface = () => {
  const { user, addMessage, addNodes, clearChatHistory } = useUserStore();
  const [isTyping, setIsTyping] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group chat history by date
  const chatSessions = useMemo(() => {
    if (!user?.chatHistory) return [];
    return groupMessagesByDate(user.chatHistory);
  }, [user?.chatHistory]);

  // Get messages for selected date or all messages
  const displayedMessages = useMemo(() => {
    if (!user?.chatHistory) return [];
    if (!selectedDate) return user.chatHistory;
    return user.chatHistory.filter(msg => 
      new Date(msg.timestamp).toISOString().split('T')[0] === selectedDate
    );
  }, [user?.chatHistory, selectedDate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages]);

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
      const allCreatedNodes = [...uniqueNodes, ...aiSuggestedNodes];
      
      // If new identity nodes were found, mention it
      if (allCreatedNodes.length > 0 && !aiResponseText.includes('identity mirror')) {
        const nodeLabels = allCreatedNodes.map(n => n.label).join(', ');
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

  const handleViewAll = () => {
    setSelectedDate(null);
    // Scroll to bottom to show latest
    setTimeout(scrollToBottom, 100);
  };

  const handleNewChat = () => {
    clearChatHistory();
    setSelectedDate(null);
  };

  if (!user) return null;

  return (
    <div className="flex h-full relative">
      {/* Chat History Sidebar */}
      <div className={`h-full border-r border-gray-800 bg-gray-950/50 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden flex-shrink-0`}>
        {/* Sidebar Header */}
        <div className="p-3 border-b border-gray-800 min-w-[256px] space-y-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
          <button
            onClick={handleViewAll}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedDate === null
                ? 'bg-white/10 text-white'
                : 'hover:bg-white/5 text-gray-400'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            All Messages
          </button>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-w-[256px]">
          {chatSessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-600 mt-1">Start chatting to see your history</p>
            </div>
          ) : (
            chatSessions.map((session) => (
              <button
                key={session.date}
                onClick={() => setSelectedDate(session.date)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedDate === session.date
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-400">{session.dateLabel}</span>
                  {session.context && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      session.context === 'work-session' 
                        ? 'bg-purple-500/20 text-purple-300' 
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {session.context === 'work-session' ? (
                        <Target className="w-2.5 h-2.5 inline" />
                      ) : (
                        <Zap className="w-2.5 h-2.5 inline" />
                      )}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 truncate">{session.preview}</p>
                {session.nodeName && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {session.nodeName}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-0.5">
                  {session.messages.length} messages
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Toggle Sidebar Button - positioned relative to sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex-shrink-0 self-center p-1.5 bg-gray-800 hover:bg-gray-700 rounded-r-lg border-y border-r border-gray-700 transition-colors -ml-px"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with filter info */}
        {selectedDate && (
          <div className="px-4 py-2 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">
                Viewing: {chatSessions.find(s => s.date === selectedDate)?.dateLabel || selectedDate}
              </span>
            </div>
            <button
              onClick={handleViewAll}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Show all
            </button>
          </div>
        )}

        {/* API Status Indicator */}
        <div className="px-6 pt-2">
          <div className={`text-xs flex items-center gap-1.5 ${apiAvailable ? 'text-green-400' : 'text-yellow-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${apiAvailable ? 'bg-green-400' : 'bg-yellow-400'}`} />
            {apiAvailable ? 'AI Connected' : 'Using local mode'}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {displayedMessages.length === 0 ? (
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
              {displayedMessages.map((message) => (
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
    </div>
  );
};
