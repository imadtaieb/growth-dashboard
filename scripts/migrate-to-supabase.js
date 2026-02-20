/**
 * Migrate existing JSON data to Supabase
 *
 * This script:
 * 1. Reads data from data/metrics.json
 * 2. Uploads it to Supabase
 * 3. Verifies the migration
 *
 * Usage: node scripts/migrate-to-supabase.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in .env file');
  console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('📦 Starting migration to Supabase...\n');

  // Read JSON data
  const jsonPath = path.join(process.cwd(), 'data', 'metrics.json');

  if (!fs.existsSync(jsonPath)) {
    console.log('⚠️  No existing data found at data/metrics.json');
    console.log('   This is fine if you\'re starting fresh!\n');
    return;
  }

  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  if (jsonData.length === 0) {
    console.log('ℹ️  JSON file is empty. Nothing to migrate.\n');
    return;
  }

  console.log(`📊 Found ${jsonData.length} metrics in JSON file\n`);

  // Check if table already has data
  const { data: existing, error: checkError } = await supabase
    .from('weekly_metrics')
    .select('id')
    .limit(1);

  if (checkError) {
    console.error('❌ Error checking Supabase table:', checkError.message);
    console.error('   Make sure you\'ve run the schema.sql file in Supabase SQL Editor!\n');
    process.exit(1);
  }

  if (existing && existing.length > 0) {
    console.log('⚠️  Warning: Supabase table already contains data');
    console.log('   Do you want to:');
    console.log('   1. Skip migration (existing data will remain)');
    console.log('   2. Clear and re-import (WARNING: will delete existing data)');
    console.log('   3. Merge (add new records, skip duplicates)\n');
    console.log('   For now, skipping migration to prevent data loss.');
    console.log('   To force migration, delete data in Supabase first.\n');
    return;
  }

  // Transform data for Supabase
  const records = jsonData.map(metric => {
    // Calculate conversion rate if not present or invalid
    let conversionRate = metric.conversionRate;
    if (conversionRate === null || conversionRate === undefined || isNaN(conversionRate)) {
      conversionRate = metric.websiteVisitors === 0
        ? 0
        : Number(((metric.waitlistSignups / metric.websiteVisitors) * 100).toFixed(2));
    }

    return {
      week_start_date: metric.weekStartDate,
      week_end_date: metric.weekEndDate,
      website_visitors: metric.websiteVisitors || 0,
      waitlist_signups: metric.waitlistSignups || 0,
      conversion_rate: conversionRate,
      created_at: metric.createdAt || new Date().toISOString(),
      updated_at: metric.updatedAt || new Date().toISOString(),
    };
  });

  console.log('⬆️  Uploading to Supabase...\n');

  // Insert in batches (Supabase recommends batches of 1000)
  const batchSize = 100;
  let uploaded = 0;
  let failed = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    const { data, error } = await supabase
      .from('weekly_metrics')
      .insert(batch)
      .select();

    if (error) {
      console.error(`❌ Error uploading batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      failed += batch.length;
    } else {
      uploaded += data.length;
      console.log(`   ✅ Uploaded batch ${Math.floor(i / batchSize) + 1}: ${data.length} records`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Successfully uploaded: ${uploaded} records`);
  console.log(`❌ Failed:               ${failed} records`);
  console.log(`📁 Total in JSON:        ${jsonData.length} records`);
  console.log('='.repeat(60));

  // Verify migration
  console.log('\n🔍 Verifying migration...');

  const { data: verify, error: verifyError } = await supabase
    .from('weekly_metrics')
    .select('*')
    .order('week_start_date', { ascending: true });

  if (verifyError) {
    console.error('❌ Error verifying migration:', verifyError.message);
    return;
  }

  console.log(`✅ Verified: ${verify.length} records in Supabase\n`);

  if (verify.length === jsonData.length) {
    console.log('🎉 Migration completed successfully!');
    console.log('   Your data is now in Supabase.');
    console.log('\n💡 Next steps:');
    console.log('   1. Test your app: npm run dev');
    console.log('   2. Verify data in Supabase dashboard');
    console.log('   3. Deploy to Vercel with Supabase env vars\n');
  } else {
    console.log('⚠️  Warning: Record count mismatch');
    console.log(`   JSON: ${jsonData.length}, Supabase: ${verify.length}`);
    console.log('   Please check for errors above.\n');
  }
}

migrate().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
