# GitHub Actions Cron Setup (Free Alternative to Vercel Cron)

## 📋 Overview

Since Vercel Free tier doesn't support cron jobs, we can use GitHub Actions to trigger the notification endpoint every hour - completely free!

## 🚀 Setup Instructions

### 1. Push to GitHub (if not already)

```bash
git add .
git commit -m "Add Vercel serverless configuration"
git push origin main
```

### 2. Add Repository Secrets

Go to your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

1. **`VERCEL_URL`**
   - Value: `https://your-app.vercel.app` (your Vercel deployment URL)
   - Without trailing slash

2. **`CRON_SECRET`**
   - Value: Same secret you added to Vercel environment variables
   - Generate a random string if you haven't yet:
   ```bash
   openssl rand -base64 32
   ```

### 3. Enable GitHub Actions

The workflow file is already created at `.github/workflows/hourly-notifications.yml`

It will automatically:
- Run every hour (at minute 0)
- Trigger your `/api/cron-notifications` endpoint
- Check for tasks with upcoming deadlines
- Send email and Telegram notifications

### 4. Verify Setup

**Manual Test:**
1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **Hourly Task Notifications** workflow
4. Click **Run workflow** (dropdown on the right)
5. Click **Run workflow** button
6. Wait a few seconds and check the run results

**Check Logs:**
- Click on the workflow run
- Click on the job name
- View the step outputs

### 5. Monitor

GitHub Actions shows:
- ✅ Last run status
- 📊 Run history
- ⏰ Next scheduled run
- 📝 Detailed logs

---

## 📅 Schedule Details

Default schedule: **Every hour**

To change the schedule, edit `.github/workflows/hourly-notifications.yml`:

```yaml
on:
  schedule:
    # Examples:
    - cron: '0 * * * *'      # Every hour
    - cron: '*/30 * * * *'   # Every 30 minutes
    - cron: '0 */2 * * *'    # Every 2 hours
    - cron: '0 8-20 * * *'   # Every hour from 8 AM to 8 PM
    - cron: '0 9,12,15,18 * * *'  # At 9 AM, 12 PM, 3 PM, 6 PM
```

Cron syntax:
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday=0)
│ │ │ │ │
* * * * *
```

---

## 🔧 Troubleshooting

### Workflow Not Running

**Check:**
1. Repository is public or you have GitHub Actions minutes available
2. Workflow file is in correct location: `.github/workflows/`
3. YAML syntax is valid
4. Actions are enabled in repository settings

### 401 Unauthorized Error

**Fix:**
- Verify `CRON_SECRET` matches in:
  - GitHub repository secrets
  - Vercel environment variables

### 404 or 500 Errors

**Check:**
1. `VERCEL_URL` is correct (no trailing slash)
2. Vercel deployment is successful
3. `/api/cron-notifications` endpoint is deployed
4. Check Vercel logs for errors

### Manual Test

```bash
# Test locally (replace with your values)
curl -X POST "https://your-app.vercel.app/api/cron-notifications" \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json"
```

---

## 💰 GitHub Actions Limits

### Free Tier:
- **Public repositories**: Unlimited minutes ✅
- **Private repositories**: 2,000 minutes/month
  - Running every hour = ~45 seconds/hour
  - ~22 minutes/month
  - Well within free limits ✅

### Pro Tier:
- 3,000 minutes/month

---

## 🔒 Security Notes

1. **Never commit secrets** to your repository
   - Use GitHub repository secrets only
   - Keep `.env` files in `.gitignore`

2. **Use CRON_SECRET** for authentication
   - Prevents unauthorized access to cron endpoint
   - Use strong random string

3. **Limit endpoint access**
   - Only respond to authorized requests
   - Verify Authorization header

---

## 📊 Monitoring

### View Run History:
1. Go to **Actions** tab
2. Click **Hourly Task Notifications**
3. View all runs with status

### Email Notifications:
GitHub can notify you of workflow failures:
1. Go to your GitHub **Settings** (your profile)
2. **Notifications** → **Actions**
3. Enable **Failed workflow run** notifications

---

## 🎯 Benefits vs Other Solutions

| Solution | Cost | Reliability | Setup |
|----------|------|-------------|-------|
| **GitHub Actions** | Free ✅ | High ⭐⭐⭐ | Easy |
| Vercel Cron | $20/month | Highest ⭐⭐⭐⭐ | Easiest |
| cron-job.org | Free ✅ | Medium ⭐⭐ | Easy |
| Custom server | $5-10/month | Medium ⭐⭐ | Hard |

---

## 🚀 Alternative: cron-job.org

If you prefer not to use GitHub Actions:

1. Visit https://cron-job.org
2. Create account
3. Create new cron job:
   - **URL**: `https://your-app.vercel.app/api/cron-notifications`
   - **Schedule**: Every hour
   - **HTTP Headers**: 
     ```
     Authorization: Bearer your-cron-secret
     Content-Type: application/json
     ```
   - **Method**: POST

---

## ✅ Verification Checklist

- [ ] Workflow file exists in `.github/workflows/`
- [ ] Repository secrets added (VERCEL_URL, CRON_SECRET)
- [ ] Manual test successful
- [ ] First automatic run completed
- [ ] Notifications received (email/Telegram)
- [ ] Logs show successful execution

---

**Done!** Your notifications will now run every hour automatically for free! 🎉
