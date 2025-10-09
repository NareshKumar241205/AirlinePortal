import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  Plane,
  Calendar,
  MapPin,
  BarChart3,
  Settings,
  User,
  Briefcase,
  CreditCard,
  Award,
  Bell,
  FileText,
  Shield,
  Building2,
  Clock,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isCollapsed, toggleSidebar, isMobile, closeSidebar }) => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  const getRoleMenuItems = () => {
    // No generic "Dashboard" link - each role has their own specific portal
    const baseItems = [];

    const roleSpecificItems = {
      super_admin: [
        {
          title: 'System Overview',
          icon: BarChart3,
          path: '/admin/overview',
          roles: ['super_admin']
        },
        {
          title: 'Airlines Management',
          icon: Building2,
          path: '/admin/airlines',
          roles: ['super_admin']
        },
        {
          title: 'User Management',
          icon: Users,
          path: '/admin/users',
          roles: ['super_admin']
        },
        {
          title: 'System Reports',
          icon: FileText,
          path: '/admin/reports',
          roles: ['super_admin']
        },
        {
          title: 'Security & Roles',
          icon: Shield,
          path: '/admin/security',
          roles: ['super_admin']
        }
      ],
      airline_admin: [
        {
          title: 'Airline Operations',
          icon: Plane,
          path: '/airline-admin',
          roles: ['airline_admin']
        },
        {
          title: 'Flight Operations',
          icon: Calendar,
          path: '/airline/flights',
          roles: ['airline_admin']
        },
        {
          title: 'Crew Management',
          icon: Users,
          path: '/airline/crew',
          roles: ['airline_admin']
        },
        {
          title: 'Route Analytics',
          icon: MapPin,
          path: '/airline/routes',
          roles: ['airline_admin']
        },
        {
          title: 'Revenue Reports',
          icon: BarChart3,
          path: '/airline/revenue',
          roles: ['airline_admin']
        }
      ],
      crew_member: [
        {
          title: 'My Schedule',
          icon: Calendar,
          path: '/crew',
          roles: ['crew_member']
        },
        {
          title: 'Flight History',
          icon: Briefcase,
          path: '/crew?tab=flights',
          roles: ['crew_member']
        },
        {
          title: 'Training',
          icon: Clock,
          path: '/crew?tab=training',
          roles: ['crew_member']
        },
        {
          title: 'Profile',
          icon: Award,
          path: '/crew?tab=profile',
          roles: ['crew_member']
        }
      ],
      passenger: [
        {
          title: 'My Bookings',
          icon: Calendar,
          path: '/passenger?tab=bookings',
          roles: ['passenger']
        },
        {
          title: 'Book Flight',
          icon: Plane,
          path: '/passenger',
          roles: ['passenger']
        },
        {
          title: 'Flight History',
          icon: MapPin,
          path: '/passenger?tab=history',
          roles: ['passenger']
        },
        {
          title: 'Loyalty Program',
          icon: Award,
          path: '/passenger?tab=loyalty',
          roles: ['passenger']
        }
      ]
    };

    const commonItems = [
      {
        title: 'Notifications',
        icon: Bell,
        path: '/notifications',
        roles: ['super_admin', 'airline_admin', 'crew_member', 'passenger']
      },
      {
        title: 'Profile',
        icon: User,
        path: '/profile',
        roles: ['super_admin', 'airline_admin', 'crew_member', 'passenger']
      },
      {
        title: 'Settings',
        icon: Settings,
        path: '/settings',
        roles: ['super_admin', 'airline_admin', 'crew_member', 'passenger']
      }
    ];

    return [
      ...baseItems,
      ...(roleSpecificItems[user?.role] || []),
      ...commonItems
    ];
  };

  const menuItems = getRoleMenuItems();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center space-x-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <Plane className="w-8 h-8 text-primary-500 dark:text-dark-primary flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-xl font-heading font-bold text-light-text-primary dark:text-dark-text-primary">
                AirlinePortal
              </span>
            )}
          </div>
          
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
              )}
            </button>
          )}

          {isMobile && (
            <button
              onClick={closeSidebar}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user?.first_name?.charAt(0) || user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate">
                  {(user?.first_name && user?.last_name) 
                    ? `${user.first_name} ${user.last_name}` 
                    : user?.name || user?.email}
                </p>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center px-3 py-2 rounded-lg transition-all duration-200 group
                      ${active 
                        ? 'bg-primary-100 dark:bg-gray-800 text-primary-700 dark:text-dark-primary' 
                        : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-light-text-primary dark:hover:text-dark-text-primary'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary-600 dark:text-dark-primary' : ''}`} />
                    {!isCollapsed && (
                      <span className="ml-3 font-medium">{item.title}</span>
                    )}
                    
                    {isCollapsed && (
                      <div className="absolute left-16 ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                        {item.title}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-2">
          <button
            onClick={logout}
            className={`
              w-full flex items-center px-3 py-2 rounded-lg transition-colors duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 group
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="ml-3 font-medium">Logout</span>
            )}
            
            {isCollapsed && (
              <div className="absolute left-16 ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;