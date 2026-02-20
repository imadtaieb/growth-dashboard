import { WeeklyMetrics, GrowthData, DashboardStats } from './types';
import { startOfWeek, endOfWeek, format } from 'date-fns';

/**
 * Calculate conversion rate from visitors and signups
 * @param visitors Number of website visitors
 * @param signups Number of waitlist signups
 * @returns Conversion rate as a percentage (0-100)
 */
export function calculateConversionRate(visitors: number, signups: number): number {
  if (visitors === 0) return 0;
  return Number(((signups / visitors) * 100).toFixed(2));
}

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

/**
 * Get the week range for a given date (Monday to Sunday)
 * Consistent with visitor-tracker.ts implementation
 * @param date Any date within the week
 * @returns Object with start and end dates in YYYY-MM-DD format
 */
export function getWeekDateRange(date: Date): { start: string; end: string } {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday

  return {
    start: format(weekStart, 'yyyy-MM-dd'),
    end: format(weekEnd, 'yyyy-MM-dd'),
  };
}
