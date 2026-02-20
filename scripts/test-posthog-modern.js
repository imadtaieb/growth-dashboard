/**
 * Test PostHog with modern HogQL query API
 */

require('dotenv').config();

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

console.log('🔌 Testing PostHog with modern API...\n');

async function testHogQLQuery() {
  try {
    const startDate = '2025-12-15';
    const endDate = '2025-12-21';

    console.log(`📊 Querying pageviews from ${startDate} to ${endDate}...\n`);

    // Using HogQL query API
    const url = `https://app.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/query/`;

    const query = {
      kind: 'EventsQuery',
      select: ['*'],
      where: [`event = '$pageview'`, `timestamp >= '${startDate}'`, `timestamp < '${endDate}'`],
      limit: 1000,
    };

    console.log('Query:', JSON.stringify(query, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
      },
      body: JSON.stringify({ query }),
    });

    console.log('\nResponse status:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.text();
      console.log('Error:', error);
      return false;
    }

    const data = await response.json();
    console.log('\n✅ Success!');
    console.log('Results:', data.results?.length || 0, 'events');

    if (data.results && data.results.length > 0) {
      console.log('\nSample event:', JSON.stringify(data.results[0], null, 2));
    }

    return true;

  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testEventsAPI() {
  try {
    console.log('\n📊 Testing Events API...\n');

    const url = `https://app.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/events/`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
      },
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.text();
      console.log('Error:', error);
      return false;
    }

    const data = await response.json();
    console.log('\n✅ Success!');
    console.log('Events found:', data.results?.length || 0);

    if (data.results && data.results.length > 0) {
      // Count pageviews
      const pageviews = data.results.filter(e => e.event === '$pageview');
      console.log('Pageviews in recent data:', pageviews.length);
    }

    return true;

  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  let success = await testHogQLQuery();

  if (!success) {
    success = await testEventsAPI();
  }

  if (success) {
    console.log('\n🎉 PostHog connection working! Ready to fetch visitor data.');
  } else {
    console.log('\n⚠️  Could not connect to PostHog API.');
    console.log('This might be a free plan limitation.');
    console.log('\n💡 Alternative: Manually enter visitor numbers for weeks 33-42');
  }
}

main();
