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
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    // Add your Vercel frontend URL here after deployment
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'TaskMind API is Running on Vercel! 🚀',
        version: '1.0.0',
        status: 'active',
        timestamp: new Date().toISOString()
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
