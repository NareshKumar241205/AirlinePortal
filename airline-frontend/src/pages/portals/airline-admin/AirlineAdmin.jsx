import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Plus,
  Settings,
  CheckCircle,
  Activity
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import MainLayout from '../../../components/layout/MainLayout';

const StatCard = ({ title, value, icon: Icon, color = 'bg-blue-500' }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${color} rounded-full p-3`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const AirlineAdmin = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { title: 'Active Flights', value: '47', icon: Plane, color: 'bg-blue-500' },
    { title: 'Total Crew', value: '234', icon: Users, color: 'bg-green-500' },
    { title: 'Daily Revenue', value: '$89.4K', icon: DollarSign, color: 'bg-purple-500' },
    { title: 'Utilization', value: '87%', icon: TrendingUp, color: 'bg-orange-500' }
  ];

  const flightData = [
    {
      id: 'AA101',
      route: 'NYC → LAX',
      departure: '08:30',
      aircraft: 'Boeing 737-800',
      status: 'On Time',
      passengers: '156/180',
      gate: 'A12'
    },
    {
      id: 'AA205',
      route: 'LAX → CHI',
      departure: '14:20',
      aircraft: 'Airbus A320',
      status: 'Delayed',
      passengers: '142/150',
      gate: 'B8'
    },
    {
      id: 'AA308',
      route: 'CHI → MIA',
      departure: '16:15',
      aircraft: 'Boeing 787-9',
      status: 'Boarding',
      passengers: '201/280',
      gate: 'C15'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      message: 'Flight AA101 departed on time',
      time: '15 minutes ago',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      message: 'Crew schedule updated for next week',
      time: '1 hour ago',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      id: 3,
      message: 'Flight AA205 delayed by 30 minutes',
      time: '2 hours ago',
      icon: AlertTriangle,
      color: 'text-yellow-600'
    }
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Airline Admin Dashboard</h1>
              <p className="text-indigo-100 mt-2">
                Welcome back, {user?.name || 'Admin'}! You have 47 active flights today.
              </p>
            </div>
            <div className="text-right">
              <p className="text-indigo-100">Current Time</p>
              <p className="text-xl font-semibold">
                {currentTime.toLocaleTimeString()}
              </p>
              <p className="text-indigo-100 text-sm">
                {currentTime.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Plane className="h-5 w-5 mr-2 text-indigo-600" />
              Today's Flights
            </h2>
            <div className="space-y-4">
              {flightData.map((flight) => (
                <div key={flight.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{flight.id}</h3>
                      <p className="text-sm text-gray-600">{flight.route}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      flight.status === 'On Time' 
                        ? 'bg-green-100 text-green-800'
                        : flight.status === 'Delayed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {flight.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Departure:</strong> {flight.departure}</p>
                      <p><strong>Gate:</strong> {flight.gate}</p>
                    </div>
                    <div>
                      <p><strong>Aircraft:</strong> {flight.aircraft}</p>
                      <p><strong>Passengers:</strong> {flight.passengers}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-indigo-600" />
              Recent Activities
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`rounded-full p-2 ${activity.color} bg-opacity-10`}>
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
              <Plus className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Add Flight</span>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
              <Users className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Manage Crew</span>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
              <Settings className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Fleet Settings</span>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
              <TrendingUp className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AirlineAdmin;
