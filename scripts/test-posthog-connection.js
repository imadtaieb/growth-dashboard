require('dotenv').config();

const apiKey = process.env.POSTHOG_API_KEY;
const projectId = process.env.POSTHOG_PROJECT_ID;

if (!apiKey || !projectId) {
  console.error('❌ PostHog credentials not found in .env');
  process.exit(1);
}

console.log('🔍 Testing PostHog connection...');
console.log(`API Key: ${apiKey.substring(0, 10)}...`);
console.log(`Project ID: ${projectId}\n`);

// Test with a recent date range (last 7 days)
const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);

const startDateStr = startDate.toISOString().split('T')[0];
const endDateStr = endDate.toISOString().split('T')[0];

console.log(`📅 Testing date range: ${startDateStr} to ${endDateStr}\n`);

async function testPostHogConnection() {
  try {
    // Test 1: Insights API (current implementation)
    console.log('1️⃣ Testing Insights API...');
    const insightsUrl = `https://app.posthog.com/api/projects/${projectId}/insights/trend/`;
    
    const insightsBody = {
      events: [
        {
          id: '$pageview',
          type: 'events',
          order: 0,
        },
      ],
      date_from: startDateStr,
      date_to: endDateStr,
      display: 'ActionsLineGraph',
      insight: 'TRENDS',
      interval: 'day',
    };

    const insightsResponse = await fetch(insightsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(insightsBody),
    });

    console.log(`   Status: ${insightsResponse.status} ${insightsResponse.statusText}`);

    if (!insightsResponse.ok) {
      const errorText = await insightsResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
    } else {
      const insightsData = await insightsResponse.json();
      console.log(`   ✅ Success!`);
      console.log(`   Response structure:`, JSON.stringify(insightsData, null, 2).substring(0, 500));
      
      // Check the data structure
      if (insightsData.result && insightsData.result.length > 0) {
        const firstResult = insightsData.result[0];
        console.log(`   📊 First result:`, JSON.stringify(firstResult, null, 2).substring(0, 300));
        console.log(`   Aggregated value: ${firstResult.aggregated_value || 'N/A'}`);
      } else {
        console.log(`   ⚠️  No results found in response`);
      }
    }

    console.log('\n');

    // Test 2: Events API (alternative)
    console.log('2️⃣ Testing Events API...');
    const eventsUrl = `https://app.posthog.com/api/projects/${projectId}/events/?event=$pageview&after=${startDateStr}&before=${endDateStr}`;
    
    const eventsResponse = await fetch(eventsUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    console.log(`   Status: ${eventsResponse.status} ${eventsResponse.statusText}`);

    if (!eventsResponse.ok) {
      const errorText = await eventsResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
    } else {
      const eventsData = await eventsResponse.json();
      console.log(`   ✅ Success!`);
      console.log(`   Events found: ${eventsData.results?.length || 0}`);
      if (eventsData.results && eventsData.results.length > 0) {
        console.log(`   Sample event:`, JSON.stringify(eventsData.results[0], null, 2).substring(0, 200));
      }
    }

    console.log('\n');

    // Test 3: Check project info
    console.log('3️⃣ Testing Project Info API...');
    const projectUrl = `https://app.posthog.com/api/projects/${projectId}/`;
    
    const projectResponse = await fetch(projectUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    console.log(`   Status: ${projectResponse.status} ${projectResponse.statusText}`);

    if (!projectResponse.ok) {
      const errorText = await projectResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
    } else {
      const projectData = await projectResponse.json();
      console.log(`   ✅ Success!`);
      console.log(`   Project name: ${projectData.name || 'N/A'}`);
      console.log(`   Project ID: ${projectData.id || 'N/A'}`);
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error(error.stack);
  }
}

testPostHogConnection();
