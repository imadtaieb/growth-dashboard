/**
 * Check what date range has data in PostHog
 */

require('dotenv').config();

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

async function checkDateRange() {
  console.log('📅 Checking PostHog data availability...\n');

  // Try last 90 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 90);

  const url = `https://app.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/query/`;

  const query = {
    kind: 'EventsQuery',
    select: ['timestamp', 'event'],
    where: [
      `event = '$pageview'`,
      `timestamp >= '${startDate.toISOString().split('T')[0]}'`,
    ],
    orderBy: ['timestamp DESC'],
    limit: 100,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error('Failed:', response.statusText);
      return;
    }

    const data = await response.json();
    const events = data.results || [];

    if (events.length === 0) {
      console.log('❌ No pageview events found in the last 90 days');
      console.log('\n💡 This means PostHog is not tracking data or hasn\'t been set up yet.');
      return;
    }

    console.log(`✅ Found ${events.length} recent pageview events\n`);

    // Get date range
    const timestamps = events.map(e => new Date(e[0]));
    const latest = new Date(Math.max(...timestamps));
    const earliest = new Date(Math.min(...timestamps));

    console.log('Latest pageview:', latest.toISOString().split('T')[0]);
    console.log('Earliest pageview:', earliest.toISOString().split('T')[0]);

    console.log('\n📊 Sample events:');
    events.slice(0, 5).forEach((e, i) => {
      console.log(`  ${i + 1}. ${e[0]} - ${e[1]}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDateRange();
