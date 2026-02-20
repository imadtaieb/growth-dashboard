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
    // Use Query API (HogQL) to get unique visitors
    // IMPORTANT: Use person_id, not distinct_id, for accurate unique visitor counts
    // Multiple distinct_ids can map to the same person_id when users are identified
    const url = `https://app.posthog.com/api/projects/${projectId}/query/`;

    // Ensure endDate includes the full day (23:59:59)
    const endDateWithTime = endDate.includes(' ') ? endDate : `${endDate} 23:59:59`;

    // Use HogQL query with count(DISTINCT person_id) for accurate unique visitor count
    const query = {
      kind: 'HogQLQuery',
      query: `SELECT count(DISTINCT person_id) FROM events WHERE event = '$pageview' AND timestamp >= '${startDate}' AND timestamp <= '${endDateWithTime}'`,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PostHog API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const results = data.results || [];

    // Results format: [[count]]
    if (results.length > 0 && Array.isArray(results[0]) && results[0].length > 0) {
      return results[0][0] as number;
    }

    return 0;
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
