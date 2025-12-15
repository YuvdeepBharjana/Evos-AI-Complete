/**
 * Unified Authentication Types
 * 
 * Centralized auth state types for the application.
 * This is a read-only integration layer that observes existing auth state.
 */

/**
 * AppUser - Unified user type for auth state
 * Maps from existing User/UserProfile types
 */
export interface AppUser {
  id: string;
  email: string;
  name: string;
  onboardingComplete: boolean;
  onboardingMethod?: 'questionnaire' | 'upload' | 'manual';
}

/**
 * AuthStatus - Current authentication resolution state
 */
export type AuthStatus = 'loading' | 'authed' | 'unauthed';

/**
 * AuthState - Complete read-only auth state
 */
export interface AuthState {
  status: AuthStatus;
  user: AppUser | null;
}

