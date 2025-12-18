import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthStatus, AppUser } from '../types/auth';
import {
  getNodes,
  setAuthToken,
  getCurrentUser,
  logout as apiLogout,
  completeOnboarding as apiCompleteOnboarding,
  getTrackingHistory,
  getDailyActions,
  type User as ApiUser,
  type DailyTracking
} from '../lib/api';

export interface DailyAction {
  id: string;
  nodeId: string;
  nodeName: string;
  action: string;
  timeEstimate: string;
  completed?: boolean;
}

// Helper function to transform database action records
function transformAction(a: any): DailyAction {
  return {
    id: a.id,
    nodeId: a.node_id || a.nodeId || 'tracking',
    nodeName: a.node_name || a.nodeName || 'Daily Task',
    action: a.action_text || a.action || '',
    timeEstimate: a.time_estimate || a.timeEstimate || '5 min',
    // For pending actions, completed should be undefined (not false)
    completed: a.status === 'done' ? true : a.status === 'skipped' ? false : undefined,
  };
}

export interface UserStore {
  // Auth state
  authToken: string | null;
  _token: string | null;
  _authState: AuthStatus;
  user: AppUser | null;

  // Actions
  setAuthToken: (token: string | null) => void;
  _setToken: (token: string | null) => Promise<void>;
  _setAuthState: (status: AuthStatus, user?: AppUser | null, token?: string | null) => void;
  setUserFromApi: (apiUser: ApiUser, token: string) => Promise<void>;
  signInWithGoogle: () => void;
  signOut: () => void;
  initAuthListener: () => (() => void);

  // User data
  completeOnboarding: (method: 'questionnaire' | 'upload' | 'manual', nodes: any[]) => Promise<void>;
  loadTrackingFromBackend: () => Promise<void>;
  checkDailyReset: () => Promise<boolean>;
  
  // Helper functions
  getTodayDateString: () => string;
  setDailyActions: (actions: DailyAction[]) => void;
  markActionComplete: (actionId: string, completed: boolean) => void;
  addMessage: (message: any) => void;
  generateDailySummary: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Auth state
      authToken: null,
      _token: null,
      _authState: 'unauthed',
      user: null,

      setAuthToken: (token) => {
        set({ authToken: token });
        get()._setToken(token);
      },

      _setToken: async (token) => {
        if (token) {
          // Store token in localStorage and API module
          localStorage.setItem('evos_token', token);
          set({ _token: token, authToken: token });
          // Try to get user data with this token
          const currentUser = await getCurrentUser();
          if (currentUser) {
            await get().setUserFromApi(currentUser, token);
          } else {
            get()._setAuthState('unauthed', null, null);
          }
        } else {
          // Clear token
          localStorage.removeItem('evos_token');
          set({ _token: null, authToken: null });
          get()._setAuthState('unauthed', null, null);
        }
      },

      _setAuthState: (status, user, token) => {
        set({
          _authState: status,
          user: user || null,
          _token: token || null,
          authToken: token || null,
        });
      },

      setUserFromApi: async (apiUser, token) => {
        // Ensure token is set in API module and localStorage
        setAuthToken(token);
        localStorage.setItem('evos_token', token);
        
        // Load user nodes and daily actions (with error handling)
        let identityNodes = [];
        let dailyActions: DailyAction[] = [];
        
        try {
          identityNodes = await getNodes();
        } catch (error) {
          console.error('Failed to load nodes:', error);
        }
        
        try {
          // Get today's daily actions (proof actions from nodes)
          const todayActions = await getDailyActions();
          // Transform API response to DailyAction format (handles snake_case from backend)
          dailyActions = todayActions.map(transformAction);
        } catch (error) {
          console.error('Failed to load daily actions:', error);
        }
        
        const appUser: AppUser = {
          id: apiUser.id,
          email: apiUser.email,
          name: apiUser.name,
          onboardingComplete: apiUser.onboarding_complete,
          onboardingMethod: apiUser.onboarding_method,
          emailVerified: apiUser.email_verified,
          identityNodes,
          dailyActions,
        };

        // Set user and token in store without triggering _setToken (to avoid loop)
        set({ 
          user: appUser,
          _token: token,
          authToken: token,
          _authState: 'authed'
        });
      },

      signInWithGoogle: () => {
        // Get API base URL for OAuth redirect
        const getApiBase = () => {
          const viteUrl = import.meta.env.VITE_API_URL;
          if (viteUrl) {
            return viteUrl.replace(/\/api\/?$/, '');
          }
          // Use backend port directly for OAuth (bypasses proxy)
          return 'http://localhost:3001';
        };
        const API_BASE = getApiBase();
        // Redirect to backend Google OAuth endpoint
        window.location.href = `${API_BASE}/api/auth/google`;
      },

      signOut: () => {
        // Clear token (async but don't wait)
        get()._setToken(null).catch(() => {});
        // Clear auth state immediately
        get()._setAuthState('unauthed', null, null);
        // Clear API token
        apiLogout();
      },

      initAuthListener: () => {
        // Check initial state
        const token = get()._token || getAuthToken();
        if (token) {
          // Restore token and check auth state (async, but don't await - let it run)
          get()._setToken(token).catch(err => {
            console.error('Failed to restore auth state:', err);
            get()._setAuthState('unauthed', null, null);
          });
        } else {
          // No token - unauthenticated
          get()._setAuthState('unauthed', null, null);
        }

        // Listen for token changes in localStorage (for OAuth callbacks from other tabs)
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === 'evos_token') {
            const newToken = e.newValue;
            if (newToken && newToken !== get()._token) {
              get()._setToken(newToken).catch(err => {
                console.error('Failed to update auth state from storage:', err);
              });
            } else if (!newToken && get()._token) {
              get()._setToken(null).catch(err => {
                console.error('Failed to clear auth state:', err);
              });
            }
          }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also check periodically for token changes (for same-tab OAuth)
        // This is needed because OAuth callback sets token in localStorage
        // but doesn't trigger storage event in same tab
        const checkInterval = setInterval(() => {
          const currentToken = getAuthToken();
          const storedToken = get()._token;
          if (currentToken !== storedToken) {
            if (currentToken) {
              get()._setToken(currentToken).catch(err => {
                console.error('Failed to update auth state from interval check:', err);
              });
            } else if (storedToken) {
              // Token was removed
              get()._setToken(null).catch(err => {
                console.error('Failed to clear auth state:', err);
              });
            }
          }
        }, 300);

        // Return cleanup function
        return () => {
          window.removeEventListener('storage', handleStorageChange);
          clearInterval(checkInterval);
        };
      },

      completeOnboarding: async (method, nodes) => {
        await apiCompleteOnboarding(method, nodes);
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              onboardingComplete: true,
              onboardingMethod: method,
              identityNodes: nodes,
            },
          });
        }
      },

      loadTrackingFromBackend: async () => {
        const trackingData = await getTrackingHistory();
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              dailyActions: trackingData.map(transformAction),
            },
          });
        }
      },

      checkDailyReset: async () => {
        const currentUser = get().user;
        if (!currentUser?.dailyActions) return false;

        // Check if any actions are from yesterday or earlier
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const hasOldActions = currentUser.dailyActions.some(action => {
          // If action has a date field, check it
          if (action.date) {
            return action.date < yesterdayStr;
          }
          // Otherwise, assume it's today's action
          return false;
        });

        if (hasOldActions) {
          // Trigger fresh load from backend
          await get().loadTrackingFromBackend();
          return true;
        }

        return false;
      },

      // Helper functions
      getTodayDateString: () => {
        return new Date().toISOString().split('T')[0];
      },

      setDailyActions: (actions: DailyAction[]) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              dailyActions: actions,
            },
          });
        }
      },

      markActionComplete: (actionId: string, completed: boolean) => {
        const currentUser = get().user;
        if (!currentUser?.dailyActions) return;

        const updatedActions = currentUser.dailyActions.map(action => {
          if (action.id === actionId) {
            // Calculate strength change based on completion
            // This is a simple calculation - you might want to adjust this
            const strengthChange = completed ? 2 : -1;
            
            return {
              ...action,
              completed,
              strengthChange,
            };
          }
          return action;
        });

        set({
          user: {
            ...currentUser,
            dailyActions: updatedActions,
          },
        });
      },

      addMessage: (message: any) => {
        // This is a placeholder - you might want to implement proper message storage
        console.log('Message added:', message);
        // If you have a messages store or array, add it here
      },

      generateDailySummary: async () => {
        // This is a placeholder - implement based on your summary generation logic
        console.log('Generating daily summary...');
        // Add your summary generation logic here
      },
    }),
    {
      name: 'evos-auth-storage',
      partialize: (state) => ({
        _token: state._token,
      }),
    }
  )
);