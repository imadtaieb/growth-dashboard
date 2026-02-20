/**
 * Sample Data Generator
 *
 * This script adds sample weekly data to help you see what the dashboard looks like
 * with real data.
 *
 * Usage:
 *   node scripts/add-sample-data.js
 */

async function addSampleWeek(weekStartDate, weekEndDate, visitors, signups) {
  const response = await fetch('http://localhost:3000/api/metrics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      weekStartDate,
      weekEndDate,
      websiteVisitors: visitors,
      waitlistSignups: signups,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log(`✓ Added week ${weekStartDate}: ${signups} signups from ${visitors} visitors (${data.conversionRate}% conversion)`);
  } else {
    const error = await response.json();
    console.error(`✗ Failed to add week ${weekStartDate}:`, error);
  }
}

async function generateSampleData() {
  console.log('🚀 Adding sample data to your dashboard...\n');

  const weeks = [
    { start: '2024-01-07', end: '2024-01-13', visitors: 850, signups: 23 },
    { start: '2024-01-14', end: '2024-01-20', visitors: 920, signups: 31 },
    { start: '2024-01-21', end: '2024-01-27', visitors: 1050, signups: 38 },
    { start: '2024-01-28', end: '2024-02-03', visitors: 1200, signups: 45 },
    { start: '2024-02-04', end: '2024-02-10', visitors: 1350, signups: 56 },
    { start: '2024-02-11', end: '2024-02-17', visitors: 1480, signups: 67 },
  ];

  for (const week of weeks) {
    await addSampleWeek(week.start, week.end, week.visitors, week.signups);
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n✨ Sample data added successfully!');
  console.log('📊 Visit http://localhost:3000 to see your dashboard\n');
}

// Run the script
generateSampleData().catch(console.error);
