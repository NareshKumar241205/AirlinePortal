import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy load components for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/Login'));
const RegisterPage = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

// Role-specific pages (organized by portal)
// Super Admin Portal
const AdminOverview = lazy(() => import('./pages/portals/super-admin/AdminOverview'));
const AirlinesManagement = lazy(() => import('./pages/portals/super-admin/AirlinesManagement'));
const UsersManagement = lazy(() => import('./pages/portals/super-admin/UsersManagement'));
const SystemReports = lazy(() => import('./pages/portals/super-admin/SystemReports'));
const Security = lazy(() => import('./pages/portals/super-admin/Security'));

// Airline Admin Portal
const AirlineAdmin = lazy(() => import('./pages/portals/airline-admin/AirlineAdmin'));

// Crew Portal
const CrewMember = lazy(() => import('./pages/portals/crew/CrewMember'));

// Passenger Portal
const Passenger = lazy(() => import('./pages/portals/passenger/Passenger'));
const PortalNavigator = lazy(() => import('./pages/PortalNavigator'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// App routes wrapper that has access to auth context
const AppRoutes = () => {
  const { isAuthenticated, loading, user } = useAuth();

  // Helper function to get role-based portal/dashboard path
  const getRoleHomePath = (role) => {
    switch (role) {
      case 'super_admin': return '/admin/overview';
      case 'airline_admin': return '/airline-admin';
      case 'crew_member': return '/crew';
      case 'passenger': return '/passenger';
      default: return '/';
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Routes>
  {/* Public routes */}
  {/* Root should always show the landing page; portals will redirect if authenticated */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/portals" element={isAuthenticated ? <Navigate to={getRoleHomePath(user?.role)} replace /> : <PortalNavigator />} />
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to={getRoleHomePath(user?.role)} replace /> : <LoginPage />
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? <Navigate to={getRoleHomePath(user?.role)} replace /> : <RegisterPage />
        } 
      />

      {/* Common Protected routes - accessible to all authenticated users */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />

      {/* Role-specific portal routes with strict role enforcement */}
      
      {/* Super Admin Routes */}
      <Route path="/admin/overview" element={
        <ProtectedRoute requiredRoles={['super_admin']} strictRoleCheck={true}>
          <AdminOverview />
        </ProtectedRoute>
      } />

      <Route path="/admin/airlines" element={
        <ProtectedRoute requiredRoles={['super_admin']} strictRoleCheck={true}>
          <AirlinesManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute requiredRoles={['super_admin']} strictRoleCheck={true}>
          <UsersManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/reports" element={
        <ProtectedRoute requiredRoles={['super_admin']} strictRoleCheck={true}>
          <SystemReports />
        </ProtectedRoute>
      } />

      <Route path="/admin/security" element={
        <ProtectedRoute requiredRoles={['super_admin']} strictRoleCheck={true}>
          <Security />
        </ProtectedRoute>
      } />

      {/* Airline Admin Routes */}
      <Route path="/airline-admin" element={
        <ProtectedRoute requiredRoles={['airline_admin']} strictRoleCheck={true}>
          <AirlineAdmin />
        </ProtectedRoute>
      } />

      {/* Crew Member Routes */}
      <Route path="/crew" element={
        <ProtectedRoute requiredRoles={['crew_member']} strictRoleCheck={true}>
          <CrewMember />
        </ProtectedRoute>
      } />

      {/* Passenger Routes */}
      <Route path="/passenger" element={
        <ProtectedRoute requiredRoles={['passenger']} strictRoleCheck={true}>
          <Passenger />
        </ProtectedRoute>
      } />

  {/* Fallback route: if authenticated send to role home, otherwise to landing */}
  <Route path="*" element={isAuthenticated ? <Navigate to={getRoleHomePath(user?.role)} replace /> : <Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
            <Suspense fallback={<PageLoader />}>
              <AppRoutes />
            </Suspense>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;