# Real-Time Visitor Sync - Implementation Summary

## What Was Created

A complete real-time visitor tracking system with multiple sync options:

### 1. **API Endpoints**

#### `/api/webhooks/posthog`
- Receives real-time events from PostHog
- Updates visitor counts immediately when pageviews occur
- Supports webhook authentication with `POSTHOG_WEBHOOK_SECRET`

#### `/api/cron/sync-visitors`
- Batch syncs all metrics with PostHog
- Designed for scheduled/periodic updates
- Returns detailed sync statistics
- Secured with `CRON_SECRET`

#### `/admin/sync` (New!)
- Visual admin dashboard
- Manual sync trigger with UI
- Status monitoring
- Real-time progress feedback

### 2. **Core Library**

#### `lib/visitor-tracker.ts`
Provides these functions:
- `syncAllMetricsWithPostHog()` - Sync all metrics
- `updateMetricVisitors(timestamp)` - Update specific week
- `syncMetricById(id)` - Update single metric
- `getSyncStatus()` - Get sync statistics

### 3. **Automation Configurations**

#### Vercel Cron (`vercel.json`)
```json
{
  "crons": [{
    "path": "/api/cron/sync-visitors",
    "schedule": "0 */6 * * *"
  }]
}
```
Automatically runs every 6 hours on Vercel deployments.

#### GitHub Actions (`.github/workflows/sync-visitors.yml`)
- Scheduled workflow running every 6 hours
- Can be manually triggered
- Works with any deployment platform

### 4. **Manual Sync Script**

#### `scripts/update-visitors-from-posthog.js`
On-demand script for manual syncing:
```bash
node scripts/update-visitors-from-posthog.js
```

### 5. **Documentation**

- **REAL_TIME_SYNC_SETUP.md** - Comprehensive setup guide
- **QUICK_START_SYNC.md** - 5-minute quick start
- **SYNC_SUMMARY.md** - This file

---

## How It Works

### Webhook Flow (Real-Time)
```
User visits website
  → PostHog captures pageview
  → PostHog sends webhook to your app
  → `/api/webhooks/posthog` receives event
  → `updateMetricVisitors()` updates the week's count
  → Dashboard shows updated data
```

### Cron Flow (Scheduled)
```
Scheduled trigger (every 6 hours)
  → `/api/cron/sync-visitors` called
  → `syncAllMetricsWithPostHog()` runs
  → For each metric:
    - Fetch latest count from PostHog
    - Compare with current count
    - Update if changed
  → Returns sync statistics
```

### Manual Flow
```
User visits /admin/sync
  → Clicks "Start Sync"
  → Calls `/api/cron/sync-visitors`
  → Shows progress and results
  → Dashboard updates
```

---

## Environment Variables

Required in `.env` and production:

```env
# PostHog Integration
POSTHOG_API_KEY=phc_your_key
POSTHOG_PROJECT_ID=12345

# Security (optional but recommended)
POSTHOG_WEBHOOK_SECRET=random_string_abc123
CRON_SECRET=random_string_xyz789
```

---

## Deployment Checklist

### For Vercel:
- ✅ Add environment variables to Vercel dashboard
- ✅ Deploy with `vercel --prod`
- ✅ Vercel cron automatically enabled via `vercel.json`
- ✅ Monitor cron execution in Vercel logs

### For GitHub Actions:
- ✅ Add `APP_URL` and `CRON_SECRET` to GitHub secrets
- ✅ Workflow runs automatically every 6 hours
- ✅ Can trigger manually from Actions tab

### For PostHog Webhook:
- ✅ Deploy app to public URL
- ✅ Configure webhook in PostHog settings
- ✅ Set webhook URL: `https://your-domain.com/api/webhooks/posthog`
- ✅ Select `$pageview` events
- ✅ (Optional) Add authorization header

---

## Testing Commands

```bash
# Check integration status
curl http://localhost:3002/api/sync

# Test webhook endpoint
curl http://localhost:3002/api/webhooks/posthog

# Trigger sync (with auth)
curl -H "Authorization: Bearer YOUR_SECRET" \
  http://localhost:3002/api/cron/sync-visitors

# Manual sync via script
node scripts/update-visitors-from-posthog.js
```

---

## Benefits

### Real-Time Updates (Webhook)
- ✅ Instant visitor count updates
- ✅ No polling or scheduled delays
- ✅ Efficient - only updates when needed

### Scheduled Sync (Cron)
- ✅ Reliable backup if webhooks fail
- ✅ Catches missed events
- ✅ Ensures data accuracy
- ✅ No manual intervention

### Manual Sync (Admin Dashboard)
- ✅ On-demand updates
- ✅ Visual feedback
- ✅ Useful for debugging
- ✅ No command line needed

### Best Practice: Use All Three!
Combine webhook + cron for maximum reliability, with manual sync as backup.

---

## Customization

### Change Sync Frequency

Edit `vercel.json`:
```json
{
  "crons": [{
    "schedule": "0 * * * *"  // Every hour
  }]
}
```

Or `.github/workflows/sync-visitors.yml`:
```yaml
schedule:
  - cron: '0 * * * *'  # Every hour
```

### Add Rate Limiting

Edit `lib/visitor-tracker.ts` line 72:
```typescript
await new Promise(resolve => setTimeout(resolve, 500)); // Increase delay
```

### Custom PostHog Queries

Modify `lib/integrations/posthog.ts` to change query logic.

---

## Monitoring

### Check Sync Health
Visit `/admin/sync` to see:
- Integration status
- Last sync time
- Success/failure counts

### View Logs

**Vercel:**
- Dashboard → Logs → Filter by endpoint

**GitHub Actions:**
- Actions tab → Workflow runs

**Local:**
- Check terminal output when running dev server

---

## Next Steps

1. ✅ Set up environment variables
2. ✅ Test locally with `/admin/sync`
3. ✅ Deploy to production
4. ✅ Configure webhook or cron (or both!)
5. ✅ Monitor first few syncs
6. ✅ Verify data accuracy

---

## Support

- **Quick Start**: See QUICK_START_SYNC.md
- **Full Guide**: See REAL_TIME_SYNC_SETUP.md
- **PostHog Docs**: https://posthog.com/docs
- **Vercel Cron**: https://vercel.com/docs/cron-jobs

Enjoy automatic visitor tracking! 🚀
