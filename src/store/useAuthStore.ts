/**
 * Unified Authentication Store
 * 
 * THE SINGLE SOURCE OF TRUTH for authentication in the application.
 * All auth state and actions flow through this store.
 * 
 * CRITICAL: The auth listener is the ONLY place that sets `user`.
 * Sign-in functions only set tokens; the listener handles user data.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthStatus, AppUser } from '../types/auth';
import { 
  login as apiLogin, 
  register as apiRegister, 
  getCurrentUser as apiGetCurrentUser,
  setAuthToken,
  getAuthToken,
  logout as apiLogout,
  type User as ApiUser
} from '../lib/api';

/**
 * Maps API User to AppUser
 */
function mapToAppUser(apiUser: ApiUser): AppUser {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    onboardingComplete: apiUser.onboarding_complete,
    onboardingMethod: apiUser.onboarding_method as 'questionnaire' | 'upload' | 'manual' | undefined,
  };
}

interface AuthStore {
  // Auth state
  status: AuthStatus;
  user: AppUser | null;
  error: string | null;
  
  // Internal token (persisted, but not exposed)
  _token: string | null;
  
  // Auth actions
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string, acceptedTerms: boolean) => Promise<void>;
  signInWithGoogle: () => void;
  signOut: () => void;
  
  // Internal: Update auth state (ONLY called by listener)
  _setAuthState: (status: AuthStatus, user: AppUser | null, error: string | null) => void;
  _setToken: (token: string | null) => Promise<void>;
  _checkAuthState: () => Promise<void>;
  
  // Initialize auth listener (runs once at app start)
  initAuthListener: () => (() => void) | undefined;
}

/**
 * Centralized auth store - THE ONLY AUTH SOURCE OF TRUTH
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      status: 'loading',
      user: null,
      error: null,
      _token: null,
      
      _setToken: async (token) => {
        set({ _token: token });
        // Sync with API module
        setAuthToken(token);
        // Trigger listener check (await to ensure user is loaded)
        await get()._checkAuthState();
      },
      
      _setAuthState: (status, user, error) => {
        set({ status, user, error });
      },
      
      _checkAuthState: async () => {
        const token = get()._token || getAuthToken();
        const currentUser = get().user; // Preserve existing user during verification
        
        if (!token) {
          get()._setAuthState('unauthed', null, null);
          return;
        }
        
        // Token exists - verify and fetch user
        // Only set loading if we don't already have a user (to avoid UI flash)
        if (!currentUser) {
          get()._setAuthState('loading', null, null);
        }
        
        try {
          const apiUser = await apiGetCurrentUser();
          if (apiUser) {
            const appUser = mapToAppUser(apiUser);
            get()._setAuthState('authed', appUser, null);
          } else {
            // Token invalid
            set({ _token: null });
            setAuthToken(null);
            get()._setAuthState('unauthed', null, null);
          }
        } catch {
          // Token invalid or network error
          set({ _token: null });
          setAuthToken(null);
          get()._setAuthState('unauthed', null, null);
        }
      },
      
      signInWithEmail: async (email: string, password: string) => {
        try {
          get()._setAuthState('loading', null, null);
          const response = await apiLogin(email, password);
          
          // Set user immediately from response (no waiting for verification)
          const appUser = mapToAppUser(response.user);
          set({ _token: response.token });
          setAuthToken(response.token);
          
          // Set user immediately for instant UI feedback
          get()._setAuthState('authed', appUser, null);
          
          // Verify in background (optional - for token validation)
          get()._checkAuthState().catch(() => {
            // If verification fails, we already have user set, so just log
            console.warn('Background auth verification failed, but user is already set');
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          get()._setAuthState('unauthed', null, errorMessage);
          throw error;
        }
      },
      
      signUpWithEmail: async (email: string, password: string, name: string, acceptedTerms: boolean) => {
        try {
          get()._setAuthState('loading', null, null);
          const response = await apiRegister(email, password, name, acceptedTerms);
          
          // Set user immediately from response (no waiting for verification)
          const appUser = mapToAppUser(response.user);
          set({ _token: response.token });
          setAuthToken(response.token);
          
          // Set user immediately for instant UI feedback
          get()._setAuthState('authed', appUser, null);
          
          // Verify in background (optional - for token validation)
          get()._checkAuthState().catch(() => {
            // If verification fails, we already have user set, so just log
            console.warn('Background auth verification failed, but user is already set');
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          get()._setAuthState('unauthed', null, errorMessage);
          throw error;
        }
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
    }),
    {
      name: 'evos-auth-storage',
      partialize: (state) => ({
        _token: state._token,
      }),
    }
  )
);




