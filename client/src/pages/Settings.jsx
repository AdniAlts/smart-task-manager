import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { 
  Bell, 
  User, 
  Send,
  LogOut,
  Trash2,
  Mail,
  MessageCircle,
  Save,
  Edit3,
  Lock,
  Eye,
  EyeOff,
  X,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Settings() {
  const { testNotification } = useTask();
  const { user, logout, deleteAccount, updateUser, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    telegram_chat_id: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Change password states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
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
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        telegram_chat_id: user.telegram_chat_id || ''
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
      const response = await api.put('/auth/settings', notificationSettings);
      updateUser(response.data.data);
      toast.success('Notification settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!profileData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    setIsSavingProfile(true);
    try {
      const response = await api.put('/auth/profile', {
        name: profileData.name,
        email: profileData.email,
        telegram_chat_id: profileData.telegram_chat_id || null
      });
      updateUser(response.data.data);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setShowChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Profile</h3>
              <p className="text-xs text-slate-500">Your account information</p>
            </div>
          </div>
          {!isEditingProfile && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setIsEditingProfile(true)}
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>
        
        {isEditingProfile ? (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg
                         text-white placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg
                         text-white placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Telegram Chat ID
                <a 
                  href="https://t.me/SpynixBot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 ml-2 text-xs"
                >
                  (Get your ID)
                </a>
              </label>
              <input
                type="text"
                value={profileData.telegram_chat_id}
                onChange={(e) => setProfileData(prev => ({ ...prev, telegram_chat_id: e.target.value }))}
                placeholder="e.g., 123456789"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg
                         text-white placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button 
                onClick={handleSaveProfile}
                isLoading={isSavingProfile}
                size="sm"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsEditingProfile(false);
                  setProfileData({
                    name: user?.name || '',
                    email: user?.email || '',
                    telegram_chat_id: user?.telegram_chat_id || ''
                  });
                }}
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      {/* Change Password Section */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Password</h3>
              <p className="text-xs text-slate-500">Change your account password</p>
            </div>
          </div>
          {!showChangePassword && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowChangePassword(true)}
            >
              <Edit3 className="w-4 h-4" />
              Change
            </Button>
          )}
        </div>
        
        {showChangePassword && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 pr-10 bg-slate-900 border border-slate-700 rounded-lg
                           text-white placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 pr-10 bg-slate-900 border border-slate-700 rounded-lg
                           text-white placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 pr-10 bg-slate-900 border border-slate-700 rounded-lg
                           text-white placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button 
                onClick={handleChangePassword}
                isLoading={isChangingPassword}
                size="sm"
              >
                <Check className="w-4 h-4" />
                Change Password
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}
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

      {/* Delete Account Section */}
      <div className="p-5 bg-rose-900/10 rounded-xl border border-rose-900/30 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="font-medium text-rose-400">Delete Account</p>
              <p className="text-xs text-rose-300/70">Permanently delete your account and all data</p>
            </div>
          </div>
          <Button 
            variant="danger"
            size="sm"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                const result = await deleteAccount();
                if (!result.success) {
                  toast.error(result.message);
                }
              }
            }}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
