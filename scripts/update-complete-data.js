/**
 * Update dashboard with complete data from both Waitlist and Conversion Rate sheets
 */

const XLSX = require('xlsx');
const http = require('http');

const excelFilePath = '/Users/imad/Downloads/WoW Growth (Window, Imad, Waitlist, Website).xlsx';

function excelDateToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekStart(weekEndDate) {
  const end = new Date(weekEndDate);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return start;
}

async function updateMetric(id, weekStartDate, weekEndDate, visitors, signups) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      weekStartDate,
      weekEndDate,
      websiteVisitors: visitors,
      waitlistSignups: signups,
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
          console.log(`✓ Updated: ${weekStartDate} - ${signups} signups, ${visitors} visitors`);
          resolve(result);
        } else {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(data);
    req.end();
  });
}

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

async function importData() {
  console.log('📊 Reading Excel file...\n');

  const workbook = XLSX.readFile(excelFilePath);

  // Read Waitlist sheet for accurate signup counts
  const waitlistSheet = workbook.Sheets['Waitlist'];
  const waitlistData = XLSX.utils.sheet_to_json(waitlistSheet, { header: 1 });

  // Read Conversion Rate sheet for visitor data (weeks 1-32)
  const conversionSheet = workbook.Sheets['Conversion Rate'];
  const conversionData = XLSX.utils.sheet_to_json(conversionSheet, { header: 1 });

  // Create a map of week data
  const weekData = {};

  // Process Waitlist sheet (has weeks 1-42)
  for (let i = 2; i < waitlistData.length; i++) {
    const row = waitlistData[i];
    if (!row || !row[1]) continue;

    const weekLabel = row[1]; // "week 1", "week 2", etc.
    const weekNum = parseInt(weekLabel.replace('week ', ''));
    const weekEndSerial = row[0];
    const signups = parseInt(row[2]) || 0;

    if (weekEndSerial && weekNum) {
      const weekEnd = excelDateToJSDate(weekEndSerial);
      const weekStart = getWeekStart(weekEnd);

      weekData[weekNum] = {
        weekStartDate: formatDate(weekStart),
        weekEndDate: formatDate(weekEnd),
        waitlistSignups: signups,
        websiteVisitors: 0, // Will update from conversion sheet
        weekLabel: weekLabel
      };
    }
  }

  // Process Conversion Rate sheet (has visitor data for weeks 1-32)
  for (let i = 2; i < conversionData.length; i++) {
    const row = conversionData[i];
    if (!row || !row[1]) continue;

    const weekLabel = row[1];
    const weekNum = parseInt(weekLabel.replace('week ', ''));
    const visitors = parseInt(row[2]) || 0;

    if (weekNum && weekData[weekNum]) {
      weekData[weekNum].websiteVisitors = visitors;
    }
  }

  console.log(`📈 Found data for ${Object.keys(weekData).length} weeks\n`);

  // Get current data from dashboard
  const currentData = await getCurrentData();
  console.log(`📊 Dashboard currently has ${currentData.length} weeks\n`);

  // Update existing entries
  let updated = 0;
  for (const metric of currentData) {
    const weekStart = metric.weekStartDate;

    // Find matching week in our data
    const matchingWeek = Object.values(weekData).find(
      w => w.weekStartDate === weekStart
    );

    if (matchingWeek) {
      await updateMetric(
        metric.id,
        matchingWeek.weekStartDate,
        matchingWeek.weekEndDate,
        matchingWeek.websiteVisitors,
        matchingWeek.waitlistSignups
      );
      updated++;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  console.log(`\n✨ Update complete!`);
  console.log(`   Updated: ${updated} weeks`);
  console.log(`\n📊 Current status:`);
  console.log(`   Total weeks tracked: 1-42`);
  console.log(`   Weeks with visitor data: 1-32 (from Conversion Rate sheet)`);
  console.log(`   Weeks 33-42: Have waitlist signups, missing visitor data`);
  console.log(`\n💡 Next step: Connect PostHog API to get visitor data for weeks 33-42`);
}

importData().catch(console.error);
