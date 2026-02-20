# Deployment Guide

## Quick Deploy to Vercel (Recommended)

Vercel is made by the creators of Next.js and offers the best deployment experience.

### Steps:

1. **Initialize Git** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Growth dashboard"
   ```

2. **Push to GitHub**:
   ```bash
   # Create a new repo on GitHub, then:
   git remote add origin https://github.com/yourusername/growth-dashboard.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Add environment variables (if using integrations):
     - `POSTHOG_API_KEY`
     - `POSTHOG_PROJECT_ID`
     - `TALLY_API_KEY`
     - `SLACK_BOT_TOKEN`
     - `SLACK_CHANNEL_ID`
   - Click "Deploy"

### ⚠️ Important: Database Consideration

The current JSON file storage **won't persist** between deployments on Vercel. You have two options:

#### Option A: Use Vercel Postgres (Recommended for Production)

1. Go to your Vercel project
2. Navigate to **Storage → Create Database → Postgres**
3. Connect to your project
4. Update `lib/storage.ts` to use Postgres instead of JSON

#### Option B: Keep Using JSON (Quick & Dirty)

Use Vercel's KV store or deploy to a platform with persistent storage:
- Railway (has persistent volumes)
- DigitalOcean App Platform
- Self-hosted VPS

## Alternative Deployments

### Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables
5. Railway will auto-detect Next.js and deploy

**Advantage**: Persistent file storage works out of the box!

### Render

1. Go to https://render.com
2. Click "New Web Service"
3. Connect your GitHub repo
4. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables
6. Deploy

### Netlify

1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub repo
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables
6. Deploy

## Environment Variables for Production

Make sure to set these in your hosting platform:

### Required for Basic Functionality
None! The dashboard works without any integrations.

### Optional Integrations

**PostHog** (for automatic visitor tracking):
```
POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
POSTHOG_PROJECT_ID=12345
```

**Tally** (for signup tracking):
```
TALLY_API_KEY=tally_xxxxxxxxxxxxx
```

**Slack** (for signup tracking):
```
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxx
SLACK_CHANNEL_ID=C01234ABCDE
```

OR

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz
```

## Database Migration (For Production)

To move from JSON to a real database, here's the recommended approach:

### Using Prisma + PostgreSQL

1. Install Prisma:
   ```bash
   npm install @prisma/client
   npm install -D prisma
   ```

2. Initialize Prisma:
   ```bash
   npx prisma init
   ```

3. Update `schema.prisma`:
   ```prisma
   model WeeklyMetrics {
     id              String   @id @default(cuid())
     weekStartDate   String
     weekEndDate     String
     websiteVisitors Int
     waitlistSignups Int
     conversionRate  Float
     createdAt       DateTime @default(now())
     updatedAt       DateTime @updatedAt
   }
   ```

4. Update `lib/storage.ts` to use Prisma instead of JSON

5. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

### Using Supabase (Easiest)

1. Create account at https://supabase.com
2. Create new project
3. Get database URL from project settings
4. Follow Prisma steps above with Supabase connection string

## Custom Domain

### Vercel
1. Go to project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Other Platforms
Similar process - check their documentation for custom domains.

## Monitoring & Analytics

### Built-in Next.js Analytics

Vercel offers free analytics:
1. Enable in Vercel dashboard
2. See page views, performance metrics
3. Track Core Web Vitals

### Error Monitoring

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- PostHog for product analytics

## Security Checklist

- [ ] Never commit `.env` file (already in .gitignore)
- [ ] Use environment variables for all API keys
- [ ] Enable HTTPS (automatic on Vercel/Netlify/Render)
- [ ] Consider adding authentication if dashboard will be public
- [ ] Set up rate limiting for API routes
- [ ] Review and update dependencies regularly

## Performance Tips

1. **Enable caching** for API routes
2. **Optimize images** if you add any
3. **Use ISR** (Incremental Static Regeneration) for stats
4. **Add loading states** for better UX
5. **Implement pagination** when you have many weeks of data

## Backup Strategy

If using JSON storage:
- Set up automated backups of `data/metrics.json`
- Consider using GitHub to version your data

If using a database:
- Enable automated backups in your database provider
- Export data weekly as CSV

## Need Help?

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
