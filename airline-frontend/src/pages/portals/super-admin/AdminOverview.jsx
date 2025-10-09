import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users,
  Building2,
  Plane,
  Shield,
  BarChart3,
  TrendingUp,
  Activity,
  Database,
  Plus,
  Settings,
  RefreshCw
} from 'lucide-react';
import MainLayout from '../../../components/layout/MainLayout';
import { useAuth } from '../../../context/AuthContext';

const AdminOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data - In production, this would come from API
  const systemStats = {
    totalAirlines: 12,
    activeUsers: 1247,
    totalFlights: 856,
    systemUptime: 99.98,
    monthlyRevenue: 2400000,
    activeFlights: 42
  };

  const recentActivities = [
    { id: 1, action: 'New airline registered', airline: 'Pacific Airways', time: '10 mins ago', type: 'success' },
    { id: 2, action: 'User role updated', user: 'john.smith@airline.com', time: '25 mins ago', type: 'info' },
    { id: 3, action: 'System maintenance completed', time: '1 hour ago', type: 'success' },
    { id: 4, action: 'New admin user created', user: 'admin@bluesky.com', time: '2 hours ago', type: 'info' },
  ];

  const airlines = [
    { id: 1, name: 'SkyWays International', users: 145, flights: 234, status: 'active' },
    { id: 2, name: 'BlueSky Airways', users: 98, flights: 156, status: 'active' },
    { id: 3, name: 'Global Air', users: 210, flights: 312, status: 'active' },
    { id: 4, name: 'Pacific Airways', users: 87, flights: 94, status: 'pending' },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center mb-2">
                <Shield className="h-10 w-10 mr-3" />
                <div>
                  <h1 className="text-4xl font-bold">System Command Center</h1>
                  <p className="text-purple-100 mt-1">Welcome back, {user?.first_name}!</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  Multi-Airline Platform
                </span>
                <span className="bg-green-400/80 px-3 py-1 rounded-full text-sm flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  All Systems Online
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate('/admin/airlines')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors border border-white/20"
                >
                  Airlines
                </button>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors border border-white/20"
                >
                  Users
                </button>
                <button
                  onClick={() => navigate('/admin/reports')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors border border-white/20"
                >
                  Reports
                </button>
                <button
                  onClick={() => navigate('/admin/security')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors border border-white/20"
                >
                  Security
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{currentTime.toLocaleDateString()}</div>
              <div className="text-purple-100">{currentTime.toLocaleTimeString()}</div>
              <button
                onClick={handleRefresh}
                className="mt-3 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Airlines"
            value={systemStats.totalAirlines}
            subtitle="+2 this month"
            icon={Building2}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Users"
            value={systemStats.activeUsers.toLocaleString()}
            subtitle="+8.2% increase"
            icon={Users}
            color="bg-green-500"
          />
          <StatCard
            title="Total Flights"
            value={systemStats.totalFlights}
            subtitle={`${systemStats.activeFlights} active now`}
            icon={Plane}
            color="bg-indigo-500"
          />
          <StatCard
            title="System Uptime"
            value={`${systemStats.systemUptime}%`}
            subtitle="Excellent performance"
            icon={Activity}
            color="bg-emerald-500"
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${(systemStats.monthlyRevenue / 1000000).toFixed(1)}M`}
            subtitle="+12.5% from last month"
            icon={TrendingUp}
            color="bg-purple-500"
          />
          <StatCard
            title="Database Status"
            value="Healthy"
            subtitle="All queries optimized"
            icon={Database}
            color="bg-teal-500"
          />
        </div>

        {/* Airlines Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Registered Airlines
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage all airline partners on the platform
                </p>
              </div>
              <button 
                onClick={() => navigate('/admin/airlines')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Manage Airlines
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Airline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Flights
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {airlines.map((airline) => (
                  <tr key={airline.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {airline.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{airline.users}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{airline.flights}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        airline.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                      }`}>
                        {airline.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => navigate('/admin/airlines')}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 mr-4 hover:underline"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => navigate('/admin/airlines')}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 hover:underline"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              Recent Activity
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Latest system-wide activities and changes
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className={`mt-1 h-2 w-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {activity.action}
                    </p>
                    {(activity.airline || activity.user) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.airline || activity.user}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => navigate('/admin/airlines')}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all group text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <Plus className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Manage Airlines
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and manage airline partners
            </p>
          </button>

          <button 
            onClick={() => navigate('/admin/users')}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all group text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <Plus className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Manage Users
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and manage all platform users
            </p>
          </button>

          <button 
            onClick={() => navigate('/admin/reports')}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all group text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg group-hover:bg-green-200 transition-colors">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <Settings className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              System Reports
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate analytics and performance reports
            </p>
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminOverview;