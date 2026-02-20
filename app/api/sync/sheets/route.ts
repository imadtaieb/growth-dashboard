import { NextRequest, NextResponse } from 'next/server';
import { fetchFromPublicSheet, extractSpreadsheetId, isValidSheetsUrl } from '@/lib/integrations/google-sheets';
import { createMetric, getAllMetrics } from '@/lib/storage';

/**
 * Sync data from Google Sheets
 *
 * POST /api/sync/sheets
 * Body: {
 *   sheetUrl: "https://docs.google.com/spreadsheets/d/...",
 *   range: "Sheet1!A2:D100" (optional, defaults to Sheet1!A2:D100)
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sheetUrl, range = 'Sheet1!A2:D100' } = body;

    if (!sheetUrl) {
      return NextResponse.json(
        { error: 'Sheet URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!isValidSheetsUrl(sheetUrl)) {
      return NextResponse.json(
        { error: 'Invalid Google Sheets URL format' },
        { status: 400 }
      );
    }

    // Extract spreadsheet ID
    const spreadsheetId = extractSpreadsheetId(sheetUrl);
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'Could not extract spreadsheet ID from URL' },
        { status: 400 }
      );
    }

    // Fetch data from Google Sheets
    const rows = await fetchFromPublicSheet(spreadsheetId, range);

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error: 'No data found in the sheet. Make sure:\n1. The sheet is publicly accessible (Anyone with link can view)\n2. The range is correct\n3. Data starts from row 2\n4. Columns are: Week Start | Week End | Visitors | Signups',
        },
        { status: 400 }
      );
    }

    // Get existing metrics to avoid duplicates
    const existingMetrics = await getAllMetrics();
    const existingDates = new Set(existingMetrics.map(m => m.weekStartDate));

    // Add new metrics
    const newMetrics = [];
    const skipped = [];

    for (const row of rows) {
      // Skip if this week already exists
      if (existingDates.has(row.weekStartDate)) {
        skipped.push(row.weekStartDate);
        continue;
      }

      // Validate data
      if (row.websiteVisitors < 0 || row.waitlistSignups < 0) {
        continue;
      }

      // Calculate conversion rate
      const conversionRate = row.websiteVisitors === 0
        ? 0
        : (row.waitlistSignups / row.websiteVisitors) * 100;

      const metric = await createMetric({
        weekStartDate: row.weekStartDate,
        weekEndDate: row.weekEndDate,
        websiteVisitors: row.websiteVisitors,
        waitlistSignups: row.waitlistSignups,
        conversionRate: Number(conversionRate.toFixed(2)),
      });

      newMetrics.push(metric);
    }

    return NextResponse.json({
      success: true,
      imported: newMetrics.length,
      skipped: skipped.length,
      skippedDates: skipped,
      metrics: newMetrics,
    });

  } catch (error) {
    console.error('Error syncing from Google Sheets:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync from Google Sheets',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to test Google Sheets connection
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sheetUrl = searchParams.get('url');

  if (!sheetUrl) {
    return NextResponse.json({
      message: 'Add ?url=YOUR_SHEET_URL to test the connection',
      example: '/api/sync/sheets?url=https://docs.google.com/spreadsheets/d/1abc123/edit',
    });
  }

  // Validate and extract ID
  if (!isValidSheetsUrl(sheetUrl)) {
    return NextResponse.json(
      { error: 'Invalid Google Sheets URL' },
      { status: 400 }
    );
  }

  const spreadsheetId = extractSpreadsheetId(sheetUrl);

  try {
    const rows = await fetchFromPublicSheet(spreadsheetId!, 'Sheet1!A2:D100');

    return NextResponse.json({
      success: true,
      spreadsheetId,
      rowsFound: rows.length,
      preview: rows.slice(0, 3), // Show first 3 rows
      message: rows.length > 0
        ? 'Successfully connected to Google Sheet!'
        : 'Sheet is accessible but no data found. Check your range and make sure data starts from row 2.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to connect to Google Sheet',
        details: error instanceof Error ? error.message : 'Unknown error',
        tip: 'Make sure the sheet is publicly accessible (Anyone with link can view)',
      },
      { status: 500 }
    );
  }
}
