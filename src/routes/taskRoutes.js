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
        const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
        const emailPort = parseInt(process.env.EMAIL_PORT || '465');
        const isSecure = emailPort === 465; // True for 465, False for 587

        console.log(`📧 Configuring SMTP: ${emailHost}:${emailPort} (Secure: ${isSecure})`);

        const transporter = nodemailer.createTransport({
            host: emailHost,
            port: emailPort,
            secure: isSecure,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
            logger: true, // Log to console
            debug: true   // Include debug info
        });

        // Setup Telegram
        const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

        // Ambil data user yang sedang login
        const [users] = await pool.query("SELECT email, telegram_chat_id, telegram_enabled, email_enabled FROM users WHERE id = ?", [userId]);
        const user = users[0];

        const promises = [];

        // 1. Test Kirim Email (if enabled)
        if (user.email_enabled && user.email) {
            console.log(`📧 Attempting to send email to ${user.email}...`);
            promises.push(
                transporter.sendMail({
                    from: `TaskMind <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: '🔔 Test Notifikasi Server',
                    text: 'Halo! Jika email ini masuk, berarti settingan SMTP Gmail berhasil.'
                })
                .then(() => {
                    console.log('✅ Email sent successfully');
                    return 'Email';
                })
                .catch(e => { 
                    console.error('❌ Email failed:', e);
                    throw new Error(`Email failed: ${e.message}`);
                })
            );
        }

        // 2. Test Kirim Telegram (if enabled)
        if (user.telegram_enabled && user.telegram_chat_id) {
            promises.push(
                bot.sendMessage(user.telegram_chat_id, "🔔 *Test Notifikasi*\nBot Telegram berhasil terhubung!", { parse_mode: 'Markdown' })
                .then(() => 'Telegram').catch(e => { throw new Error(`Telegram failed: ${e.message}`) })
            );
        }

        if (promises.length === 0) {
            return res.json({ message: "Tidak ada notifikasi yang dikirim. Pastikan Telegram/Email diaktifkan." });
        }

        const results = await Promise.allSettled(promises);
        const sentTo = results.filter(r => r.status === 'fulfilled').map(r => r.value);
        const errors = results.filter(r => r.status === 'rejected').map(r => r.reason.message);

        if (sentTo.length > 0) {
            res.json({ 
                message: `Notifikasi test berhasil dikirim ke: ${sentTo.join(', ')}`,
                errors: errors.length > 0 ? errors : undefined
            });
        } else {
            res.status(500).json({ 
                message: "Gagal mengirim notifikasi", 
                errors 
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;