import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plane, 
  Shield, 
  Users, 
  BarChart3, 
  Star, 
  ArrowRight,
  CheckCircle,
  Globe,
  Clock,
  Award
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  // Get role-based portal path
  const getRolePortalPath = () => {
    if (!user?.role) return '/portals';
    
    switch (user.role) {
      case 'super_admin': return '/admin/overview';
      case 'airline_admin': return '/airline-admin';
      case 'crew_member': return '/crew';
      case 'passenger': return '/passenger';
      default: return '/portals';
    }
  };

  const features = [
    {
      icon: Plane,
      title: 'Flight Management',
      description: 'Comprehensive flight scheduling, tracking, and management system with real-time updates.',
      color: 'text-blue-500'
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Role-based dashboard for super admins, airline admins, crew members, and customers.',
      color: 'text-green-500'
    },
    {
      icon: Shield,
      title: 'Secure Operations',
      description: 'Enterprise-grade security with JWT authentication and encrypted data handling.',
      color: 'text-purple-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Real-time insights, revenue tracking, and comprehensive reporting dashboards.',
      color: 'text-orange-500'
    }
  ];

  const stats = [
    { label: 'Airlines Managed', value: '500+', icon: Plane },
    { label: 'Daily Flights', value: '50K+', icon: Globe },
    { label: 'Happy Customers', value: '2M+', icon: Users },
    { label: 'Uptime', value: '99.9%', icon: Clock }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, Skyways International',
      content: 'AirlinePortal transformed our operations. The intuitive interface and powerful features have increased our efficiency by 40%.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Operations Director, BlueSky Airways',
      content: 'The best airline management system we\'ve used. Customer support is exceptional and the platform is incredibly reliable.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Fleet Manager, Global Wings',
      content: 'Real-time tracking and analytics have revolutionized how we manage our fleet. Couldn\'t imagine working without it.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 dark:from-dark-primary/10 dark:to-dark-secondary/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="font-heading text-4xl tracking-tight font-extrabold text-light-text-primary dark:text-dark-text-primary sm:text-5xl lg:text-6xl">
                <span className="block">Next-Generation</span>
                <span className="block gradient-text">Airline Management</span>
              </h1>
              
              <p className="mt-6 text-lg text-light-text-secondary dark:text-dark-text-secondary sm:max-w-xl sm:mx-auto lg:mx-0">
                Streamline your airline operations with our comprehensive management portal. 
                From flight scheduling to customer management, everything you need in one powerful platform.
              </p>
              
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center lg:justify-start">
                  {isAuthenticated ? (
                    <Link to={getRolePortalPath()}>
                      <Button size="lg" rightIcon={ArrowRight}>
                        Go to My Portal
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/register">
                        <Button size="lg" rightIcon={ArrowRight}>
                          Get Started Free
                        </Button>
                      </Link>
                      <Link to="/login">
                        <Button variant="outline" size="lg">
                          Sign In
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
                

              </div>
            </div>
            
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="relative block w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-strong">
                  <div className="aspect-w-16 aspect-h-10 bg-gradient-to-br from-primary-400 to-secondary-400 p-8">
                    <div className="flex items-center justify-center h-full">
                      <Plane className="w-32 h-32 text-white animate-bounce-subtle" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary">
                      Live Dashboard Preview
                    </h3>
                    <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Real-time flight tracking and management
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-primary-100 dark:bg-gray-800 rounded-lg">
                  <stat.icon className="w-6 h-6 text-primary-600 dark:text-dark-primary" />
                </div>
                <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-light-bg dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-extrabold text-light-text-primary dark:text-dark-text-primary sm:text-4xl">
              Everything you need to manage your airline
            </h2>
            <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
              Powerful features designed for modern airline operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-hover p-6 text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 mb-4 rounded-lg bg-gray-100 dark:bg-gray-800 ${feature.color}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-light-text-primary dark:text-dark-text-primary">
                  {feature.title}
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-extrabold text-light-text-primary dark:text-dark-text-primary sm:text-4xl">
              Trusted by industry leaders
            </h2>
            <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
              See what airline professionals say about AirlinePortal
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="card p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-light-text-primary dark:text-dark-text-primary mb-4">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="animate-scale-in">
            <Award className="w-16 h-16 mx-auto mb-6 text-primary-500 dark:text-dark-primary" />
            <h2 className="text-3xl font-heading font-extrabold text-light-text-primary dark:text-dark-text-primary sm:text-4xl">
              Ready to transform your airline operations?
            </h2>
            <p className="mt-6 text-lg text-light-text-secondary dark:text-dark-text-secondary">
              Join thousands of airlines worldwide who trust AirlinePortal for their management needs.
              Start your free trial today and experience the difference.
            </p>
            <div className="mt-8 space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              {!isAuthenticated && (
                <>
                  <Link to="/register">
                    <Button size="lg" rightIcon={ArrowRight}>
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Plane className="w-8 h-8 text-primary-400" />
              <span className="text-2xl font-heading font-bold text-white">AirlinePortal</span>
            </div>
            <p className="text-gray-400 mb-8">
              Next-generation airline management platform
            </p>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500 text-sm">
                © 2024 AirlinePortal. All rights reserved. Built with ❤️ for the aviation industry.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;