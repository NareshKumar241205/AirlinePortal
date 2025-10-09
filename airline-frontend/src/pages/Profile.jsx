import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Camera,
  Edit2,
  Save,
  X,
  Shield,
  Award,
  Plane,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get full name from first_name and last_name or fallback to name field
  const getFullName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.name || '';
  };

  const [formData, setFormData] = useState({
    name: getFullName(),
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: getFullName(),
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      dateOfBirth: user?.dateOfBirth || ''
    });
    setIsEditing(false);
  };

  const roleStats = {
    super_admin: [
      { label: 'Airlines Managed', value: '12', icon: Plane },
      { label: 'Total Users', value: '1,247', icon: User },
      { label: 'System Uptime', value: '99.9%', icon: Shield },
      { label: 'Years Active', value: '3', icon: Clock }
    ],
    airline_admin: [
      { label: 'Fleet Size', value: '24', icon: Plane },
      { label: 'Crew Members', value: '156', icon: User },
      { label: 'Routes', value: '18', icon: MapPin },
      { label: 'Years Active', value: '2', icon: Clock }
    ],
    crew_member: [
      { label: 'Flight Hours', value: '847', icon: Clock },
      { label: 'Routes Flown', value: '28', icon: MapPin },
      { label: 'Perfect Flights', value: '156', icon: Award },
      { label: 'Years Experience', value: '5', icon: Shield }
    ],
    passenger: [
      { label: 'Total Bookings', value: '12', icon: Plane },
      { label: 'Miles Earned', value: '24,580', icon: Award },
      { label: 'Countries', value: '8', icon: MapPin },
      { label: 'Member Since', value: '2022', icon: Calendar }
    ]
  };

  const currentStats = roleStats[user?.role] || roleStats.passenger;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-light-text-primary dark:text-dark-text-primary">
          Profile
        </h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto">
                {user?.first_name?.charAt(0) || user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <Camera className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
              </button>
            </div>

            <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-6">
              {getFullName() || user?.email}
            </h2>

            {/* Edit Toggle */}
            <div className="space-y-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  leftIcon={Edit2}
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="flex-1"
                    leftIcon={Save}
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Save'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    leftIcon={X}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
              Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {currentStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 bg-primary-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-primary-600 dark:text-dark-primary" />
                  </div>
                  <div className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                    {stat.value}
                  </div>
                  <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-6">
              Personal Information
            </h3>

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input pl-10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input pl-10"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className="input pl-10 resize-none"
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input pl-10"
                  />
                </div>
              </div>

              {/* Role Information */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-md font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                  Account Information
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        Account Type
                      </p>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary capitalize">
                        {user?.role?.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        Member Since
                      </p>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;