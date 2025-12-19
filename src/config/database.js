const mysql = require('mysql2/promise');

console.log('🔍 Loading database config...');
console.log('  MYSQL_HOST:', process.env.MYSQL_HOST || 'not set');
console.log('  MYSQLHOST:', process.env.MYSQLHOST || 'not set');
console.log('  DB_HOST:', process.env.DB_HOST || 'not set');

// Railway MySQL provides variables (with or without underscore)
const getDatabaseConfig = () => {
    // Railway MySQL individual variables (with underscore: MYSQL_HOST)
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
    
    // Railway MySQL individual variables (without underscore: MYSQLHOST)
    if (process.env.MYSQLHOST) {
        console.log('📦 Using MYSQLHOST config (no underscore)');
        return {
            host: process.env.MYSQLHOST,
            port: parseInt(process.env.MYSQLPORT) || 3306,
            user: process.env.MYSQLUSER,
            password: process.env.MYSQLPASSWORD,
            database: process.env.MYSQLDATABASE,
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