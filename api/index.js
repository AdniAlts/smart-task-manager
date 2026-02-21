// Vercel Serverless Function - Main API Handler
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const taskRoutes = require('../src/routes/taskRoutes');
const authRoutes = require('../src/routes/authRoutes');
const dashboardRoutes = require('../src/routes/dashboardRoutes');

const app = express();

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',
    'http://localhost:5174',  // Alternative Vite port
    'https://smart-task-manager-nine-pi.vercel.app', // Production frontend
    process.env.FRONTEND_URL, // Additional frontend URL from env
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        
        // Allow all localhost origins in development
        if (origin && origin.startsWith('http://localhost')) {
            return callback(null, true);
        }
        
        // Allow all vercel.app domains
        if (origin && origin.includes('.vercel.app')) {
            return callback(null, true);
        }
        
        // Check allowed origins
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Request-Id']
}));

app.use(express.json());

// Routes - Using full /api prefix since Vercel passes full path
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// API root endpoint
app.get(['/api', '/api/'], (req, res) => {
    res.json({
        message: 'TaskMind API is Running on Vercel! 🚀',
        version: '1.0.0',
        status: 'active',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            tasks: '/api/tasks',
            dashboard: '/api/dashboard',
            health: '/api/health',
            telegram: '/api/telegram-webhook',
            cron: '/api/cron-notifications'
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'TaskMind API is Running on Vercel! 🚀',
        version: '1.0.0',
        status: 'active',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            tasks: '/api/tasks',
            dashboard: '/api/dashboard',
            health: '/api/health',
            telegram: '/api/telegram-webhook',
            cron: '/api/cron-notifications'
        }
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Export as serverless function
module.exports = app;
