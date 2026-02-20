'use client';

import { useEffect, useState } from 'react';
import { WeeklyMetrics, DashboardStats } from '@/lib/types';
import { calculateGrowth } from '@/lib/calculations';
import MetricCard from './components/MetricCard';
import GrowthChart from './components/GrowthChart';
import MetricsTable from './components/MetricsTable';
import AddMetricForm from './components/AddMetricForm';
import SyncFromSheetsModal from './components/SyncFromSheetsModal';
import SyncPostHogButton from './components/SyncPostHogButton';

export default function Home() {
  const [metrics, setMetrics] = useState<WeeklyMetrics[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      const data = await response.json();
      setMetrics(data.metrics || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this week\'s data?')) {
      return;
    }

    try {
      const response = await fetch(`/api/metrics/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMetrics();
      }
    } catch (error) {
      console.error('Error deleting metric:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Calculate WoW growth
  const currentWeek = metrics[metrics.length - 1];
  const previousWeek = metrics[metrics.length - 2];
  const growth = currentWeek ? calculateGrowth(currentWeek, previousWeek) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">Growth Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track your startup's weekly metrics and growth
            </p>
          </div>
          <div className="flex gap-3">
            <SyncPostHogButton onSuccess={fetchMetrics} />
            <SyncFromSheetsModal onSuccess={fetchMetrics} />
            <AddMetricForm onSuccess={fetchMetrics} />
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Signups"
            value={stats?.totalSignups || 0}
            icon="👥"
            change={growth?.signupsGrowth}
          />
          <MetricCard
            title="Current Conversion Rate"
            value={stats?.currentConversionRate || 0}
            suffix="%"
            icon="📈"
            change={growth?.conversionRateChange}
          />
          <MetricCard
            title="Avg Weekly Signups"
            value={stats?.averageWeeklySignups.toFixed(1) || 0}
            icon="📊"
          />
          <MetricCard
            title="Weeks Tracked"
            value={stats?.totalWeeks || 0}
            icon="📅"
          />
        </div>

        {/* Growth Chart */}
        {metrics.length > 0 ? (
          <GrowthChart data={metrics} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No data yet. Add your first week of metrics to see the growth chart!
            </p>
          </div>
        )}

        {/* Data Table */}
        <MetricsTable data={metrics} onDelete={handleDelete} onUpdate={fetchMetrics} />

        {/* Integration Status */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
            🔌 API Integrations (Coming Soon)
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
            Automate your data collection by connecting to your tools:
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">📊</span>
              <div>
                <strong className="text-blue-900 dark:text-blue-100">PostHog</strong>
                <p className="text-blue-700 dark:text-blue-300">Auto-fetch website visitor data</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">📝</span>
              <div>
                <strong className="text-blue-900 dark:text-blue-100">Tally / Slack</strong>
                <p className="text-blue-700 dark:text-blue-300">Track waitlist signups automatically</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
