import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useUserStore } from '../../store/useUserStore';
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
  Clock,
  MoreVertical,
  Trash2,
  Edit3,
  X,
  Check
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

// Group messages by session
interface ChatSession {
  sessionId: string;
  messages: Message[];
  preview: string;
  timestamp: Date;
  timeLabel: string;
  context?: string;
  nodeName?: string;
}

const groupMessagesBySession = (messages: Message[]): ChatSession[] => {
  const groups: Record<string, Message[]> = {};
  
  // Group messages by sessionId
  messages.forEach(msg => {
    const sessionId = msg.sessionId || 'default';
    if (!groups[sessionId]) {
      groups[sessionId] = [];
    }
    groups[sessionId].push(msg);
  });
  
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  return Object.entries(groups)
    .map(([sessionId, msgs]) => {
      const firstUserMsg = msgs.find(m => m.sender === 'user');
      const preview = firstUserMsg 
        ? cleanText(firstUserMsg.content).substring(0, 35) + (firstUserMsg.content.length > 35 ? '...' : '')
        : 'New conversation';
      
      // Get context from first message with context
      const contextMsg = msgs.find(m => m.context && m.nodeName);
      
      // Get timestamp from first message
      const firstTimestamp = msgs[0]?.timestamp ? new Date(msgs[0].timestamp) : now;
      const dateStr = firstTimestamp.toISOString().split('T')[0];
      
      let timeLabel: string;
      if (dateStr === today) {
        timeLabel = firstTimestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      } else if (dateStr === yesterday) {
        timeLabel = 'Yesterday';
      } else {
        timeLabel = firstTimestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      return {
        sessionId,
        messages: msgs,
        preview,
        timestamp: firstTimestamp,
        timeLabel,
        context: contextMsg?.context,
        nodeName: contextMsg?.nodeName
      };
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Most recent first
};

// Generate a unique session ID
const generateSessionId = () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const ChatInterface = () => {
  const { user, addMessage, addNodes, deleteMessagesBySession, chatSessionNames, setChatSessionName } = useUserStore();
  const [isTyping, setIsTyping] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => generateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Menu and rename state
  const [menuOpenSessionId, setMenuOpenSessionId] = useState<string | null>(null);
  const [renameSessionId, setRenameSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Pending node suggestions (AI suggests, user confirms)
  const [pendingNodeSuggestions, setPendingNodeSuggestions] = useState<IdentityNode[]>([]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenSessionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group chat history by session
  const chatSessions = useMemo(() => {
    if (!user?.chatHistory) return [];
    return groupMessagesBySession(user.chatHistory);
  }, [user?.chatHistory]);

  // Get messages for current session
  const displayedMessages = useMemo(() => {
    if (!user?.chatHistory) return [];
    return user.chatHistory.filter(msg => msg.sessionId === currentSessionId);
  }, [user?.chatHistory, currentSessionId]);

  // Get display name for a session (custom name or preview)
  const getSessionDisplayName = (session: ChatSession) => {
    return chatSessionNames[session.sessionId] || session.preview;
  };

  // Handle rename
  const handleStartRename = (sessionId: string) => {
    setRenameSessionId(sessionId);
    setRenameValue(chatSessionNames[sessionId] || '');
    setMenuOpenSessionId(null);
  };

  const handleSaveRename = () => {
    if (renameSessionId && renameValue.trim()) {
      setChatSessionName(renameSessionId, renameValue.trim());
    }
    setRenameSessionId(null);
    setRenameValue('');
  };

  const handleCancelRename = () => {
    setRenameSessionId(null);
    setRenameValue('');
  };

  // Handle delete
  const handleDeleteSession = (sessionId: string) => {
    deleteMessagesBySession(sessionId);
    setMenuOpenSessionId(null);
    // If we deleted the current session, switch to a new one
    if (sessionId === currentSessionId) {
      setCurrentSessionId(generateSessionId());
    }
  };

  // Handle accepting a suggested node
  const handleAcceptNode = async (node: IdentityNode) => {
    addNodes([node]);
    try {
      await createNode(node);
    } catch (error) {
      console.error('Failed to save node to backend:', error);
    }
    setPendingNodeSuggestions(prev => prev.filter(n => n.id !== node.id));
    
    // Add a confirmation message
    const confirmMsg: Message = {
      id: `msg-confirm-${Date.now()}`,
      content: `✨ Added "${node.label}" to your identity mirror.`,
      sender: 'ai',
      timestamp: new Date(),
      sessionId: currentSessionId
    };
    addMessage(confirmMsg);
  };

  // Handle rejecting a suggested node
  const handleRejectNode = (nodeId: string) => {
    setPendingNodeSuggestions(prev => prev.filter(n => n.id !== nodeId));
  };

  // Handle rejecting all suggested nodes
  const handleRejectAllNodes = () => {
    setPendingNodeSuggestions([]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages]);

  // Check if API is available on mount
  useEffect(() => {
    checkApiHealth().then((health) => setApiAvailable(health.ok && health.aiAvailable));
  }, []);

  // Auto-respond to externally added messages (e.g., from "Work on" button)
  const lastProcessedMsgRef = useRef<string | null>(null);
  useEffect(() => {
    if (!user?.chatHistory || isTyping) return;
    
    const messages = user.chatHistory;
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    
    // Check if this is a new user message that needs a response
    // (has context like 'daily-action' and hasn't been processed yet)
    if (
      lastMessage.sender === 'user' && 
      lastMessage.context === 'daily-action' &&
      lastMessage.id !== lastProcessedMsgRef.current
    ) {
      lastProcessedMsgRef.current = lastMessage.id;
      
      // Switch to this message's session (or use current if it has one)
      const msgSessionId = lastMessage.sessionId || currentSessionId;
      if (msgSessionId !== currentSessionId) {
        setCurrentSessionId(msgSessionId);
      }
      
      // Trigger AI response for this message
      triggerAIResponse(lastMessage.content, lastMessage.nodeName, msgSessionId);
    }
  }, [user?.chatHistory, isTyping, currentSessionId]);

  // Separate function to trigger AI response (used by auto-respond and manual send)
  const triggerAIResponse = async (userContent: string, nodeName?: string, sessionId?: string) => {
    if (!user) return;
    
    const targetSessionId = sessionId || currentSessionId;
    setIsTyping(true);

    try {
      let aiResponseText: string;

      // Always check API availability fresh (don't rely on stale state)
      const isApiAvailable = await checkApiHealth();

      if (isApiAvailable) {
        // Only use messages from the current session for context
        const sessionMessages = user.chatHistory.filter(m => m.sessionId === targetSessionId);
        const history = sessionMessages.map(m => ({
          content: m.content,
          sender: m.sender
        }));
        aiResponseText = await sendChatMessage(userContent, history);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        aiResponseText = generateLocalResponse(userContent, user.name);
      }
      
      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        content: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        nodeName: nodeName,
        sessionId: targetSessionId
      };
      addMessage(aiResponse);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        content: "I'm having trouble connecting right now. Let's try again in a moment.",
        sender: 'ai',
        timestamp: new Date(),
        sessionId: targetSessionId
      };
      addMessage(errorResponse);
    } finally {
      setIsTyping(false);
    }
  };

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

    // Add user message with session ID
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date(),
      sessionId: currentSessionId
    };
    addMessage(userMessage);

    // Only check for EXPLICIT node creation commands (e.g., "add node X", "create node for Y")
    // We no longer automatically extract nodes from natural language patterns
    const explicitNodes = parseExplicitNodeCreation(content, user.identityNodes);
    
    if (explicitNodes.length > 0) {
      addNodes(explicitNodes);
      // Also save to backend
      try {
        for (const node of explicitNodes) {
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
        // Use OpenAI API - only use messages from current session for context
        const sessionMessages = user.chatHistory.filter(m => m.sessionId === currentSessionId);
        const history = sessionMessages.map(m => ({
          content: m.content,
          sender: m.sender
        }));
        aiResponseText = await sendChatMessage(content, history);
      } else {
        // Fallback to local response
        await new Promise(resolve => setTimeout(resolve, 1000));
        aiResponseText = generateLocalResponse(content, user.name);
      }
      
      // Parse AI response for node creation commands - but DON'T auto-add them
      // Instead, show a confirmation prompt to the user
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
            description: 'Suggested by AI from conversation'
          });
        }
        
        // Remove the command from the response text
        aiResponseText = aiResponseText.replace(fullMatch, '').trim();
      }
      
      // If AI suggested nodes, show confirmation prompt instead of auto-adding
      if (aiSuggestedNodes.length > 0) {
        setPendingNodeSuggestions(prev => [...prev, ...aiSuggestedNodes]);
      }
      
      // Only mention explicitly created nodes (from user commands)
      if (explicitNodes.length > 0) {
        const nodeLabels = explicitNodes.map(n => n.label).join(', ');
        aiResponseText += `\n\n✨ Added to your identity mirror: ${nodeLabels}.`;
      }
      
      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        content: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        sessionId: currentSessionId
      };
      addMessage(aiResponse);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        content: "I'm having trouble connecting right now. Let's try again in a moment.",
        sender: 'ai',
        timestamp: new Date(),
        sessionId: currentSessionId
      };
      addMessage(errorResponse);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    // Create a new session - previous chats remain in sidebar
    setCurrentSessionId(generateSessionId());
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  if (!user) return null;

  return (
    <div className="flex h-full relative">
      {/* Chat History Sidebar */}
      <div className={`h-full border-r border-gray-800 bg-gray-950/50 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden flex-shrink-0`}>
        {/* Sidebar Header */}
        <div className="p-3 border-b border-gray-800 min-w-[256px]">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Recent Chats Label */}
        <div className="px-3 py-2 min-w-[256px]">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Recent Chats</span>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 min-w-[256px]">
          {chatSessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-600 mt-1">Start chatting to see your history</p>
            </div>
          ) : (
            chatSessions.map((session) => (
              <div key={session.sessionId} className="relative group">
                {/* Rename Mode */}
                {renameSessionId === session.sessionId ? (
                  <div className="p-2 rounded-lg bg-white/5 border border-purple-500/30">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename();
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      placeholder="Chat name..."
                      className="w-full px-2 py-1.5 text-sm bg-gray-900/50 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      autoFocus
                    />
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={handleSaveRename}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs"
                      >
                        <Check className="w-3 h-3" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-xs"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => handleSelectSession(session.sessionId)}
                    className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer ${
                      currentSessionId === session.sessionId
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-400">{session.timeLabel}</span>
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
                      
                      {/* 3-dot Menu Button */}
                      <div className="relative" ref={menuOpenSessionId === session.sessionId ? menuRef : null}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenSessionId(menuOpenSessionId === session.sessionId ? null : session.sessionId);
                          }}
                          className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {menuOpenSessionId === session.sessionId && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-full mt-1 w-36 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartRename(session.sessionId);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                                Rename
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSession(session.sessionId);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 truncate">{getSessionDisplayName(session)}</p>
                    {session.nodeName && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {session.nodeName}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-0.5">
                      {session.messages.length} messages
                    </p>
                  </div>
                )}
              </div>
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

        {/* Pending Node Suggestions */}
        <AnimatePresence>
          {pendingNodeSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-6 py-4 border-t border-purple-500/30 bg-purple-500/5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">
                    Add to your Identity Mirror?
                  </span>
                </div>
                <button
                  onClick={handleRejectAllNodes}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Dismiss all
                </button>
              </div>
              <div className="space-y-2">
                {pendingNodeSuggestions.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        node.type === 'goal' ? 'bg-purple-500' :
                        node.type === 'habit' ? 'bg-blue-500' :
                        node.type === 'trait' ? 'bg-green-500' :
                        node.type === 'emotion' ? 'bg-pink-500' :
                        node.type === 'struggle' ? 'bg-orange-500' :
                        'bg-cyan-500'
                      }`} />
                      <div>
                        <span className="text-sm font-medium text-white">{node.label}</span>
                        <span className="text-xs text-gray-500 ml-2 capitalize">({node.type})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRejectNode(node.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                        title="Don't add"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAcceptNode(node)}
                        className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
                        title="Add to Mirror"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-800">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </div>
  );
};
