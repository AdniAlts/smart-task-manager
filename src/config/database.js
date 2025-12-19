const mysql = require('mysql2/promise');

// Railway MySQL provides MYSQL_URL or individual variables
const getDatabaseConfig = () => {
    // If Railway provides a full URL (recommended)
    if (process.env.MYSQL_URL) {
        return {
            uri: process.env.MYSQL_URL,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };
    }
    
    // Railway MySQL individual variables
    if (process.env.MYSQL_HOST) {
        return {
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };
    }
    
    // Fallback to custom env vars (local development)
    return {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smart_task_manager',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
};

const pool = mysql.createPool(getDatabaseConfig());

// Cek koneksi saat file ini dimuat pertama kali
pool.getConnection()
    .then(conn => {
        console.log("✅ Database connected successfully!");
        conn.release();
    })
    .catch(err => {
        console.error("❌ Database connection failed:", err.message);
    });

module.exports = pool;