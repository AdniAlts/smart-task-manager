# ⚠️ VERCEL FREE TIER CRON LIMITATION

## 🚨 Important: Vercel Hobby (Free) Plan Limitation

Vercel Free tier **ONLY supports cron jobs that run ONCE PER DAY or less**.

Your error:
```
Hobby accounts are limited to daily cron jobs. 
This cron expression (0 * * * *) would run more than once per day.
```

---

## ✅ SOLUTION: Use GitHub Actions (100% Free, Hourly!)

**Recommended approach** - GitHub Actions is completely free and supports hourly cron jobs.

### Quick Setup (5 minutes):

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Add Vercel serverless functions"
   git push origin main
   ```

2. **Add GitHub Repository Secrets**:
   - Go to: **Your Repo → Settings → Secrets and variables → Actions**
   - Click **New repository secret**
   
   Add these 2 secrets:
   
   **Secret 1:**
   - Name: `VERCEL_URL`
   - Value: `https://your-app.vercel.app` (your Vercel URL after deployment)
   
   **Secret 2:**
   - Name: `CRON_SECRET`
   - Value: Generate random string:
     ```bash
     openssl rand -base64 32
     ```
   - **Important**: Add the SAME value to Vercel environment variables!

3. **The workflow is already configured!**
   - File: `.github/workflows/hourly-notifications.yml`
   - Schedule: Every hour (`0 * * * *`)
   - It will automatically trigger your `/api/cron-notifications` endpoint

4. **Add CRON_SECRET to Vercel**:
   - Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
   - Add variable:
     - Name: `CRON_SECRET`
     - Value: Same value as GitHub secret

5. **Deploy without Vercel Cron**:
   ```bash
   vercel
   ```
   This should work now since we removed the cron config!

6. **Test the workflow**:
   - Go to: **GitHub → Your Repo → Actions tab**
   - Select **Hourly Task Notifications**
   - Click **Run workflow** (manual test)
   - Check the results

---

## 🔄 Alternative: Vercel Daily Cron (Free)

If you only want notifications **once per day**, you can use Vercel's free cron:

1. **Copy the example file**:
   ```bash
   cp vercel-with-daily-cron.json.example vercel.json
   ```

2. **This will run at 9 AM daily**:
   ```json
   "crons": [
     {
       "path": "/api/cron-notifications",
       "schedule": "0 9 * * *"
     }
   ]
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

**Allowed schedules on Free tier:**
- `0 9 * * *` - Daily at 9 AM
- `0 0 * * 0` - Weekly on Sunday at midnight
- `0 0 1 * *` - Monthly on 1st day at midnight

---

## 📊 Comparison

| Method | Frequency | Cost | Setup |
|--------|-----------|------|-------|
| **GitHub Actions** | Hourly | FREE ✅ | 5 min |
| Vercel Free Cron | Daily only | FREE | 2 min |
| Vercel Pro Cron | Any schedule | $20/month | 2 min |

---

## 🚀 Recommended: GitHub Actions

**Why GitHub Actions is better for free tier:**
- ✅ Runs every hour (not just daily)
- ✅ 100% free for public repos
- ✅ 2,000 free minutes/month for private repos
- ✅ Easy to monitor (GitHub Actions tab)
- ✅ Email notifications on failure
- ✅ Can run on any schedule you want

**Current setup:**
Your workflow file is already created at:
`.github/workflows/hourly-notifications.yml`

It will run every hour and trigger your notification endpoint!

---

## ✅ What I've Done

1. ✅ **Removed cron from vercel.json** - Now you can deploy!
2. ✅ **Created vercel-with-daily-cron.json.example** - If you want daily cron
3. ✅ **GitHub Actions workflow already exists** - Ready to use!

---

## 🎯 Next Steps

**Option A: Use GitHub Actions (Recommended)**

1. Deploy to Vercel (should work now):
   ```bash
   vercel
   ```

2. Note your Vercel URL

3. Add GitHub secrets:
   - `VERCEL_URL` = your Vercel URL
   - `CRON_SECRET` = random string (generate with `openssl rand -base64 32`)

4. Add same `CRON_SECRET` to Vercel environment variables

5. Push to GitHub:
   ```bash
   git add .
   git commit -m "Setup serverless functions"
   git push origin main
   ```

6. Test in GitHub Actions tab!

**Option B: Use Daily Cron (Simpler but less frequent)**

1. Use daily cron config:
   ```bash
   cp vercel-with-daily-cron.json.example vercel.json
   ```

2. Deploy:
   ```bash
   vercel
   ```

---

## 📚 Full Guide

For complete GitHub Actions setup instructions, see:
**GITHUB_ACTIONS_CRON.md**

---

## 🆘 Need Help?

Check the workflow logs:
1. Go to GitHub → Actions tab
2. Click on a workflow run
3. View the step outputs

---

**Recommended**: Go with GitHub Actions for hourly notifications! 🚀
