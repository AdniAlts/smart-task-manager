const cron = require('node-cron');
const pool = require('../config/database');
const { sendEmail } = require('./emailService');
const TelegramBot = require('node-telegram-bot-api');

// Setup Telegram Bot
const getBot = () => {
    return new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
};

// Format deadline untuk pesan (Indonesian Locale)
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

// Format priority
const formatPriority = (priority) => {
    const map = {
        'do_first': '🔴 Do First (Urgent)',
        'schedule': '🟡 Schedule',
        'delegate': '🔵 Delegate',
        'eliminate': '⚪ Eliminate'
    };
    return map[priority] || priority;
};

// Generator Template Pesan (Telegram & Email)
const generateNotificationMessage = (task, hoursRemaining) => {
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

    // Template Telegram
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

    // Template Email (HTML)
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

// Fungsi Kirim Notifikasi
const sendNotification = async (user, task, hoursRemaining) => {
    const { telegramMessage, emailSubject, emailHtml } = generateNotificationMessage(task, hoursRemaining);
    
    try {
        if (user.telegram_enabled && user.telegram_chat_id) {
            const bot = getBot();
            await bot.sendMessage(user.telegram_chat_id, telegramMessage, { parse_mode: 'Markdown' });
            console.log(`✅ Telegram sent to ${user.telegram_chat_id} for task: ${task.title}`);
        }

        if (user.email_enabled && user.email) {
            await sendEmail({
                to: user.email,
                subject: emailSubject,
                html: emailHtml
            });
            console.log(`✅ Email sent to ${user.email} for task: ${task.title}`);
        }
    } catch (error) {
        console.error(`❌ Failed to send notification for task ${task.id}:`, error.message);
    }
};

// LOGIKA UTAMA: Cek Deadline
const checkAndNotifyDeadlines = async () => {
    console.log('\n' + '='.repeat(60));
    console.log(`🔍 CHECKING DEADLINES`);
    console.log('='.repeat(60));
    
    try {
        // PENTING: Ambil waktu dari DATABASE, bukan dari JavaScript!
        // Database sudah dikonfigurasi timezone +07:00 (WIB)
        // new Date() di Railway akan selalu UTC, menyebabkan perhitungan salah
        const [[timeResult]] = await pool.query('SELECT NOW() as db_now');
        const now = new Date(timeResult.db_now);
        
        console.log(`⏰ Database NOW() (WIB): ${now.toLocaleString('id-ID')}`);
        
        // Query: Cari task dengan deadline antara (Sekarang - 1 Jam) s/d (Sekarang + 30 Jam)
        const [tasks] = await pool.query(`
            SELECT t.*, u.email, u.telegram_chat_id, u.telegram_enabled, u.email_enabled
            FROM tasks t
            JOIN users u ON t.user_id = u.id
            WHERE t.is_completed = FALSE 
            AND t.deadline IS NOT NULL
            AND t.deadline BETWEEN DATE_SUB(NOW(), INTERVAL 1 HOUR) AND DATE_ADD(NOW(), INTERVAL 30 HOUR)
            AND (u.telegram_enabled = TRUE OR u.email_enabled = TRUE)
        `);

        if (tasks.length === 0) {
            console.log('📭 No upcoming deadlines in range.');
            console.log('='.repeat(60) + '\n');
            return;
        }

        console.log(`📋 Found ${tasks.length} candidate task(s). Checking precise timing...`);
        
        for (const task of tasks) {
            const deadline = new Date(task.deadline);
            
            // Hitung selisih waktu (miliseconds)
            const msUntilDeadline = deadline - now;
            // Konversi ke jam (bisa negatif jika sudah lewat deadline, atau positif jika belum)
            const hoursUntilDeadline = msUntilDeadline / (1000 * 60 * 60);
            
            console.log(`\n📝 Checking: "${task.title}"`);
            console.log(`   Deadline: ${formatDeadline(task.deadline)}`);
            console.log(`   Hours left: ${hoursUntilDeadline.toFixed(2)}h`);

            let shouldNotify = false;
            let notificationType = '';
            
            // Logic 1: Reminder 24 Jam (Range 20 jam s/d 27 jam sebelum deadline)
            if (hoursUntilDeadline >= 20 && hoursUntilDeadline <= 27) {
                if (!task.notified_24h) {
                    shouldNotify = true;
                    notificationType = '24h';
                } else {
                    console.log(`   ⏭️ Already sent 24h reminder.`);
                }
            } 
            // Logic 2: Reminder 1 Jam / Urgent (Range 0 jam s/d 4 jam sebelum deadline)
            else if (hoursUntilDeadline >= 0 && hoursUntilDeadline <= 4) {
                if (!task.notified_1h) {
                    shouldNotify = true;
                    notificationType = '1h';
                } else {
                    console.log(`   ⏭️ Already sent 1h reminder.`);
                }
            }
            // Logic 3: Task Terlewat (Opsional, untuk debugging)
            else if (hoursUntilDeadline < 0) {
                 console.log(`   ⚠️ Task Overdue (Deadline passed).`);
            } else {
                 console.log(`   ⏳ Not in notification range yet.`);
            }
            
            // Eksekusi Pengiriman
            if (shouldNotify) {
                console.log(`   🚀 SENDING ${notificationType.toUpperCase()} NOTIFICATION...`);
                
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
                
                // Update database agar tidak kirim double
                const updateField = notificationType === '24h' ? 'notified_24h' : 'notified_1h';
                await pool.query(`UPDATE tasks SET ${updateField} = TRUE WHERE id = ?`, [task.id]);
                console.log(`   ✅ Flag ${updateField} updated.`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking deadlines:', error.message);
    }
};

// Inisialisasi Scheduler
const initScheduler = () => {
    // Jalan setiap menit
    cron.schedule('* * * * *', () => {
        checkAndNotifyDeadlines();
    });

    // Jalan sekali saat server restart
    console.log('🚀 Scheduler initialized - Checking every 1 minute');
    console.log('⚠️  Note: Using DATABASE time (WIB), not server time (UTC)');
    checkAndNotifyDeadlines();
};

module.exports = { initScheduler, checkAndNotifyDeadlines, generateNotificationMessage };