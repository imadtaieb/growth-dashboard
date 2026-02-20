# Growth Dashboard - Complete Rebuild Guide

## 🎯 Project Overview

A Next.js dashboard that tracks weekly growth metrics (website visitors and waitlist signups) with automatic syncing from PostHog analytics.

---

## 📋 Tech Stack

- **Frontend/Backend**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Analytics**: PostHog (visitor tracking)
- **Deployment**: Vercel
- **UI**: React 19, Tailwind CSS, Recharts
- **Language**: TypeScript

---

## 🗄️ Database Schema (Supabase)

```sql
CREATE TABLE weekly_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  website_visitors INTEGER NOT NULL DEFAULT 0,
  waitlist_signups INTEGER NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_weekly_metrics_week_start ON weekly_metrics(week_start_date);
CREATE UNIQUE INDEX idx_weekly_metrics_unique_week ON weekly_metrics(week_start_date, week_end_date);
```

---

## 🔑 Required Environment Variables

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# PostHog (REQUIRED for visitor sync)
POSTHOG_API_KEY=phx_your_key_here
POSTHOG_PROJECT_ID=your_project_id_here
```

---

## 📁 Project Structure

```
growth-dashboard/
├── app/
│   ├── admin/sync/page.tsx         # Manual sync dashboard
│   ├── api/
│   │   ├── cron/sync-visitors/route.ts  # Cron endpoint
│   │   ├── metrics/route.ts        # GET/POST metrics
│   │   ├── metrics/[id]/route.ts   # GET/PUT/DELETE single metric
│   │   ├── sync/route.ts           # Integration status check
│   │   └── webhooks/posthog/route.ts    # PostHog webhook (optional)
│   ├── components/
│   │   ├── AddMetricForm.tsx
│   │   ├── GrowthChart.tsx
│   │   ├── MetricCard.tsx
│   │   └── MetricsTable.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # Main dashboard
├── lib/
│   ├── supabase.ts                 # Supabase client
│   ├── storage.ts                  # Database operations
│   ├── visitor-tracker.ts          # PostHog sync logic
│   ├── calculations.ts             # Metrics calculations
│   ├── types.ts                    # TypeScript types
│   └── integrations/
│       ├── posthog.ts              # PostHog API
│       ├── tally.ts                # (Optional) Tally integration
│       └── slack.ts                # (Optional) Slack integration
├── scripts/
│   ├── migrate-to-supabase.js      # Import JSON to Supabase
│   └── test-supabase-connection.js # Test Supabase setup
├── supabase/
│   └── schema.sql                  # Database schema
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🚀 Clean Setup Instructions

### 1. Create New Next.js Project

```bash
npx create-next-app@latest growth-dashboard
cd growth-dashboard
```

**Configuration:**
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ App Router
- ✅ `src/` directory: NO
- ✅ Import alias: `@/*`

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js date-fns recharts
npm install -D @types/node
```

### 3. Set Up Supabase

1. Go to https://supabase.com
2. Create new project (name: `growth-dashboard`)
3. Wait for initialization
4. Go to **SQL Editor** → **New Query**
5. Paste contents of `supabase/schema.sql`
6. Click **Run**
7. Go to **Settings** → **API**
8. Copy **Project URL** and **anon public key**
9. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

### 4. Set Up PostHog

1. Get your PostHog API key from Settings
2. Get your Project ID from URL
3. Add to `.env.local`:
   ```env
   POSTHOG_API_KEY=phx_xxx
   POSTHOG_PROJECT_ID=12345
   ```

### 5. Copy Core Files

**IMPORTANT:** Copy these files from the existing project:

```
lib/supabase.ts
lib/storage.ts
lib/visitor-tracker.ts
lib/integrations/posthog.ts
lib/calculations.ts
lib/types.ts
app/api/metrics/route.ts
app/api/metrics/[id]/route.ts
app/api/sync/route.ts
app/admin/sync/page.tsx
app/components/*.tsx
app/page.tsx
app/layout.tsx
```

### 6. Test Locally

```bash
npm run dev
```

Visit http://localhost:3000

---

## 🎨 Key Features

### 1. Dashboard Page (`app/page.tsx`)
- Weekly metrics table
- Growth chart (line/bar)
- Summary statistics
- Add metric form

### 2. Admin Sync Page (`app/admin/sync`)
- Manual sync button
- Integration status check
- Sync progress/results
- Real-time feedback

### 3. API Endpoints

**GET /api/metrics**
- Returns all metrics + dashboard stats

**POST /api/metrics**
- Create new metric
- Body: `{ weekStartDate, weekEndDate, websiteVisitors, waitlistSignups }`

**GET /api/metrics/[id]**
- Get single metric

**PUT /api/metrics/[id]**
- Update metric
- Auto-recalculates conversion rate

**GET /api/sync**
- Check integration status

**GET /api/cron/sync-visitors**
- Sync all metrics with PostHog
- Returns: `{ updated, skipped, failed, total }`

---

## 📊 How Visitor Syncing Works

### Data Flow:
```
PostHog (tracks pageviews)
    ↓
API Query (weekly visitor counts)
    ↓
Supabase (update visitor numbers)
    ↓
Dashboard (display updated metrics)
```

### Manual Sync:
1. Visit `/admin/sync`
2. Click "Start Sync"
3. System queries PostHog for each week
4. Updates Supabase with latest visitor counts
5. Recalculates conversion rates

### PostHog Query:
```javascript
{
  kind: 'EventsQuery',
  select: ['distinct_id', 'timestamp'],
  where: [
    `event = '$pageview'`,
    `timestamp >= '2025-01-01'`,
    `timestamp <= '2025-01-07 23:59:59'`
  ]
}
```

Counts unique `distinct_id` values = unique visitors

---

## 🚢 Deployment to Vercel

### Critical Setup Steps:

#### 1. Clean Git Repository
```bash
# Initialize fresh repo in project root
cd growth-dashboard
git init
git add .
git commit -m "Initial commit"
```

**IMPORTANT:** Make sure files are at ROOT level, not nested in subdirectories!

#### 2. Push to GitHub
```bash
git remote add origin https://github.com/yourusername/growth-dashboard.git
git branch -M main
git push -u origin main
```

#### 3. Deploy to Vercel

1. Go to https://vercel.com
2. Import project from GitHub
3. **Root Directory**: Leave EMPTY (or set to `.`)
4. **Build Settings**: Auto-detected (don't change)
5. **Environment Variables** - Add these:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   POSTHOG_API_KEY
   POSTHOG_PROJECT_ID
   ```
6. Click Deploy

### Common Deployment Issues & Fixes:

#### Issue: "No Next.js version detected"
**Cause:** Files nested in wrong directory in Git
**Fix:** Ensure `package.json` is at root of repository

#### Issue: "Module not found: '@/lib/...'"
**Cause:** Path alias not resolving
**Fix:** Verify `tsconfig.json` has correct paths configuration

#### Issue: "Missing Supabase environment variables" during build
**Cause:** Env vars checked at build time instead of runtime
**Fix:** In `lib/supabase.ts`, don't throw error - just create client with empty strings:
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);
```

Validate at runtime in storage functions instead.

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use NEXT_PUBLIC_ prefix** for client-side env vars
3. **Keep API keys** in Vercel environment variables
4. **Supabase RLS** - Already enabled in schema
5. **PostHog anon key** is safe for client-side use

---

## 📈 Data Migration

If you have existing data in JSON format:

```bash
node scripts/migrate-to-supabase.js
```

This will:
1. Read `data/metrics.json`
2. Upload to Supabase
3. Verify migration
4. Report results

---

## 🎯 Minimal Working Version

To get started quickly, you only need:

### Must Have:
- ✅ Supabase database (with schema)
- ✅ PostHog credentials
- ✅ 4 environment variables
- ✅ Core files: `lib/`, `app/api/`, `app/page.tsx`

### Optional:
- ❌ Cron jobs (can sync manually)
- ❌ Webhooks (can sync manually)
- ❌ Tally/Slack integrations
- ❌ GitHub Actions

**Minimal setup = Manual sync only via `/admin/sync`**

---

## 🧪 Testing Checklist

Before deploying:

- [ ] `npm run dev` works locally
- [ ] Visit `http://localhost:3000` - dashboard loads
- [ ] Visit `/admin/sync` - sync page works
- [ ] Click "Start Sync" - syncs successfully
- [ ] Add manual metric - saves to Supabase
- [ ] View in Supabase Table Editor - data appears
- [ ] `npm run build` - builds successfully
- [ ] No TypeScript errors
- [ ] All environment variables in `.env.local`

---

## 📝 TypeScript Types

```typescript
// lib/types.ts
export interface WeeklyMetrics {
  id: string;
  weekStartDate: string; // YYYY-MM-DD
  weekEndDate: string;
  websiteVisitors: number;
  waitlistSignups: number;
  conversionRate: number; // percentage
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalSignups: number;
  currentConversionRate: number;
  averageWeeklySignups: number;
  totalWeeks: number;
}
```

---

## 🐛 Known Issues & Solutions

### Issue: Vercel deployment fails with path errors
**Solution:** Delete `.git` folder, reinitialize, ensure all files at root

### Issue: PostHog returns 0 visitors
**Solution:** Check date format is `YYYY-MM-DD`, verify PostHog has data for those dates

### Issue: Supabase connection fails
**Solution:** Run `node scripts/test-supabase-connection.js` to verify credentials

### Issue: Build succeeds but runtime errors
**Solution:** Check browser console, verify env vars are set in Vercel

---

## 📚 Useful Commands

```bash
# Development
npm run dev

# Build (test before deploying)
npm run build

# Start production server locally
npm run start

# Test Supabase connection
node scripts/test-supabase-connection.js

# Migrate data to Supabase
node scripts/migrate-to-supabase.js

# Manual sync (via API)
curl http://localhost:3000/api/cron/sync-visitors
```

---

## 🔗 Important URLs

- **Supabase Dashboard**: https://app.supabase.com
- **PostHog**: https://app.posthog.com
- **Vercel**: https://vercel.com
- **GitHub**: https://github.com
- **Next.js Docs**: https://nextjs.org/docs

---

## 💡 Tips for Success

1. **Start fresh** - Use `create-next-app` for clean foundation
2. **Test locally first** - Don't deploy until it works locally
3. **One step at a time** - Set up Supabase, then PostHog, then deploy
4. **Check Git structure** - `git ls-files` should show files at root
5. **Use .env.local** for local development
6. **Use Vercel env vars** for production
7. **Test the build** - Run `npm run build` before deploying
8. **Keep it simple** - Start without cron jobs, add later if needed

---

## 🎉 Expected Final Result

After successful deployment:

- **Dashboard**: `https://your-app.vercel.app`
- **Admin Sync**: `https://your-app.vercel.app/admin/sync`
- **Features Working**:
  - ✅ View all weekly metrics
  - ✅ Add new metrics manually
  - ✅ Sync visitor counts from PostHog
  - ✅ Auto-calculate conversion rates
  - ✅ Beautiful charts and tables
  - ✅ Responsive design
  - ✅ Real-time updates

---

## 📞 Support Resources

- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **PostHog**: https://posthog.com/docs
- **Vercel**: https://vercel.com/docs
- **Tailwind**: https://tailwindcss.com/docs

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ Dashboard loads at Vercel URL
2. ✅ Can view existing metrics
3. ✅ Can add new metrics
4. ✅ Manual sync works from `/admin/sync`
5. ✅ PostHog visitor counts update correctly
6. ✅ No console errors
7. ✅ Data persists in Supabase

---

**Good luck with the rebuild! Follow these steps carefully and you'll have a clean, working deployment.** 🚀
