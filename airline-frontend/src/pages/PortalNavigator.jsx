import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Plane, 
  Users, 
  User,
  ArrowRight,
  LayoutDashboard,
  Building2,
  Calendar,
  Star
} from 'lucide-react';

const PortalNavigator = () => {
  const navigate = useNavigate();

  const portals = [
    {
      title: 'Super Admin Portal',
      description: 'System overview, user management, and administrative controls',
      icon: Shield,
      path: '/admin/overview',
      color: 'from-purple-500 to-purple-700',
      features: ['User Management', 'System Monitoring', 'Analytics', 'Security Settings']
    },
    {
      title: 'Airline Admin Portal',
      description: 'Flight management, crew scheduling, and operational oversight',
      icon: Plane,
      path: '/airline-admin',
      color: 'from-blue-500 to-blue-700',
      features: ['Flight Management', 'Crew Scheduling', 'Aircraft Status', 'Revenue Reports']
    },
    {
      title: 'Crew Member Portal',
      description: 'Personal schedule, training, and flight assignments',
      icon: Users,
      path: '/crew',
      color: 'from-green-500 to-green-700',
      features: ['My Schedule', 'Flight History', 'Training Records', 'Profile Management']
    },
    {
      title: 'Passenger Portal',
      description: 'Flight booking, travel history, and loyalty program',
      icon: User,
      path: '/passenger',
      color: 'from-orange-500 to-orange-700',
      features: ['Book Flights', 'My Bookings', 'Travel History', 'Loyalty Program']
    }
  ];

  const quickLinks = [
    { title: 'Landing Page', path: '/', icon: Building2 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Airline Management System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Choose a portal to explore the role-based dashboard system
          </p>
          
          {/* Quick Links */}
          <div className="flex justify-center space-x-4 mb-8">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
                >
                  <Icon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  <span className="text-gray-700 dark:text-gray-300">{link.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.path}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${portal.color} p-6 text-white`}>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{portal.title}</h3>
                      <p className="text-white text-opacity-90 text-sm">
                        {portal.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Key Features:
                  </h4>
                  <ul className="space-y-2 mb-6">
                    {portal.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(portal.path)}
                    className={`
                      w-full bg-gradient-to-r ${portal.color} text-white py-3 px-4 rounded-lg
                      hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200
                      flex items-center justify-center space-x-2 font-medium
                    `}
                  >
                    <span>Access Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              About This Demo
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
              This is a comprehensive role-based dashboard system built with React and Tailwind CSS. 
              Each portal demonstrates different user experiences and functionalities tailored to specific roles 
              within an airline management system. No authentication is required for this demo.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">4</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Role-Based Portals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">15+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Reusable Components</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Responsive Design</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">Dark/Light</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Theme Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalNavigator;