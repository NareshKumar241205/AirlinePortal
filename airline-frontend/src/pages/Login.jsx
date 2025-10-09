import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Plane, Mail, Lock, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error and success when user starts typing
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    // Client-side validation
    if (!formData.email) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      // Call login function from AuthContext
      const result = await login(formData.email, formData.password);
      
      console.log('Login result:', result); // Debug log
      
      if (result.success) {
        // Log successful authentication
        console.log('🔐 Authentication successful!');
        console.log('User:', result.user);
        console.log('Target route:', result.targetRoute);
        
        // Show success message
        setSuccessMessage('Login successful! Redirecting to your portal...');
        
        // Wait 1.5 seconds to show success message
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Automatically navigate to the appropriate route based on user role
        if (result.targetRoute) {
          console.log(`Navigating to: ${result.targetRoute}`);
          navigate(result.targetRoute, { replace: true });
          return;
        }

        // Fallback to manual role-based navigation if targetRoute isn't provided
        const userRole = result.user.role;
        switch (userRole) {
          case 'super_admin':
            navigate('/admin/overview', { replace: true });
            break;
          case 'airline_admin':
            navigate('/airline-admin', { replace: true });
            break;
          case 'crew_member':
            navigate('/crew', { replace: true });
            break;
          case 'passenger':
          case 'customer':
            navigate('/passenger', { replace: true });
            break;
          default:
            // Unknown role - redirect to portals page
            navigate('/portals', { replace: true });
            break;
        }
      } else {
        setError(result.error || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-8">
              <Plane className="w-8 h-8 text-primary-500 dark:text-dark-primary" />
              <span className="text-2xl font-heading font-bold text-light-text-primary dark:text-dark-text-primary">
                AirlinePortal
              </span>
            </Link>
            
            <h2 className="text-3xl font-heading font-extrabold text-light-text-primary dark:text-dark-text-primary">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Or{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-dark-primary dark:hover:text-primary-300"
              >
                create a new account
              </Link>
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2 text-red-700 dark:text-red-400 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm flex-1">{error}</span>
                <button 
                  onClick={() => setError('')}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2 text-green-700 dark:text-green-400 animate-slide-down">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm flex-1">{successMessage}</span>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-10 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                    ) : (
                      <Eye className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-dark-primary dark:hover:text-primary-300"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </div>
            </form>

            {/* Demo Accounts */}
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <p className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-4">
                📋 Demo Accounts (Click email to copy):
              </p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <strong className="text-blue-700 dark:text-blue-300">Super Admin:</strong>
                  <br/>
                  Email: <code className="text-blue-600 dark:text-blue-400">superadmin@airportal.com</code>
                  <br/>
                  Password: <code>Password123!</code>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <strong className="text-green-700 dark:text-green-300">Airline Admin:</strong>
                  <br/>
                  Email: <code className="text-green-600 dark:text-green-400">admin@skyways.com</code>
                  <br/>
                  Password: <code>Password123!</code>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                  <strong className="text-purple-700 dark:text-purple-300">Crew Member:</strong>
                  <br/>
                  Email: <code className="text-purple-600 dark:text-purple-400">pilot@skyways.com</code>
                  <br/>
                  Password: <code>Password123!</code>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                  <strong className="text-orange-700 dark:text-orange-300">Passenger:</strong>
                  <br/>
                  Email: <code className="text-orange-600 dark:text-orange-400">john.doe@email.com</code>
                  <br/>
                  Password: <code>Password123!</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
          <div className="text-center text-white p-12">
            <Plane className="w-32 h-32 mx-auto mb-8 animate-bounce-subtle" />
            <h2 className="text-3xl font-heading font-bold mb-4">
              Welcome Back to AirlinePortal
            </h2>
            <p className="text-lg opacity-90 max-w-md mx-auto">
              Your comprehensive airline management solution. 
              Sign in to access your dashboard and manage your operations efficiently.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="font-semibold">500+</div>
                <div className="opacity-75">Airlines</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="font-semibold">50K+</div>
                <div className="opacity-75">Daily Flights</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="font-semibold">2M+</div>
                <div className="opacity-75">Happy Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="font-semibold">99.9%</div>
                <div className="opacity-75">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;