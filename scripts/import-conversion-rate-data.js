/**
 * Import data from the "Conversion Rate" sheet
 */

const XLSX = require('xlsx');
const http = require('http');

const excelFilePath = '/Users/imad/Downloads/WoW Growth (Window, Imad, Waitlist, Website).xlsx';

// Helper function to convert Excel date serial number to Date
function excelDateToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to get week start date (Sunday of that week)
function getWeekStart(weekEndDate) {
  const end = new Date(weekEndDate);
  const start = new Date(end);
  start.setDate(end.getDate() - 6); // 6 days before the end
  return start;
}

async function addMetric(weekStartDate, weekEndDate, visitors, signups) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      weekStartDate,
      weekEndDate,
      websiteVisitors: visitors,
      waitlistSignups: signups,
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/metrics',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201) {
          const result = JSON.parse(responseData);
          console.log(`✓ Added: ${weekStartDate} to ${weekEndDate} - ${signups} signups from ${visitors} visitors (${result.conversionRate}% CR)`);
          resolve(result);
        } else {
          const error = JSON.parse(responseData);
          console.log(`✗ Failed: ${weekStartDate} - ${error.error}`);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`✗ Error: ${error.message}`);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function importData() {
  console.log('📊 Reading Excel file...\n');

  const workbook = XLSX.readFile(excelFilePath);
  const worksheet = workbook.Sheets['Conversion Rate'];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('Found', data.length - 2, 'weeks of data\n');

  const metrics = [];

  // Skip first 2 rows (title and headers)
  for (let i = 2; i < data.length; i++) {
    const row = data[i];

    if (!row || row.length === 0) continue;

    const weekEndingSerial = row[0]; // Excel date serial
    const weekLabel = row[1]; // "week 1", "week 2", etc.
    const visitors = parseInt(row[2]) || 0;
    const signups = parseInt(row[3]) || 0;

    if (!weekEndingSerial || visitors === 0) continue;

    // Convert Excel serial date to JavaScript Date
    const weekEnd = excelDateToJSDate(weekEndingSerial);
    const weekStart = getWeekStart(weekEnd);

    const weekStartDate = formatDate(weekStart);
    const weekEndDate = formatDate(weekEnd);

    metrics.push({
      weekStartDate,
      weekEndDate,
      visitors,
      signups,
      weekLabel,
    });
  }

  console.log(`📈 Importing ${metrics.length} weeks of data to dashboard...\n`);

  let imported = 0;
  let skipped = 0;

  for (const metric of metrics) {
    const result = await addMetric(
      metric.weekStartDate,
      metric.weekEndDate,
      metric.visitors,
      metric.signups
    );

    if (result) {
      imported++;
    } else {
      skipped++;
    }

    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n✨ Import complete!');
  console.log(`   Imported: ${imported} weeks`);
  console.log(`   Skipped: ${skipped} weeks`);
  console.log('\n📊 Visit http://localhost:3000 to see your dashboard!\n');
}

// Run the import
importData().catch(console.error);
