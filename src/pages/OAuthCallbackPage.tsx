import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { setAuthToken, getCurrentUser } from '../lib/api';
import { useUserStore } from '../store/useUserStore';

/**
 * OAuth Callback Page
 * Handles the redirect from Google/Apple OAuth
 * Receives token in URL params and triggers auth state update
 * 
 * Uses useUserStore as the single source of truth for auth state
 */
export const OAuthCallbackPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, setUserFromApi, setAuthToken: setUserAuthToken } = useUserStore();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        setIsLoading(true);
        
        // Get token and error from URL params
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const errorParam = params.get('error');
        
        // If no token and no error param, this might be an accidental visit
        if (!token && !errorParam) {
          // If user is already logged in, redirect to dashboard
          if (user) {
            if (user.onboardingComplete) {
              navigate('/dashboard', { replace: true });
            } else {
              navigate('/onboarding', { replace: true });
            }
            return;
          }
          // Otherwise redirect to login
          navigate('/login', { replace: true });
          return;
        }

        if (errorParam) {
          // OAuth error occurred
          const errorMessages: Record<string, string> = {
            google_auth_failed: 'Google sign-in failed. Please try again.',
            google_callback_error: 'Failed to complete Google sign-in.',
            google_not_configured: 'Google Sign-In is not set up on this server. Please contact the administrator or use email/password.',
            apple_auth_failed: 'Apple sign-in failed. Please try again.',
            apple_callback_error: 'Failed to complete Apple sign-in.',
            apple_not_configured: 'Apple Sign-In is not set up on this server. Please contact the administrator or use email/password.',
          };
          
          setError(errorMessages[errorParam] || 'Authentication failed. Please try again.');
          setIsLoading(false);
          
          // Redirect to login after showing error
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
          return;
        }

        if (!token) {
          setError('No authentication token received.');
          setIsLoading(false);
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
          return;
        }

        // Set token in both API module and user store
        setAuthToken(token);
        setUserAuthToken(token);
        
        // Small delay to ensure token is set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Fetch user data immediately
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          setError('Failed to load user data. Please try again.');
          setIsLoading(false);
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
          return;
        }

        // Update user store with the user data - wait for it to complete
        await setUserFromApi(currentUser, token);
        
        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 200));

        // Redirect based on onboarding status
        if (currentUser.onboarding_complete) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('An unexpected error occurred. Please try again.');
        setIsLoading(false);
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate, user, setUserFromApi, setUserAuthToken]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030014]">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-8 max-w-md w-full text-center relative z-10"
      >
        {error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        ) : isLoading ? (
          <>
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Completing sign-in...</h2>
            <p className="text-gray-400">Please wait while we set up your account</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Redirecting...</h2>
            <p className="text-gray-400">Taking you to your dashboard</p>
          </>
        )}
      </motion.div>
    </div>
  );
};



