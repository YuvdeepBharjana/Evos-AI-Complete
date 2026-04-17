import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUserStore } from './store/useUserStore';
import { useAuthStore } from './store/useAuthStore';
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
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { MirrorPage } from './pages/MirrorPage';
import { ProfilePage } from './pages/ProfilePage';
import { ExperimentPage } from './pages/ExperimentPage';
import { WorkSessionPage } from './pages/WorkSessionPage';
import { WorkEnvironmentPage } from './pages/WorkEnvironmentPage';
import { PremarketCalibrationPage } from './pages/PremarketCalibrationPage';
import { PostMarketReviewPage } from './pages/PostMarketReviewPage';
import { DisciplineCalendarPage } from './pages/DisciplineCalendarPage';
import { AppLayout } from './components/layout/AppLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { setAuthToken, getCurrentUser } from './lib/api';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { useTradingDayStore } from './store/useTradingDayStore';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Check both stores - useAuthStore is primary, useUserStore is fallback
  const { user: authUser } = useAuthStore();
  const { user: userStoreUser } = useUserStore();
  const user = authUser || userStoreUser;
  
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

// Auth Route Component (redirects to home if already logged in)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserStore();
  
  if (user?.onboardingComplete) {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { authToken, user, setUserFromApi, signOut, loadTrackingFromBackend, checkDailyReset } = useUserStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize TradingDay system on app load
  useEffect(() => {
    useTradingDayStore.getState().initializeToday();
  }, []);

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
            signOut();
          }
        } else {
          // No auth token - user is not logged in, proceed to show app
          console.log('No auth token found - user not logged in');
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        signOut();
      } finally {
        console.log('Initialization complete, setting isInitializing to false');
        setIsInitializing(false);
      }
    };

    // Add timeout safety net - if initialization takes more than 10 seconds, force completion
    const timeoutId = setTimeout(() => {
      console.warn('Initialization timeout - forcing app to render');
      setIsInitializing(false);
    }, 10000);

    initializeAuth().finally(() => {
      clearTimeout(timeoutId);
    });
  }, []); // Run only once on mount

  // Show loading screen while initializing
  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ============================================
            PUBLIC ROUTES (Marketing Pages with PublicLayout)
            ============================================ */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/vision" element={<VisionPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route 
            path="/testimonials" 
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Testimonials</h1>
                  <p className="text-gray-400">Coming soon</p>
                </div>
              </div>
            } 
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Route>

        {/* ============================================
            AUTH ROUTES (Login, OAuth, Password Reset)
            ============================================ */}
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

        {/* ============================================
            AUTHENTICATED APP ROUTES (With AppLayout Sidebar)
            All authenticated routes use AppLayout for consistent sidebar navigation.
            ============================================ */}
        <Route element={<AppLayout />}>
          {/* Core Discipline Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/premarket"
            element={
              <ProtectedRoute>
                <PremarketCalibrationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/postmarket"
            element={
              <ProtectedRoute>
                <PostMarketReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <DisciplineCalendarPage />
              </ProtectedRoute>
            }
          />
          
          {/* Secondary Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
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
            path="/settings"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Settings</h1>
                    <p className="text-gray-400">Coming soon</p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* ============================================
              LEGACY / DEPRECATED ROUTES
              These are from the identity-era system and are
              not part of the core trader discipline workflow.
              Kept for backward compatibility but de-prioritized.
              ============================================ */}
          <Route
            path="/mirror"
            element={
              <ProtectedRoute>
                <MirrorPage />
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

        {/* ============================================
            LEGACY FULLSCREEN ROUTES
            ============================================ */}
        <Route
          path="/work-session"
          element={
            <ProtectedRoute>
              <WorkSessionPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
