// Vercel Serverless Function - Telegram Webhook Handler
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

module.exports = async (req, res) => {
    // Only accept POST requests from Telegram
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const update = req.body;

        // Handle /start command
        if (update.message && update.message.text === '/start') {
            const chatId = update.message.chat.id;
            const userName = update.message.from.first_name || 'there';

            const message = {
                chat_id: chatId,
                text: `👋 Welcome ${userName}!\n\n` +
                      `✅ Your Telegram notifications are now active!\n\n` +
                      `Your Chat ID is:\n` +
                      `\`${chatId}\`\n\n` +
                      `You can use this Chat ID in TaskMind settings to receive task notifications.`,
                parse_mode: 'Markdown'
            };

            // Send message back to user
            const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
            const response = await fetch(telegramApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });

            if (!response.ok) {
                console.error('Telegram API error:', await response.text());
            }
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
