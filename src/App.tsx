import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUserStore } from './store/useUserStore';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';
import { VisionPage } from './pages/VisionPage';
import { PricingPage } from './pages/PricingPage';
import { ContactPage } from './pages/ContactPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MirrorPage } from './pages/MirrorPage';
import { ProfilePage } from './pages/ProfilePage';
import { ExperimentPage } from './pages/ExperimentPage';
import { WorkSessionPage } from './pages/WorkSessionPage';
import { WorkEnvironmentPage } from './pages/WorkEnvironmentPage';
import { AppLayout } from './components/layout/AppLayout';
import { setAuthToken, getCurrentUser } from './lib/api';
import { LoadingScreen } from './components/ui/LoadingScreen';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserStore();
  
  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user exists but hasn't completed onboarding, redirect to onboarding
  if (!user.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

// Auth Route Component (redirects to dashboard if already logged in)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserStore();
  
  if (user?.onboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { authToken, user, setUserFromApi, logout, loadTrackingFromBackend, checkDailyReset } = useUserStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore and validate session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // If we have an authToken in Zustand store, sync it with API module and validate
        if (authToken) {
          // Sync token with API module
          setAuthToken(authToken);
          
          // Verify the token is still valid by fetching current user
          const currentUser = await getCurrentUser();
          
          if (currentUser) {
            // Token is valid - if we don't have user data or it's stale, refresh it
            if (!user || user.id !== currentUser.id) {
              console.log('Restoring session for user:', currentUser.email);
              await setUserFromApi(currentUser, authToken);
            }
            
            // Load saved data from backend (tracking)
            console.log('Loading saved data from backend...');
            await loadTrackingFromBackend().catch((error) => {
              console.error('Failed to load tracking data:', error);
            });
            
            // Check for daily reset (this will load fresh actions if it's a new day)
            console.log('Checking for daily reset...');
            const wasReset = await checkDailyReset();
            if (wasReset) {
              console.log('🌅 Daily reset completed - fresh day started!');
            } else {
              console.log('📅 Same day - no reset needed');
            }
          } else {
            // Token is invalid or expired, clear everything
            console.log('Session expired or invalid, logging out');
            logout();
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []); // Run only once on mount

  // Show loading screen while initializing
  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/vision" element={<VisionPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* Onboarding is NOT wrapped in AuthRoute to allow mentor selection flow to complete */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Protected Routes */}
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mirror"
            element={
              <ProtectedRoute>
                <MirrorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/experiment"
            element={
              <ProtectedRoute>
                <ExperimentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/work/:nodeId"
            element={
              <ProtectedRoute>
                <WorkEnvironmentPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Work Session (full screen, no app layout) */}
        <Route
          path="/work-session"
          element={
            <ProtectedRoute>
              <WorkSessionPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
