/**
 * Fix null/NaN conversion rates in the data
 */

const fs = require('fs');
const path = require('path');

const dataFile = path.join(process.cwd(), 'data', 'metrics.json');

console.log('📊 Reading metrics data...\n');

const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

console.log(`Total metrics: ${data.length}`);

let fixed = 0;

data.forEach((metric, index) => {
  const visitors = metric.websiteVisitors || 0;
  const signups = metric.waitlistSignups || 0;

  // Calculate conversion rate
  const conversionRate = visitors === 0 ? 0 : (signups / visitors) * 100;

  if (metric.conversionRate === null || isNaN(metric.conversionRate) || metric.conversionRate === undefined) {
    console.log(`Week ${index + 1}: ${metric.weekStartDate} - Fixing conversion rate`);
    metric.conversionRate = Number(conversionRate.toFixed(2));
    fixed++;
  }
});

console.log(`\n✓ Fixed ${fixed} conversion rates`);

// Write back
fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

console.log('✨ Data file updated!');
console.log('\n🔄 Refresh your browser to see the dashboard!');
