const { Pool } = require('pg');

// Support both DATABASE_URL (Railway) and individual env vars (local)
const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    : new Pool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
    });

// Test connection on startup
pool.connect()
    .then(client => {
        console.log("✅ PostgreSQL connected successfully!");
        client.release();
    })
    .catch(err => {
        console.error("❌ PostgreSQL connection failed:", err.message);
    });

module.exports = pool;