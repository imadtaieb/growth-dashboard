/**
 * Visitor Tracking Library
 *
 * Handles automatic syncing of visitor data from PostHog
 */

import { getAllMetrics, updateMetric, getMetricById } from './storage';
import { getPostHogVisitors } from './integrations/posthog';
import { startOfWeek, endOfWeek, format } from 'date-fns';

interface SyncResult {
  updated: number;
  skipped: number;
  failed: number;
  total: number;
}

/**
 * Get the week range for a given date
 */
function getWeekRange(date: Date): { start: string; end: string } {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday

  return {
    start: format(weekStart, 'yyyy-MM-dd'),
    end: format(weekEnd, 'yyyy-MM-dd'),
  };
}

/**
 * Update visitor count for a metric based on a timestamp
 * Used by webhook endpoint for real-time updates
 */
export async function updateMetricVisitors(timestamp: Date): Promise<boolean> {
  try {
    const { start, end } = getWeekRange(timestamp);

    // Find the metric for this week
    const allMetrics = await getAllMetrics();
    const metric = allMetrics.find(
      m => m.weekStartDate === start && m.weekEndDate === end
    );

    if (!metric) {
      console.log(`No metric found for week ${start} to ${end}`);
      return false;
    }

    // Fetch latest visitor count from PostHog
    const visitors = await getPostHogVisitors(start, end);

    // Only update if the count has changed
    if (visitors === metric.websiteVisitors) {
      return true; // No update needed
    }

    // Calculate new conversion rate
    const conversionRate = visitors === 0 ? 0 : (metric.waitlistSignups / visitors) * 100;

    // Update the metric
    await updateMetric(metric.id, {
      websiteVisitors: visitors,
      conversionRate: Number(conversionRate.toFixed(2)),
    });

    console.log(`Updated ${metric.id}: ${metric.websiteVisitors} → ${visitors} visitors`);
    return true;

  } catch (error) {
    console.error('Error updating metric visitors:', error);
    return false;
  }
}

/**
 * Sync all metrics with PostHog data
 * Used by cron endpoint for scheduled syncing
 */
export async function syncAllMetricsWithPostHog(): Promise<SyncResult> {
  const result: SyncResult = {
    updated: 0,
    skipped: 0,
    failed: 0,
    total: 0,
  };

  try {
    // Get all metrics
    const metrics = await getAllMetrics();
    result.total = metrics.length;

    console.log(`[Sync] Processing ${metrics.length} metrics...`);

    // Process each metric
    for (const metric of metrics) {
      try {
        // Fetch latest visitor count from PostHog
        const visitors = await getPostHogVisitors(
          metric.weekStartDate,
          metric.weekEndDate
        );

        // Check if update is needed
        if (visitors === metric.websiteVisitors) {
          result.skipped++;
          continue;
        }

        // Calculate new conversion rate
        const conversionRate = visitors === 0 ? 0 : (metric.waitlistSignups / visitors) * 100;

        // Update the metric
        const updated = await updateMetric(metric.id, {
          websiteVisitors: visitors,
          conversionRate: Number(conversionRate.toFixed(2)),
        });

        if (updated) {
          console.log(`[Sync] Updated ${metric.weekStartDate}: ${metric.websiteVisitors} → ${visitors} visitors`);
          result.updated++;
        } else {
          result.failed++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`[Sync] Failed to update metric ${metric.id}:`, error);
        result.failed++;
      }
    }

    return result;

  } catch (error) {
    console.error('[Sync] Error in syncAllMetricsWithPostHog:', error);
    throw error;
  }
}

/**
 * Sync a specific metric by ID
 */
export async function syncMetricById(id: string): Promise<boolean> {
  try {
    const metric = await getMetricById(id);

    if (!metric) {
      console.error(`Metric ${id} not found`);
      return false;
    }

    // Fetch latest visitor count from PostHog
    const visitors = await getPostHogVisitors(
      metric.weekStartDate,
      metric.weekEndDate
    );

    // Check if update is needed
    if (visitors === metric.websiteVisitors) {
      console.log(`Metric ${id} already up to date`);
      return true;
    }

    // Calculate new conversion rate
    const conversionRate = visitors === 0 ? 0 : (metric.waitlistSignups / visitors) * 100;

    // Update the metric
    const updated = await updateMetric(metric.id, {
      websiteVisitors: visitors,
      conversionRate: Number(conversionRate.toFixed(2)),
    });

    if (updated) {
      console.log(`Updated metric ${id}: ${metric.websiteVisitors} → ${visitors} visitors`);
      return true;
    }

    return false;

  } catch (error) {
    console.error(`Error syncing metric ${id}:`, error);
    return false;
  }
}

/**
 * Get sync status and statistics
 */
export async function getSyncStatus() {
  try {
    const metrics = await getAllMetrics();

    const needsUpdate = metrics.filter(m => {
      // Consider metrics that haven't been updated in the last 24 hours
      const lastUpdate = new Date(m.updatedAt);
      const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
      return hoursSinceUpdate > 24;
    });

    return {
      totalMetrics: metrics.length,
      needsUpdate: needsUpdate.length,
      lastSync: metrics.length > 0 ? new Date(Math.max(...metrics.map(m => new Date(m.updatedAt).getTime()))) : null,
      configured: !!(process.env.POSTHOG_API_KEY && process.env.POSTHOG_PROJECT_ID),
    };

  } catch (error) {
    console.error('Error getting sync status:', error);
    throw error;
  }
}
