import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Plane, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
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

const CrewMember = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const upcomingFlights = [
    {
      id: 'AA101',
      date: '2024-01-15',
      time: '14:30',
      route: 'NYC → LAX',
      aircraft: 'Boeing 737',
      duration: '5h 30m',
      status: 'Scheduled'
    },
    {
      id: 'AA205',
      date: '2024-01-16',
      time: '09:15',
      route: 'LAX → MIA',
      aircraft: 'Airbus A320',
      duration: '4h 45m',
      status: 'Confirmed'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      message: 'Completed flight AA892 (DEN → PHX)',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      message: 'Schedule updated for next week',
      time: '1 day ago',
      icon: Calendar,
      color: 'text-blue-600'
    }
  ];

  const stats = [
    { title: 'Upcoming Flights', value: '2', icon: Plane, color: 'bg-blue-500' },
    { title: 'Flight Hours', value: '89', icon: Clock, color: 'bg-green-500' },
    { title: 'Destinations', value: '12', icon: MapPin, color: 'bg-purple-500' },
    { title: 'Team Members', value: '24', icon: Users, color: 'bg-orange-500' }
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Crew Dashboard</h1>
              <p className="text-blue-100 mt-2">
                Welcome back, {user?.name || 'Crew Member'}! You have 2 upcoming flights.
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100">Current Time</p>
              <p className="text-xl font-semibold">
                {currentTime.toLocaleTimeString()}
              </p>
              <p className="text-blue-100 text-sm">
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
              <Plane className="h-5 w-5 mr-2 text-blue-600" />
              Upcoming Flights
            </h2>
            <div className="space-y-4">
              {upcomingFlights.map((flight) => (
                <div key={flight.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{flight.id}</h3>
                      <p className="text-sm text-gray-600">{flight.route}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {flight.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Date:</strong> {flight.date}</p>
                      <p><strong>Time:</strong> {flight.time}</p>
                    </div>
                    <div>
                      <p><strong>Aircraft:</strong> {flight.aircraft}</p>
                      <p><strong>Duration:</strong> {flight.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Calendar className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">View Schedule</span>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Clock className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Log Hours</span>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <AlertCircle className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Report Issue</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CrewMember;
