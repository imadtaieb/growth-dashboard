export interface WeeklyMetrics {
  id: string;
  weekStartDate: string; // ISO format YYYY-MM-DD
  weekEndDate: string;
  websiteVisitors: number;
  waitlistSignups: number;
  conversionRate: number; // calculated: (signups / visitors) * 100
  createdAt: string;
  updatedAt: string;
}

export interface GrowthData {
  currentWeek: WeeklyMetrics;
  previousWeek?: WeeklyMetrics;
  weekOverWeekGrowth: {
    signupsGrowth: number; // percentage
    visitorsGrowth: number; // percentage
    conversionRateChange: number; // percentage points
  };
}

export interface DashboardStats {
  totalSignups: number;
  currentConversionRate: number;
  averageWeeklySignups: number;
  totalWeeks: number;
}
