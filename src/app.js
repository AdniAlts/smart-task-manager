require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes'); // Kita buat sebentar lagi
const scheduler = require('./services/scheduler'); // Scheduler yang tadi kita bahas

const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Buka akses untuk frontend
app.use(express.json()); // Agar bisa baca JSON dari body request

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Test Route (Cek server nyala/nggak)
app.get('/', (req, res) => {
    res.send('Smart Student Task Manager API is Running! 🚀');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log('Scheduler (Cron Job) aktif di background...');
});