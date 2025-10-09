import React from 'react';

// Base skeleton component
export const Skeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '', 
  rounded = 'rounded',
  animate = true 
}) => {
  return (
    <div 
      className={`
        ${width} ${height} ${rounded} 
        bg-gray-200 dark:bg-gray-700 
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
    />
  );
};

// Card skeleton
export const CardSkeleton = ({ showIcon = true, lines = 3 }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="animate-pulse">
        <div className="flex items-center space-x-3 mb-4">
          {showIcon && (
            <Skeleton width="w-8" height="h-8" rounded="rounded-lg" />
          )}
          <Skeleton width="w-32" height="h-5" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton 
              key={index}
              width={index === lines - 1 ? 'w-3/4' : 'w-full'} 
              height="h-4" 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Stats card skeleton
export const StatsCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <Skeleton width="w-24" height="h-4" />
          <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton width="w-20" height="h-8" />
          <div className="flex items-center space-x-2">
            <Skeleton width="w-12" height="h-4" />
            <Skeleton width="w-16" height="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="animate-pulse">
        {/* Table header */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} width="w-24" height="h-4" />
            ))}
          </div>
        </div>
        
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  width={colIndex === 0 ? 'w-32' : colIndex === columns - 1 ? 'w-20' : 'w-24'} 
                  height="h-4" 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Chart skeleton
export const ChartSkeleton = ({ height = 'h-64' }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="animate-pulse">
        <Skeleton width="w-32" height="h-5" className="mb-4" />
        <div className={`${height} bg-gray-200 dark:bg-gray-700 rounded flex items-end justify-center space-x-2 p-4`}>
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-300 dark:bg-gray-600 rounded-t"
              style={{ 
                width: '20px',
                height: `${Math.random() * 80 + 20}%`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// List skeleton
export const ListSkeleton = ({ items = 5, showAvatar = false }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 animate-pulse">
          {showAvatar && (
            <Skeleton width="w-10" height="h-10" rounded="rounded-full" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton width="w-3/4" height="h-4" />
            <Skeleton width="w-1/2" height="h-3" />
          </div>
          <Skeleton width="w-16" height="h-3" />
        </div>
      ))}
    </div>
  );
};

// Navigation skeleton
export const NavigationSkeleton = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 px-3 py-2 animate-pulse">
          <Skeleton width="w-5" height="h-5" rounded="rounded" />
          <Skeleton width="w-24" height="h-4" />
        </div>
      ))}
    </div>
  );
};

// Dashboard skeleton
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="animate-pulse">
        <Skeleton width="w-64" height="h-8" className="mb-2" />
        <Skeleton width="w-48" height="h-5" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse">
            <Skeleton width="w-32" height="h-5" className="mb-4" />
            <ListSkeleton items={5} showAvatar={true} />
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <TableSkeleton rows={8} columns={6} />
    </div>
  );
};

// Loading overlay
export const LoadingOverlay = ({ 
  show, 
  children, 
  message = 'Loading...', 
  className = '' 
}) => {
  if (!show) return children;

  return (
    <div className={`relative ${className}`}>
      {children && (
        <div className="filter blur-sm pointer-events-none">
          {children}
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

// Skeleton wrapper for conditional loading
export const SkeletonWrapper = ({ 
  loading, 
  skeleton, 
  children,
  fallback = null 
}) => {
  if (loading) {
    return skeleton || fallback || <CardSkeleton />;
  }
  
  return children;
};

// Animated loading dots
export const LoadingDots = ({ size = 'md', color = 'blue' }) => {
  const sizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const colors = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600'
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className={`
            ${sizes[size]} ${colors[color]} rounded-full animate-pulse
          `}
          style={{
            animationDelay: `${index * 0.15}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

// Pulse animation component
export const PulseLoader = ({ 
  width = 'w-16', 
  height = 'h-16', 
  color = 'bg-blue-600' 
}) => {
  return (
    <div className="flex items-center justify-center">
      <div className={`
        ${width} ${height} ${color} rounded-full animate-pulse
      `}></div>
    </div>
  );
};

// Spinning loader
export const SpinLoader = ({ 
  size = 'w-8 h-8', 
  color = 'border-blue-600',
  className = '' 
}) => {
  return (
    <div className={`
      animate-spin rounded-full ${size} border-2 border-gray-200 dark:border-gray-700 ${color}
      ${className}
    `}></div>
  );
};

// Page loading component
export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
      <div className="text-center">
        <SpinLoader size="w-12 h-12" className="mx-auto mb-4" />
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Skeleton;