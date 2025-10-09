import React from 'react';
import { MoreVertical, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { StatsCardSkeleton, CardSkeleton } from './Skeleton';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'increase', 
  icon: Icon, 
  className = '',
  onClick,
  loading = false 
}) => {
  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4" />;
      case 'neutral':
        return <Minus className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600 dark:text-green-400';
      case 'decrease':
        return 'text-red-600 dark:text-red-400';
      case 'neutral':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-green-600 dark:text-green-400';
    }
  };

  if (loading) {
    return <StatsCardSkeleton />;
  }

  return (
    <div 
      className={`
        bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6
        transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-600
        ${onClick ? 'cursor-pointer' : ''} ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg transition-colors duration-200">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors duration-200">
          <MoreVertical className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
        </button>
      </div>
      
      <div>
        <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
          {value}
        </p>
        {change && (
          <div className={`flex items-center space-x-1 text-sm ${getChangeColor()}`}>
            {getChangeIcon()}
            <span>{change}</span>
            <span className="text-light-text-secondary dark:text-dark-text-secondary">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoCard = ({ 
  title, 
  children, 
  action, 
  className = '',
  headerClassName = '',
  bodyClassName = '' 
}) => {
  return (
    <div className={`card ${className}`}>
      <div className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${headerClassName}`}>
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
          {title}
        </h3>
        {action && (
          <div className="flex items-center space-x-2">
            {action}
          </div>
        )}
      </div>
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

const ActionCard = ({ 
  title, 
  description, 
  action, 
  icon: Icon, 
  className = '',
  onClick 
}) => {
  return (
    <div 
      className={`card p-6 hover-scale ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-primary-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
          <Icon className="w-6 h-6 text-primary-600 dark:text-dark-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">
            {title}
          </h3>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
            {description}
          </p>
          {action && (
            <div className="flex justify-end">
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ 
  label, 
  value, 
  sublabel, 
  color = 'blue', 
  className = '' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4 text-center ${className}`}>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium mb-1">{label}</div>
      {sublabel && (
        <div className="text-xs opacity-75">{sublabel}</div>
      )}
    </div>
  );
};

export { StatsCard, InfoCard, ActionCard, MetricCard };