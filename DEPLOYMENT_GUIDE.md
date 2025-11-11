# 🚀 Deployment Guide - ViralFlow

**Complete guide for deploying ViralFlow to production**

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:
- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] API keys secured
- [ ] Tests passing
- [ ] Documentation updated

---

## 🌐 Vercel Deployment (Recommended)

### Step 1: Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository

### Step 2: Configure Project
- **Framework Preset:** Next.js
- **Root Directory:** `./` (root)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Step 3: Environment Variables
Add all variables from `.env.local`:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Visit your deployment URL

### Step 5: Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records
4. SSL will be auto-configured

---

## 🔄 Setting Up Cron Jobs

### Vercel Cron
Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/scheduled-posts/process",
      "schedule": "*/1 * * * *"
    }
  ]
}
```

### External Cron (Alternative)
Use services like:
- **Cron-job.org**
- **EasyCron**
- **GitHub Actions**

**Example GitHub Actions:**
```yaml
name: Process Scheduled Posts
on:
  schedule:
    - cron: '*/1 * * * *'
  workflow_dispatch:
jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - name: Call API
        run: |
          curl -X POST https://your-app.vercel.app/api/scheduled-posts/process
```

---

## 🗄️ Database Setup

### Supabase Production
1. Create production project
2. Run `supabase-schema.sql`
3. Configure RLS policies
4. Set up backups
5. Enable real-time subscriptions

### Environment Variables
Update production environment variables with production Supabase credentials.

---

## 💳 Stripe Configuration

### Production Keys
1. Get production keys from Stripe Dashboard
2. Add to environment variables
3. Configure webhook endpoint:
   - URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Events: All payment events

### Webhook Security
Verify webhook signatures:
```typescript
const signature = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

---

## 📊 Monitoring Setup

### Error Tracking
**Sentry:**
1. Create Sentry project
2. Install: `npm install @sentry/nextjs`
3. Configure in `sentry.client.config.ts`
4. Add `SENTRY_DSN` to environment

### Analytics
**Vercel Analytics:**
- Automatically enabled
- View in Vercel dashboard

**Custom Analytics:**
- Google Analytics
- PostHog
- Mixpanel

---

## 🔐 Security Hardening

### Headers
Add to `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ];
}
```

### Rate Limiting
Implement rate limiting on API routes:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

---

## 🧪 Post-Deployment Testing

### Smoke Tests
1. **Homepage loads**
   ```bash
   curl https://your-app.vercel.app
   ```

2. **API endpoints work**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

3. **Database connection**
   - Test user registration
   - Test content creation

4. **Payment flow**
   - Test checkout (test mode)
   - Verify webhooks

### Performance Tests
- Page load time < 3s
- API response < 200ms
- Database queries optimized

---

## 🔄 Continuous Deployment

### GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📈 Scaling Considerations

### Database
- Monitor query performance
- Add indexes as needed
- Consider read replicas at scale

### API
- Implement caching (Redis)
- Use CDN for static assets
- Monitor API usage

### Background Jobs
- Use queue system (Bull, BullMQ)
- Scale workers as needed
- Monitor job processing

---

## 🆘 Troubleshooting

### Build Failures
- Check environment variables
- Verify dependencies
- Review build logs

### Runtime Errors
- Check error tracking (Sentry)
- Review logs
- Test locally

### Database Issues
- Verify connection string
- Check RLS policies
- Review query performance

---

## 📝 Post-Deployment

### Monitoring
- Set up alerts
- Monitor error rates
- Track performance metrics

### Documentation
- Update deployment docs
- Document any issues
- Share with team

### User Communication
- Announce launch
- Share documentation
- Collect feedback

---

**Last Updated:** 2024  
**Version:** 1.0.0

