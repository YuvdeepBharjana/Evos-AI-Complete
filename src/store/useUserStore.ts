import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, IdentityNode, Message, DailyAction, WorkSession, DailySummary, NodeStatus, TrackingData, TrackingGoals } from '../types';
import { createDemoProfile } from '../data/demoProfile';
import { getNodes, setAuthToken, logout as apiLogout, completeOnboarding as apiCompleteOnboarding, type User as ApiUser } from '../lib/api';

interface UserStore {
  user: UserProfile | null;
  authToken: string | null;
  activeWorkSession: WorkSession | null;
  recentStrengthChanges: Record<string, number>; // nodeId -> change amount
  
  // Basic user actions
  setUser: (user: UserProfile) => void;
  setUserFromApi: (apiUser: ApiUser, token: string) => Promise<void>;
  loginWithDemo: (email: string, name?: string) => void;
  logout: () => void;
  updateNodes: (nodes: IdentityNode[]) => void;
  addNodes: (nodes: IdentityNode[]) => void;
  addMessage: (message: Message) => void;
  completeOnboarding: (method: 'questionnaire' | 'upload' | 'manual', nodes: IdentityNode[]) => Promise<void>;
  clearUser: () => void;
  clearRecentStrengthChanges: () => void;
  
  // Node strength updates
  updateNodeStrength: (nodeId: string, change: number) => void;
  setNodeDesiredStrength: (nodeId: string, desiredStrength: number) => void;
  
  // Daily Action Protocol
  setDailyActions: (actions: DailyAction[]) => void;
  markActionComplete: (actionId: string, completed: boolean) => void;
  
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
      
      setUser: (user) => set({ user }),
      
      setUserFromApi: async (apiUser, token) => {
        // Set the auth token in the API client
        setAuthToken(token);
        
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
          chatHistory: [],
          alignmentScore: 75,
          dailyActions: [],
          trackingData: []
        };
        
        set({ 
          user: userProfile, 
          authToken: token,
          recentStrengthChanges: {} 
        });
      },
      
      loginWithDemo: (email, name) => set(() => ({
        user: createDemoProfile(email, name || email.split('@')[0]),
        recentStrengthChanges: {}
      })),
      
      logout: () => {
        apiLogout();
        set({ user: null, authToken: null, activeWorkSession: null, recentStrengthChanges: {} });
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
      
      addMessage: (message) => set((state) => ({
        user: state.user ? {
          ...state.user,
          chatHistory: [...state.user.chatHistory, message]
        } : null
      })),
      
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
        apiLogout();
        set({ user: null, authToken: null, activeWorkSession: null, recentStrengthChanges: {} });
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
          }
        };
      }),
      
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
      })
    }),
    {
      name: 'evos-user-storage'
    }
  )
);
