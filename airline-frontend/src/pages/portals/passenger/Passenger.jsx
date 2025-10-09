import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Calendar, 
  MapPin, 
  Star, 
  CreditCard,
  CheckCircle,
  Clock,
  Gift,
  Search,
  TrendingUp
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

const Passenger = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { title: 'Loyalty Points', value: '12,450', icon: Star, color: 'bg-purple-500' },
    { title: 'Flights This Year', value: '8', icon: Plane, color: 'bg-blue-500' },
    { title: 'Miles Traveled', value: '24,680', icon: MapPin, color: 'bg-green-500' },
    { title: 'Money Saved', value: '$1,240', icon: CreditCard, color: 'bg-orange-500' }
  ];

  const upcomingBookings = [
    {
      id: 'AA101',
      date: '2024-01-20',
      route: 'NYC → LAX',
      departure: '08:30',
      arrival: '11:45',
      seat: '12A',
      status: 'Confirmed',
      gate: 'A12',
      bookingRef: 'ABC123'
    },
    {
      id: 'AA205',
      date: '2024-01-27',
      route: 'LAX → NYC',
      departure: '14:20',
      arrival: '22:30',
      seat: '15F',
      status: 'Confirmed',
      gate: 'B8',
      bookingRef: 'DEF456'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      message: 'Booking confirmed for flight AA101',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      message: 'Earned 250 loyalty points',
      time: '1 day ago',
      icon: Star,
      color: 'text-purple-600'
    },
    {
      id: 3,
      message: 'Check-in now available for AA101',
      time: '3 hours ago',
      icon: Clock,
      color: 'text-blue-600'
    }
  ];

  const rewards = [
    { id: 1, title: 'Free Upgrade', points: 5000, icon: TrendingUp },
    { id: 2, title: 'Lounge Access', points: 3000, icon: Gift },
    { id: 3, title: 'Extra Baggage', points: 2000, icon: Gift }
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Passenger Portal</h1>
              <p className="text-purple-100 mt-2">
                Welcome back, {user?.name || 'Traveler'}! You have 2 upcoming trips.
              </p>
            </div>
            <div className="text-right">
              <p className="text-purple-100">Current Time</p>
              <p className="text-xl font-semibold">
                {currentTime.toLocaleTimeString()}
              </p>
              <p className="text-purple-100 text-sm">
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
              <Plane className="h-5 w-5 mr-2 text-purple-600" />
              Upcoming Bookings
            </h2>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{booking.id}</h3>
                      <p className="text-sm text-gray-600">{booking.route}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {booking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Date:</strong> {booking.date}</p>
                      <p><strong>Departure:</strong> {booking.departure}</p>
                      <p><strong>Seat:</strong> {booking.seat}</p>
                    </div>
                    <div>
                      <p><strong>Arrival:</strong> {booking.arrival}</p>
                      <p><strong>Gate:</strong> {booking.gate}</p>
                      <p><strong>Ref:</strong> {booking.bookingRef}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-600" />
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Gift className="h-5 w-5 mr-2 text-purple-600" />
              Available Rewards
            </h2>
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-purple-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <reward.icon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{reward.title}</p>
                      <p className="text-sm text-gray-600">{reward.points} points</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                    Redeem
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                <Search className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-gray-600 text-sm">Book Flight</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                <Calendar className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-gray-600 text-sm">Manage Trips</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                <CheckCircle className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-gray-600 text-sm">Check In</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                <Star className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-gray-600 text-sm">View Rewards</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Passenger;
