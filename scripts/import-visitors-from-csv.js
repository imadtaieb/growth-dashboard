require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { startOfWeek, endOfWeek, format, parseISO, addDays } = require('date-fns');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read CSV file
const csvPath = '/Users/imad/Downloads/WoW Growth (Window, Imad, Waitlist, Website) - Conversion Rate.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

console.log('📊 Importing website visitors from CSV...\n');

// Parse CSV (skip header rows)
const data = [];
for (let i = 2; i < lines.length; i++) {
  const line = lines[i];
  // Handle CSV with commas in numbers (e.g., "2,308")
  const columns = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g).map(col => col.replace(/^"|"$/g, '').trim());
  
  if (columns.length < 3) continue;
  
  const weekEnding = columns[0];
  const weekNum = columns[1];
  const websiteVisitorsCumulative = columns[2].replace(/,/g, '');
  const waitlistCumulative = columns[3]?.replace(/,/g, '') || '0';
  const websiteDelta = columns[4]?.replace(/,/g, '') || '';
  const waitlistDelta = columns[5]?.replace(/,/g, '') || '';
  
  // Extract week number (e.g., "week 1" -> 1)
  const weekMatch = weekNum.match(/week\s+(\d+)/i);
  const weekNumber = weekMatch ? parseInt(weekMatch[1]) : null;
  
  if (!weekNumber || weekNumber < 1 || weekNumber > 32) continue;
  
  // Parse week ending date (Sunday)
  const weekEndDate = parseISO(weekEnding);
  const weekStartDate = startOfWeek(weekEndDate, { weekStartsOn: 1 }); // Monday
  
  // Calculate weekly visitors (use delta if available, otherwise calculate from cumulative)
  let weeklyVisitors = 0;
  if (websiteDelta && websiteDelta !== '-' && !isNaN(parseInt(websiteDelta))) {
    weeklyVisitors = parseInt(websiteDelta);
  } else {
    // Calculate from cumulative (current - previous)
    const prevWeek = data[data.length - 1];
    if (prevWeek) {
      weeklyVisitors = parseInt(websiteVisitorsCumulative) - prevWeek.cumulativeVisitors;
    } else {
      // First week - use cumulative as weekly
      weeklyVisitors = parseInt(websiteVisitorsCumulative);
    }
  }
  
  // Calculate weekly signups
  let weeklySignups = 0;
  if (waitlistDelta && waitlistDelta !== '-' && !isNaN(parseInt(waitlistDelta))) {
    weeklySignups = parseInt(waitlistDelta);
  } else {
    const prevWeek = data[data.length - 1];
    if (prevWeek) {
      weeklySignups = parseInt(waitlistCumulative) - prevWeek.cumulativeSignups;
    } else {
      weeklySignups = parseInt(waitlistCumulative);
    }
  }
  
  data.push({
    weekNumber,
    weekStartDate: format(weekStartDate, 'yyyy-MM-dd'),
    weekEndDate: format(weekEndDate, 'yyyy-MM-dd'),
    weeklyVisitors,
    weeklySignups,
    cumulativeVisitors: parseInt(websiteVisitorsCumulative),
    cumulativeSignups: parseInt(waitlistCumulative),
  });
}

console.log(`Found ${data.length} weeks to import (weeks 1-32)\n`);

async function importData() {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const week of data) {
    try {
      // Check if metric already exists
      const { data: existing } = await supabase
        .from('weekly_metrics')
        .select('id, website_visitors, waitlist_signups')
        .eq('week_start_date', week.weekStartDate)
        .single();

      const conversionRate = week.weeklyVisitors === 0 ? 0 : (week.weeklySignups / week.weeklyVisitors) * 100;

      if (existing) {
        // Update existing metric
        const { error } = await supabase
          .from('weekly_metrics')
          .update({
            website_visitors: week.weeklyVisitors,
            waitlist_signups: week.weeklySignups,
            conversion_rate: Number(conversionRate.toFixed(2)),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
        
        // Only count as updated if values changed
        if (existing.website_visitors !== week.weeklyVisitors || existing.waitlist_signups !== week.weeklySignups) {
          updated++;
          console.log(`✓ Updated Week ${week.weekNumber} (${week.weekStartDate}): ${week.weeklyVisitors} visitors, ${week.weeklySignups} signups`);
        } else {
          skipped++;
        }
      } else {
        // Create new metric
        const { error } = await supabase
          .from('weekly_metrics')
          .insert({
            week_start_date: week.weekStartDate,
            week_end_date: week.weekEndDate,
            website_visitors: week.weeklyVisitors,
            waitlist_signups: week.weeklySignups,
            conversion_rate: Number(conversionRate.toFixed(2)),
          });

        if (error) throw error;
        created++;
        console.log(`✓ Created Week ${week.weekNumber} (${week.weekStartDate}): ${week.weeklyVisitors} visitors, ${week.weeklySignups} signups`);
      }
    } catch (error) {
      errors++;
      console.error(`✗ Error processing Week ${week.weekNumber}:`, error.message);
    }
  }

  console.log(`\n✨ Import complete!`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped} (no changes)`);
  console.log(`   Errors: ${errors}`);
}

importData().catch(console.error);
