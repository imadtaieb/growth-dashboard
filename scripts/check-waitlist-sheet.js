/**
 * Check the Waitlist sheet for week 42 data
 */

const XLSX = require('xlsx');

const excelFilePath = '/Users/imad/Downloads/WoW Growth (Window, Imad, Waitlist, Website).xlsx';

console.log('📊 Reading Waitlist sheet...\n');

const workbook = XLSX.readFile(excelFilePath);
const worksheet = workbook.Sheets['Waitlist'];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('Waitlist Sheet Data:');
console.log('='.repeat(80));

// Show header
console.log('Headers:', data[1].join(' | '));
console.log('-'.repeat(80));

// Show all rows to find week 42
data.slice(2).forEach((row, index) => {
  if (row && row.length > 0) {
    const weekLabel = row[1]; // Column B - Week label
    const subscribers = row[2]; // Column C - Subscribers
    console.log(`Row ${index + 2}: Week Ending: ${row[0]} | ${weekLabel} | Subscribers: ${subscribers} | Change: ${row[3]} | Growth: ${row[4]}`);
  }
});

console.log('\n' + '='.repeat(80));

// Find week 42 specifically
const week42Row = data.find(row => row && row[1] && row[1].toString().toLowerCase().includes('week 42'));

if (week42Row) {
  console.log('\n✅ Found Week 42:');
  console.log(`   Subscribers (Column C): ${week42Row[2]}`);
  console.log(`   Week Ending: ${week42Row[0]}`);
  console.log(`   Change: ${week42Row[3]}`);
  console.log(`   Growth: ${week42Row[4]}`);
} else {
  console.log('\n⚠️  Week 42 not found in Waitlist sheet');
  console.log('Total rows:', data.length - 2);
  console.log('Last week found:', data[data.length - 1] ? data[data.length - 1][1] : 'N/A');
}
