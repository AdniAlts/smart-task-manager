const cron = require('node-cron');
const pool = require('../config/database');
const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');

// Setup Email Transporter
const getTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: { 
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS 
        }
    });
};

// Setup Telegram Bot
const getBot = () => {
    return new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
};

// Format deadline untuk pesan
const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Format priority untuk pesan
const formatPriority = (priority) => {
    const map = {
        'do_first': '🔴 Do First (Urgent)',
        'schedule': '🟡 Schedule',
        'delegate': '🔵 Delegate',
        'eliminate': '⚪ Eliminate'
    };
    return map[priority] || priority;
};

// Generate pesan notifikasi
const generateNotificationMessage = (task, hoursRemaining) => {
    const timeText = hoursRemaining <= 1 
        ? '⚠️ KURANG DARI 1 JAM LAGI!' 
        : hoursRemaining <= 24 
            ? `⏰ ${hoursRemaining} jam lagi`
            : `📅 ${Math.floor(hoursRemaining / 24)} hari lagi`;

    const telegramMessage = `
🔔 *DEADLINE REMINDER*

📝 *${task.title}*
${task.subject ? `📚 Mata Kuliah: ${task.subject}` : ''}
📆 Deadline: ${formatDeadline(task.deadline)}
${formatPriority(task.priority_level)}

⏳ *${timeText}*

${task.description ? `📋 Detail: ${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}` : ''}

_Jangan lupa selesaikan tugasmu! 💪_
    `.trim();

    const emailSubject = `⏰ Reminder: ${task.title} - ${timeText}`;
    
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1e293b; color: #f1f5f9; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #8b5cf6; margin: 0;">🔔 Deadline Reminder</h1>
            </div>
            
            <div style="background-color: #334155; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #f1f5f9; margin: 0 0 10px 0;">📝 ${task.title}</h2>
                ${task.subject ? `<p style="color: #94a3b8; margin: 5px 0;">📚 Mata Kuliah: <strong>${task.subject}</strong></p>` : ''}
                <p style="color: #94a3b8; margin: 5px 0;">📆 Deadline: <strong>${formatDeadline(task.deadline)}</strong></p>
                <p style="color: #94a3b8; margin: 5px 0;">${formatPriority(task.priority_level)}</p>
            </div>
            
            <div style="background-color: ${hoursRemaining <= 1 ? '#7f1d1d' : hoursRemaining <= 24 ? '#78350f' : '#1e3a5f'}; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                <p style="font-size: 18px; font-weight: bold; margin: 0; color: ${hoursRemaining <= 1 ? '#fca5a5' : hoursRemaining <= 24 ? '#fcd34d' : '#93c5fd'};">
                    ⏳ ${timeText}
                </p>
            </div>
            
            ${task.description ? `
            <div style="background-color: #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #94a3b8; margin: 0;">📋 <strong>Detail:</strong></p>
                <p style="color: #cbd5e1; margin: 10px 0 0 0;">${task.description}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; color: #64748b; font-size: 12px;">
                <p>Jangan lupa selesaikan tugasmu! 💪</p>
                <p>Smart Student Task Manager</p>
            </div>
        </div>
    `;

    return { telegramMessage, emailSubject, emailHtml };
};

// Kirim notifikasi ke user
const sendNotification = async (user, task, hoursRemaining) => {
    const { telegramMessage, emailSubject, emailHtml } = generateNotificationMessage(task, hoursRemaining);
    
    try {
        // Kirim Telegram (hanya jika enabled dan ada chat_id)
        if (user.telegram_enabled && user.telegram_chat_id) {
            const bot = getBot();
            await bot.sendMessage(user.telegram_chat_id, telegramMessage, { parse_mode: 'Markdown' });
            console.log(`✅ Telegram sent to ${user.telegram_chat_id} for task: ${task.title}`);
        }

        // Kirim Email (hanya jika enabled dan ada email)
        if (user.email_enabled && user.email) {
            const transporter = getTransporter();
            await transporter.sendMail({
                from: 'Smart Task Manager <noreply@smarttask.com>',
                to: user.email,
                subject: emailSubject,
                html: emailHtml
            });
            console.log(`✅ Email sent to ${user.email} for task: ${task.title}`);
        }
        
        // Log jika tidak ada notifikasi yang dikirim
        if (!user.telegram_enabled && !user.email_enabled) {
            console.log(`⚠️ No notifications enabled for user - skipping task: ${task.title}`);
        }
    } catch (error) {
        console.error(`❌ Failed to send notification for task ${task.id}:`, error.message);
    }
};

// Cek dan kirim notifikasi untuk deadline yang mendekat
const checkAndNotifyDeadlines = async () => {
    console.log('🔍 Checking deadlines...');
    
    try {
        // Ambil semua task yang belum selesai dengan deadline dalam 25 jam ke depan
        // (25 jam untuk memastikan 24 jam dan 1 jam reminder tercakup)
        // Hanya ambil task dari user yang punya notifikasi enabled
        const [tasks] = await pool.query(`
            SELECT t.*, u.email, u.telegram_chat_id, u.telegram_enabled, u.email_enabled
            FROM tasks t
            JOIN users u ON t.user_id = u.id
            WHERE t.is_completed = FALSE 
            AND t.deadline IS NOT NULL
            AND t.deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 25 HOUR)
            AND (u.telegram_enabled = TRUE OR u.email_enabled = TRUE)
        `);

        if (tasks.length === 0) {
            console.log('📭 No upcoming deadlines to notify');
            return;
        }

        const now = new Date();
        
        console.log(`📋 Found ${tasks.length} upcoming tasks to check`);
        
        for (const task of tasks) {
            const deadline = new Date(task.deadline);
            const msUntilDeadline = deadline - now;
            const hoursUntilDeadline = msUntilDeadline / (1000 * 60 * 60);
            
            console.log(`📝 Task "${task.title}" - Deadline: ${deadline.toLocaleString()}, Hours until: ${hoursUntilDeadline.toFixed(2)}`);
            
            // Cek apakah sudah pernah dinotifikasi untuk waktu ini
            // - 22-26 jam sebelum deadline (reminder 24 jam) - lebih fleksibel
            // - 0-3 jam sebelum deadline (reminder 1 jam/terakhir)
            
            let shouldNotify = false;
            let notificationType = '';
            
            if (hoursUntilDeadline >= 22 && hoursUntilDeadline <= 26) {
                // 24 hour reminder (range diperlebar)
                shouldNotify = !task.notified_24h;
                notificationType = '24h';
                console.log(`  → In 24h range, notified_24h: ${task.notified_24h}, shouldNotify: ${shouldNotify}`);
            } else if (hoursUntilDeadline >= 0 && hoursUntilDeadline <= 3) {
                // 1 hour/final reminder (range diperlebar)
                shouldNotify = !task.notified_1h;
                notificationType = '1h';
                console.log(`  → In 1h range, notified_1h: ${task.notified_1h}, shouldNotify: ${shouldNotify}`);
            } else {
                console.log(`  → Not in notification range (hours: ${hoursUntilDeadline.toFixed(2)})`);
            }
            
            if (shouldNotify) {
                await sendNotification(
                    { 
                        email: task.email, 
                        telegram_chat_id: task.telegram_chat_id,
                        telegram_enabled: task.telegram_enabled,
                        email_enabled: task.email_enabled
                    },
                    task,
                    hoursUntilDeadline
                );
                
                // Update flag notifikasi di database
                const updateField = notificationType === '24h' ? 'notified_24h' : 'notified_1h';
                await pool.query(`UPDATE tasks SET ${updateField} = TRUE WHERE id = ?`, [task.id]);
                console.log(`📝 Updated ${updateField} flag for task ${task.id}`);
            }
        }
        
        console.log('✅ Deadline check completed');
    } catch (error) {
        console.error('❌ Error checking deadlines:', error.message);
    }
};

// Inisialisasi Cron Jobs
const initScheduler = () => {
    // Cek setiap 15 menit untuk deadline yang mendekat
    cron.schedule('*/15 * * * *', () => {
        console.log('⏰ Running scheduled deadline check...');
        checkAndNotifyDeadlines();
    });

    // Cek juga saat server start
    console.log('🚀 Scheduler initialized - checking deadlines every 15 minutes');
    checkAndNotifyDeadlines();
};

module.exports = { initScheduler, checkAndNotifyDeadlines, generateNotificationMessage };
