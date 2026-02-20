/**
 * Check the Website sheet for week 42 data
 */

const XLSX = require('xlsx');

const excelFilePath = '/Users/imad/Downloads/WoW Growth (Window, Imad, Waitlist, Website).xlsx';

console.log('📊 Reading Website sheet...\n');

const workbook = XLSX.readFile(excelFilePath);
const worksheet = workbook.Sheets['Website'];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('Website Sheet - Last 15 weeks:');
console.log('='.repeat(80));

// Show header
console.log('Headers:', data[1].join(' | '));
console.log('-'.repeat(80));

// Show last 15 rows
const startRow = Math.max(2, data.length - 15);
data.slice(startRow).forEach((row, index) => {
  if (row && row.length > 0 && row[1]) {
    const weekLabel = row[1]; // Column B - Week label
    const visitors = row[2]; // Column C - Visitors
    console.log(`${weekLabel}: ${visitors} visitors | Change: ${row[3]}`);
  }
});

console.log('\n' + '='.repeat(80));

// Find week 42 specifically
const week42Row = data.find(row => row && row[1] && row[1].toString().toLowerCase().includes('week 42'));

if (week42Row) {
  console.log('\n✅ Found Week 42:');
  console.log(`   Website Visitors (Column C): ${week42Row[2]}`);
  console.log(`   Week Ending: ${week42Row[0]}`);
  console.log(`   Change: ${week42Row[3]}`);
} else {
  console.log('\n⚠️  Week 42 not found in Website sheet');
  console.log('Total rows:', data.length - 2);
  console.log('Last week found:', data[data.length - 2] ? data[data.length - 2][1] : 'N/A');
  console.log('\nLast row with data:');
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i] && data[i][1]) {
      console.log(`   ${data[i][1]}: ${data[i][2]} visitors`);
      break;
    }
  }
}
