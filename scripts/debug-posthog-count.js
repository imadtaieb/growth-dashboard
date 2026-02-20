require('dotenv').config();

const apiKey = process.env.POSTHOG_API_KEY;
const projectId = process.env.POSTHOG_PROJECT_ID;

if (!apiKey || !projectId) {
  console.error('❌ PostHog credentials not found');
  process.exit(1);
}

// Test with a specific week
const startDate = '2026-02-17';
const endDate = '2026-02-23';

console.log('🔍 Debugging PostHog visitor count...');
console.log(`Date range: ${startDate} to ${endDate}\n`);

async function debugCounts() {
  try {
    // Method 1: Query API with uniq(distinct_id) aggregation
    console.log('1️⃣ Query API with uniq() aggregation...');
    const queryUrl = `https://app.posthog.com/api/projects/${projectId}/query/`;
    
    const query1 = {
      kind: 'EventsQuery',
      select: ['uniq(distinct_id)'],
      where: [
        `event = '$pageview'`,
        `timestamp >= '${startDate}'`,
        `timestamp <= '${endDate} 23:59:59'`,
      ],
    };

    const response1 = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: query1 }),
    });

    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`   ✅ Result:`, JSON.stringify(data1, null, 2));
    } else {
      const error = await response1.text();
      console.log(`   ❌ Error: ${error}`);
    }

    console.log('\n');

    // Method 2: Query API - get all events and count manually
    console.log('2️⃣ Query API - manual count (current method)...');
    const query2 = {
      kind: 'EventsQuery',
      select: ['distinct_id', 'timestamp'],
      where: [
        `event = '$pageview'`,
        `timestamp >= '${startDate}'`,
        `timestamp <= '${endDate} 23:59:59'`,
      ],
      limit: 100000,
    };

    const response2 = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: query2 }),
    });

    if (response2.ok) {
      const data2 = await response2.json();
      const events = data2.results || [];
      const uniqueVisitors = new Set(events.map(e => e[0])).size;
      console.log(`   ✅ Total events: ${events.length}`);
      console.log(`   ✅ Unique visitors (Set): ${uniqueVisitors}`);
      
      // Check for duplicates
      const distinctIds = events.map(e => e[0]);
      const duplicates = distinctIds.length - new Set(distinctIds).size;
      console.log(`   📊 Duplicate events: ${duplicates}`);
      
      // Show date distribution
      const dates = events.map(e => e[1]?.substring(0, 10)).filter(Boolean);
      const dateCounts = {};
      dates.forEach(d => dateCounts[d] = (dateCounts[d] || 0) + 1);
      console.log(`   📅 Events by date:`, dateCounts);
    } else {
      const error = await response2.text();
      console.log(`   ❌ Error: ${error}`);
    }

    console.log('\n');

    // Method 3: Try using HogQL with countDistinct
    console.log('3️⃣ Query API with countDistinct...');
    const query3 = {
      kind: 'HogQLQuery',
      query: `SELECT count(DISTINCT distinct_id) FROM events WHERE event = '$pageview' AND timestamp >= '${startDate}' AND timestamp <= '${endDate} 23:59:59'`,
    };

    const response3 = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: query3 }),
    });

    if (response3.ok) {
      const data3 = await response3.json();
      console.log(`   ✅ Result:`, JSON.stringify(data3, null, 2));
    } else {
      const error = await response3.text();
      console.log(`   ❌ Error: ${error}`);
    }

    console.log('\n');

    // Method 4: Check what PostHog dashboard might be showing
    console.log('4️⃣ Checking if we need to filter by person_id instead...');
    const query4 = {
      kind: 'EventsQuery',
      select: ['person_id', 'distinct_id', 'timestamp'],
      where: [
        `event = '$pageview'`,
        `timestamp >= '${startDate}'`,
        `timestamp <= '${endDate} 23:59:59'`,
      ],
      limit: 10,
    };

    const response4 = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: query4 }),
    });

    if (response4.ok) {
      const data4 = await response4.json();
      console.log(`   ✅ Sample events structure:`, JSON.stringify(data4.results?.slice(0, 2), null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

debugCounts();
