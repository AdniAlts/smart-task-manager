const mysql = require('mysql2/promise');

// Railway MySQL provides MYSQL_URL or individual variables
const getDatabaseConfig = () => {
    // Debug: log available env vars (remove in production)
    console.log('🔍 Database Config Debug:');
    console.log('  MYSQL_URL exists:', !!process.env.MYSQL_URL);
    console.log('  MYSQL_HOST:', process.env.MYSQL_HOST || 'not set');
    console.log('  MYSQL_DATABASE:', process.env.MYSQL_DATABASE || 'not set');
    
    // Railway MySQL individual variables (preferred - more reliable)
    if (process.env.MYSQL_HOST) {
        console.log('📦 Using MYSQL_HOST config');
        return {
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT) || 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };
    }
    
    // If Railway provides a full URL
    // Format: mysql://user:password@host:port/database
    if (process.env.MYSQL_URL) {
        console.log('📦 Using MYSQL_URL config');
        try {
            const url = new URL(process.env.MYSQL_URL);
            return {
                host: url.hostname,
                port: parseInt(url.port) || 3306,
                user: decodeURIComponent(url.username),
                password: decodeURIComponent(url.password),
                database: url.pathname.slice(1), // Remove leading /
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            };
        } catch (err) {
            console.error('❌ Failed to parse MYSQL_URL:', err.message);
        }
    }
    
    // Fallback to custom env vars (local development)
    console.log('📦 Using local DB config (fallback)');
    return {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smart_task_manager',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
};

let pool;
try {
    const config = getDatabaseConfig();
    console.log('🔧 Creating pool with host:', config.host, 'database:', config.database);
    pool = mysql.createPool(config);
} catch (err) {
    console.error('❌ Failed to create database pool:', err.message);
    // Create a dummy pool that will fail gracefully
    pool = null;
}

// Cek koneksi saat file ini dimuat pertama kali
if (pool) {
    pool.getConnection()
        .then(conn => {
            console.log("✅ Database connected successfully!");
            conn.release();
        })
        .catch(err => {
            console.error("❌ Database connection failed:", err.message);
        });
} else {
    console.error("❌ No database pool available");
}

module.exports = pool;