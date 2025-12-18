import { useState } from 'react';
import { useTask } from '../context/TaskContext';
import Button from '../components/ui/Button';
import { 
  Bell, 
  User, 
  Palette, 
  Shield,
  Info,
  ExternalLink,
  TestTube,
  CheckCircle,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { testNotification } = useTask();
  const [isTesting, setIsTesting] = useState(false);

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      await testNotification();
    } finally {
      setIsTesting(false);
    }
  };

  const settingsSections = [
    {
      title: 'Profile',
      icon: User,
      description: 'Manage your account information',
      items: [
        { label: 'Display Name', value: 'Student User', type: 'text' },
        { label: 'Email', value: 'student@university.edu', type: 'text' },
        { label: 'Student ID', value: '1', type: 'text' },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      description: 'Configure how you receive alerts',
      items: [
        { label: 'Email Notifications', value: true, type: 'toggle' },
        { label: 'Push Notifications', value: true, type: 'toggle' },
        { label: 'Reminder Before Deadline', value: '1 hour', type: 'select' },
      ],
    },
    {
      title: 'Appearance',
      icon: Palette,
      description: 'Customize the look and feel',
      items: [
        { label: 'Theme', value: 'Dark', type: 'select' },
        { label: 'Accent Color', value: 'Violet', type: 'select' },
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">
          Manage your preferences and account settings.
        </p>
      </div>

      {/* Test Notification Card */}
      <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 
                      border border-violet-500/30 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-violet-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <TestTube className="w-6 h-6 text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Test Notifications</h3>
            <p className="text-sm text-slate-400 mb-3">
              Send a test notification to verify your notification setup is working correctly.
            </p>
            <Button 
              onClick={handleTestNotification}
              isLoading={isTesting}
              variant="primary"
              size="sm"
            >
              <Bell className="w-4 h-4" />
              Send Test Notification
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section) => (
          <div 
            key={section.title}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden"
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/50">
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                <section.icon className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{section.title}</h3>
                <p className="text-xs text-slate-500">{section.description}</p>
              </div>
            </div>

            {/* Section Items */}
            <div className="divide-y divide-slate-700/50">
              {section.items.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <span className="text-sm text-slate-300">{item.label}</span>
                  
                  {item.type === 'toggle' ? (
                    <button
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        item.value ? 'bg-violet-600' : 'bg-slate-600'
                      }`}
                    >
                      <span 
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          item.value ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  ) : item.type === 'select' ? (
                    <select className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white">
                      <option>{item.value}</option>
                    </select>
                  ) : (
                    <span className="text-sm text-slate-400">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* App Info */}
      <div className="mt-8 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-300">Smart Task Manager</p>
              <p className="text-xs text-slate-500">Version 1.0.0 • Built with React + Vite</p>
            </div>
          </div>
          <a 
            href="#" 
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
          >
            Documentation <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Logout Section */}
      <div className="mt-6 p-5 bg-slate-800/50 rounded-xl border border-slate-700/50">
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
            onClick={() => toast.success('Logout functionality coming soon!')}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
