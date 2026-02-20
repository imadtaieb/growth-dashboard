import { NextRequest, NextResponse } from 'next/server';
import { syncAllMetricsWithPostHog } from '@/lib/visitor-tracker';

/**
 * Cron Job Endpoint for Syncing Visitor Data
 *
 * This endpoint syncs all weekly metrics with PostHog data.
 * It's designed to be called by a cron service.
 *
 * Deployment options:
 *
 * 1. Vercel Cron (Recommended for Vercel deployments):
 *    Add to vercel.json:
 *    {
 *      "crons": [{
 *        "path": "/api/cron/sync-visitors",
 *        "schedule": "0 0 * * *"  // Daily at midnight
 *      }]
 *    }
 *
 * 2. External Cron Service:
 *    - cron-job.org
 *    - EasyCron
 *    - GitHub Actions
 *    Set up to call: https://your-domain.com/api/cron/sync-visitors
 *
 * 3. Vercel Deploy Hooks:
 *    Use with GitHub Actions scheduled workflow
 *
 * Security:
 * Set CRON_SECRET in your environment variables and include it in the request
 */

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Check authorization if secret is configured
    if (cronSecret) {
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid or missing authorization token' },
          { status: 401 }
        );
      }
    }

    // Check if PostHog is configured
    if (!process.env.POSTHOG_API_KEY || !process.env.POSTHOG_PROJECT_ID) {
      return NextResponse.json(
        { error: 'PostHog not configured', configured: false },
        { status: 400 }
      );
    }

    console.log('[Cron] Starting visitor sync job...');
    const startTime = Date.now();

    // Sync all metrics with PostHog
    const result = await syncAllMetricsWithPostHog();

    const duration = Date.now() - startTime;

    console.log(`[Cron] Sync completed in ${duration}ms`);
    console.log(`[Cron] Updated: ${result.updated}, Skipped: ${result.skipped}, Failed: ${result.failed}`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results: {
        updated: result.updated,
        skipped: result.skipped,
        failed: result.failed,
        total: result.total
      },
      message: `Successfully synced ${result.updated} metrics`
    });

  } catch (error) {
    console.error('[Cron] Error syncing visitors:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync visitors',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Also support POST for flexibility with different cron services
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
