import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { ChartSkeleton } from './Skeleton';

const Chart = ({
  type = 'line',
  data = [],
  width = '100%',
  height = 300,
  className = '',
  title,
  colors = ['#4F46E5', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'],
  loading = false,
  ...props
}) => {
  const { isDark } = useTheme();

  // Theme-aware colors
  const themeColors = {
    text: isDark ? '#F3F4F6' : '#374151',
    grid: isDark ? '#374151' : '#E5E7EB',
    background: isDark ? '#111827' : '#FFFFFF',
    tooltipBg: isDark ? '#1F2937' : '#FFFFFF',
    tooltipBorder: isDark ? '#374151' : '#E5E7EB'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <ChartSkeleton height={`h-[${height}px]`} />;
  }

  const chartProps = {
    width: '100%',
    height,
    data,
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
    ...props
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <RechartsLineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
            <XAxis 
              dataKey="name" 
              stroke={themeColors.text}
              fontSize={12}
            />
            <YAxis 
              stroke={themeColors.text}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Object.keys(data[0] || {}).filter(key => key !== 'name').map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </RechartsLineChart>
        );

      case 'area':
        return (
          <RechartsAreaChart {...chartProps}>
            <defs>
              {Object.keys(data[0] || {}).filter(key => key !== 'name').map((key, index) => (
                <linearGradient key={key} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <XAxis 
              dataKey="name" 
              stroke={themeColors.text}
              fontSize={12}
            />
            <YAxis 
              stroke={themeColors.text}
              fontSize={12}
            />
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Object.keys(data[0] || {}).filter(key => key !== 'name').map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fillOpacity={1}
                fill={`url(#colorGradient${index})`}
              />
            ))}
          </RechartsAreaChart>
        );

      case 'bar':
        return (
          <RechartsBarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
            <XAxis 
              dataKey="name" 
              stroke={themeColors.text}
              fontSize={12}
            />
            <YAxis 
              stroke={themeColors.text}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Object.keys(data[0] || {}).filter(key => key !== 'name').map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        );

      case 'pie':
        const pieData = data.map((item, index) => ({
          ...item,
          fill: colors[index % colors.length]
        }));
        
        return (
          <RechartsPieChart {...chartProps}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </RechartsPieChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width={width} height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

// Predefined chart components for common use cases
export const CustomLineChart = (props) => <Chart {...props} type="line" />;
export const CustomAreaChart = (props) => <Chart {...props} type="area" />;
export const CustomBarChart = (props) => <Chart {...props} type="bar" />;
export const CustomPieChart = (props) => <Chart {...props} type="pie" />;

export default Chart;