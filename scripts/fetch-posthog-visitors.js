/**
 * Fetch visitor data from PostHog for weeks 33-42
 */

require('dotenv').config();
const http = require('http');

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

async function getPostHogVisitors(startDate, endDate) {
  const url = `https://app.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/query/`;

  const query = {
    kind: 'EventsQuery',
    select: ['distinct_id', 'timestamp'],
    where: [
      `event = '$pageview'`,
      `timestamp >= '${startDate}'`,
      `timestamp <= '${endDate}'`,
    ],
    limit: 100000, // High limit to get all pageviews
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
      console.error(`Failed to fetch ${startDate} to ${endDate}:`, response.statusText);
      return 0;
    }

    const data = await response.json();
    const events = data.results || [];

    // Count unique visitors
    const uniqueVisitors = new Set(events.map(e => e[0])).size; // distinct_id is first column

    return uniqueVisitors;

  } catch (error) {
    console.error(`Error fetching ${startDate}:`, error.message);
    return 0;
  }
}

async function getCurrentDashboardData() {
  return new Promise((resolve) => {
    http.get('http://localhost:3000/api/metrics', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const parsed = JSON.parse(data);
        resolve(parsed.metrics || []);
      });
    }).on('error', () => resolve([]));
  });
}

async function updateMetric(id, weekStartDate, weekEndDate, visitors, signups) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      weekStartDate,
      weekEndDate,
      websiteVisitors: visitors,
      waitlistSignups: signups,
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/metrics/${id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(responseData));
        } else {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('📊 Fetching visitor data from PostHog...\n');

  // Get current dashboard data
  const metrics = await getCurrentDashboardData();

  if (metrics.length === 0) {
    console.error('❌ Could not fetch dashboard data');
    return;
  }

  console.log(`Found ${metrics.length} weeks in dashboard\n`);

  // Find weeks 33-42 (the ones with 0 visitors)
  const weeksToUpdate = metrics.filter(m => m.websiteVisitors === 0 && m.waitlistSignups > 0);

  console.log(`Found ${weeksToUpdate.length} weeks with missing visitor data\n`);

  let updated = 0;
  let failed = 0;

  for (const week of weeksToUpdate) {
    console.log(`Fetching ${week.weekStartDate} to ${week.weekEndDate}...`);

    const visitors = await getPostHogVisitors(week.weekStartDate, week.weekEndDate);

    if (visitors > 0) {
      const result = await updateMetric(
        week.id,
        week.weekStartDate,
        week.weekEndDate,
        visitors,
        week.waitlistSignups
      );

      if (result) {
        console.log(`✓ Updated: ${visitors} visitors, ${week.waitlistSignups} signups (${result.conversionRate}% CR)`);
        updated++;
      } else {
        console.log(`✗ Failed to update`);
        failed++;
      }
    } else {
      console.log(`⚠️  No visitor data found for this week`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✨ Complete!`);
  console.log(`   Updated: ${updated} weeks`);
  console.log(`   Failed/No data: ${failed} weeks`);
  console.log(`\n🔄 Refresh your dashboard to see updated conversion rates!`);
}

main();
