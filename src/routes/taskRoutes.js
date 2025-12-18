const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

const pool = require('../config/database');
const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');

// Base URL: /api/tasks

router.get('/', taskController.getTasks);       // Ambil semua tugas
router.post('/', taskController.createTask);    // Buat tugas baru
router.put('/:id', taskController.updateTask);  // Edit tugas
router.delete('/:id', taskController.deleteTask); // Hapus tugas

router.post('/analyze', taskController.analyzeText); // Analisa teks dengan AI

router.post('/test-notify', async (req, res) => {
    try {
        // Setup Transporter Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        // Setup Telegram
        const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

        // Ambil data user 1
        const [users] = await pool.query("SELECT email, telegram_chat_id FROM users WHERE id = 1");
        const user = users[0];

        // 1. Test Kirim Email
        await transporter.sendMail({
            from: 'Smart Task Manager',
            to: user.email,
            subject: '🔔 Test Notifikasi Server',
            text: 'Halo! Jika email ini masuk, berarti settingan SMTP Gmail berhasil.'
        });

        // 2. Test Kirim Telegram
        if (user.telegram_chat_id) {
            await bot.sendMessage(user.telegram_chat_id, "🔔 *Test Notifikasi*\nBot Telegram berhasil terhubung!", { parse_mode: 'Markdown' });
        }

        res.json({ message: "Notifikasi test berhasil dikirim! Cek HP Anda." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

module.exports = router;