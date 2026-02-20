# Supabase Setup Guide

## Step-by-Step Guide to Set Up Supabase for Your Growth Dashboard

### ⏱️ Total Time: ~10 minutes

---

## Step 1: Create Supabase Account (2 minutes)

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

---

## Step 2: Create a New Project (1 minute)

1. Click **"New Project"**
2. Fill in:
   - **Name**: `growth-dashboard` (or any name you like)
   - **Database Password**: Choose a strong password (save it somewhere safe!)
   - **Region**: Select closest to you (e.g., `US East` if you're in North America)
   - **Pricing Plan**: Select **"Free"** ✅

3. Click **"Create new project"**
4. Wait ~2 minutes for project to initialize ☕

---

## Step 3: Create the Database Table (3 minutes)

1. In your Supabase project, click **"SQL Editor"** in the left sidebar

2. Click **"New query"**

3. Copy and paste the entire contents of `supabase/schema.sql` into the editor

4. Click **"Run"** (or press Cmd/Ctrl + Enter)

5. You should see: ✅ **"Success. No rows returned"**

---

## Step 4: Get Your API Credentials (1 minute)

1. Click **"Settings"** (gear icon) in the left sidebar

2. Click **"API"** under Project Settings

3. You'll see two important values:

   **Project URL:**
   ```
   https://abcdefghijklmnop.supabase.co
   ```

   **anon/public key:** (click "Reveal" to see it)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Copy these values** - you'll need them in the next step!

---

## Step 5: Add to Your .env File (1 minute)

1. Open your `.env` file in the project root

2. Add these two lines at the top:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. Replace with your actual values from Step 4

4. Save the file

---

## Step 6: Migrate Your Existing Data (2 minutes)

If you have existing data in `data/metrics.json`, let's migrate it to Supabase:

1. Make sure your `.env` file has the Supabase credentials

2. Run the migration script:

   ```bash
   node scripts/migrate-to-supabase.js
   ```

3. You should see:
   ```
   📦 Starting migration to Supabase...
   📊 Found X metrics in JSON file
   ⬆️  Uploading to Supabase...
      ✅ Uploaded batch 1: X records
   🎉 Migration completed successfully!
   ```

---

## Step 7: Test Locally (1 minute)

1. Restart your dev server:

   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. Visit http://localhost:3002

3. Your dashboard should load with all your data! ✅

4. Try adding a new metric to verify writes work

---

## Step 8: Verify in Supabase Dashboard (Optional)

1. In Supabase, click **"Table Editor"** in the left sidebar

2. Click on **"weekly_metrics"** table

3. You should see all your data! 🎉

4. You can:
   - View data
   - Edit records directly
   - Add new records
   - Export to CSV

---

## 🎉 Done!

Your Growth Dashboard is now using Supabase!

### ✅ What You Get:

- **Persistent storage** - Data survives deployments
- **Backup & export** - Download CSV anytime
- **Visual editor** - Edit data in browser
- **SQL queries** - Run custom analytics
- **Real-time updates** - If you want them later
- **Free tier** - 500 MB database storage

---

## 🚀 Deploy to Vercel

Now that Supabase is set up, you can deploy to Vercel:

### In Vercel:

1. Go to your project settings → **Environment Variables**

2. Add these two variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key_here
   ```

3. **Important**: Make sure you also add your PostHog variables:
   ```
   POSTHOG_API_KEY = phc_your_key
   POSTHOG_PROJECT_ID = your_project_id
   CRON_SECRET = your_random_secret
   ```

4. Deploy!

---

## 📊 Supabase Free Tier Limits

You get **for FREE**:

- ✅ 500 MB database storage
- ✅ Unlimited API requests
- ✅ 50,000 monthly active users
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth
- ✅ Automatic backups (7 days)

**Note**: Projects pause after 1 week of inactivity, but resume instantly when accessed.

---

## 🔒 Security Notes

1. **anon key is safe to expose** - It's designed for client-side use
2. **Row Level Security (RLS)** is enabled - The schema sets this up
3. **Never commit your `.env` file** - Already in `.gitignore`

---

## 🆘 Troubleshooting

### Error: "Missing Supabase environment variables"

- Check that `.env` has both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after adding them

### Error: "relation 'weekly_metrics' does not exist"

- You need to run the schema.sql file in Supabase SQL Editor
- Go to Step 3 above

### Migration script fails

- Make sure you've created the table first (Step 3)
- Check that your Supabase credentials are correct
- Verify `.env` file has the right values

### Data not showing in dashboard

- Check Supabase Table Editor to see if data is there
- Look for errors in browser console (F12)
- Verify `.env` variables are set correctly

---

## 💡 Next Steps

1. ✅ Test locally - Make sure everything works
2. ✅ Deploy to Vercel - Your data will persist!
3. ✅ Set up PostHog sync - Automatic visitor updates
4. ✅ Enjoy your dashboard! 🎉

---

## 📚 Useful Links

- **Supabase Dashboard**: https://app.supabase.com
- **Supabase Docs**: https://supabase.com/docs
- **SQL Editor**: View and run queries
- **Table Editor**: Visual database browser
- **API Docs**: Auto-generated API documentation

---

## 🔄 Backup Your Data

To export your data from Supabase:

1. Go to **Table Editor** → **weekly_metrics**
2. Click the **"..."** menu
3. Select **"Export to CSV"**
4. Save the file

You can also use the SQL Editor:

```sql
SELECT * FROM weekly_metrics
ORDER BY week_start_date;
```

Then copy the results!

---

## Need Help?

If you run into issues:

1. Check the Supabase docs: https://supabase.com/docs
2. Check the migration script output for errors
3. Look at browser console for client-side errors
4. Check Supabase project logs in dashboard

Happy tracking! 📈
