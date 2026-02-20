# Quick Setup Guide

## Immediate Use (No Setup Required)

Your dashboard is already running at **http://localhost:3000**

You can start using it right away with manual data entry:

1. Open http://localhost:3000
2. Click **"+ Add Week Data"**
3. Enter your weekly metrics
4. View your growth charts and analytics

## API Integration Setup (Optional)

If you want to automate data collection from PostHog, Tally, or Slack, follow these steps:

### Step 1: PostHog Setup

Get automatic website visitor tracking:

1. Go to https://posthog.com (free plan available)
2. Sign up and create a project
3. Navigate to **Settings → Project API Key**
4. Copy your **API Key** and **Project ID**
5. Create a `.env` file in your project root:
   ```bash
   cp .env.example .env
   ```
6. Add your credentials:
   ```
   POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
   POSTHOG_PROJECT_ID=12345
   ```

### Step 2: Tally/Slack Setup

Choose ONE of the following options for signup tracking:

#### Option A: Slack (Recommended if you get Tally notifications in Slack)

1. Go to https://api.slack.com/apps
2. Click **"Create New App"** → **"From scratch"**
3. Name it "Growth Dashboard" and select your workspace
4. Go to **OAuth & Permissions**
5. Add **"channels:history"** scope
6. Install to workspace
7. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
8. Get your channel ID:
   - Right-click your signup notifications channel
   - Click **"View channel details"**
   - Copy the channel ID from the bottom
9. Add to `.env`:
   ```
   SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxx
   SLACK_CHANNEL_ID=C01234ABCDE
   ```

#### Option B: Tally API (If you have Tally Pro)

1. Go to your Tally form
2. Click **Settings → Integrations → API**
3. Generate an API key
4. Add to `.env`:
   ```
   TALLY_API_KEY=tally_xxxxxxxxxxxxx
   ```

### Step 3: Test Your Integrations

Restart your development server:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

Check integration status:
```bash
curl http://localhost:3000/api/sync
```

You should see which integrations are configured.

### Step 4: Sync Data

Test the sync with a date range:
```bash
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -d '{
    "weekStartDate": "2024-02-12",
    "weekEndDate": "2024-02-18",
    "source": "auto"
  }'
```

## Next Steps

### For Production Deployment

1. **Database**: The app currently uses JSON file storage. For production, consider:
   - Supabase (easiest)
   - PostgreSQL with Prisma
   - MongoDB

2. **Environment Variables**: Set up your `.env` variables in your hosting platform

3. **Deploy**: Deploy to:
   - Vercel (recommended for Next.js)
   - Railway
   - Render
   - Netlify

### Customization Ideas

- Add more metrics (CAC, MRR, churn rate)
- Create weekly email reports
- Add goal tracking and projections
- Build a public dashboard for investors
- Add user authentication
- Export data to CSV/PDF

## Troubleshooting

### API calls returning 0 data
- Check your `.env` file has the correct credentials
- Verify API keys are valid
- Check the date range matches when you have data

### Dark mode not working
- It uses system preferences by default
- Your OS dark mode setting controls the theme

### Charts not showing
- Make sure you have at least 1 week of data entered
- Check browser console for errors

## Need Help?

1. Check the main README.md for detailed docs
2. Review the API integration files in `lib/integrations/`
3. Check PostHog/Tally/Slack API documentation

Happy tracking! 📈
