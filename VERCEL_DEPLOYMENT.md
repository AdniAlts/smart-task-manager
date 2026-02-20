# 🚀 Vercel Deployment Guide

## 📋 Prerequisites

1. **Database Setup** - Choose and setup one database option:
   - ✅ **PlanetScale** (Recommended - MySQL compatible, free tier)
   - Railway (Keep MySQL only - ~$5/month)
   - Aiven MySQL
   - Neon PostgreSQL (requires code changes)
   
   See [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) for detailed instructions.

2. **Vercel Account** - Sign up at https://vercel.com

3. **Telegram Bot Setup** - Switch from polling to webhook

---

## 🗄️ Step 1: Setup Database

### Option A: PlanetScale (Recommended)

```bash
# 1. Sign up at https://planetscale.com
# 2. Create database: smart-task-manager
# 3. Import schema
pscale shell smart-task-manager main < database/schema-mysql.sql

# 4. Get connection string from PlanetScale dashboard
# Copy the DATABASE_URL (format: mysql://user:pass@host/db?sslaccept=strict)
```

### Option B: Keep Railway Database Only

```bash
# 1. In Railway dashboard, keep only MySQL service
# 2. Remove the backend service
# 3. Note down connection details:
#    - MYSQL_HOST
#    - MYSQL_PORT
#    - MYSQL_USER
#    - MYSQL_PASSWORD
#    - MYSQL_DATABASE
```

---

## 📡 Step 2: Setup Telegram Webhook

Your bot needs to switch from polling to webhook mode for Vercel.

**After deploying to Vercel**, run this command:

```bash
# Replace with your actual values
TELEGRAM_BOT_TOKEN="your-bot-token"
VERCEL_URL="your-app.vercel.app"

curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"https://${VERCEL_URL}/api/telegram-webhook\"}"
```

**Verify webhook is set:**
```bash
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
```

---

## 🚀 Step 3: Deploy to Vercel

### Method 1: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from project root
cd /home/nix16/projects/smart-task-manager
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? smart-task-manager
# - Directory? ./ (current directory)
# - Override settings? No
```

### Method 2: Deploy via GitHub

```bash
# 1. Push to GitHub
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main

# 2. Import in Vercel:
#    - Go to https://vercel.com/new
#    - Import your GitHub repository
#    - Vercel will auto-detect settings
#    - Click Deploy
```

---

## 🔐 Step 4: Set Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables

Add these variables:

### Database (Choose based on your provider)

**For PlanetScale:**
```
DATABASE_URL = mysql://xxxxx:xxxxx@xxxxx.psdb.cloud/smart-task-manager?sslaccept=strict
```

**For Railway/Others:**
```
MYSQL_HOST = your-mysql-host.com
MYSQL_PORT = 3306
MYSQL_USER = your-username
MYSQL_PASSWORD = your-password
MYSQL_DATABASE = your-database
MYSQL_SSL = true
```

### Required Variables
```
JWT_SECRET = your-super-secret-jwt-key
GEMINI_API_KEY = your-gemini-api-key
TELEGRAM_BOT_TOKEN = your-telegram-bot-token
CRON_SECRET = generate-random-secret-for-cron
NODE_ENV = production
```

### Email (Optional - if using email notifications)
```
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = your-email@gmail.com
EMAIL_PASSWORD = your-app-password
EMAIL_FROM = TaskMind <your-email@gmail.com>
```

### Frontend URL (Add after deploying frontend)
```
FRONTEND_URL = https://your-frontend.vercel.app
```

---

## 🎨 Step 5: Deploy Frontend (Client)

```bash
cd client

# Deploy client separately
vercel

# Or link to main project as a different service
# In Vercel dashboard, you can have:
# - smart-task-manager (backend)
# - smart-task-manager-client (frontend)
```

### Update client API URL

In `client/src/services/api.js`, update the baseURL:

```javascript
const API_URL = import.meta.env.PROD 
  ? 'https://your-backend.vercel.app/api'
  : 'http://localhost:3000/api';
```

Add environment variable in Vercel (client project):
```
VITE_API_URL = https://your-backend.vercel.app/api
```

---

## ✅ Step 6: Verify Deployment

### Test Backend API
```bash
curl https://your-backend.vercel.app/api
# Should return: {"message": "TaskMind API is Running on Vercel! 🚀", ...}
```

### Test Telegram Webhook
```bash
# Send /start to your Telegram bot
# Should receive welcome message with chat ID
```

### Test Cron Job
```bash
# Cron runs every hour automatically
# Or trigger manually:
curl -X POST https://your-backend.vercel.app/api/cron-notifications \
  -H "Authorization: Bearer your-cron-secret"
```

### Test Frontend
```bash
# Visit your frontend URL
https://your-frontend.vercel.app

# Try login, create tasks, etc.
```

---

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Check environment variables are set correctly
vercel env ls

# View deployment logs
vercel logs
```

### Telegram Webhook Not Working
```bash
# Check webhook status
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"

# Remove webhook and set again
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook"
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"https://your-app.vercel.app/api/telegram-webhook\"}"
```

### CORS Errors
Update `FRONTEND_URL` environment variable with your actual frontend URL.

### Cron Jobs Not Running
- Cron jobs only work on **Pro** or **Enterprise** plans
- For free tier, use external cron services:
  - https://cron-job.org
  - https://easycron.com
  - Set them to hit: `https://your-app.vercel.app/api/cron-notifications`

---

## 📊 Monitoring & Logs

```bash
# View real-time logs
vercel logs --follow

# View specific deployment logs
vercel logs [deployment-url]
```

In Vercel Dashboard:
- Go to your project → Deployments → Select deployment → View Function Logs

---

## 💰 Cost Estimation

### Free Tier Limits:
- **Vercel Free**: 
  - 100GB bandwidth/month
  - Serverless function execution: 100GB-hours
  - ⚠️ NO cron jobs (need external service or upgrade)
  
- **PlanetScale Free**:
  - 5GB storage
  - 1 billion row reads/month
  - 10 million row writes/month

### If you need Cron (Vercel Pro):
- $20/month per member
- Includes cron jobs
- Better for production use

### Alternative for Free Cron:
Use **cron-job.org** (free) to hit your endpoint every hour:
```
https://your-app.vercel.app/api/cron-notifications
```

---

## 🎉 Done!

Your app should now be running on:
- **Backend**: `https://your-backend.vercel.app`
- **Frontend**: `https://your-frontend.vercel.app`
- **Database**: PlanetScale/Railway/Aiven

### Next Steps:
1. Update LinkedIn post with new Vercel URLs
2. Test all features thoroughly
3. Monitor logs for any errors
4. Setup custom domain (optional)
5. Enable Vercel Analytics (optional)

---

## 🔄 Future Updates

To update your deployment:

```bash
# Make changes to code
git add .
git commit -m "Update feature X"
git push origin main

# Vercel auto-deploys on push (if connected to GitHub)
# Or manually deploy:
vercel --prod
```

---

## ❓ Need Help?

- Vercel Docs: https://vercel.com/docs
- PlanetScale Docs: https://planetscale.com/docs
- Vercel Discord: https://vercel.com/discord

Good luck! 🚀
