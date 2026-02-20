# 🚀 Smart Task Manager - Vercel Migration Summary

## ✅ What Has Been Done

Your Smart Task Manager has been configured for Vercel deployment with the following changes:

### 📁 New Files Created:

1. **`/api/index.js`** - Main serverless function for Express routes
2. **`/api/telegram-webhook.js`** - Telegram webhook handler (replaces polling)
3. **`/api/cron-notifications.js`** - Scheduled notifications (replaces node-cron)
4. **`/vercel.json`** - Vercel configuration with routing and cron setup
5. **`/.env.vercel.example`** - Template for environment variables
6. **`/VERCEL_DEPLOYMENT.md`** - Complete deployment guide
7. **`/DATABASE_MIGRATION.md`** - Database provider options
8. **`/DEPLOYMENT_CHECKLIST.md`** - Step-by-step checklist
9. **`/setup-telegram-webhook.sh`** - Script to setup Telegram webhook
10. **`/test-deployment.sh`** - Script to test your deployment

### 🔧 Modified Files:

1. **`/src/config/database.js`** - Updated to support PlanetScale and other providers with SSL
2. **`/.gitignore`** - Added Vercel and development files

### 🏗️ Architecture Changes:

#### Before (Railway):
```
Traditional Server
├── Express app running 24/7
├── Telegram bot polling
├── Node-cron for scheduled tasks
└── Railway MySQL
```

#### After (Vercel):
```
Serverless Functions
├── API routes as serverless functions
├── Telegram webhook (no polling)
├── Vercel Cron Jobs (hourly notifications)
└── External MySQL (PlanetScale/Railway/Aiven)
```

---

## 📋 What You Need To Do Now

### 1️⃣ Choose & Setup Database (Required)

**Recommended: PlanetScale (Free tier, MySQL compatible)**

```bash
# Sign up at https://planetscale.com
# Create database: smart-task-manager
# Import schema using PlanetScale CLI or dashboard
pscale shell smart-task-manager main < database/schema-mysql.sql

# Get DATABASE_URL from dashboard
# Format: mysql://user:pass@host.psdb.cloud/db?sslaccept=strict
```

**Alternative: Keep Railway for database only**
- Keep MySQL service on Railway
- Remove backend service
- Use Railway MySQL credentials with Vercel

See [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) for all options.

---

### 2️⃣ Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts and note your deployment URL
# Example: https://smart-task-manager-xyz.vercel.app
```

---

### 3️⃣ Add Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

**Required variables:**
```bash
# Database (choose one format based on your provider)
DATABASE_URL=mysql://user:pass@host.psdb.cloud/db?sslaccept=strict

# OR individual variables:
MYSQL_HOST=your-host.com
MYSQL_PORT=3306
MYSQL_USER=username
MYSQL_PASSWORD=password
MYSQL_DATABASE=database_name
MYSQL_SSL=true

# Authentication & AI
JWT_SECRET=your-super-secret-key-change-this
GEMINI_API_KEY=your-gemini-api-key

# Telegram
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Security
CRON_SECRET=generate-random-secret-here

# Environment
NODE_ENV=production
```

**Optional (for email notifications):**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=TaskMind <your-email@gmail.com>
```

---

### 4️⃣ Setup Telegram Webhook

After deploying, run the helper script:

```bash
# Make it executable (if not already)
chmod +x setup-telegram-webhook.sh

# Run the script
./setup-telegram-webhook.sh

# Or manually:
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-app.vercel.app/api/telegram-webhook"}'
```

---

### 5️⃣ Deploy Frontend

```bash
# Navigate to client folder
cd client

# Update API URL in src/services/api.js
# Change baseURL to your Vercel backend URL

# Deploy
vercel

# Add environment variable in Vercel (client project):
VITE_API_URL=https://your-backend.vercel.app/api
```

---

### 6️⃣ Test Everything

```bash
# Use the test script
./test-deployment.sh

# Or manually test:

# 1. Test API
curl https://your-app.vercel.app/api

# 2. Test Telegram bot
# Send /start to your bot in Telegram

# 3. Test frontend
# Visit https://your-frontend.vercel.app
# Try login, create tasks, etc.
```

---

## ⚠️ Important Notes

### Cron Jobs (Notifications)

**Free Tier Limitation:**
- Vercel Free tier does NOT support cron jobs
- Your hourly notifications won't run automatically

**Solutions:**

**Option 1: Upgrade to Vercel Pro** ($20/month)
- Includes cron job support
- Better for production

**Option 2: Use External Cron Service** (Free)
- Use https://cron-job.org (free)
- Setup to hit: `https://your-app.vercel.app/api/cron-notifications`
- Set to run every hour
- Add header: `Authorization: Bearer your-cron-secret`

**Option 3: GitHub Actions** (Free)
```yaml
# .github/workflows/cron.yml
name: Hourly Notifications
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger notifications
        run: |
          curl -X POST ${{ secrets.VERCEL_URL }}/api/cron-notifications \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

## 🔍 Monitoring & Logs

```bash
# View real-time logs
vercel logs --follow

# View specific deployment
vercel logs [deployment-url]
```

**In Vercel Dashboard:**
- Go to: Deployments → Select deployment → Function Logs

---

## 💰 Cost Comparison

### Option 1: All Free
- **Vercel Free**: Backend hosting
- **PlanetScale Free**: Database (5GB)
- **External Cron**: cron-job.org or GitHub Actions
- **Total**: $0/month ✅

### Option 2: Railway DB Only
- **Vercel Free**: Backend hosting
- **Railway**: MySQL only (~$5/month)
- **External Cron**: Free service
- **Total**: ~$5/month

### Option 3: Production Ready
- **Vercel Pro**: $20/month (includes cron)
- **PlanetScale Free**: Database (5GB)
- **Total**: $20/month

---

## 📚 Additional Resources

- [Complete Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Database Migration Guide](./DATABASE_MIGRATION.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Vercel Documentation](https://vercel.com/docs)
- [PlanetScale Documentation](https://planetscale.com/docs)

---

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Check logs
vercel logs

# Verify environment variables
vercel env ls

# Test database connection locally
node -e "require('./src/config/database')"
```

### Telegram Webhook Not Working
```bash
# Check webhook status
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Delete and reset webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
./setup-telegram-webhook.sh
```

### CORS Errors
- Make sure `FRONTEND_URL` environment variable is set
- Add your frontend URL to allowed origins in `/api/index.js`

---

## 🎉 Success Checklist

After completing all steps, verify:

- ✅ API returns: `https://your-app.vercel.app/api`
- ✅ Can login/register on frontend
- ✅ Can create tasks (including Magic Input)
- ✅ Telegram bot responds to `/start`
- ✅ Dashboard shows charts
- ✅ Notifications work (if cron is setup)

---

## 🚀 Next Steps

1. **Custom Domain** (Optional)
   - Add custom domain in Vercel settings
   - Update DNS records
   - Update environment variables

2. **Analytics** (Optional)
   - Enable Vercel Analytics
   - Setup error tracking (Sentry, LogRocket)

3. **Performance**
   - Enable Vercel Edge Functions (if needed)
   - Setup CDN for static assets
   - Optimize database queries

4. **Security**
   - Enable Vercel firewall
   - Setup rate limiting
   - Regular security audits

---

**Need help?** Check the documentation files or create an issue on GitHub.

Good luck with your deployment! 🚀
