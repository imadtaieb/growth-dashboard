/**
 * Update visitor counts from PostHog API
 *
 * This script:
 * 1. Fetches all metrics from the dashboard
 * 2. For each metric, queries PostHog for the actual visitor count
 * 3. Updates the metric with the correct visitor count and recalculates conversion rate
 *
 * Usage: node scripts/update-visitors-from-posthog.js
 */

require('dotenv').config();

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const API_URL = 'http://localhost:3002'; // Update if your port is different

/**
 * Fetch visitor count from PostHog for a specific date range
 */
async function getPostHogVisitors(startDate, endDate) {
  const url = `https://app.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/query/`;

  // PostHog HogQL query to get unique pageview visitors
  const query = {
    kind: 'EventsQuery',
    select: ['distinct_id', 'timestamp'],
    where: [
      `event = '$pageview'`,
      `timestamp >= '${startDate}'`,
      `timestamp <= '${endDate} 23:59:59'`,
    ],
    limit: 100000, // High limit to get all pageviews
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`PostHog API error (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();
    const events = data.results || [];

    // Count unique visitors (distinct_id is first column)
    const uniqueVisitors = new Set(events.map(e => e[0])).size;

    return uniqueVisitors;
  } catch (error) {
    console.error('Error fetching from PostHog:', error.message);
    return null;
  }
}

/**
 * Fetch all metrics from the dashboard API
 */
async function getAllMetrics() {
  try {
    const response = await fetch(`${API_URL}/api/metrics`);

    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`);
    }

    const data = await response.json();
    return data.metrics || [];
  } catch (error) {
    console.error('Error fetching metrics:', error.message);
    return [];
  }
}

/**
 * Update a metric with new visitor count
 */
async function updateMetric(id, updates) {
  try {
    const response = await fetch(`${API_URL}/api/metrics/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update metric: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating metric:', error.message);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting PostHog visitor data update...\n');

  // Validate environment variables
  if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
    console.error('❌ Error: PostHog credentials not found in .env file');
    console.error('   Please set POSTHOG_API_KEY and POSTHOG_PROJECT_ID\n');
    process.exit(1);
  }

  console.log(`📊 PostHog Project ID: ${POSTHOG_PROJECT_ID}`);
  console.log(`🔗 API URL: ${API_URL}\n`);

  // Fetch all metrics
  console.log('📥 Fetching metrics from dashboard...');
  const metrics = await getAllMetrics();

  if (metrics.length === 0) {
    console.error('❌ No metrics found. Make sure the dev server is running on port 3002');
    process.exit(1);
  }

  console.log(`✓ Found ${metrics.length} metrics\n`);

  // Statistics
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  // Process each metric
  for (let i = 0; i < metrics.length; i++) {
    const metric = metrics[i];
    const progress = `[${i + 1}/${metrics.length}]`;

    console.log(`${progress} Processing ${metric.weekStartDate} to ${metric.weekEndDate}...`);

    // Fetch visitor count from PostHog
    const visitors = await getPostHogVisitors(metric.weekStartDate, metric.weekEndDate);

    if (visitors === null) {
      console.log(`   ❌ Failed to fetch PostHog data`);
      failed++;
      continue;
    }

    // Check if update is needed
    if (visitors === metric.websiteVisitors) {
      console.log(`   ⏭️  Already up to date (${visitors} visitors)`);
      skipped++;
      continue;
    }

    // Calculate new conversion rate
    const conversionRate = visitors === 0 ? 0 : (metric.waitlistSignups / visitors) * 100;

    // Update the metric
    const updated_metric = await updateMetric(metric.id, {
      websiteVisitors: visitors,
      conversionRate: Number(conversionRate.toFixed(2)),
    });

    if (updated_metric) {
      const oldCR = metric.conversionRate;
      const newCR = updated_metric.conversionRate;
      const change = oldCR === 0 ? 'N/A' : ((newCR - oldCR) / oldCR * 100).toFixed(1) + '%';

      console.log(`   ✅ Updated: ${metric.websiteVisitors} → ${visitors} visitors`);
      console.log(`      Conversion rate: ${oldCR}% → ${newCR}% (${change} change)`);
      updated++;
    } else {
      console.log(`   ❌ Failed to update in database`);
      failed++;
    }

    // Rate limiting - wait 500ms between requests
    if (i < metrics.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Update Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Updated:        ${updated} metrics`);
  console.log(`⏭️  Already current: ${skipped} metrics`);
  console.log(`❌ Failed:         ${failed} metrics`);
  console.log(`📈 Total processed: ${metrics.length} metrics`);
  console.log('='.repeat(60));

  if (updated > 0) {
    console.log('\n✨ Success! Refresh your dashboard to see the updated data.');
  }
}

// Run the script
main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
