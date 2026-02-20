/**
 * Import Data from Excel File
 *
 * This script reads your existing Excel file and imports the data into the dashboard.
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Path to your Excel file
const excelFilePath = '/Users/imad/Downloads/WoW Growth (Window, Imad, Waitlist, Website).xlsx';

async function importFromExcel() {
  console.log('📊 Reading Excel file...\n');

  // Read the Excel file
  const workbook = XLSX.readFile(excelFilePath);

  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  console.log(`Sheet found: "${sheetName}"\n`);

  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('📋 Preview of your data:');
  console.log('Headers:', data[0]);
  console.log('First row:', data[1]);
  console.log('Second row:', data[2]);
  console.log('\nTotal rows:', data.length - 1, '(excluding header)\n');

  // Try to identify columns
  const headers = data[0];
  console.log('🔍 Analyzing columns...');

  // Display all data to help identify the correct columns
  console.log('\n📊 All data from your sheet:');
  console.log('='.repeat(80));
  data.forEach((row, index) => {
    if (index === 0) {
      console.log('HEADERS:', row.join(' | '));
      console.log('-'.repeat(80));
    } else if (index <= 10) {
      console.log(`Row ${index}:`, row.join(' | '));
    }
  });

  // Try to automatically detect columns
  let weekStartCol = -1;
  let weekEndCol = -1;
  let visitorsCol = -1;
  let signupsCol = -1;

  headers.forEach((header, index) => {
    const h = String(header).toLowerCase();
    if (h.includes('week') && h.includes('start')) weekStartCol = index;
    if (h.includes('week') && h.includes('end')) weekEndCol = index;
    if (h.includes('visitor') || h.includes('window')) visitorsCol = index;
    if (h.includes('signup') || h.includes('waitlist')) signupsCol = index;
  });

  console.log('\n🎯 Column detection:');
  console.log('Week Start column:', weekStartCol >= 0 ? headers[weekStartCol] : 'NOT FOUND');
  console.log('Week End column:', weekEndCol >= 0 ? headers[weekEndCol] : 'NOT FOUND');
  console.log('Visitors column:', visitorsCol >= 0 ? headers[visitorsCol] : 'NOT FOUND');
  console.log('Signups column:', signupsCol >= 0 ? headers[signupsCol] : 'NOT FOUND');

  console.log('\n📝 Next steps:');
  console.log('1. Review the data above');
  console.log('2. I will create a custom import based on your specific format');
  console.log('3. Please share which columns contain:');
  console.log('   - Week start dates');
  console.log('   - Week end dates');
  console.log('   - Website visitor numbers');
  console.log('   - Waitlist signup numbers');
}

// Run the analysis
importFromExcel().catch(console.error);
