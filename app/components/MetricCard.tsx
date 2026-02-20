'use client';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  suffix?: string;
  icon?: string;
}

export default function MetricCard({ title, value, change, suffix = '', icon }: MetricCardProps) {
  const changeColor = change && change > 0 ? 'text-green-600' : change && change < 0 ? 'text-red-600' : 'text-gray-600';
  const changeSymbol = change && change > 0 ? '↑' : change && change < 0 ? '↓' : '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className="mt-2">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}{suffix}
        </p>
        {change !== undefined && (
          <p className={`text-sm mt-1 font-medium ${changeColor}`}>
            {changeSymbol} {Math.abs(change)}% from last week
          </p>
        )}
      </div>
    </div>
  );
}
