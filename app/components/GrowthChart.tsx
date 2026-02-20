'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WeeklyMetrics } from '@/lib/types';

interface GrowthChartProps {
  data: WeeklyMetrics[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
  // Calculate cumulative total signups for each week
  let cumulativeTotal = 0;
  const chartData = data.map((metric, index) => {
    cumulativeTotal += metric.waitlistSignups;
    return {
      week: `Week ${index + 1}`,
      weekNumber: index + 1,
      totalSignups: cumulativeTotal,
    };
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Total Signups Growth</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="week"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            label={{ value: 'Total Signups', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#F9FAFB'
            }}
            formatter={(value: number) => [value.toLocaleString(), 'Total Signups']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalSignups"
            stroke="#10B981"
            strokeWidth={3}
            name="Total Signups"
            dot={{ fill: '#10B981', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
