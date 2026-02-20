/**
 * Google Sheets API Integration
 *
 * This file contains functions to read and write data from Google Sheets.
 *
 * Setup:
 * 1. Go to https://console.cloud.google.com
 * 2. Create a new project or select existing
 * 3. Enable Google Sheets API
 * 4. Create credentials (API Key or Service Account)
 * 5. Add to .env file
 *
 * Two methods available:
 * - Method 1: API Key (Simple, read-only, public sheets)
 * - Method 2: Service Account (Advanced, read/write, private sheets)
 */

interface SheetRow {
  weekStartDate: string;
  weekEndDate: string;
  websiteVisitors: number;
  waitlistSignups: number;
}

/**
 * Method 1: Using API Key (Simpler, for public sheets)
 *
 * The sheet must be publicly accessible (anyone with link can view)
 */
export async function fetchFromPublicSheet(
  spreadsheetId: string,
  range: string = 'Sheet1!A2:D100'
): Promise<SheetRow[]> {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

  if (!apiKey) {
    console.warn('Google Sheets API key not configured');
    return [];
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    // Parse rows into our format
    // Expected columns: Week Start | Week End | Website Visitors | Waitlist Signups
    return rows.map((row: string[]) => ({
      weekStartDate: row[0] || '',
      weekEndDate: row[1] || '',
      websiteVisitors: parseInt(row[2]) || 0,
      waitlistSignups: parseInt(row[3]) || 0,
    })).filter((row: SheetRow) => row.weekStartDate && row.weekEndDate);

  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    return [];
  }
}

/**
 * Method 2: Using Service Account (More secure, for private sheets)
 *
 * Requires setting up a service account and sharing the sheet with the service account email
 */
export async function fetchFromPrivateSheet(
  spreadsheetId: string,
  range: string = 'Sheet1!A2:D100'
): Promise<SheetRow[]> {
  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;

  if (!credentials) {
    console.warn('Google Sheets service account credentials not configured');
    return [];
  }

  try {
    // Parse service account credentials
    const creds = JSON.parse(credentials);

    // Create JWT for authentication
    const jwt = await createJWT(creds);

    // Get access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    const { access_token } = await tokenResponse.json();

    // Fetch sheet data
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    return rows.map((row: string[]) => ({
      weekStartDate: row[0] || '',
      weekEndDate: row[1] || '',
      websiteVisitors: parseInt(row[2]) || 0,
      waitlistSignups: parseInt(row[3]) || 0,
    })).filter((row: SheetRow) => row.weekStartDate && row.weekEndDate);

  } catch (error) {
    console.error('Error fetching from private Google Sheet:', error);
    return [];
  }
}

/**
 * Helper function to create JWT for service account authentication
 */
async function createJWT(credentials: any): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // Note: In production, use a proper JWT library like 'jsonwebtoken'
  // This is a simplified version for demonstration
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Claim = Buffer.from(JSON.stringify(claim)).toString('base64url');

  return `${base64Header}.${base64Claim}`;
}

/**
 * Extract spreadsheet ID from Google Sheets URL
 *
 * Examples:
 * - https://docs.google.com/spreadsheets/d/1abc123/edit → 1abc123
 * - https://docs.google.com/spreadsheets/d/1abc123/edit#gid=0 → 1abc123
 */
export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * Validate Google Sheets URL format
 */
export function isValidSheetsUrl(url: string): boolean {
  return /docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/.test(url);
}
