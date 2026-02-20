/**
 * Check what dates we need for weeks 32-42
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

async function main() {
  const metrics = await getCurrentData();

  console.log('📊 Weeks 32-42 date ranges:\n');
  console.log('Week | Dates                           | Visitors | Signups');
  console.log('-'.repeat(70));

  metrics.slice(31, 42).forEach((week, index) => {
    const weekNum = index + 32;
    const visitors = week.websiteVisitors;
    const signups = week.waitlistSignups;
    const status = visitors === 0 ? '❌ MISSING' : '✅';

    console.log(`${weekNum}   | ${week.weekStartDate} to ${week.weekEndDate} | ${visitors.toString().padStart(8)} | ${signups.toString().padStart(7)} ${status}`);
  });

  const missingWeeks = metrics.slice(31, 42).filter(w => w.websiteVisitors === 0);

  console.log('\n' + '='.repeat(70));
  console.log(`\nMissing visitor data for ${missingWeeks.length} weeks (weeks 32-42)`);
  console.log('\nThese dates are:');
  missingWeeks.forEach(w => {
    console.log(`  ${w.weekStartDate} to ${w.weekEndDate}`);
  });
}

main();
