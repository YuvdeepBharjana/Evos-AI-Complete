import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, IdentityNode, Message, DailyAction, WorkSession, DailySummary, NodeStatus, TrackingData, TrackingGoals, DailyMetric, DailyMetricEntry } from '../types';
import { createDemoProfile } from '../data/demoProfile';
import { getNodes, setAuthToken, logout as apiLogout, completeOnboarding as apiCompleteOnboarding, getTrackingHistory, type User as ApiUser, type DailyTracking } from '../lib/api';

// Default metrics for the tracker
const DEFAULT_METRICS: DailyMetric[] = [
  { id: 'calories', label: 'Calories', unit: 'cal', type: 'number', target: 2000, isDefault: true, isActive: true, icon: 'Flame', color: '#f97316' },
  { id: 'exercise', label: 'Exercise', unit: 'min', type: 'number', target: 30, isDefault: true, isActive: true, icon: 'Dumbbell', color: '#22c55e' },
  { id: 'deep-work', label: 'Deep Work', unit: 'hrs', type: 'number', target: 4, isDefault: true, isActive: true, icon: 'Briefcase', color: '#3b82f6' },
  { id: 'sleep', label: 'Sleep', unit: 'hrs', type: 'number', target: 8, isDefault: true, isActive: true, icon: 'Moon', color: '#6366f1' },
  { id: 'mood', label: 'Mood', unit: '', type: 'scale_1_10', target: 7, isDefault: true, isActive: true, icon: 'Heart', color: '#ec4899' },
];

interface UserStore {
  user: UserProfile | null;
  authToken: string | null;
  activeWorkSession: WorkSession | null;
  recentStrengthChanges: Record<string, number>; // nodeId -> change amount (for animations)
  todayStrengthChanges: Record<string, number>; // nodeId -> total change today (persistent)
  lastResetDate: string | null; // Track when we last reset (YYYY-MM-DD format)
  
  // Custom metrics for tracker
  customMetrics: DailyMetric[];
  metricEntries: DailyMetricEntry[];
  
  // Persisted chat history keyed by user ID (survives logout/login)
  userChatHistories: Record<string, Message[]>;
  userChatSessionNames: Record<string, Record<string, string>>;
  
  // Basic user actions
  setUser: (user: UserProfile) => void;
  setUserFromApi: (apiUser: ApiUser, token: string) => Promise<void>;
  loginWithDemo: (email: string, name?: string) => void;
  logout: () => void;
  updateNodes: (nodes: IdentityNode[]) => void;
  addNodes: (nodes: IdentityNode[]) => void;
  deleteNode: (nodeId: string) => void;
  addMessage: (message: Message) => void;
  clearChatHistory: () => void;
  deleteMessagesBySession: (sessionId: string) => void;
  
  // Chat session names
  chatSessionNames: Record<string, string>;
  setChatSessionName: (sessionId: string, name: string) => void;
  completeOnboarding: (method: 'questionnaire' | 'upload' | 'manual', nodes: IdentityNode[]) => Promise<void>;
  clearUser: () => void;
  clearRecentStrengthChanges: () => void;
  
  // Node strength updates
  updateNodeStrength: (nodeId: string, change: number) => void;
  setNodeDesiredStrength: (nodeId: string, desiredStrength: number) => void;
  
  // Daily Action Protocol
  setDailyActions: (actions: DailyAction[]) => void;
  markActionComplete: (actionId: string, completed: boolean) => void;
  loadDailyActionsFromBackend: () => Promise<void>;
  
  // Work Sessions
  startWorkSession: (nodeId: string, nodeName: string) => void;
  addWorkSessionMessage: (message: Message) => void;
  endWorkSession: (strengthChange: number, summary: string) => void;
  
  // Alignment & Summary
  updateAlignmentScore: () => void;
  generateDailySummary: () => void;
  
  // Tracking
  updateTrackingData: (data: TrackingData) => void;
  setTrackingGoals: (goals: TrackingGoals) => void;
  
  // Custom Metrics
  addMetric: (metric: Omit<DailyMetric, 'id' | 'isDefault' | 'isActive'>) => void;
  updateMetric: (id: string, updates: Partial<DailyMetric>) => void;
  deleteMetric: (id: string) => void;
  toggleMetricActive: (id: string) => void;
  upsertMetricEntry: (date: string, metricId: string, value: number) => void;
  getMetricValue: (date: string, metricId: string) => number | undefined;
  getActiveMetrics: () => DailyMetric[];
  loadTrackingFromBackend: () => Promise<void>;
  
  // Daily reset system
  checkDailyReset: () => Promise<boolean>; // Returns true if reset was performed
  getTodayDateString: () => string;
}

// Calculate alignment score based on gaps
const calculateAlignmentScore = (nodes: IdentityNode[]): number => {
  const nodesWithDesired = nodes.filter(n => n.desiredStrength !== undefined);
  if (nodesWithDesired.length === 0) return 75; // Default score
  
  const totalAlignment = nodesWithDesired.reduce((acc, node) => {
    const desired = node.desiredStrength || node.strength;
    const alignment = 100 - Math.abs(desired - node.strength);
    return acc + alignment;
  }, 0);
  
  return Math.round(totalAlignment / nodesWithDesired.length);
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      authToken: null,
      activeWorkSession: null,
      recentStrengthChanges: {},
      todayStrengthChanges: {},
      lastResetDate: null,
      customMetrics: DEFAULT_METRICS,
      metricEntries: [],
      chatSessionNames: {},
      userChatHistories: {},
      userChatSessionNames: {},
      
      // Helper to get today's date string in YYYY-MM-DD format
      getTodayDateString: () => {
        return new Date().toISOString().split('T')[0];
      },
      
      setUser: (user) => set({ user }),
      
      setUserFromApi: async (apiUser, token) => {
        // Set the auth token in the API client
        setAuthToken(token);
        
        // Get current state to restore chat history for this user
        const currentState = get();
        
        // Fetch user's nodes from the API
        const apiNodes = await getNodes();
        
        // Transform API nodes to local format
        const identityNodes: IdentityNode[] = apiNodes.map(node => ({
          id: node.id,
          label: node.label,
          type: node.type as IdentityNode['type'],
          strength: node.strength,
          status: node.status as NodeStatus,
          description: node.description,
          connections: [],
          lastUpdated: new Date(),
          createdAt: new Date()
        }));
        
        // Restore chat history for this user from persisted storage
        const restoredChatHistory = currentState.userChatHistories[apiUser.id] || [];
        const restoredSessionNames = currentState.userChatSessionNames[apiUser.id] || {};
        
        // Create local user profile from API data
        // Note: SQLite returns 0/1 for booleans, so we need to convert
        const userProfile: UserProfile = {
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          createdAt: new Date(),
          onboardingComplete: Boolean(apiUser.onboarding_complete),
          onboardingMethod: apiUser.onboarding_method as 'questionnaire' | 'upload' | 'manual' | undefined,
          identityNodes,
          chatHistory: restoredChatHistory,
          alignmentScore: 75,
          dailyActions: [],
          trackingData: []
        };
        
        set({ 
          user: userProfile, 
          authToken: token,
          recentStrengthChanges: {},
          chatSessionNames: restoredSessionNames
        });
        
        // Load tracking data from backend (non-blocking)
        // This runs in the background and won't break the app if it fails
        get().loadTrackingFromBackend().catch((error) => {
          console.error('Failed to load tracking data:', error);
          // App continues to work normally
        });
      },
      
      loginWithDemo: (email, name) => set(() => ({
        user: createDemoProfile(email, name || email.split('@')[0]),
        recentStrengthChanges: {}
      })),
      
      logout: () => {
        const state = get();
        const userId = state.user?.id;
        
        // Save chat history before logging out so it can be restored
        if (userId && state.user?.chatHistory) {
          set((prevState) => ({
            userChatHistories: {
              ...prevState.userChatHistories,
              [userId]: state.user!.chatHistory
            },
            userChatSessionNames: {
              ...prevState.userChatSessionNames,
              [userId]: state.chatSessionNames
            }
          }));
        }
        
        apiLogout();
        set({ user: null, authToken: null, activeWorkSession: null, recentStrengthChanges: {}, chatSessionNames: {} });
      },
      
      updateNodes: (nodes) => set((state) => ({
        user: state.user ? { ...state.user, identityNodes: nodes } : null
      })),
      
      addNodes: (newNodes) => set((state) => ({
        user: state.user ? { 
          ...state.user, 
          identityNodes: [...state.user.identityNodes, ...newNodes] 
        } : null
      })),
      
      deleteNode: (nodeId) => set((state) => ({
        user: state.user ? {
          ...state.user,
          identityNodes: state.user.identityNodes.filter(node => node.id !== nodeId),
          // Also remove any daily actions for this node
          dailyActions: state.user.dailyActions?.filter(action => action.nodeId !== nodeId) || []
        } : null
      })),
      
      addMessage: (message) => set((state) => {
        if (!state.user) return state;
        const newChatHistory = [...state.user.chatHistory, message];
        return {
          user: {
            ...state.user,
            chatHistory: newChatHistory
          },
          // Also persist to userChatHistories for this user
          userChatHistories: {
            ...state.userChatHistories,
            [state.user.id]: newChatHistory
          }
        };
      }),
      
      clearChatHistory: () => set((state) => ({
        user: state.user ? {
          ...state.user,
          chatHistory: []
        } : null
      })),
      
      deleteMessagesBySession: (sessionId) => set((state) => {
        if (!state.user) return state;
        const newChatHistory = state.user.chatHistory.filter(msg => {
          // For 'default' session, also delete messages with undefined/null sessionId
          if (sessionId === 'default') {
            return msg.sessionId !== undefined && msg.sessionId !== null && msg.sessionId !== 'default';
          }
          return msg.sessionId !== sessionId;
        });
        const newSessionNames = Object.fromEntries(
          Object.entries(state.chatSessionNames).filter(([key]) => key !== sessionId)
        );
        return {
          user: {
            ...state.user,
            chatHistory: newChatHistory
          },
          chatSessionNames: newSessionNames,
          // Also update persisted storage
          userChatHistories: {
            ...state.userChatHistories,
            [state.user.id]: newChatHistory
          },
          userChatSessionNames: {
            ...state.userChatSessionNames,
            [state.user.id]: newSessionNames
          }
        };
      }),
      
      setChatSessionName: (sessionId, name) => set((state) => {
        const newSessionNames = {
          ...state.chatSessionNames,
          [sessionId]: name
        };
        return {
          chatSessionNames: newSessionNames,
          // Also persist for this user
          userChatSessionNames: state.user ? {
            ...state.userChatSessionNames,
            [state.user.id]: newSessionNames
          } : state.userChatSessionNames
        };
      }),
      
      completeOnboarding: async (method, nodes) => {
        const state = get();
        
        // If user is authenticated (has authToken), save to backend
        if (state.authToken) {
          try {
            const result = await apiCompleteOnboarding(method, nodes);
            if (result && result.nodes && Array.isArray(result.nodes)) {
              // Transform API nodes to local format
              const identityNodes: IdentityNode[] = result.nodes.map((node: any) => ({
                id: node.id,
                label: node.label,
                type: node.type as IdentityNode['type'],
                strength: node.strength,
                status: node.status as NodeStatus,
                description: node.description,
                connections: [],
                lastUpdated: new Date(),
                createdAt: new Date()
              }));
              
              set({
                user: state.user ? {
                  ...state.user,
                  onboardingComplete: true,
                  onboardingMethod: method,
                  identityNodes
                } : null
              });
              return;
            }
          } catch (error) {
            console.error('Failed to save onboarding to backend:', error);
          }
        }
        
        // Fallback to local-only update (use original nodes with proper formatting)
        const formattedNodes: IdentityNode[] = nodes.map(node => ({
          ...node,
          connections: node.connections || [],
          lastUpdated: new Date(),
          createdAt: new Date()
        }));
        
        set({
          user: state.user ? {
            ...state.user,
            onboardingComplete: true,
            onboardingMethod: method,
            identityNodes: formattedNodes
          } : null
        });
      },
      
      clearUser: () => {
        const state = get();
        const userId = state.user?.id;
        
        // Save chat history before clearing so it can be restored
        if (userId && state.user?.chatHistory) {
          set((prevState) => ({
            userChatHistories: {
              ...prevState.userChatHistories,
              [userId]: state.user!.chatHistory
            },
            userChatSessionNames: {
              ...prevState.userChatSessionNames,
              [userId]: state.chatSessionNames
            }
          }));
        }
        
        apiLogout();
        set({ user: null, authToken: null, activeWorkSession: null, recentStrengthChanges: {}, chatSessionNames: {} });
      },
      
      clearRecentStrengthChanges: () => set({ recentStrengthChanges: {} }),
      
      // Update a specific node's strength
      updateNodeStrength: (nodeId, change) => set((state) => {
        if (!state.user) return state;
        
        const updatedNodes: IdentityNode[] = state.user.identityNodes.map(node => {
          if (node.id === nodeId) {
            const newStrength = Math.max(0, Math.min(100, node.strength + change));
            const newStatus: NodeStatus = newStrength >= 80 ? 'mastered' : 
                             newStrength >= 50 ? 'active' : 
                             newStrength >= 20 ? 'developing' : 'neglected';
            return {
              ...node,
              strength: newStrength,
              status: newStatus,
              lastUpdated: new Date()
            };
          }
          return node;
        });
        
        return {
          user: {
            ...state.user,
            identityNodes: updatedNodes,
            alignmentScore: calculateAlignmentScore(updatedNodes)
          },
          recentStrengthChanges: {
            ...state.recentStrengthChanges,
            [nodeId]: change
          }
        };
      }),
      
      setNodeDesiredStrength: (nodeId, desiredStrength) => set((state) => {
        if (!state.user) return state;
        
        const updatedNodes = state.user.identityNodes.map(node => 
          node.id === nodeId ? { ...node, desiredStrength } : node
        );
        
        return {
          user: {
            ...state.user,
            identityNodes: updatedNodes
          }
        };
      }),
      
      // Daily Actions
      setDailyActions: (actions) => set((state) => ({
        user: state.user ? {
          ...state.user,
          dailyActions: actions
        } : null
      })),
      
      markActionComplete: (actionId, completed) => set((state) => {
        if (!state.user?.dailyActions) return state;
        
        const action = state.user.dailyActions.find(a => a.id === actionId);
        if (!action) return state;
        
        // Skip tracking node (no strength change for tracking)
        if (action.nodeId === 'tracking') {
          const updatedActions = state.user.dailyActions.map(a => 
            a.id === actionId 
              ? { ...a, completed, completedAt: new Date(), strengthChange: 0 }
              : a
          );
          return {
            user: {
              ...state.user,
              dailyActions: updatedActions
            }
          };
        }
        
        // Calculate strength change
        const strengthChange = completed 
          ? Math.floor(Math.random() * 6) + 5  // +5 to +10
          : -(Math.floor(Math.random() * 5) + 3); // -3 to -7
        
        // Update action
        const updatedActions = state.user.dailyActions.map(a => 
          a.id === actionId 
            ? { ...a, completed, completedAt: new Date(), strengthChange }
            : a
        );
        
        // Update node strength
        const updatedNodes: IdentityNode[] = state.user.identityNodes.map(node => {
          if (node.id === action.nodeId) {
            const newStrength = Math.max(0, Math.min(100, node.strength + strengthChange));
            const newStatus: NodeStatus = newStrength >= 80 ? 'mastered' : 
                             newStrength >= 50 ? 'active' : 
                             newStrength >= 20 ? 'developing' : 'neglected';
            return {
              ...node,
              strength: newStrength,
              status: newStatus,
              lastUpdated: new Date()
            };
          }
          return node;
        });
        
        // Calculate cumulative today's change for this node
        const previousTodayChange = state.todayStrengthChanges[action.nodeId] || 0;
        const newTodayChange = previousTodayChange + strengthChange;

        return {
          user: {
            ...state.user,
            dailyActions: updatedActions,
            identityNodes: updatedNodes,
            alignmentScore: calculateAlignmentScore(updatedNodes)
          },
          recentStrengthChanges: {
            ...state.recentStrengthChanges,
            [action.nodeId]: strengthChange
          },
          todayStrengthChanges: {
            ...state.todayStrengthChanges,
            [action.nodeId]: newTodayChange
          }
        };
      }),
      
      loadDailyActionsFromBackend: async () => {
        try {
          const { getDailyActions } = await import('../lib/api');
          const today = get().getTodayDateString();
          const actions = await getDailyActions(today); // Always fetch for today
          
          if (actions && actions.length > 0) {
            // Transform backend actions to frontend format
            const transformedActions: DailyAction[] = actions.map((a: any) => ({
              id: a.id,
              nodeId: a.node_id || a.nodeId || 'tracking',
              nodeName: a.node_name || a.nodeName || 'Daily Task',
              action: a.action_text || a.action || '',
              timeEstimate: a.time_estimate || a.timeEstimate || '5 min',
              // For pending actions, completed should be undefined (not false)
              completed: a.status === 'done' ? true : a.status === 'skipped' ? false : undefined,
              skipped: a.status === 'skipped',
              strengthChange: 0,
              // Use date from backend, or fallback to created_at
              createdAt: a.date ? new Date(a.date + 'T00:00:00') : new Date(a.created_at || Date.now()),
              date: a.date || today, // Store the date string for easy comparison
            }));
            
            set((state) => ({
              user: state.user ? {
                ...state.user,
                dailyActions: transformedActions
              } : null,
              lastResetDate: today // Update last reset date when loading actions
            }));
            
            console.log(`📋 Loaded ${transformedActions.length} daily actions for ${today}`);
          } else {
            // No actions found - this is a fresh day, clear any stale actions
            set((state) => ({
              user: state.user ? {
                ...state.user,
                dailyActions: []
              } : null,
              lastResetDate: today
            }));
            console.log(`📋 No actions found for ${today}, ready for new generation`);
          }
        } catch (error) {
          console.error('Failed to load daily actions from backend:', error);
        }
      },
      
      // Check if we need to reset for a new day
      checkDailyReset: async () => {
        const today = get().getTodayDateString();
        const lastReset = get().lastResetDate;
        
        // If this is a new day (or first time), reset
        if (lastReset !== today) {
          console.log(`🌅 New day detected! Last reset: ${lastReset}, Today: ${today}`);
          
          // Clear local daily actions and old summary - they'll be loaded fresh from backend
          set((state) => ({
            user: state.user ? {
              ...state.user,
              dailyActions: [], // Clear for fresh load
              lastDailySummary: undefined // Clear old summary for new day
            } : null,
            recentStrengthChanges: {}, // Clear strength change indicators
            todayStrengthChanges: {}, // Clear today's changes for new day
            lastResetDate: today
          }));
          
          // Load fresh actions from backend (will generate if none exist)
          await get().loadDailyActionsFromBackend();
          
          return true; // Reset was performed
        }
        
        return false; // No reset needed
      },
      
      // Work Sessions
      startWorkSession: (nodeId, nodeName) => set(() => ({
        activeWorkSession: {
          id: `ws-${Date.now()}`,
          nodeId,
          nodeName,
          startedAt: new Date(),
          messages: []
        }
      })),
      
      addWorkSessionMessage: (message) => set((state) => ({
        activeWorkSession: state.activeWorkSession ? {
          ...state.activeWorkSession,
          messages: [...state.activeWorkSession.messages, message]
        } : null
      })),
      
      endWorkSession: (strengthChange, summary) => {
        const state = get();
        if (!state.activeWorkSession || !state.user) return;
        
        const nodeId = state.activeWorkSession.nodeId;
        
        const session: WorkSession = {
          ...state.activeWorkSession,
          endedAt: new Date(),
          strengthChange,
          summary
        };
        
        // Update node strength
        const updatedNodes: IdentityNode[] = state.user.identityNodes.map(node => {
          if (node.id === nodeId) {
            const newStrength = Math.max(0, Math.min(100, node.strength + strengthChange));
            const newStatus: NodeStatus = newStrength >= 80 ? 'mastered' : 
                             newStrength >= 50 ? 'active' : 
                             newStrength >= 20 ? 'developing' : 'neglected';
            return {
              ...node,
              strength: newStrength,
              status: newStatus,
              lastUpdated: new Date()
            };
          }
          return node;
        });
        
        set({
          activeWorkSession: null,
          user: {
            ...state.user,
            identityNodes: updatedNodes,
            workSessions: [...(state.user.workSessions || []), session],
            alignmentScore: calculateAlignmentScore(updatedNodes)
          },
          recentStrengthChanges: strengthChange !== 0 ? {
            ...state.recentStrengthChanges,
            [nodeId]: strengthChange
          } : state.recentStrengthChanges
        });
      },
      
      updateAlignmentScore: () => set((state) => {
        if (!state.user) return state;
        return {
          user: {
            ...state.user,
            alignmentScore: calculateAlignmentScore(state.user.identityNodes)
          }
        };
      }),
      
      generateDailySummary: () => set((state) => {
        if (!state.user?.dailyActions) return state;
        
        const actions = state.user.dailyActions;
        const completed = actions.filter(a => a.completed === true).length;
        const failed = actions.filter(a => a.completed === false).length;
        const totalChange = actions.reduce((acc, a) => acc + (a.strengthChange || 0), 0);
        
        const summary: DailySummary = {
          date: new Date(),
          actionsCompleted: completed,
          actionsFailed: failed,
          totalStrengthChange: totalChange,
          alignmentScore: state.user.alignmentScore || 75,
          reflection: completed >= failed 
            ? "Today you acted like your future self. Keep building momentum."
            : "Today your identity and actions drifted apart. Tomorrow is another chance to prove who you are becoming.",
          topPerformingNode: actions.find(a => a.completed && (a.strengthChange || 0) > 0)?.nodeName,
          needsAttentionNode: actions.find(a => !a.completed)?.nodeName
        };
        
        return {
          user: {
            ...state.user,
            lastDailySummary: summary
          }
        };
      }),
      
      // Tracking data persistence
      updateTrackingData: (data: TrackingData) => set((state) => {
        if (!state.user) return state;
        
        const existingData = state.user.trackingData || [];
        const todayStr = new Date(data.date).toDateString();
        
        // Find if we already have data for today
        const todayIndex = existingData.findIndex(
          t => new Date(t.date).toDateString() === todayStr
        );
        
        let updatedData: TrackingData[];
        if (todayIndex >= 0) {
          // Update existing day's data
          updatedData = [...existingData];
          updatedData[todayIndex] = {
            ...existingData[todayIndex],
            ...data,
            date: new Date() // Update timestamp
          };
        } else {
          // Add new day's data
          updatedData = [...existingData, data];
        }
        
        return {
          user: {
            ...state.user,
            trackingData: updatedData
          }
        };
      }),
      
      setTrackingGoals: (goals: TrackingGoals) => set((state) => {
        if (!state.user) return state;
        
        return {
          user: {
            ...state.user,
            trackingGoals: {
              ...state.user.trackingGoals,
              ...goals
            }
          }
        };
      }),
      
      // Custom Metrics Management
      addMetric: (metricInput) => {
        const newMetric: DailyMetric = {
          ...metricInput,
          id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isDefault: false,
          isActive: true
        };
        set((state) => ({
          customMetrics: [...state.customMetrics, newMetric]
        }));
      },
      
      updateMetric: (id, updates) => {
        set((state) => ({
          customMetrics: state.customMetrics.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          )
        }));
      },
      
      deleteMetric: (id) => {
        set((state) => ({
          customMetrics: state.customMetrics.filter((m) => m.id !== id || m.isDefault),
          metricEntries: state.metricEntries.filter((e) => e.metricId !== id)
        }));
      },
      
      toggleMetricActive: (id) => {
        set((state) => ({
          customMetrics: state.customMetrics.map((m) =>
            m.id === id ? { ...m, isActive: !m.isActive } : m
          )
        }));
      },
      
      upsertMetricEntry: (date, metricId, value) => {
        set((state) => {
          const existingIndex = state.metricEntries.findIndex(
            (e) => e.date === date && e.metricId === metricId
          );
          
          if (existingIndex >= 0) {
            const updatedEntries = [...state.metricEntries];
            updatedEntries[existingIndex] = { ...updatedEntries[existingIndex], value };
            return { metricEntries: updatedEntries };
          } else {
            const newEntry: DailyMetricEntry = {
              id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              date,
              metricId,
              value
            };
            return { metricEntries: [...state.metricEntries, newEntry] };
          }
        });
      },
      
      getMetricValue: (date, metricId) => {
        const entry = get().metricEntries.find(
          (e) => e.date === date && e.metricId === metricId
        );
        return entry?.value;
      },
      
      getActiveMetrics: () => {
        return get().customMetrics.filter((m) => m.isActive);
      },
      
      // Load tracking data from backend and merge with local data
      loadTrackingFromBackend: async () => {
        try {
          // Load last 30 days of tracking history
          const trackingHistory = await getTrackingHistory(30);
          
          if (!trackingHistory || trackingHistory.length === 0) {
            console.log('📊 No tracking history found in backend');
            return;
          }
          
          console.log(`📊 Loading ${trackingHistory.length} days of tracking data from backend...`);
          
          // Map backend tracking data to metricEntries
          const backendEntries: DailyMetricEntry[] = [];
          
          trackingHistory.forEach((tracking: DailyTracking) => {
            // Map backend fields to metric IDs
            const mappings = [
              { backendField: 'calories', metricId: 'calories' },
              { backendField: 'exercise_mins', metricId: 'exercise' },
              { backendField: 'deep_work_hrs', metricId: 'deep-work' },
              { backendField: 'sleep_hrs', metricId: 'sleep' },
              { backendField: 'mood', metricId: 'mood' },
            ];
            
            mappings.forEach(({ backendField, metricId }) => {
              const value = tracking[backendField as keyof DailyTracking] as number | undefined;
              if (value !== undefined && value !== null) {
                backendEntries.push({
                  id: `backend-${tracking.date}-${metricId}`,
                  date: tracking.date,
                  metricId,
                  value: Number(value)
                });
              }
            });
          });
          
          // Merge with existing entries (backend data takes precedence for same date/metric)
          set((state) => {
            const existingEntries = state.metricEntries || [];
            const mergedEntries: DailyMetricEntry[] = [...existingEntries];
            
            backendEntries.forEach((backendEntry) => {
              const existingIndex = mergedEntries.findIndex(
                (e) => e.date === backendEntry.date && e.metricId === backendEntry.metricId
              );
              
              if (existingIndex >= 0) {
                // Update existing entry with backend data (backend is source of truth)
                mergedEntries[existingIndex] = backendEntry;
              } else {
                // Add new entry from backend
                mergedEntries.push(backendEntry);
              }
            });
            
            console.log(`✅ Loaded ${backendEntries.length} metric entries from backend, total: ${mergedEntries.length}`);
            
            return { metricEntries: mergedEntries };
          });
        } catch (error) {
          // Silently fail - don't break the app if tracking data can't be loaded
          console.error('⚠️ Failed to load tracking data from backend:', error);
          // App continues to work with local data
        }
      }
    }),
    {
      name: 'evos-user-storage',
      partialize: (state) => ({
        user: state.user,
        authToken: state.authToken,
        customMetrics: state.customMetrics,
        metricEntries: state.metricEntries,
        recentStrengthChanges: state.recentStrengthChanges,
        todayStrengthChanges: state.todayStrengthChanges,
        lastResetDate: state.lastResetDate,
        chatSessionNames: state.chatSessionNames,
        userChatHistories: state.userChatHistories,
        userChatSessionNames: state.userChatSessionNames
      })
    }
  )
);
