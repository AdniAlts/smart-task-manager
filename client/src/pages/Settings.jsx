import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { 
  Bell, 
  User, 
  Info,
  ExternalLink,
  Send,
  LogOut,
  Mail,
  MessageCircle,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Settings() {
  const { testNotification } = useTask();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    telegram_enabled: true,
    email_enabled: true,
  });

  // Load user settings on mount
  useEffect(() => {
    if (user) {
      setNotificationSettings({
        telegram_enabled: user.telegram_enabled ?? true,
        email_enabled: user.email_enabled ?? true,
      });
    }
  }, [user]);

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      await testNotification();
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggle = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveNotificationSettings = async () => {
    setIsSaving(true);
    try {
      await api.put('/auth/settings', notificationSettings);
      toast.success('Notification settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">
          Manage your preferences and account settings.
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden mb-6">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/50">
          <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Profile</h3>
            <p className="text-xs text-slate-500">Your account information</p>
          </div>
        </div>
        <div className="divide-y divide-slate-700/50">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-slate-300">Name</span>
            <span className="text-sm text-slate-400">{user?.name || 'User'}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-slate-300">Email</span>
            <span className="text-sm text-slate-400">{user?.email || '-'}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-slate-300">Telegram Chat ID</span>
            <span className="text-sm text-slate-400">{user?.telegram_chat_id || 'Not connected'}</span>
          </div>
        </div>
      </div>

      {/* Notification Settings Section */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden mb-6">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/50">
          <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Notifications</h3>
            <p className="text-xs text-slate-500">Configure how you receive reminders</p>
          </div>
        </div>
        
        <div className="divide-y divide-slate-700/50">
          {/* Telegram Toggle */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">Telegram Bot</p>
                <p className="text-xs text-slate-500">Get reminders via Telegram</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('telegram_enabled')}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notificationSettings.telegram_enabled ? 'bg-violet-600' : 'bg-slate-600'
              }`}
            >
              <span 
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notificationSettings.telegram_enabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Email Toggle */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">Email Notifications</p>
                <p className="text-xs text-slate-500">Get reminders via Email</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('email_enabled')}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notificationSettings.email_enabled ? 'bg-violet-600' : 'bg-slate-600'
              }`}
            >
              <span 
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notificationSettings.email_enabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Save Button */}
          <div className="px-5 py-4">
            <Button 
              onClick={handleSaveNotificationSettings}
              isLoading={isSaving}
              size="sm"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Test Notification */}
      <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 
                      border border-violet-500/30 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-violet-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Send className="w-6 h-6 text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Test Notifications</h3>
            <p className="text-sm text-slate-400 mb-3">
              Send a test notification to verify your Telegram and Email setup is working correctly.
            </p>
            <Button 
              onClick={handleTestNotification}
              isLoading={isTesting}
              size="sm"
            >
              <Bell className="w-4 h-4" />
              Send Test Notification
            </Button>
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="font-medium text-white">Sign Out</p>
              <p className="text-xs text-slate-500">Sign out from your account</p>
            </div>
          </div>
          <Button 
            variant="danger"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
