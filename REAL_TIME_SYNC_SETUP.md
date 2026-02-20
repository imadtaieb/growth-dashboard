# Real-Time Visitor Tracking Setup Guide

This guide explains how to set up automatic, real-time visitor tracking from PostHog.

## Overview

You have **three options** for keeping visitor data updated:

1. **PostHog Webhook** (Real-time, event-driven)
2. **Scheduled Cron Jobs** (Periodic syncing every few hours)
3. **Manual Script** (Run on-demand when needed)

You can use one or combine multiple methods!

---

## Option 1: PostHog Webhook (Real-Time Updates)

This provides the most real-time updates by receiving events directly from PostHog.

### Setup Steps:

#### 1. Configure Environment Variables

Add to your `.env` file:
```env
POSTHOG_API_KEY=phc_your_actual_key
POSTHOG_PROJECT_ID=your_project_id
POSTHOG_WEBHOOK_SECRET=your_random_secret_123  # Generate a random string
```

#### 2. Deploy Your Application

Your app must be publicly accessible. Deploy to:
- Vercel (recommended)
- Railway
- Render
- Any platform with a public URL

#### 3. Configure PostHog Webhook

1. Log into PostHog → **Project Settings** → **Webhooks**
2. Click **"Create Webhook"**
3. Configure:
   - **Webhook URL**: `https://your-domain.com/api/webhooks/posthog`
   - **Events to send**: Select `$pageview`
   - **Message format**: JSON
4. (Optional) Add your `POSTHOG_WEBHOOK_SECRET` to PostHog webhook headers:
   - Header name: `Authorization`
   - Value: `Bearer your_random_secret_123`
5. Click **"Create"**

#### 4. Test the Webhook

Visit your website to generate a pageview, then check:
```bash
curl https://your-domain.com/api/webhooks/posthog
```

You should see:
```json
{
  "status": "active",
  "endpoint": "PostHog Webhook",
  "configured": true,
  "secured": true
}
```

### How It Works:
- Every time someone visits your website, PostHog sends an event
- Your webhook endpoint receives it and updates the relevant week's visitor count
- Dashboard shows updated numbers in real-time

---

## Option 2: Scheduled Cron Jobs (Periodic Syncing)

Automatically sync visitor data every few hours using scheduled tasks.

### Method A: Vercel Cron (Easiest for Vercel)

Already configured! The `vercel.json` file includes:
```json
{
  "crons": [{
    "path": "/api/cron/sync-visitors",
    "schedule": "0 */6 * * *"  // Every 6 hours
  }]
}
```

#### Setup:
1. Add to `.env` (or Vercel environment variables):
   ```env
   CRON_SECRET=your_random_cron_secret_456
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

3. Vercel automatically runs the sync every 6 hours!

#### Customize Schedule:
Edit `vercel.json` to change frequency:
- `0 * * * *` - Every hour
- `0 */3 * * *` - Every 3 hours
- `0 0 * * *` - Daily at midnight
- `0 0 * * 0` - Weekly on Sundays

### Method B: GitHub Actions (Works with any platform)

Already configured in `.github/workflows/sync-visitors.yml`!

#### Setup:

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

2. Add these secrets:
   - `APP_URL`: Your deployed app URL (e.g., `https://growth-dashboard.vercel.app`)
   - `CRON_SECRET`: Same secret from your `.env` file

3. Enable GitHub Actions in your repository

4. The workflow runs automatically every 6 hours!

#### Manual Trigger:
You can also trigger manually:
1. Go to **Actions** tab in GitHub
2. Select **"Sync Visitors from PostHog"**
3. Click **"Run workflow"**

### Method C: External Cron Service

Use services like cron-job.org or EasyCron:

1. Create account at [cron-job.org](https://cron-job.org)

2. Create new cron job:
   - **URL**: `https://your-domain.com/api/cron/sync-visitors`
   - **Schedule**: Every 6 hours (or your preference)
   - **Request method**: GET
   - **Headers**:
     ```
     Authorization: Bearer your_cron_secret_456
     ```

3. Save and activate

---

## Option 3: Manual Script (On-Demand)

Run the sync script whenever you want to update data.

### Usage:

```bash
# Make sure your dev server is running
npm run dev

# In another terminal, run the sync script
node scripts/update-visitors-from-posthog.js
```

### What it does:
1. Fetches all metrics from your dashboard
2. For each week, queries PostHog for visitor count
3. Updates metrics with latest data
4. Shows progress and results

---

## Testing Your Setup

### 1. Check Integration Status

```bash
curl https://your-domain.com/api/sync
```

Should return:
```json
{
  "integrations": {
    "posthog": true,
    "tally": false,
    "slack": false
  }
}
```

### 2. Test Webhook Endpoint

```bash
curl https://your-domain.com/api/webhooks/posthog
```

### 3. Test Cron Endpoint

```bash
curl -H "Authorization: Bearer your_cron_secret" \
  https://your-domain.com/api/cron/sync-visitors
```

Should return sync results:
```json
{
  "success": true,
  "results": {
    "updated": 5,
    "skipped": 10,
    "failed": 0,
    "total": 15
  }
}
```

### 4. Manual Trigger Sync

Visit a test page or use the manual script to verify data updates.

---

## Environment Variables Summary

Create a `.env` file with these variables:

```env
# Required for all methods
POSTHOG_API_KEY=phc_your_key
POSTHOG_PROJECT_ID=12345

# For webhook (optional but recommended)
POSTHOG_WEBHOOK_SECRET=random_string_abc123

# For cron jobs (required for scheduled syncing)
CRON_SECRET=random_string_xyz789
```

### Generate Secure Secrets:

```bash
# On Mac/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Recommended Setup

For production, use **Scheduled Cron + Webhook** together:

1. **Webhook** for immediate updates when users visit
2. **Cron Job** as backup to catch any missed events (every 6 hours)

This ensures your data is always accurate!

---

## Monitoring & Troubleshooting

### Check Logs

**Vercel:**
- Go to your project dashboard → **Logs**
- Filter by `/api/cron/sync-visitors` or `/api/webhooks/posthog`

**GitHub Actions:**
- Go to **Actions** tab
- Click on the workflow run to see logs

### Common Issues

**Issue: Unauthorized error**
- Check that `CRON_SECRET` or `POSTHOG_WEBHOOK_SECRET` matches in both `.env` and webhook/cron service

**Issue: PostHog not configured**
- Verify `POSTHOG_API_KEY` and `POSTHOG_PROJECT_ID` are set correctly
- Test with: `curl https://your-domain.com/api/sync`

**Issue: No data updating**
- Check PostHog webhook is active and sending events
- Verify your app URL is publicly accessible
- Check logs for error messages

**Issue: Rate limiting**
- The sync includes 100ms delays between requests
- If you have many weeks, consider increasing the delay in `lib/visitor-tracker.ts`

---

## Security Best Practices

1. **Always use secrets** for webhook and cron endpoints
2. **Never commit** `.env` to Git (already in `.gitignore`)
3. **Use environment variables** in production (Vercel, Railway, etc.)
4. **Rotate secrets** periodically
5. **Monitor logs** for suspicious activity

---

## Next Steps

1. Choose your preferred sync method(s)
2. Configure environment variables
3. Deploy your application
4. Set up webhook or cron job
5. Test to verify it's working
6. Monitor logs to ensure regular updates

Questions? Check the main README.md or open an issue on GitHub!
