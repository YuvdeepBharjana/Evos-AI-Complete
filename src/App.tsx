import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './store/useUserStore';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MirrorPage } from './pages/MirrorPage';
import { ProfilePage } from './pages/ProfilePage';
import { AppLayout } from './components/layout/AppLayout';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserStore();
  
  if (!user || !user.onboardingComplete) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already onboarded)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserStore();
  
  if (user?.onboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <OnboardingPage />
            </PublicRoute>
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
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
