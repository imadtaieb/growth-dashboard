require('dotenv').config();

const apiKey = process.env.POSTHOG_API_KEY;
const projectId = process.env.POSTHOG_PROJECT_ID;

if (!apiKey || !projectId) {
  console.error('❌ PostHog credentials not found in .env');
  process.exit(1);
}

// Test with a specific week
const startDate = '2026-02-17'; // Monday
const endDate = '2026-02-23';   // Sunday

console.log('🔍 Testing PostHog visitor count...');
console.log(`Date range: ${startDate} to ${endDate}\n`);

async function testVisitorCount() {
  try {
    // Method 1: Query API (HogQL) - what we're using now
    console.log('1️⃣ Using Query API (HogQL)...');
    const queryUrl = `https://app.posthog.com/api/projects/${projectId}/query/`;
    
    const query = {
      kind: 'EventsQuery',
      select: ['distinct_id', 'timestamp'],
      where: [
        `event = '$pageview'`,
        `timestamp >= '${startDate}'`,
        `timestamp <= '${endDate} 23:59:59'`,
      ],
      limit: 100000,
    };

    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!queryResponse.ok) {
      const errorText = await queryResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
    } else {
      const queryData = await queryResponse.json();
      const events = queryData.results || [];
      const uniqueVisitors = new Set(events.map(e => e[0])).size;
      console.log(`   ✅ Total events: ${events.length}`);
      console.log(`   ✅ Unique visitors: ${uniqueVisitors}`);
      
      // Show sample events
      if (events.length > 0) {
        console.log(`   Sample event:`, events[0]);
      }
    }

    console.log('\n');

    // Method 2: Events API - what we were using before
    console.log('2️⃣ Using Events API (for comparison)...');
    const eventsUrl = `https://app.posthog.com/api/projects/${projectId}/events/?event=$pageview&after=${startDate}&before=${endDate}`;
    
    const eventsResponse = await fetch(eventsUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!eventsResponse.ok) {
      const errorText = await eventsResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
    } else {
      const eventsData = await eventsResponse.json();
      const allEvents = eventsData.results || [];
      const uniqueVisitorsEvents = new Set(allEvents.map(e => e.distinct_id)).size;
      console.log(`   ✅ Total events: ${allEvents.length}`);
      console.log(`   ✅ Unique visitors: ${uniqueVisitorsEvents}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testVisitorCount();
