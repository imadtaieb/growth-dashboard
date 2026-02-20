/**
 * Slack Integration for Signup Tracking
 *
 * This file provides webhook functionality to track signups via Slack.
 *
 * Setup Option 1: Webhook Receiver (Recommended)
 * ------------------------------------------------
 * Set up a webhook in your dashboard that Tally/other services can call.
 * This increments a counter each time a signup occurs.
 *
 * Setup Option 2: Slack Message Parsing
 * --------------------------------------
 * 1. Create a Slack App at https://api.slack.com/apps
 * 2. Add "channels:history" scope
 * 3. Install to your workspace
 * 4. Get the Bot User OAuth Token
 * 5. Add to .env:
 *    SLACK_BOT_TOKEN=xoxb-your-token
 *    SLACK_CHANNEL_ID=your-channel-id
 */

interface SlackMessage {
  type: string;
  text: string;
  ts: string;
  user?: string;
}

interface SlackHistoryResponse {
  ok: boolean;
  messages: SlackMessage[];
  has_more: boolean;
}

/**
 * Count signup notifications in a Slack channel
 * Useful if Tally posts to a #waitlist-signups channel
 */
export async function countSlackSignups(
  startDate: string,
  endDate: string,
  searchPattern = 'new signup'
): Promise<number> {
  const botToken = process.env.SLACK_BOT_TOKEN;
  const channelId = process.env.SLACK_CHANNEL_ID;

  if (!botToken || !channelId) {
    console.warn('Slack credentials not configured');
    return 0;
  }

  try {
    const startTimestamp = new Date(startDate).getTime() / 1000;
    const endTimestamp = new Date(endDate).getTime() / 1000;

    const url = `https://slack.com/api/conversations.history?channel=${channelId}&oldest=${startTimestamp}&latest=${endTimestamp}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${botToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    const data: SlackHistoryResponse = await response.json();

    if (!data.ok) {
      throw new Error('Slack API returned error');
    }

    // Count messages matching the search pattern (case-insensitive)
    const signupCount = data.messages.filter(
      (msg) => msg.text.toLowerCase().includes(searchPattern.toLowerCase())
    ).length;

    return signupCount;
  } catch (error) {
    console.error('Error fetching Slack messages:', error);
    return 0;
  }
}

/**
 * Send a notification to Slack when metrics are updated
 */
export async function sendSlackNotification(message: string): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('Slack webhook URL not configured');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: message }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
}
