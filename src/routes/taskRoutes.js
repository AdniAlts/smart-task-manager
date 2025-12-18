const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

const pool = require('../config/database');
const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');

// Base URL: /api/tasks
// All routes are protected with auth middleware

router.get('/', authMiddleware, taskController.getTasks);       // Ambil semua tugas
router.post('/', authMiddleware, taskController.createTask);    // Buat tugas baru
router.put('/:id', authMiddleware, taskController.updateTask);  // Edit tugas
router.delete('/:id', authMiddleware, taskController.deleteTask); // Hapus tugas

router.post('/analyze', authMiddleware, taskController.analyzeText); // Analisa teks dengan AI

router.post('/test-notify', authMiddleware, async (req, res) => {
    try {
        // Get current user from token
        const userId = req.user.id;
        
        // Setup Transporter Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        // Setup Telegram
        const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

        // Ambil data user yang sedang login
        const [users] = await pool.query("SELECT email, telegram_chat_id, telegram_enabled, email_enabled FROM users WHERE id = ?", [userId]);
        const user = users[0];

        let sentTo = [];

        // 1. Test Kirim Email (if enabled)
        if (user.email_enabled && user.email) {
            await transporter.sendMail({
                from: 'TaskMind',
                to: user.email,
                subject: '🔔 Test Notifikasi Server',
                text: 'Halo! Jika email ini masuk, berarti settingan SMTP Gmail berhasil.'
            });
            sentTo.push('Email');
        }

        // 2. Test Kirim Telegram (if enabled)
        if (user.telegram_enabled && user.telegram_chat_id) {
            await bot.sendMessage(user.telegram_chat_id, "🔔 *Test Notifikasi*\nBot Telegram berhasil terhubung!", { parse_mode: 'Markdown' });
            sentTo.push('Telegram');
        }

        if (sentTo.length === 0) {
            return res.json({ message: "Tidak ada notifikasi yang dikirim. Pastikan Telegram/Email diaktifkan." });
        }

        res.json({ message: `Notifikasi test berhasil dikirim ke: ${sentTo.join(', ')}` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;