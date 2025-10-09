import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * Enhanced ProtectedRoute component with robust role-based access control
 * 
 * @param {ReactNode} children - Child components to render if access is granted
 * @param {string[]} requiredRoles - Array of roles allowed to access this route
 * @param {string} redirectTo - Path to redirect if authentication fails
 * @param {boolean} strictRoleCheck - If true, requires exact role match; if false, allows higher privilege roles
 */
const ProtectedRoute = ({ 
  children, 
  requiredRoles = [],
  redirectTo = '/login',
  strictRoleCheck = false
}) => {
  const { isAuthenticated, user, loading, token } = useAuth();
  const navigate = useNavigate();

  // Role hierarchy (higher index = higher privileges)
  const roleHierarchy = ['passenger', 'crew_member', 'airline_admin', 'super_admin'];

  // Verify token and authentication on mount
  useEffect(() => {
    if (!loading && !token && isAuthenticated) {
      console.error('⚠️ Protected route accessed with invalid authentication state');
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, redirectTo, token]);

  // Show loading spinner while auth is being checked
  if (loading) {
    console.log('🔄 ProtectedRoute: Loading authentication state...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('🔒 ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to={redirectTo} replace />;
  }
  
  console.log(`✅ ProtectedRoute: Authenticated as ${user.role}, checking access...`);

  // Check role-based access
  if (requiredRoles.length > 0) {
    const userRoleIndex = roleHierarchy.indexOf(user.role);
    
    // Perform role check based on strictness level
    const hasAccess = strictRoleCheck 
      // Strict check: role must be exactly in the required roles
      ? requiredRoles.includes(user.role)
      // Hierarchical check: role or higher privilege can access
      : requiredRoles.some(role => {
          const requiredRoleIndex = roleHierarchy.indexOf(role);
          return userRoleIndex >= requiredRoleIndex;
        });
    
    if (!hasAccess) {
      console.log(`🚫 Access denied: Role ${user.role} not authorized for this route`);
      return (
        <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
              You don't have the required permissions to access this page.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;