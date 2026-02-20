/**
 * PostHog API Integration
 *
 * This file contains functions to fetch website visitor data from PostHog.
 *
 * Setup:
 * 1. Create a PostHog account at https://posthog.com
 * 2. Get your API key from Settings > Project API Key
 * 3. Get your project ID from the URL (e.g., posthog.com/project/{PROJECT_ID})
 * 4. Add these to your .env file:
 *    POSTHOG_API_KEY=your_api_key
 *    POSTHOG_PROJECT_ID=your_project_id
 */

interface PostHogEvent {
  timestamp: string;
  event: string;
  distinct_id: string;
  properties?: Record<string, unknown>;
}

interface PostHogResponse {
  results: PostHogEvent[];
  next?: string;
}

export async function getPostHogVisitors(
  startDate: string,
  endDate: string
): Promise<number> {
  const apiKey = process.env.POSTHOG_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;

  if (!apiKey || !projectId) {
    console.warn('PostHog API credentials not configured');
    return 0;
  }

  try {
    // PostHog Insights API endpoint for unique pageviews
    const url = `https://app.posthog.com/api/projects/${projectId}/insights/trend/`;

    const body = {
      events: [
        {
          id: '$pageview',
          type: 'events',
          order: 0,
        },
      ],
      date_from: startDate,
      date_to: endDate,
      display: 'ActionsLineGraph',
      insight: 'TRENDS',
      interval: 'day',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`PostHog API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract unique visitors count
    // This is a simplified version - you may need to adjust based on your PostHog setup
    const uniqueVisitors = data.result?.[0]?.aggregated_value || 0;

    return uniqueVisitors;
  } catch (error) {
    console.error('Error fetching PostHog data:', error);
    return 0;
  }
}

/**
 * Alternative: Fetch using the Events API
 * Use this if you need more granular control over the data
 */
export async function getPostHogEvents(
  startDate: string,
  endDate: string,
  eventName = '$pageview'
): Promise<PostHogEvent[]> {
  const apiKey = process.env.POSTHOG_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;

  if (!apiKey || !projectId) {
    console.warn('PostHog API credentials not configured');
    return [];
  }

  try {
    const url = `https://app.posthog.com/api/projects/${projectId}/events/?event=${eventName}&after=${startDate}&before=${endDate}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`PostHog API error: ${response.statusText}`);
    }

    const data: PostHogResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching PostHog events:', error);
    return [];
  }
}
