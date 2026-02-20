import { NextRequest, NextResponse } from 'next/server';
import { updateMetricVisitors } from '@/lib/visitor-tracker';

/**
 * PostHog Webhook Endpoint
 *
 * This endpoint receives events from PostHog webhooks to update visitor counts in real-time.
 *
 * Setup in PostHog:
 * 1. Go to PostHog → Project Settings → Webhooks
 * 2. Create new webhook with URL: https://your-domain.com/api/webhooks/posthog
 * 3. Select events to track (usually $pageview)
 * 4. (Optional) Set a secret token for security
 *
 * Environment variables:
 * POSTHOG_WEBHOOK_SECRET=your_secret_token (optional but recommended)
 */

interface PostHogWebhookEvent {
  event: string;
  distinct_id: string;
  timestamp: string;
  properties?: {
    $current_url?: string;
    $pathname?: string;
    [key: string]: unknown;
  };
}

interface PostHogWebhookPayload {
  event: string;
  data: PostHogWebhookEvent;
  hook: {
    id: string;
    created: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if configured
    const secret = process.env.POSTHOG_WEBHOOK_SECRET;
    if (secret) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || authHeader !== `Bearer ${secret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const payload: PostHogWebhookPayload = await request.json();

    // Only process pageview events
    if (payload.data.event === '$pageview') {
      const timestamp = new Date(payload.data.timestamp);

      // Update the visitor count for the week containing this timestamp
      await updateMetricVisitors(timestamp);
    }

    return NextResponse.json({
      success: true,
      received: true,
      event: payload.data.event
    });
  } catch (error) {
    console.error('Error processing PostHog webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: 'PostHog Webhook',
    configured: !!process.env.POSTHOG_API_KEY && !!process.env.POSTHOG_PROJECT_ID,
    secured: !!process.env.POSTHOG_WEBHOOK_SECRET,
  });
}
