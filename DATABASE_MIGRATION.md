# 🗄️ Database Migration Guide

## Option 1: PlanetScale (MySQL - Recommended)

### Setup:
1. Visit https://planetscale.com/
2. Sign up with GitHub
3. Create new database: `smart-task-manager`
4. Get connection string from "Connect" tab
5. Run migration:
   ```bash
   # Install pscale CLI
   brew install planetscale/tap/pscale  # macOS
   # or download from https://github.com/planetscale/cli
   
   # Import your schema
   pscale shell smart-task-manager main < database/schema-mysql.sql
   ```

### Environment Variables for Vercel:
```env
DATABASE_URL=mysql://user:password@host.psdb.cloud/smart-task-manager?sslaccept=strict
```

---

## Option 2: Aiven (MySQL/PostgreSQL)

### Setup:
1. Visit https://aiven.io/
2. Sign up (free trial)
3. Create MySQL service
4. Download SSL certificate
5. Get connection details

### Environment Variables:
```env
MYSQL_HOST=mysql-xxxxx.aivencloud.com
MYSQL_PORT=xxxxx
MYSQL_USER=avnadmin
MYSQL_PASSWORD=xxxxx
MYSQL_DATABASE=defaultdb
MYSQL_SSL=true
```

---

## Option 3: Keep Railway Database Only

### Setup:
1. Keep MySQL service active on Railway
2. Remove backend from Railway
3. Use Railway MySQL with Vercel backend

### Cost: ~$5/month for database only

### Environment Variables:
```env
MYSQL_HOST=xxxxx.railway.app
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=xxxxx
MYSQL_DATABASE=railway
```

---

## Option 4: Neon (PostgreSQL - Fast & Free)

### Setup:
1. Visit https://neon.tech/
2. Sign up with GitHub
3. Create project
4. **Note:** Requires migration from MySQL to PostgreSQL

### Migration needed:
- Convert MySQL syntax to PostgreSQL
- Update `mysql2` to `pg` in dependencies
- Modify queries (no AUTO_INCREMENT, use SERIAL)

---

## Recommended: PlanetScale
✅ MySQL compatible (no code changes)
✅ 5GB storage free
✅ Auto-scaling
✅ Built-in branching (like Git for databases)
✅ No SSL certificate hassle
