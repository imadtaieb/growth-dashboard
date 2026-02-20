import { NextRequest, NextResponse } from 'next/server';
import { getPostHogVisitors } from '@/lib/integrations/posthog';
import { getTallySubmissions } from '@/lib/integrations/tally';
import { countSlackSignups } from '@/lib/integrations/slack';
import { createMetric } from '@/lib/storage';

/**
 * API endpoint to sync data from external sources
 *
 * Usage:
 * POST /api/sync
 * Body: {
 *   weekStartDate: "2024-01-01",
 *   weekEndDate: "2024-01-07",
 *   source: "posthog" | "tally" | "slack" | "auto",
 *   tallyFormId?: "your-form-id" (required if source is tally)
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weekStartDate, weekEndDate, source = 'auto', tallyFormId } = body;

    if (!weekStartDate || !weekEndDate) {
      return NextResponse.json(
        { error: 'Week start and end dates are required' },
        { status: 400 }
      );
    }

    let websiteVisitors = 0;
    let waitlistSignups = 0;

    // Fetch website visitors from PostHog
    if (source === 'posthog' || source === 'auto') {
      try {
        websiteVisitors = await getPostHogVisitors(weekStartDate, weekEndDate);
      } catch (error) {
        console.error('Failed to fetch PostHog data:', error);
      }
    }

    // Fetch waitlist signups from Tally or Slack
    if (source === 'tally' && tallyFormId) {
      try {
        waitlistSignups = await getTallySubmissions(tallyFormId, weekStartDate, weekEndDate);
      } catch (error) {
        console.error('Failed to fetch Tally data:', error);
      }
    } else if (source === 'slack' || source === 'auto') {
      try {
        waitlistSignups = await countSlackSignups(weekStartDate, weekEndDate);
      } catch (error) {
        console.error('Failed to fetch Slack data:', error);
      }
    }

    // If no data was fetched from integrations, return error
    if (websiteVisitors === 0 && waitlistSignups === 0) {
      return NextResponse.json(
        {
          error: 'No data could be fetched from integrations. Please check your API credentials in .env file.',
          websiteVisitors,
          waitlistSignups,
        },
        { status: 400 }
      );
    }

    // Calculate conversion rate
    const conversionRate = websiteVisitors === 0 ? 0 : (waitlistSignups / websiteVisitors) * 100;

    // Save to database
    const newMetric = await createMetric({
      weekStartDate,
      weekEndDate,
      websiteVisitors,
      waitlistSignups,
      conversionRate: Number(conversionRate.toFixed(2)),
    });

    return NextResponse.json({
      success: true,
      metric: newMetric,
      source: {
        visitors: source === 'posthog' || source === 'auto' ? 'posthog' : 'manual',
        signups: source === 'tally' ? 'tally' : source === 'slack' || source === 'auto' ? 'slack' : 'manual',
      },
    });
  } catch (error) {
    console.error('Error syncing data:', error);
    return NextResponse.json(
      { error: 'Failed to sync data from integrations' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to test integration status
 */
export async function GET() {
  const status = {
    posthog: !!(process.env.POSTHOG_API_KEY && process.env.POSTHOG_PROJECT_ID),
    tally: !!process.env.TALLY_API_KEY,
    slack: !!(process.env.SLACK_BOT_TOKEN && process.env.SLACK_CHANNEL_ID) || !!process.env.SLACK_WEBHOOK_URL,
  };

  return NextResponse.json({
    integrations: status,
    message: 'Integration status check',
  });
}
