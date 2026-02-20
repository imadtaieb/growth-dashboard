# Google Sheets Integration Guide

The easiest way to import data into your Growth Dashboard! Perfect if you're already tracking metrics in a spreadsheet.

## Quick Start (No API Key Required!)

### Step 1: Format Your Google Sheet

Your sheet should have these columns (starting from row 1 with headers):

| Week Start | Week End   | Website Visitors | Waitlist Signups |
|------------|------------|------------------|------------------|
| 2024-01-07 | 2024-01-13 | 850             | 23               |
| 2024-01-14 | 2024-01-20 | 920             | 31               |
| 2024-01-21 | 2024-01-27 | 1050            | 38               |

**Important:**
- Column A: Week Start Date (format: YYYY-MM-DD)
- Column B: Week End Date (format: YYYY-MM-DD)
- Column C: Website Visitors (number only)
- Column D: Waitlist Signups (number only)
- Headers in row 1, data starts from row 2

### Step 2: Make Your Sheet Public

1. Open your Google Sheet
2. Click **Share** button (top right)
3. Click **"Change to anyone with the link"**
4. Set permissions to **"Viewer"**
5. Click **Done**

**Note:** Only people with the link can view. Your sheet won't appear in Google searches.

### Step 3: Import to Dashboard

1. Open your dashboard at http://localhost:3000
2. Click **"📊 Import from Sheets"** button
3. Paste your Google Sheets URL
4. Click **"Test Connection"** to verify
5. Click **"Import Data"**

Done! Your data is now in the dashboard.

## Advanced: Using API Key (Optional)

If you prefer more control or have privacy concerns, you can use a Google API key.

### Why Use an API Key?

- Slightly more secure
- Rate limiting control
- Better error messages
- Required for private sheets (with Service Account)

### Setup Steps

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown (top left)
   - Click **"New Project"**
   - Name it "Growth Dashboard"
   - Click **Create**

3. **Enable Google Sheets API**
   - In the left sidebar, go to **APIs & Services → Library**
   - Search for "Google Sheets API"
   - Click on it and click **Enable**

4. **Create API Key**
   - Go to **APIs & Services → Credentials**
   - Click **"Create Credentials" → "API Key"**
   - Copy the API key
   - Click **"Restrict Key"** (recommended)
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sheets API"
   - Click **Save**

5. **Add to Your Dashboard**
   - Create `.env` file (if you haven't already):
     ```bash
     cp .env.example .env
     ```
   - Add your API key:
     ```
     GOOGLE_SHEETS_API_KEY=AIzaSyC...your-key-here
     ```
   - Restart your development server

## Sheet Template

Use this template to get started quickly:

[Copy this Google Sheet Template](https://docs.google.com/spreadsheets/d/1ABC123/copy)

Or create your own with this structure:

```
A1: Week Start    B1: Week End      C1: Website Visitors    D1: Waitlist Signups
A2: 2024-01-07    B2: 2024-01-13    C2: 850                D2: 23
A3: 2024-01-14    B3: 2024-01-20    C3: 920                D3: 31
...
```

## Syncing Your Data

### First Time Import

1. Click **"📊 Import from Sheets"**
2. Paste your sheet URL
3. Leave range as `Sheet1!A2:D100` (default)
4. Click **"Import Data"**

The dashboard will:
- Import all new weeks
- Skip weeks that already exist
- Calculate conversion rates automatically
- Sort data chronologically

### Regular Updates

When you add new weeks to your sheet:

1. Add the new row in your Google Sheet
2. Go back to the dashboard
3. Click **"📊 Import from Sheets"** again
4. Same URL, click **"Import Data"**

Only new weeks will be imported. Existing weeks are skipped.

### Custom Range

If your data is in a different location:

- Different sheet tab: `Sheet2!A2:D100`
- Different columns: `Sheet1!B2:E100`
- More rows: `Sheet1!A2:D500`

## Troubleshooting

### Error: "No data found"

**Check these:**
- [ ] Sheet is publicly accessible (Share → Anyone with link)
- [ ] Data starts from row 2 (row 1 should be headers)
- [ ] Dates are in YYYY-MM-DD format (e.g., 2024-01-07)
- [ ] Numbers don't have quotes or special characters
- [ ] Range is correct (default: `Sheet1!A2:D100`)

### Error: "Invalid Google Sheets URL"

**Make sure URL looks like:**
```
https://docs.google.com/spreadsheets/d/1ABC123XYZ/edit
```

**Not like:**
```
https://drive.google.com/file/d/1ABC123XYZ
```

### Connection Test Fails

1. Open the sheet URL in an incognito window
2. If you see "Request access", the sheet isn't public
3. Go back and make it "Anyone with link can view"

### Dates Not Importing

**Date must be formatted as:**
- Correct: `2024-01-07`
- Wrong: `Jan 7, 2024` or `1/7/2024` or `07-01-2024`

**To fix in Google Sheets:**
1. Select date column
2. Format → Number → Plain text
3. Manually type dates as YYYY-MM-DD

### Numbers Imported as Zero

**Check for:**
- Commas in numbers (remove them: 1000 not 1,000)
- Text characters (remove: 850 not 850 visitors)
- Formulas not calculating (check if formulas have errors)

## Tips & Best Practices

### Keep Your Sheet Updated

Update your Google Sheet weekly, then sync to the dashboard. This way you have:
- Backup in Google Drive
- Easy editing in spreadsheet
- Beautiful visualization in dashboard

### Use Formulas

In your Google Sheet, you can use formulas:

```
Column E (Conversion Rate):
=D2/C2*100

Column F (WoW Growth):
=(D3-D2)/D2*100
```

These won't be imported, but help you verify the dashboard calculations.

### Archive Old Data

If you have more than 100 weeks:
- Change range to `Sheet1!A2:D200`
- Or move old data to another sheet tab

### Multiple Projects

Track multiple projects in different sheets:
- Each project = separate sheet tab
- Import each with different range
- Example: `Project1!A2:D100` and `Project2!A2:D100`

## Security Considerations

### Is My Data Safe?

**With Public Sharing:**
- Anyone with the link can view
- Not listed in Google search
- Can't edit without permission
- Revoke access anytime by making private

**Best Practice:**
- Don't include sensitive customer data
- Only aggregate numbers (total visitors, signups)
- Use API key for additional security

### Private Sheets (Advanced)

For completely private sheets, use a Service Account:

1. Create Service Account in Google Cloud Console
2. Download JSON credentials
3. Share sheet with service account email
4. Add credentials to `.env`:
   ```
   GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account",...}'
   ```

This is more complex but keeps your sheet completely private.

## Example Workflows

### Workflow 1: Weekly Manual Tracking

```
Monday morning:
1. Check PostHog for last week's visitors → add to Google Sheet
2. Check Tally for signups → add to Google Sheet
3. Open dashboard → Import from Sheets
4. Review metrics and charts
```

### Workflow 2: Real-time Dashboard

```
Set up once:
1. Configure PostHog API (auto-fetch visitors)
2. Configure Slack integration (auto-count signups)
3. Use manual entry or sheets for corrections
```

### Workflow 3: Hybrid Approach

```
1. Use Google Sheets for historical data (import once)
2. Use manual entry for new weeks
3. Sync back to Google Sheets monthly for backup
```

## Frequently Asked Questions

**Q: Can I import from Excel?**
A: Upload your Excel file to Google Drive, convert to Google Sheets, then import.

**Q: Will it duplicate existing weeks?**
A: No. The dashboard checks week start dates and skips duplicates.

**Q: Can I edit imported data?**
A: Yes, but only through the dashboard UI. Re-importing won't override edits.

**Q: What if I have gaps in my data?**
A: That's fine! Import the weeks you have. Charts will still work.

**Q: Can I import daily data instead of weekly?**
A: The dashboard is designed for weekly data. You can aggregate daily data in your sheet first.

**Q: Does it work with Google Workspace?**
A: Yes! Same process. Just make sure sharing settings allow it.

## Need Help?

- Check that your sheet matches the template format exactly
- Try the "Test Connection" button to see specific errors
- Make sure sheet is public (Anyone with link can view)
- Verify dates are in YYYY-MM-DD format
- Check that numbers don't have commas or text

Still stuck? Check the main README.md or SETUP.md files for more help!
