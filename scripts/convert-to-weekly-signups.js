/**
 * Convert cumulative totals to weekly new signups
 */

const http = require('http');

async function getCurrentData() {
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

async function updateMetric(id, weekStartDate, weekEndDate, visitors, newSignups) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      weekStartDate,
      weekEndDate,
      websiteVisitors: visitors,
      waitlistSignups: newSignups,
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
          const result = JSON.parse(responseData);
          console.log(`✓ Week ${weekStartDate}: ${newSignups} NEW signups (was showing ${result.waitlistSignups} cumulative)`);
          resolve(result);
        } else {
          console.log(`✗ Failed to update ${weekStartDate}`);
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(data);
    req.end();
  });
}

async function convertData() {
  console.log('📊 Fetching current data...\n');

  const metrics = await getCurrentData();

  if (metrics.length === 0) {
    console.log('No data found!');
    return;
  }

  console.log(`Found ${metrics.length} weeks of data\n`);
  console.log('Converting cumulative totals to weekly NEW signups...\n');

  // Calculate weekly new signups
  const updates = [];

  for (let i = 0; i < metrics.length; i++) {
    const current = metrics[i];
    const previous = i > 0 ? metrics[i - 1] : null;

    // Calculate NEW signups for this week
    const newSignups = previous
      ? current.waitlistSignups - previous.waitlistSignups
      : current.waitlistSignups; // First week keeps its value

    // Also calculate NEW visitors for this week
    const newVisitors = previous
      ? current.websiteVisitors - previous.websiteVisitors
      : current.websiteVisitors; // First week keeps its value

    updates.push({
      id: current.id,
      weekStartDate: current.weekStartDate,
      weekEndDate: current.weekEndDate,
      oldSignups: current.waitlistSignups,
      newSignups: newSignups,
      oldVisitors: current.websiteVisitors,
      newVisitors: Math.max(0, newVisitors), // Ensure no negative values
    });
  }

  console.log('Preview of changes:\n');
  console.log('Week | Old (Cumulative) | New (Weekly) | Visitors');
  console.log('-'.repeat(60));
  updates.slice(0, 10).forEach((u, i) => {
    console.log(`${i + 1}    | ${u.oldSignups.toString().padStart(6)} signups | ${u.newSignups.toString().padStart(4)} new | ${u.newVisitors} visitors`);
  });
  console.log('...');
  console.log(`${updates.length} | ${updates[updates.length - 1].oldSignups.toString().padStart(6)} signups | ${updates[updates.length - 1].newSignups.toString().padStart(4)} new | ${updates[updates.length - 1].newVisitors} visitors`);

  console.log('\n📝 Applying updates...\n');

  for (const update of updates) {
    await updateMetric(
      update.id,
      update.weekStartDate,
      update.weekEndDate,
      update.newVisitors,
      update.newSignups
    );
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('\n✨ Conversion complete!');
  console.log('\n📊 Now the dashboard shows:');
  console.log('   - Weekly NEW signups (not cumulative)');
  console.log('   - Weekly NEW visitors (not cumulative)');
  console.log('   - Total Signups card will show sum of all weekly signups');
  console.log('\n🔄 Refresh your browser to see the changes!');
}

convertData().catch(console.error);
