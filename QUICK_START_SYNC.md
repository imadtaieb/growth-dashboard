# Quick Start: Real-Time Visitor Sync

## TL;DR - Get Started in 5 Minutes

### 1. Set Environment Variables

Add to your `.env` file:
```env
POSTHOG_API_KEY=phc_your_key_here
POSTHOG_PROJECT_ID=your_project_id_here
CRON_SECRET=any_random_secret_string_123
```

### 2. Test Locally

```bash
# Start your dev server
npm run dev

# In another terminal, test the sync
curl http://localhost:3002/api/cron/sync-visitors
```

### 3. Use the Admin Dashboard

Visit: **http://localhost:3002/admin/sync**

Click "Start Sync" to manually update all visitor counts!

---

## Production Setup (Choose One)

### Option A: Vercel (Easiest)

1. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

2. Add environment variables in Vercel dashboard:
   - `POSTHOG_API_KEY`
   - `POSTHOG_PROJECT_ID`
   - `CRON_SECRET`

3. **Done!** Vercel automatically runs sync every 6 hours using `vercel.json`

### Option B: GitHub Actions

1. Add secrets to GitHub repo:
   - `APP_URL` = your deployed URL
   - `CRON_SECRET` = your secret

2. **Done!** Workflow runs every 6 hours automatically

### Option C: PostHog Webhook

1. Deploy your app

2. In PostHog:
   - Settings → Webhooks → Create
   - URL: `https://your-domain.com/api/webhooks/posthog`
   - Events: `$pageview`

3. **Done!** Real-time updates on every pageview

---

## Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/cron/sync-visitors` | GET | Sync all metrics with PostHog |
| `/api/webhooks/posthog` | POST | Receive PostHog webhook events |
| `/api/sync` | GET | Check integration status |
| `/admin/sync` | GET | Admin dashboard for manual sync |

---

## Testing

```bash
# Check if PostHog is configured
curl http://localhost:3002/api/sync

# Manually trigger sync
curl http://localhost:3002/api/cron/sync-visitors

# Check webhook health
curl http://localhost:3002/api/webhooks/posthog
```

---

## Troubleshooting

**Problem: No data updating**
- ✅ Check `.env` has correct PostHog credentials
- ✅ Verify PostHog API key has read permissions
- ✅ Test endpoint: `curl http://localhost:3002/api/sync`

**Problem: Cron not running**
- ✅ Check `CRON_SECRET` is set in production
- ✅ Verify Vercel cron is enabled
- ✅ Check GitHub Actions secrets are configured

**Problem: Webhook not working**
- ✅ Ensure app is publicly accessible
- ✅ Check PostHog webhook configuration
- ✅ Verify webhook URL is correct

---

## Need More Details?

See **REAL_TIME_SYNC_SETUP.md** for comprehensive setup guide with all options.
