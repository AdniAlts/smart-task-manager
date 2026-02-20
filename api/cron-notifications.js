// Vercel Serverless Function - Cron Job for Notifications
require('dotenv').config();
const pool = require('../src/config/database');
const { sendEmail } = require('../src/services/emailService');

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

// Send Telegram notification
const sendTelegramNotification = async (chatId, message) => {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN || !chatId) return false;

    try {
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        return response.ok;
    } catch (error) {
        console.error('Telegram error:', error);
        return false;
    }
};

// Generate notification message
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

    return `
🔔 *DEADLINE REMINDER*

📝 *${task.title}*
${task.subject ? `📚 Mata Kuliah: ${task.subject}` : ''}
📆 Deadline: ${formatDeadline(task.deadline)}
${formatPriority(task.priority_level)}

⏳ *${timeText}*

${task.description ? `📋 Detail: ${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}` : ''}

_Jangan lupa selesaikan tugasmu! 💪_
    `.trim();
};

// Main cron handler
module.exports = async (req, res) => {
    // Verify cron secret for security
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('⏰ Running scheduled notification check...');

    try {
        const connection = await pool.getConnection();

        try {
            // Get tasks that need notifications
            const [tasks] = await connection.execute(`
                SELECT 
                    t.*,
                    u.email as user_email,
                    u.telegram_chat_id,
                    TIMESTAMPDIFF(HOUR, NOW(), t.deadline) as hours_remaining
                FROM tasks t
                JOIN users u ON t.user_id = u.id
                WHERE t.status != 'done'
                AND t.deadline IS NOT NULL
                AND t.deadline > NOW()
                AND TIMESTAMPDIFF(HOUR, NOW(), t.deadline) <= 24
                ORDER BY t.deadline ASC
            `);

            let notificationsSent = 0;

            for (const task of tasks) {
                const message = generateNotificationMessage(task, task.hours_remaining);

                // Send Telegram notification
                if (task.telegram_chat_id) {
                    const telegramSent = await sendTelegramNotification(task.telegram_chat_id, message);
                    if (telegramSent) notificationsSent++;
                }

                // Send email notification
                if (task.user_email) {
                    try {
                        await sendEmail(
                            task.user_email,
                            `⏰ Reminder: ${task.title}`,
                            message
                        );
                        notificationsSent++;
                    } catch (emailError) {
                        console.error('Email error:', emailError);
                    }
                }
            }

            connection.release();

            console.log(`✅ Sent ${notificationsSent} notifications for ${tasks.length} tasks`);
            
            res.status(200).json({
                success: true,
                tasksChecked: tasks.length,
                notificationsSent,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('❌ Cron job error:', error);
        res.status(500).json({ 
            error: 'Cron job failed', 
            message: error.message 
        });
    }
};
