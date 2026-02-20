# Growth Dashboard - Quick Rebuild Checklist

## ⚡ Fast Track Setup (30 minutes)

### Step 1: Create New Project (5 min)
```bash
npx create-next-app@latest growth-dashboard
cd growth-dashboard
npm install @supabase/supabase-js date-fns recharts
```

### Step 2: Supabase Setup (5 min)
- [ ] Create account at https://supabase.com
- [ ] Create project: `growth-dashboard`
- [ ] Go to SQL Editor
- [ ] Run `supabase/schema.sql` from old project
- [ ] Get credentials from Settings → API
- [ ] Add to `.env.local`:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
  POSTHOG_API_KEY=phx_xxx
  POSTHOG_PROJECT_ID=12345
  ```

### Step 3: Copy Core Files (10 min)
Copy from old project to new:
- [ ] `lib/supabase.ts`
- [ ] `lib/storage.ts`
- [ ] `lib/visitor-tracker.ts`
- [ ] `lib/integrations/posthog.ts`
- [ ] `lib/calculations.ts`
- [ ] `lib/types.ts`
- [ ] `app/api/` (entire folder)
- [ ] `app/admin/sync/page.tsx`
- [ ] `app/components/` (entire folder)
- [ ] `app/page.tsx`
- [ ] Update `app/layout.tsx` if needed

### Step 4: Test Locally (5 min)
```bash
npm run dev
```
- [ ] Visit http://localhost:3000
- [ ] Visit http://localhost:3000/admin/sync
- [ ] Click "Start Sync"
- [ ] Verify data appears

### Step 5: Deploy to Vercel (5 min)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/growth-dashboard.git
git push -u origin main
```

Then in Vercel:
- [ ] Import GitHub repo
- [ ] Root Directory: leave EMPTY
- [ ] Add 4 environment variables
- [ ] Deploy

---

## 🔑 The 4 Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
POSTHOG_API_KEY
POSTHOG_PROJECT_ID
```

---

## ⚠️ Critical: Avoid These Mistakes

1. ❌ **Don't nest files** - Keep everything at project root
2. ❌ **Don't set Root Directory** in Vercel (leave empty)
3. ❌ **Don't throw errors** in `lib/supabase.ts` at build time
4. ❌ **Don't forget** to add env vars in Vercel
5. ❌ **Don't commit** `.env` files

---

## ✅ Success Signs

- Dashboard loads
- Can add metrics
- Manual sync works
- No console errors
- Data in Supabase

---

## 🆘 If Deployment Fails

1. Run `npm run build` locally first
2. Check `git ls-files` shows files at root
3. Verify all 4 env vars in Vercel
4. Check Vercel build logs for specific error
5. Compare with `PROJECT_REBUILD_GUIDE.md`

---

**That's it! Follow this checklist and you'll have a clean deployment.** 🎯
