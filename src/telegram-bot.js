const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;

const initTelegramBot = () => {
  // Check if token exists
  if (!token || token.trim() === '') {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN not set in environment variables. Telegram bot disabled.');
    return null;
  }

  // Validate token format (should be like: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11)
  const tokenRegex = /^\d+:[A-Za-z0-9_-]+$/;
  if (!tokenRegex.test(token)) {
    console.error('❌ Invalid TELEGRAM_BOT_TOKEN format. Bot not started.');
    return null;
  }

  try {
    bot = new TelegramBot(token, { 
      polling: {
        interval: 300,
        autoStart: true,
        params: {
          timeout: 10
        }
      }
    });

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
      ).catch(err => {
        console.error('Error sending message:', err.message);
      });
    });

    bot.on('polling_error', (error) => {
      if (error.code === 'ETELEGRAM' && error.response && error.response.statusCode === 404) {
        console.error('❌ Telegram Bot Error: Invalid bot token (404 Not Found)');
        console.error('Please check your TELEGRAM_BOT_TOKEN in Railway environment variables');
        console.error('Get a valid token from @BotFather on Telegram');
        // Stop polling on 404
        bot.stopPolling();
      } else if (error.code === 'ETELEGRAM' && error.response && error.response.statusCode === 409) {
        console.error('❌ Telegram Bot Error: Conflict - bot is already running elsewhere');
        bot.stopPolling();
      } else {
        console.error('Telegram polling error:', error.code, error.message);
      }
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
