import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Plane, Mail, Lock, User, AlertCircle, Check, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'passenger'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { value: 'passenger', label: 'Passenger', description: 'Book flights and manage bookings' },
    { value: 'crew_member', label: 'Crew Member', description: 'Flight crew and staff access' },
    { value: 'airline_admin', label: 'Airline Admin', description: 'Manage airline operations' }
  ];

  const passwordRequirements = [
    { regex: /.{8,}/, text: 'At least 8 characters' },
    { regex: /[A-Z]/, text: 'One uppercase letter' },
    { regex: /[a-z]/, text: 'One lowercase letter' },
    { regex: /\d/, text: 'One number' }
  ];

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error and success when user starts typing
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const validatePassword = () => {
    return passwordRequirements.every(req => req.regex.test(formData.password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    // Validation
    if (!validatePassword()) {
      setError('Password does not meet requirements');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Split name into first and last name
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      const registrationData = {
        first_name: firstName,
        last_name: lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      
      const result = await register(registrationData);
      
      if (result.success) {
        setSuccessMessage('Registration successful! Redirecting to your portal...');
        
        // Wait 2 seconds to show success message, then navigate
        setTimeout(() => {
          // Navigate based on role
          const roleRoutes = {
            'passenger': '/passenger',
            'customer': '/passenger',
            'crew_member': '/crew',
            'airline_admin': '/airline-admin',
            'super_admin': '/admin/overview'
          };
          navigate(roleRoutes[result.user.role] || '/passenger');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image */}
      <div className="hidden lg:block relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-400 to-primary-400 flex items-center justify-center">
          <div className="text-center text-white p-12">
            <Plane className="w-32 h-32 mx-auto mb-8 animate-bounce-subtle" />
            <h2 className="text-3xl font-heading font-bold mb-4">
              Join AirlinePortal Today
            </h2>
            <p className="text-lg opacity-90 max-w-md mx-auto">
              Experience the future of airline management. 
              Create your account and start your journey with us.
            </p>
            <div className="mt-8 space-y-3 text-left max-w-sm mx-auto">
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 bg-white/20 rounded-full p-1" />
                <span className="text-sm">Secure and reliable</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 bg-white/20 rounded-full p-1" />
                <span className="text-sm">24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
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
              Create your account
            </h2>
            <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-dark-primary dark:hover:text-primary-300"
              >
                Sign in here
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
                <label htmlFor="name" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

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
                <label htmlFor="role" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  Account Type
                </label>
                <div className="mt-2 space-y-2">
                  {roles.map((role) => (
                    <label
                      key={role.value}
                      className={`relative flex items-start p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                        formData.role === role.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <div className="ml-3">
                        <span className={`block text-sm font-medium ${
                          formData.role === role.value
                            ? 'text-primary-700 dark:text-primary-300'
                            : 'text-light-text-primary dark:text-dark-text-primary'
                        }`}>
                          {role.label}
                        </span>
                        <span className="block text-xs text-light-text-secondary dark:text-dark-text-secondary">
                          {role.description}
                        </span>
                      </div>
                    </label>
                  ))}
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-10 pr-10"
                    placeholder="Create a password"
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
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, index) => {
                      const isValid = req.regex.test(formData.password);
                      return (
                        <div key={index} className={`flex items-center text-xs ${
                          isValid ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                        }`}>
                          <Check className={`w-3 h-3 mr-2 ${isValid ? 'opacity-100' : 'opacity-30'}`} />
                          {req.text}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input pl-10 pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                    ) : (
                      <Eye className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Passwords do not match
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-dark-primary">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-dark-primary">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || !validatePassword() || formData.password !== formData.confirmPassword}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;