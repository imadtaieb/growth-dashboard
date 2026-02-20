/**
 * Tally Forms API Integration
 *
 * This file contains functions to fetch form submission data from Tally.
 *
 * Setup:
 * 1. Go to your Tally form settings
 * 2. Navigate to Integrations > API
 * 3. Generate an API key
 * 4. Add to your .env file:
 *    TALLY_API_KEY=your_api_key
 *
 * Note: Tally's API might be limited on free plans.
 * Check https://tally.so/help/api for details.
 */

interface TallySubmission {
  submissionId: string;
  createdAt: string;
  fields: Record<string, unknown>;
}

interface TallyResponse {
  data: TallySubmission[];
}

export async function getTallySubmissions(
  formId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const apiKey = process.env.TALLY_API_KEY;

  if (!apiKey) {
    console.warn('Tally API key not configured');
    return 0;
  }

  try {
    // Tally API endpoint (hypothetical - check actual Tally API docs)
    const url = `https://api.tally.so/forms/${formId}/responses`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Tally API error: ${response.statusText}`);
    }

    const data: TallyResponse = await response.json();

    // Filter submissions by date range
    const filteredSubmissions = data.data.filter((submission) => {
      const submissionDate = new Date(submission.createdAt);
      return submissionDate >= new Date(startDate) && submissionDate <= new Date(endDate);
    });

    return filteredSubmissions.length;
  } catch (error) {
    console.error('Error fetching Tally submissions:', error);
    return 0;
  }
}

/**
 * Note: Tally's free plan might not have API access.
 * Alternative: Use webhooks to track signups in real-time
 * See lib/integrations/slack.ts for webhook-based tracking
 */
