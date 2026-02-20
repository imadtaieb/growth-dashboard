/**
 * Test PostHog API connection and fetch visitor data
 */

require('dotenv').config();

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

console.log('🔌 Testing PostHog connection...\n');
console.log('API Key:', POSTHOG_API_KEY ? `${POSTHOG_API_KEY.substring(0, 10)}...` : 'NOT FOUND');
console.log('Project ID:', POSTHOG_PROJECT_ID || 'NOT FOUND');
console.log();

if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
  console.error('❌ PostHog credentials not found in .env file');
  process.exit(1);
}

async function testConnection() {
  try {
    // Test with a simple query for the last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const url = `https://app.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`;

    console.log('📊 Testing API with last 7 days of data...\n');

    const body = {
      events: [
        {
          id: '$pageview',
          type: 'events',
          order: 0,
        },
      ],
      date_from: startDate.toISOString().split('T')[0],
      date_to: endDate.toISOString().split('T')[0],
      display: 'ActionsLineGraph',
      insight: 'TRENDS',
      interval: 'day',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return false;
    }

    const data = await response.json();
    console.log('\n✅ Connection successful!');
    console.log('\nResponse structure:', Object.keys(data));

    if (data.result && data.result.length > 0) {
      console.log('\n📈 Data found:');
      console.log('Result type:', typeof data.result[0]);
      console.log('Sample result:', JSON.stringify(data.result[0], null, 2));
    } else {
      console.log('\n⚠️  No pageview data found for the last 7 days');
      console.log('Full response:', JSON.stringify(data, null, 2));
    }

    return true;

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

testConnection();
