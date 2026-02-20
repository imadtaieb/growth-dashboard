import { WeeklyMetrics, GrowthData, DashboardStats } from './types';

export function calculateGrowth(current: WeeklyMetrics, previous?: WeeklyMetrics): GrowthData['weekOverWeekGrowth'] {
  if (!previous) {
    return {
      signupsGrowth: 0,
      visitorsGrowth: 0,
      conversionRateChange: 0,
    };
  }

  const signupsGrowth = previous.waitlistSignups === 0
    ? 0
    : ((current.waitlistSignups - previous.waitlistSignups) / previous.waitlistSignups) * 100;

  const visitorsGrowth = previous.websiteVisitors === 0
    ? 0
    : ((current.websiteVisitors - previous.websiteVisitors) / previous.websiteVisitors) * 100;

  const conversionRateChange = current.conversionRate - previous.conversionRate;

  return {
    signupsGrowth: Number(signupsGrowth.toFixed(2)),
    visitorsGrowth: Number(visitorsGrowth.toFixed(2)),
    conversionRateChange: Number(conversionRateChange.toFixed(2)),
  };
}

export function calculateDashboardStats(metrics: WeeklyMetrics[]): DashboardStats {
  if (metrics.length === 0) {
    return {
      totalSignups: 0,
      currentConversionRate: 0,
      averageWeeklySignups: 0,
      totalWeeks: 0,
    };
  }

  // Now we're storing weekly NEW signups, so sum them all to get total
  const totalSignups = metrics.reduce((sum, m) => sum + m.waitlistSignups, 0);
  const latestMetric = metrics[metrics.length - 1];
  const currentConversionRate = latestMetric.conversionRate || 0;
  const averageWeeklySignups = totalSignups / metrics.length;

  return {
    totalSignups,
    currentConversionRate: Number(currentConversionRate.toFixed(2)),
    averageWeeklySignups: Number(averageWeeklySignups.toFixed(2)),
    totalWeeks: metrics.length,
  };
}

export function getWeekDateRange(date: Date): { start: string; end: string } {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay()); // Start on Sunday

  const end = new Date(start);
  end.setDate(start.getDate() + 6); // End on Saturday

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}
