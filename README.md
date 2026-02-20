# Growth Dashboard

A Next.js dashboard for tracking your startup's weekly growth metrics including website visitors, waitlist signups, and conversion rates.

## Features

- **Weekly Metrics Tracking**: Track website visitors and waitlist signups week over week
- **Visual Analytics**: Beautiful line charts showing growth trends over time
- **Key Metrics Cards**: Quick overview of total signups, conversion rate, and week-over-week growth
- **Google Sheets Import**: Import data directly from Google Sheets with one click
- **Manual Data Entry**: Easy form-based data input for weekly metrics
- **API Integrations**: Connect to PostHog, Tally, and Slack for automated data collection
- **Dark Mode Support**: Automatic dark/light theme based on system preferences

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone or navigate to this directory:
   ```bash
   cd "Growth dashboard"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Quick Start Options

### Option 1: Import from Google Sheets (Recommended)

Already tracking in a spreadsheet? Import everything at once:

1. Format your Google Sheet with columns: Week Start | Week End | Visitors | Signups
2. Make it publicly accessible (Share → Anyone with link can view)
3. Click **"📊 Import from Sheets"** in the dashboard
4. Paste your sheet URL and click Import

See [GOOGLE-SHEETS-GUIDE.md](GOOGLE-SHEETS-GUIDE.md) for detailed instructions.

### Option 2: Manual Entry

Add data one week at a time:

1. Click the **"+ Add Week Data"** button
2. Select the week start and end dates
3. Enter website visitors and waitlist signups
4. Click **"Add Metrics"**

The dashboard will automatically calculate:
- Conversion rate (signups / visitors × 100)
- Week-over-week growth percentages
- Average weekly signups

## API Integrations (Optional)

### PostHog Integration

Track website visitors automatically from PostHog:

1. Sign up at [posthog.com](https://posthog.com)
2. Go to Settings → Project API Key
3. Copy your API key and Project ID
4. Add to `.env`:
   ```
   POSTHOG_API_KEY=your_api_key_here
   POSTHOG_PROJECT_ID=your_project_id_here
   ```

### Tally Forms Integration

Track waitlist signups from Tally:

1. Go to your Tally form settings
2. Navigate to Integrations → API
3. Generate an API key
4. Add to `.env`:
   ```
   TALLY_API_KEY=your_api_key_here
   ```

**Note**: Tally's free plan may have limited API access. Check [tally.so/help/api](https://tally.so/help/api) for details.

### Slack Integration

Track signups via Slack notifications:

**Option 1: Slack Channel Monitoring** (Recommended if Tally posts to Slack)

1. Create a Slack App at [api.slack.com/apps](https://api.slack.com/apps)
2. Add the "channels:history" scope
3. Install to your workspace
4. Copy the Bot User OAuth Token
5. Get your channel ID (right-click channel → View channel details)
6. Add to `.env`:
   ```
   SLACK_BOT_TOKEN=xoxb-your-token
   SLACK_CHANNEL_ID=your-channel-id
   ```

**Option 2: Slack Webhook** (For notifications only)

1. Create an Incoming Webhook
2. Add to `.env`:
   ```
   SLACK_WEBHOOK_URL=your-webhook-url
   ```

### Using the Sync API

Once you've configured integrations, use the sync endpoint:

```bash
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -d '{
    "weekStartDate": "2024-01-01",
    "weekEndDate": "2024-01-07",
    "source": "auto"
  }'
```

Source options:
- `"auto"` - Fetch from all configured integrations
- `"posthog"` - Only fetch from PostHog
- `"tally"` - Only fetch from Tally (requires tallyFormId)
- `"slack"` - Only fetch from Slack

Check integration status:
```bash
curl http://localhost:3000/api/sync
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── metrics/         # CRUD API for metrics
│   │   └── sync/            # Integration sync endpoint
│   ├── components/          # React components
│   │   ├── MetricCard.tsx   # Metric display cards
│   │   ├── GrowthChart.tsx  # Line chart component
│   │   ├── MetricsTable.tsx # Data table
│   │   └── AddMetricForm.tsx # Manual entry form
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main dashboard page
├── lib/
│   ├── types.ts             # TypeScript types
│   ├── storage.ts           # JSON-based data storage
│   ├── calculations.ts      # Growth calculations
│   └── integrations/        # API integrations
│       ├── posthog.ts
│       ├── tally.ts
│       └── slack.ts
└── data/
    └── metrics.json         # Auto-generated data file
```

## Data Storage

Currently uses a simple JSON file (`data/metrics.json`) for storage. This is perfect for:
- Personal use
- Small teams
- Quick prototyping

For production use with multiple users, consider upgrading to:
- PostgreSQL with Prisma
- MongoDB
- Supabase
- Firebase

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

**Note**: The JSON storage won't persist between deployments on Vercel. You'll need to upgrade to a database for production.

### Other Platforms

This is a standard Next.js app and can be deployed to:
- Railway
- Render
- Netlify
- AWS Amplify
- DigitalOcean App Platform

## License

MIT

## Support

For questions or issues, please refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [PostHog Docs](https://posthog.com/docs)
- [Tally Docs](https://tally.so/help)
- [Slack API Docs](https://api.slack.com)
