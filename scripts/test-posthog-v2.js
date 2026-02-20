/**
 * Test PostHog connection with alternate authentication methods
 */

require('dotenv').config();

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

console.log('🔌 Testing PostHog connection (trying multiple auth methods)...\n');

async function testWithQueryAPI() {
  console.log('📊 Method 1: Using Query API with project key...\n');

  try {
    // Try using the simpler query endpoint
    const startDate = '2025-12-15'; // Week 33 start
    const endDate = '2025-12-21';   // Week 33 end

    const url = `https://app.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/events/?after=${startDate}&before=${endDate}&event=$pageview`;

    console.log('URL:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
      },
    });

    console.log('Status:', response.status, response.statusText);

    if (response.status === 403 || response.status === 401) {
      console.log('❌ Authentication failed with Bearer token\n');
      return false;
    }

    if (!response.ok) {
      const error = await response.text();
      console.log('Error:', error);
      return false;
    }

    const data = await response.json();
    console.log('✅ Success! Found', data.results?.length || 0, 'events');
    return true;

  } catch (error) {
    console.log('❌ Failed:', error.message);
    return false;
  }
}

async function testPublicAPI() {
  console.log('\n📊 Method 2: Using public SDK approach...\n');

  try {
    // PostHog's public API endpoint
    const url = 'https://app.posthog.com/batch/';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: POSTHOG_API_KEY,
        batch: [{
          event: '$pageview',
          properties: {},
          timestamp: new Date().toISOString(),
        }],
      }),
    });

    console.log('Status:', response.status);

    if (response.ok) {
      console.log('✅ Project API key is valid for sending events');
      console.log('ℹ️  However, you need a Personal API Key to READ data from PostHog');
      return false;
    }

    return false;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    return false;
  }
}

async function main() {
  const method1 = await testWithQueryAPI();

  if (!method1) {
    const method2 = await testPublicAPI();
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 To fetch visitor data from PostHog, you need:');
  console.log('\n1. Go to https://app.posthog.com');
  console.log('2. Click your profile → Personal API Keys');
  console.log('3. Create a new Personal API Key');
  console.log('4. Update POSTHOG_API_KEY in .env with the Personal API Key');
  console.log('\n' + '='.repeat(60));
}

main();
