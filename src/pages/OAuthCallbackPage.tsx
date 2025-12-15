import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { setAuthToken } from '../lib/api';

/**
 * OAuth Callback Page
 * Handles the redirect from Google/Apple OAuth
 * Receives token in URL params and triggers auth state update
 * 
 * The token is set in localStorage, and the auth listener will pick it up
 */
export const OAuthCallbackPage = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get token and error from URL params
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const errorParam = params.get('error');

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
          
          // Redirect to login after showing error
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        if (!token) {
          setError('No authentication token received.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        // Set token in localStorage - auth listener will pick it up
        setAuthToken(token);

        // Wait a moment for auth listener to detect token, then redirect
        // The auth listener will fetch user data and update state
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('An unexpected error occurred. Please try again.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

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
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Completing sign-in...</h2>
            <p className="text-gray-400">Please wait while we set up your account</p>
          </>
        )}
      </motion.div>
    </div>
  );
};
