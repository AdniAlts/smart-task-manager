const cron = require('node-cron');
const pool = require('../config/database');
const { sendEmail } = require('./emailService');
const TelegramBot = require('node-telegram-bot-api');

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
    // Format jam dengan lebih rapi
    let timeText;
    if (hoursRemaining < 1) {
        const minutesRemaining = Math.round(hoursRemaining * 60);
        timeText = `⚠️ KURANG DARI ${minutesRemaining} MENIT LAGI!`;
    } else if (hoursRemaining <= 2) {
        timeText = `⚠️ ${Math.round(hoursRemaining)} jam lagi!`;
    } else if (hoursRemaining <= 24) {
        timeText = `⏰ ${Math.round(hoursRemaining)} jam lagi`;
    } else {
        const days = Math.floor(hoursRemaining / 24);
        const remainingHours = Math.round(hoursRemaining % 24);
        timeText = remainingHours > 0 
            ? `📅 ${days} hari ${remainingHours} jam lagi`
            : `📅 ${days} hari lagi`;
    }

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
                <p>TaskMind</p>
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

        // Kirim Email via Brevo (hanya jika enabled dan ada email)
        if (user.email_enabled && user.email) {
            await sendEmail({
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
    const now = new Date();
    const TIMEZONE_OFFSET = parseInt(process.env.TIMEZONE_OFFSET || '7');
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 CHECKING DEADLINES');
    console.log(`⏰ Server Time (UTC): ${now.toISOString()}`);
    console.log(`⏰ Timezone Offset: +${TIMEZONE_OFFSET} hours`);
    console.log('='.repeat(60));
    
    try {
        // Ambil semua task yang belum selesai dengan deadline dalam 27 jam ke depan
        // Range diperlebar ke 27 jam untuk memastikan 24h reminder (22-26 jam) tercakup
        // Query menggunakan waktu database (yang biasanya WIB)
        const [tasks] = await pool.query(`
            SELECT t.*, u.email, u.telegram_chat_id, u.telegram_enabled, u.email_enabled
            FROM tasks t
            JOIN users u ON t.user_id = u.id
            WHERE t.is_completed = FALSE 
            AND t.deadline IS NOT NULL
            AND t.deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 27 HOUR)
            AND (u.telegram_enabled = TRUE OR u.email_enabled = TRUE)
        `);

        if (tasks.length === 0) {
            console.log('📭 No upcoming deadlines to notify in next 27 hours');
            console.log('='.repeat(60) + '\n');
            return;
        }

        console.log(`\n📋 Found ${tasks.length} upcoming task(s) to check`);
        
        // Ambil waktu sekarang dari database untuk konsistensi timezone
        const [[dbTime]] = await pool.query('SELECT NOW() as now');
        const dbNow = new Date(dbTime.now);
        console.log(`📅 Database NOW(): ${dbNow.toLocaleString('id-ID')}`);
        
        for (const task of tasks) {
            const deadline = new Date(task.deadline);
            
            // Hitung selisih waktu menggunakan waktu database (bukan server time)
            // Ini memastikan konsistensi karena deadline dan NOW() dari sumber yang sama
            const msUntilDeadline = deadline - dbNow;
            const hoursUntilDeadline = msUntilDeadline / (1000 * 60 * 60);
            
            console.log(`\n📝 Checking Task ID ${task.id}: "${task.title}"`);
            console.log(`   Deadline (DB): ${deadline.toLocaleString('id-ID')}`);
            console.log(`   Now (DB): ${dbNow.toLocaleString('id-ID')}`);
            console.log(`   Hours until deadline: ${hoursUntilDeadline.toFixed(2)}h`);
            console.log(`   Flags: notified_24h=${task.notified_24h}, notified_1h=${task.notified_1h}`);
            console.log(`   User: telegram_enabled=${task.telegram_enabled}, email_enabled=${task.email_enabled}`);
            
            // Cek apakah sudah pernah dinotifikasi untuk waktu ini
            // - 20-27 jam sebelum deadline (reminder 24 jam) - range diperlebar untuk toleransi
            // - 0-4 jam sebelum deadline (reminder 1 jam/terakhir) - range diperlebar
            
            let shouldNotify = false;
            let notificationType = '';
            
            if (hoursUntilDeadline >= 20 && hoursUntilDeadline <= 27) {
                // 24 hour reminder (range diperlebar: 20-27 jam)
                shouldNotify = !task.notified_24h;
                notificationType = '24h';
                console.log(`   ✅ IN 24H RANGE (20-27h)`);
                console.log(`   → Already notified? ${task.notified_24h ? 'YES ❌' : 'NO ✅'}`);
                console.log(`   → Will notify? ${shouldNotify ? 'YES 📤' : 'NO (already sent)'}`);
            } else if (hoursUntilDeadline >= 0 && hoursUntilDeadline <= 4) {
                // 1 hour/final reminder (range diperlebar: 0-4 jam)
                shouldNotify = !task.notified_1h;
                notificationType = '1h';
                console.log(`   ✅ IN 1H RANGE (0-4h)`);
                console.log(`   → Already notified? ${task.notified_1h ? 'YES ❌' : 'NO ✅'}`);
                console.log(`   → Will notify? ${shouldNotify ? 'YES 📤' : 'NO (already sent)'}`);
            } else if (hoursUntilDeadline > 4 && hoursUntilDeadline < 20) {
                console.log(`   ⏭️ IN BETWEEN RANGES (4-20h) - waiting for 1h reminder`);
            } else {
                console.log(`   ⏭️ NOT IN NOTIFICATION RANGE`);
                console.log(`   → Need: 20-27h or 0-4h, got: ${hoursUntilDeadline.toFixed(2)}h`);
            }
            
            if (shouldNotify) {
                console.log(`   🚀 SENDING NOTIFICATION (${notificationType})...`);
                
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
                console.log(`   ✅ Notification sent & ${updateField} flag updated for task ${task.id}`);
            } else {
                console.log(`   ⏭️ SKIPPED (already notified or not in range)`);
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ Deadline check completed');
        console.log('='.repeat(60) + '\n');
    } catch (error) {
        console.error('❌ Error checking deadlines:', error.message);
    }
};

// Inisialisasi Cron Jobs
const initScheduler = () => {
    // Cek setiap 1 menit untuk deadline yang mendekat
    cron.schedule('* * * * *', () => {
        console.log('⏰ Running scheduled deadline check...');
        checkAndNotifyDeadlines();
    });

    // Cek juga saat server start
    console.log('🚀 Scheduler initialized - checking deadlines every 1 minute');
    checkAndNotifyDeadlines();
};

module.exports = { initScheduler, checkAndNotifyDeadlines, generateNotificationMessage };
