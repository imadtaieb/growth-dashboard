/**
 * Test Supabase Connection
 *
 * Quick script to verify Supabase is set up correctly
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in .env file\n');
  process.exit(1);
}

console.log('✅ Credentials found in .env');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('📡 Testing connection to Supabase...');

  // Try to query the table
  const { data, error } = await supabase
    .from('weekly_metrics')
    .select('count')
    .limit(1);

  if (error) {
    if (error.code === '42P01') {
      console.error('\n❌ Table "weekly_metrics" does not exist!');
      console.error('\n📝 You need to create the table first:');
      console.error('   1. Go to https://app.supabase.com/project/irjbtmaaldchjyuorkil/editor');
      console.error('   2. Click "SQL Editor" in the sidebar');
      console.error('   3. Click "New query"');
      console.error('   4. Copy/paste the contents of supabase/schema.sql');
      console.error('   5. Click "Run"\n');
      process.exit(1);
    }

    console.error('\n❌ Error connecting to Supabase:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  }

  console.log('✅ Successfully connected to Supabase!');
  console.log('✅ Table "weekly_metrics" exists!\n');

  // Check how many records exist
  const { count, error: countError } = await supabase
    .from('weekly_metrics')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log(`📊 Current records in database: ${count || 0}\n`);
  }

  console.log('🎉 Supabase is ready to use!');
  console.log('\n💡 Next step: Run the migration');
  console.log('   node scripts/migrate-to-supabase.js\n');
}

test().catch(error => {
  console.error('\n💥 Fatal error:', error.message);
  process.exit(1);
});
