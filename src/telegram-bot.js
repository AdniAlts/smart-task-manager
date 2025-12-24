const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;

const initTelegramBot = () => {
  if (!token) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN not set in environment variables');
    return null;
  }

  try {
    bot = new TelegramBot(token, { polling: true });

    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const userName = msg.from.first_name || 'there';

      bot.sendMessage(
        chatId, 
        `👋 Welcome ${userName}!\n\n` +
        `✅ Your Telegram notifications are now active!\n\n` +
        `Your Chat ID is:\n` +
        `<code>${chatId}</code>\n\n` +
        `You can use this Chat ID in TaskMind settings to receive task notifications.`,
        { parse_mode: 'HTML' }
      );
    });

    bot.on('polling_error', (error) => {
      console.error('Telegram polling error:', error.code, error.message);
    });

    console.log('🤖 Telegram bot started successfully');
    return bot;
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error.message);
    return null;
  }
};

const getTelegramBot = () => bot;

module.exports = { initTelegramBot, getTelegramBot };
