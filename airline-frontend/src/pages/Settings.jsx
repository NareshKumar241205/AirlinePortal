import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  Eye,
  Mail,
  Smartphone,
  Lock,
  Palette,
  Monitor,
  Volume2,
  VolumeX,
  Save,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
      flightUpdates: true,
      bookingConfirmations: true,
      promotions: false,
      securityAlerts: true
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: false,
      analytics: true,
      location: true
    },
    appearance: {
      theme: theme,
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD'
    },
    security: {
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: '30',
      passwordExpiry: '90'
    }
  });

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'security', name: 'Security', icon: Lock }
  ];

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSavedMessage('Settings saved successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      console.error('Settings save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Account Information
        </h3>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                Name
              </label>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {user?.name || user?.email}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                Email
              </label>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {user?.email}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                Role
              </label>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                Member Since
              </label>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                Language
              </h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Choose your preferred language
              </p>
            </div>
            <select
              value={settings.appearance.language}
              onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
              className="input w-32"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                Timezone
              </h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Your local timezone
              </p>
            </div>
            <select
              value={settings.appearance.timezone}
              onChange={(e) => handleSettingChange('appearance', 'timezone', e.target.value)}
              className="input w-40"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
              <option value="GMT">Greenwich Time</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                Currency
              </h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Display prices in
              </p>
            </div>
            <select
              value={settings.appearance.currency}
              onChange={(e) => handleSettingChange('appearance', 'currency', e.target.value)}
              className="input w-24"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {[
            { key: 'flightUpdates', label: 'Flight Updates', desc: 'Get notified about flight delays, cancellations, and gate changes', icon: Bell },
            { key: 'bookingConfirmations', label: 'Booking Confirmations', desc: 'Receive confirmation for new bookings and changes', icon: Mail },
            { key: 'promotions', label: 'Promotions & Deals', desc: 'Special offers and promotional content', icon: Volume2 },
            { key: 'securityAlerts', label: 'Security Alerts', desc: 'Important security notifications and login alerts', icon: Shield }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5 text-primary-500 dark:text-dark-primary" />
                <div>
                  <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                    {item.label}
                  </h4>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {item.desc}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[item.key]}
                  onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Delivery Methods
        </h3>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
            { key: 'push', label: 'Push Notifications', desc: 'Browser and mobile push notifications', icon: Smartphone },
            { key: 'sms', label: 'SMS Notifications', desc: 'Text message notifications for urgent updates', icon: Bell }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5 text-primary-500 dark:text-dark-primary" />
                <div>
                  <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                    {item.label}
                  </h4>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {item.desc}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[item.key]}
                  onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Privacy Controls
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Eye className="w-5 h-5 text-primary-500 dark:text-dark-primary" />
              <div>
                <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  Profile Visibility
                </h4>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  Who can see your profile information
                </p>
              </div>
            </div>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
              className="input w-32"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
            </select>
          </div>

          {[
            { key: 'dataSharing', label: 'Data Sharing', desc: 'Share anonymized data to improve services' },
            { key: 'analytics', label: 'Analytics', desc: 'Allow usage analytics for better experience' },
            { key: 'location', label: 'Location Services', desc: 'Use location for personalized recommendations' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-primary-500 dark:text-dark-primary" />
                <div>
                  <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                    {item.label}
                  </h4>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {item.desc}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy[item.key]}
                  onChange={(e) => handleSettingChange('privacy', item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Theme
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor }
          ].map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => {
                if (themeOption.value !== 'system') {
                  toggleTheme();
                }
                handleSettingChange('appearance', 'theme', themeOption.value);
              }}
              className={`p-4 border-2 rounded-lg transition-colors duration-200 ${
                settings.appearance.theme === themeOption.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <themeOption.icon className={`w-8 h-8 mx-auto mb-2 ${
                settings.appearance.theme === themeOption.value
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-light-text-secondary dark:text-dark-text-secondary'
              }`} />
              <div className={`text-sm font-medium ${
                settings.appearance.theme === themeOption.value
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-light-text-primary dark:text-dark-text-primary'
              }`}>
                {themeOption.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Display Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                Date Format
              </h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                How dates are displayed throughout the app
              </p>
            </div>
            <select
              value={settings.appearance.dateFormat}
              onChange={(e) => handleSettingChange('appearance', 'dateFormat', e.target.value)}
              className="input w-36"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Security Options
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  Two-Factor Authentication
                </h4>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <Button
              variant={settings.security.twoFactorAuth ? "default" : "outline"}
              size="sm"
              onClick={() => handleSettingChange('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
            >
              {settings.security.twoFactorAuth ? 'Enabled' : 'Enable'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-primary-500 dark:text-dark-primary" />
              <div>
                <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  Login Notifications
                </h4>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  Get notified when someone logs into your account
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.loginNotifications}
                onChange={(e) => handleSettingChange('security', 'loginNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                Session Timeout
              </h4>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Automatically log out after inactivity (minutes)
              </p>
            </div>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
              className="input w-20"
            >
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="60">60</option>
              <option value="120">120</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Password Security
        </h3>
        <div className="space-y-4">
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
          <Button variant="outline" className="w-full">
            Download Account Data
          </Button>
          <Button variant="outline" className="w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-light-text-primary dark:text-dark-text-primary">
          Settings
        </h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
          Manage your account preferences and security settings
        </p>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2 text-green-700 dark:text-green-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{savedMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700 dark:bg-gray-800 dark:text-dark-primary'
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {renderTabContent()}
            
            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                leftIcon={isSaving ? undefined : Save}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;