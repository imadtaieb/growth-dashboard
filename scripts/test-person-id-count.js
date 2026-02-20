require('dotenv').config();

const apiKey = process.env.POSTHOG_API_KEY;
const projectId = process.env.POSTHOG_PROJECT_ID;

const startDate = '2026-02-17';
const endDate = '2026-02-23';

console.log('🔍 Testing PostHog visitor count with person_id...');
console.log(`Date range: ${startDate} to ${endDate}\n`);

async function testPersonIdCount() {
  const url = `https://app.posthog.com/api/projects/${projectId}/query/`;
  
  const query = {
    kind: 'HogQLQuery',
    query: `SELECT count(DISTINCT person_id) FROM events WHERE event = '$pageview' AND timestamp >= '${startDate}' AND timestamp <= '${endDate} 23:59:59'`,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Error:', error);
    return;
  }

  const data = await response.json();
  const count = data.results?.[0]?.[0];
  
  console.log(`✅ Unique visitors (using person_id): ${count}`);
  console.log(`\n📊 This should match what you see in PostHog dashboard!`);
}

testPersonIdCount();
