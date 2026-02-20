# Supabase Quick Start - TL;DR

## 🚀 Get Supabase Running in 10 Minutes

### 1. Create Supabase Project

1. Go to https://supabase.com → Sign up
2. Create new project (name: `growth-dashboard`, free tier)
3. Wait 2 minutes for initialization

### 2. Create Database Table

1. In Supabase → Click **SQL Editor**
2. Click **New query**
3. Copy/paste ALL of `supabase/schema.sql`
4. Click **Run**

### 3. Get Your Credentials

1. Supabase → **Settings** → **API**
2. Copy:
   - **Project URL**
   - **anon public** key (click "Reveal")

### 4. Add to .env

Add these lines to your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5. Migrate Existing Data

```bash
node scripts/migrate-to-supabase.js
```

### 6. Test It!

```bash
npm run dev
```

Visit http://localhost:3002 - Your data should be there! ✅

---

## That's It!

Your dashboard now uses Supabase. Data persists forever, even when you deploy to Vercel.

### Next Steps:

1. Deploy to Vercel (add Supabase env vars there too)
2. Your cron jobs will automatically sync visitor data
3. Everything works the same, but better! 🎉

**Full guide**: See `SUPABASE_SETUP.md` for detailed instructions.
