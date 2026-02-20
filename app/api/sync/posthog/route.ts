import { NextRequest, NextResponse } from 'next/server';
import { syncAllMetricsWithPostHog } from '@/lib/visitor-tracker';

/**
 * Manual Sync Endpoint for PostHog Data
 * 
 * This endpoint allows manual syncing of all metrics with PostHog data.
 * Unlike the cron endpoint, this doesn't require authentication.
 */

export async function POST() {
  try {
    // Check if PostHog is configured
    if (!process.env.POSTHOG_API_KEY || !process.env.POSTHOG_PROJECT_ID) {
      return NextResponse.json(
        { error: 'PostHog not configured', configured: false },
        { status: 400 }
      );
    }

    console.log('[Manual Sync] Starting visitor sync...');
    const startTime = Date.now();

    // Sync all metrics with PostHog
    const result = await syncAllMetricsWithPostHog();

    const duration = Date.now() - startTime;

    console.log(`[Manual Sync] Sync completed in ${duration}ms`);
    console.log(`[Manual Sync] Updated: ${result.updated}, Skipped: ${result.skipped}, Failed: ${result.failed}`);

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
    console.error('[Manual Sync] Error syncing visitors:', error);
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
 * Also support GET for convenience
 */
export async function GET() {
  return POST();
}
