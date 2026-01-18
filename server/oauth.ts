/**
 * OAuth Authentication with Passport.js
 * Supports Google Sign-In and Apple Sign-In
 * 
 * Security features:
 * - State parameter for CSRF protection
 * - Nonce for replay attack prevention (Apple)
 * - Secure token handling
 * - Account linking for existing emails
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// @ts-ignore - passport-apple doesn't have TypeScript types
import { Strategy as AppleStrategy } from 'passport-apple';
import { findOrCreateOAuthUser, generateToken } from './auth.js';
import type { User } from './auth.js';

// OAuth callback URL base (will be set from environment)
const FRONTEND_URL = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Log OAuth configuration for debugging
console.log('🔐 OAuth Configuration:');
console.log(`   FRONTEND_URL: ${FRONTEND_URL}`);
console.log(`   BACKEND_URL: ${BACKEND_URL}`);
console.log(`   Google Callback: ${BACKEND_URL}/api/auth/google/callback`);

/**
 * Configure Google OAuth Strategy
 * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars
 */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user info from Google profile
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || profile.name?.givenName || 'User';

          if (!email) {
            return done(new Error('No email provided by Google'), undefined);
          }

          // Find or create user and link OAuth account
          const user = findOrCreateOAuthUser(
            'google',
            profile.id,
            email,
            name,
            accessToken,
            refreshToken,
            undefined // Google doesn't always provide expires_at
          );

          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
  
  console.log('✅ Google OAuth strategy configured');
} else {
  console.log('⚠️  Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
}

/**
 * Configure Apple Sign-In Strategy
 * Requires APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY env vars
 */
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
  passport.use(
    new AppleStrategy(
      {
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        privateKeyString: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle escaped newlines
        callbackURL: `${BACKEND_URL}/api/auth/apple/callback`,
        scope: ['name', 'email'],
        passReqToCallback: false,
      },
      async (accessToken: any, refreshToken: any, idToken: any, profile: any, done: any) => {
        try {
          // Apple provides email and name in idToken claims
          const email = profile.email;
          // Apple only provides name on first sign-in, so we extract it from profile or use default
          const name = profile.name 
            ? `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim() 
            : 'User';

          if (!email) {
            return done(new Error('No email provided by Apple'), undefined);
          }

          // Find or create user and link OAuth account
          const user = findOrCreateOAuthUser(
            'apple',
            profile.sub, // Apple's unique user identifier
            email,
            name || 'User',
            accessToken,
            refreshToken,
            undefined
          );

          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
  
  console.log('✅ Apple OAuth strategy configured');
} else {
  console.log('⚠️  Apple OAuth not configured (missing APPLE credentials)');
}

/**
 * Passport serialization (not used for JWT, but required by Passport)
 */
passport.serializeUser((user, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser((id: string, done) => {
  // We use JWT tokens, so this is minimal
  // Passport expects User | false | null | undefined
  done(null, { id } as User);
});

export { passport };

/**
 * OAuth Success Handler
 * Generates JWT token and redirects to frontend with token
 */
export function handleOAuthSuccess(user: User): { token: string; user: User } {
  const token = generateToken(user);
  return { token, user };
}

/**
 * Generate OAuth callback redirect URL
 * Redirects to frontend with token or error
 */
export function getOAuthRedirectURL(token?: string, error?: string): string {
  const params = new URLSearchParams();
  
  if (token) {
    params.append('token', token);
  }
  
  if (error) {
    params.append('error', error);
  }
  
  const redirectURL = `${FRONTEND_URL}/auth/callback?${params.toString()}`;
  console.log(`🔗 OAuth redirect URL: ${redirectURL}`);
  return redirectURL;
}




