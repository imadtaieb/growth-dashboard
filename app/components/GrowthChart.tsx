'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WeeklyMetrics } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface GrowthChartProps {
  data: WeeklyMetrics[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
  const chartData = data.map((metric) => ({
    week: format(parseISO(metric.weekStartDate), 'MMM d'),
    signups: metric.waitlistSignups,
    visitors: metric.websiteVisitors,
    conversionRate: metric.conversionRate,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Weekly Growth Trends</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="week"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            yAxisId="left"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#F9FAFB'
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="signups"
            stroke="#10B981"
            strokeWidth={2}
            name="Waitlist Signups"
            dot={{ fill: '#10B981', r: 4 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="visitors"
            stroke="#3B82F6"
            strokeWidth={2}
            name="Website Visitors"
            dot={{ fill: '#3B82F6', r: 4 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="conversionRate"
            stroke="#F59E0B"
            strokeWidth={2}
            name="Conversion Rate (%)"
            dot={{ fill: '#F59E0B', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
