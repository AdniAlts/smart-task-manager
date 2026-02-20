## 📝 Quick Deployment Checklist

### Before Deployment
- [ ] Choose database provider (PlanetScale recommended)
- [ ] Setup database and import schema
- [ ] Get all database credentials
- [ ] Have Telegram bot token ready
- [ ] Have Gemini API key ready

### Vercel Setup
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy backend: `vercel` from project root
- [ ] Note your Vercel deployment URL

### Environment Variables (Add in Vercel Dashboard)
- [ ] `DATABASE_URL` or individual `MYSQL_*` variables
- [ ] `JWT_SECRET`
- [ ] `GEMINI_API_KEY`
- [ ] `TELEGRAM_BOT_TOKEN`
- [ ] `CRON_SECRET` (generate random string)
- [ ] `NODE_ENV=production`
- [ ] Optional: Email variables

### After Backend Deployment
- [ ] Setup Telegram webhook (run curl command)
- [ ] Verify webhook with getWebhookInfo
- [ ] Test API endpoint: `https://your-app.vercel.app/api`
- [ ] Check function logs in Vercel dashboard

### Frontend Deployment
- [ ] Update API URL in `client/src/services/api.js`
- [ ] Deploy client: `cd client && vercel`
- [ ] Add `VITE_API_URL` environment variable
- [ ] Update `FRONTEND_URL` in backend environment variables

### Testing
- [ ] Test login/register
- [ ] Test task creation (including Magic Input)
- [ ] Test Telegram bot (/start command)
- [ ] Test dashboard
- [ ] Verify cron job (check logs after 1 hour)

### Optional
- [ ] Setup custom domain
- [ ] Enable Vercel Analytics
- [ ] Setup external cron service (if on free tier)
- [ ] Add monitoring/error tracking

### Migration from Railway
- [ ] Export data from Railway MySQL (if needed)
- [ ] Import to new database
- [ ] Update DNS if using custom domain
- [ ] Test everything works
- [ ] Delete Railway backend service (keep DB if using it)
