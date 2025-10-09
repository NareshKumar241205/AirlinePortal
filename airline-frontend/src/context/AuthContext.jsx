import React, { createContext, useContext, useEffect, useState } from 'react';
import { firebaseAuth } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAuthenticated = !!user;

  // Set up Firebase auth state listener
  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in, get additional user data
          const userData = await firebaseAuth.getCurrentUserData();
          if (userData) {
            setUser(userData);
            console.log(`✅ Auth restored for ${userData.email} (${userData.role})`);
          } else {
            // Create user document if it doesn't exist
            const newUserData = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              firstName: firebaseUser.displayName?.split(' ')[0] || '',
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              role: 'customer',
              isActive: true,
              isVerified: firebaseUser.emailVerified,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            };
            setUser(newUserData);
          }
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Error handling auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Helper function to get the correct navigation path based on user role
  // Return absolute paths (include leading slash) so callers can navigate directly.
  const getRoleHomePath = (role) => {
    switch (role) {
      case 'super_admin': return '/admin/overview';
      case 'airline_admin': return '/airline-admin';
      case 'crew_member': return '/crew';
      case 'passenger':
      case 'customer': return '/passenger';
      default: return '/'; // Redirect to landing page for unknown roles
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Input validation
      if (!email || !password) {
        setLoading(false);
        return { success: false, error: 'Email and password are required' };
      }
      
      // Use Firebase authentication
      const result = await firebaseAuth.login(email, password);
      
      if (!result.success) {
        console.log(`❌ Failed login attempt for email: ${email}`);
        setLoading(false);
        return { success: false, error: result.error };
      }

      // Firebase auth state listener will handle setting the user
      console.log(`✅ Login successful for ${email} (${result.user.role})`);
      console.log(`🧭 Navigation target: ${getRoleHomePath(result.user.role)}`);
      
      setLoading(false);
      return { 
        success: true, 
        user: result.user,
        targetRoute: getRoleHomePath(result.user.role)
      };
      
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use Firebase authentication for registration
      const result = await firebaseAuth.register(userData.email, userData.password, {
        firstName: userData.first_name || userData.firstName,
        lastName: userData.last_name || userData.lastName,
        role: userData.role || 'customer'
      });
      
      if (!result.success) {
        setLoading(false);
        return { 
          success: false, 
          error: result.error 
        };
      }
      
      console.log(`✅ Registration successful for ${userData.email}`);
      
      setLoading(false);
      return { 
        success: true, 
        user: result.user,
        targetRoute: getRoleHomePath(result.user.role)
      };
      
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      return { 
        success: false, 
        error: 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      await firebaseAuth.logout();
      console.log('🔓 Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (userData) => {
    setLoading(true);
    
    try {
      const result = await firebaseAuth.updateUserProfile(userData);
      
      if (result.success) {
        // Update local user state
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        setLoading(false);
        return { success: true, user: updatedUser };
      } else {
        setLoading(false);
        return result;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setLoading(false);
      return { 
        success: false, 
        error: 'Profile update failed. Please try again.' 
      };
    }
  };

  const changePassword = async (newPassword) => {
    setLoading(true);
    
    try {
      const result = await firebaseAuth.changePassword(newPassword);
      setLoading(false);
      return result;
    } catch (error) {
      console.error('Password change error:', error);
      setLoading(false);
      return { 
        success: false, 
        error: 'Password change failed. Please try again.' 
      };
    }
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // Helper functions for role checking
  const isSuperAdmin = () => hasRole('super_admin');
  const isAirlineAdmin = () => hasRole('airline_admin');
  const isCrewMember = () => hasRole('crew_member');
  const isPassenger = () => hasRole('passenger') || hasRole('customer');
  const isAdmin = () => hasAnyRole(['super_admin', 'airline_admin']);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isAirlineAdmin,
    isCrewMember,
    isPassenger,
    isAdmin,
    getRoleHomePath
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};