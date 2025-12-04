import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUserStore } from './store/useUserStore';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VisionPage } from './pages/VisionPage';
import { ContactPage } from './pages/ContactPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MirrorPage } from './pages/MirrorPage';
import { ProfilePage } from './pages/ProfilePage';
import { ExperimentPage } from './pages/ExperimentPage';
import { WorkSessionPage } from './pages/WorkSessionPage';
import { AppLayout } from './components/layout/AppLayout';
import { setAuthToken, getCurrentUser } from './lib/api';
import { LoadingScreen } from './components/ui/LoadingScreen';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserStore();
  
  if (!user || !user.onboardingComplete) {
    return <Navigate to="/login" replace />;
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
  const { authToken, user, setUserFromApi, logout, loadTrackingFromBackend } = useUserStore();
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
            } else {
              // User is already loaded, just refresh tracking data from backend
              console.log('User session valid, loading tracking data from backend...');
              loadTrackingFromBackend().catch((error) => {
                console.error('Failed to load tracking data:', error);
                // App continues to work normally
              });
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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/onboarding"
          element={
            <AuthRoute>
              <OnboardingPage />
            </AuthRoute>
          }
        />

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
