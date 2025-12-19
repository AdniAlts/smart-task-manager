# 🚀 Deployment Guide: Smart Task Manager

## Architecture Overview
- **Frontend**: Vercel (React + Vite)
- **Backend**: Railway (Node.js + Express)
- **Database**: MySQL (Railway)
- **Domain**: Namecheap
- **SSL**: Automatic (provided by Vercel & Railway)

---

## Step 1: Deploy MySQL Database on Railway

1. Go to [Railway](https://railway.app) and login
2. Click **"New Project"** → **"Provision MySQL"**
3. Once created, click on the MySQL service
4. Go to **"Variables"** tab - you'll see:
   - `MYSQL_URL`
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

5. Go to **"Data"** tab → **"Query"** and run the schema:
   - Copy contents from `database/schema-mysql.sql`
   - Paste and execute to create tables

---

## Step 2: Deploy Backend on Railway

1. In your Railway project, click **"New"** → **"GitHub Repo"**
2. Select your repository: `AdniAlts/smart-task-manager`
3. Railway will detect the `railway.toml` and auto-configure

### Configure Environment Variables

Go to **"Variables"** tab and add:

```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com  (update after Vercel deploy)

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Telegram
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

### Link MySQL Variables

1. Click **"Add Variable"** → **"Add Reference"**
2. Select the MySQL service and reference:
   - `MYSQL_URL`
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

### Generate Domain

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** to get: `your-app.up.railway.app`
3. Note this URL for Vercel configuration

---

## Step 3: Deploy Frontend on Vercel

1. Go to [Vercel](https://vercel.com) and login
2. Click **"Add New Project"** → Import from GitHub
3. Select your repository: `AdniAlts/smart-task-manager`

### Configure Project Settings

- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Add Environment Variables

```
VITE_API_URL=https://your-app.up.railway.app/api
```

4. Click **"Deploy"**
5. After deployment, note your Vercel URL (e.g., `your-app.vercel.app`)

### Update Railway FRONTEND_URL

Go back to Railway and update:
```
FRONTEND_URL=https://your-app.vercel.app
```

---

## Step 4: Connect Custom Domain (Namecheap)

### For Frontend (Vercel)

1. In Vercel, go to **Project Settings** → **Domains**
2. Add your domain: `yourdomain.com` and `www.yourdomain.com`
3. Vercel will show DNS records to add

**In Namecheap:**
1. Go to **Domain List** → **Manage** → **Advanced DNS**
2. Add these records:

| Type  | Host | Value                    | TTL       |
|-------|------|--------------------------|-----------|
| A     | @    | 76.76.19.19              | Automatic |
| CNAME | www  | cname.vercel-dns.com     | Automatic |

### For Backend (Railway) - Optional

If you want a custom API domain (e.g., `api.yourdomain.com`):

1. In Railway, go to **Settings** → **Networking** → **Custom Domain**
2. Add: `api.yourdomain.com`
3. Railway will show DNS records

**In Namecheap:**

| Type  | Host | Value                          | TTL       |
|-------|------|--------------------------------|-----------|
| CNAME | api  | your-app.up.railway.app        | Automatic |

4. Update Vercel's `VITE_API_URL` to `https://api.yourdomain.com/api`

---

## Step 5: SSL Configuration

**SSL is automatic!** ✅
- Vercel automatically provisions SSL certificates
- Railway automatically provisions SSL certificates
- No manual configuration needed

---

## Post-Deployment Checklist

- [ ] Database tables created successfully
- [ ] Backend healthcheck passes (`https://your-backend.up.railway.app/` returns "TaskMind API is Running! 🚀")
- [ ] Frontend loads without errors
- [ ] Can register new user
- [ ] Can login
- [ ] Tasks CRUD operations work
- [ ] AI task analysis works (Gemini)
- [ ] Notifications work (if configured)
- [ ] Custom domain resolves correctly
- [ ] HTTPS works on all domains

---

## Environment Variables Summary

### Railway (Backend)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `FRONTEND_URL` | Your Vercel domain |
| `JWT_SECRET` | Strong random string |
| `MYSQL_URL` | Auto from Railway MySQL |
| `MYSQL_HOST` | Auto from Railway MySQL |
| `MYSQL_PORT` | Auto from Railway MySQL |
| `MYSQL_USER` | Auto from Railway MySQL |
| `MYSQL_PASSWORD` | Auto from Railway MySQL |
| `MYSQL_DATABASE` | Auto from Railway MySQL |
| `GEMINI_API_KEY` | From Google AI Studio |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | Your Gmail |
| `EMAIL_PASS` | Gmail App Password |
| `TELEGRAM_BOT_TOKEN` | From BotFather |

### Vercel (Frontend)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Railway backend URL + `/api` |

---

## Troubleshooting

### Backend won't start
- Check Railway logs for errors
- Verify MySQL connection variables are referenced correctly
- Ensure `MYSQL_URL` or individual MySQL vars are set

### CORS errors
- Verify `FRONTEND_URL` in Railway matches your Vercel domain exactly
- Include protocol: `https://your-domain.com` (not just `your-domain.com`)

### Database connection fails
- Check if MySQL service is running in Railway
- Verify tables were created using schema-mysql.sql
- Check connection limit isn't exceeded

### Domain not working
- DNS propagation can take up to 48 hours
- Verify DNS records in Namecheap are correct
- Check for typos in CNAME values

---

## Useful Commands

```bash
# Test backend locally with production-like env
NODE_ENV=production npm start

# Build frontend locally
cd client && npm run build && npm run preview
```

---

## Cost Estimation

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel | 100GB bandwidth/month | ~$20/month Pro |
| Railway | $5 credit/month | Pay as you go |
| MySQL (Railway) | Included in Railway | ~$5-10/month |
| Namecheap Domain | N/A | ~$10-15/year |

For a small project, you can run entirely within free tiers! 🎉
