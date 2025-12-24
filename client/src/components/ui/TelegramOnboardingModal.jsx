import { MessageCircle, ExternalLink, Check } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function TelegramOnboardingModal({ isOpen, onClose, chatId }) {
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'your_bot_username';

  const handleOpenTelegram = () => {
    window.open(`https://t.me/${botUsername}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enable Telegram Notifications">
      <div className="space-y-4">
        {/* Info */}
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-6 h-6 text-violet-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-white mb-1">Start Your Bot</h3>
              <p className="text-sm text-slate-300">
                To receive task notifications on Telegram, you need to start a conversation with our bot first.
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">Follow these steps:</h4>
          
          <div className="space-y-3">
            {/* Step 1 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-medium">
                1
              </div>
              <div>
                <p className="text-slate-300 text-sm">
                  Click the button below to open our Telegram bot
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-medium">
                2
              </div>
              <div>
                <p className="text-slate-300 text-sm">
                  Press the <span className="font-mono bg-slate-800 px-2 py-0.5 rounded">/start</span> button in the chat
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-medium">
                3
              </div>
              <div>
                <p className="text-slate-300 text-sm">
                  You'll start receiving task notifications!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat ID Display */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Your Chat ID:</p>
          <p className="font-mono text-sm text-white">{chatId}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleOpenTelegram}
            className="flex-1 justify-center"
            icon={<ExternalLink className="w-4 h-4" />}
          >
            Open Telegram Bot
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1 justify-center"
            icon={<Check className="w-4 h-4" />}
          >
            Got It
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-500 text-center">
          You can skip this now and do it later from Settings
        </p>
      </div>
    </Modal>
  );
}
