/**
 * Check all sheets in the Excel file
 */

const XLSX = require('xlsx');

const excelFilePath = '/Users/imad/Downloads/WoW Growth (Window, Imad, Waitlist, Website).xlsx';

console.log('📊 Reading Excel file...\n');

const workbook = XLSX.readFile(excelFilePath);

console.log('📋 Found', workbook.SheetNames.length, 'sheets:\n');

workbook.SheetNames.forEach((sheetName, index) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Sheet ${index + 1}: "${sheetName}"`);
  console.log('='.repeat(80));

  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('\nFirst 5 rows:');
  data.slice(0, 5).forEach((row, rowIndex) => {
    console.log(`Row ${rowIndex}:`, row.join(' | '));
  });

  console.log('\nTotal rows:', data.length);
});

console.log('\n\n📝 Which sheet contains your waitlist and website visitor data?');
