import { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  Send,
  Mail,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { PriorityBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function Notifications() {
  const { tasks, isLoading, testNotification } = useTask();
  const [isTesting, setIsTesting] = useState(false);
  
  // Filter upcoming tasks for notifications
  const getUpcomingDeadlines = () => {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    return tasks
      .filter(task => {
        if (task.is_completed || !task.deadline) return false;
        const deadline = new Date(task.deadline);
        return deadline <= in48Hours;
      })
      .map(task => {
        const deadline = new Date(task.deadline);
        const now = new Date();
        const hoursUntil = Math.floor((deadline - now) / (1000 * 60 * 60));
        
        let urgency = 'normal';
        if (deadline < now) urgency = 'overdue';
        else if (hoursUntil <= 6) urgency = 'critical';
        else if (hoursUntil <= 24) urgency = 'urgent';
        
        return { ...task, hoursUntil, urgency };
      })
      .sort((a, b) => a.hoursUntil - b.hoursUntil);
  };

  const upcomingTasks = getUpcomingDeadlines();

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      await testNotification();
    } finally {
      setIsTesting(false);
    }
  };

  const formatTimeUntil = (hoursUntil) => {
    if (hoursUntil < 0) {
      const overdue = Math.abs(hoursUntil);
      if (overdue < 24) return `${overdue}h overdue`;
      return `${Math.floor(overdue / 24)}d overdue`;
    }
    if (hoursUntil < 1) return 'Less than 1 hour';
    if (hoursUntil < 24) return `${hoursUntil} hours`;
    return `${Math.floor(hoursUntil / 24)} days`;
  };

  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'overdue':
        return 'border-rose-500/50 bg-rose-500/10';
      case 'critical':
        return 'border-amber-500/50 bg-amber-500/10';
      case 'urgent':
        return 'border-yellow-500/50 bg-yellow-500/10';
      default:
        return 'border-slate-700/50 bg-slate-800/50';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'urgent':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Calendar className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-slate-400 mt-1">
          Stay updated with your task deadlines and reminders.
        </p>
      </div>

      {/* Notification Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Telegram Bot Card */}
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Telegram Bot</h3>
              <p className="text-xs text-slate-500">Get instant notifications</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-3">
            Receive deadline reminders directly on Telegram. The bot will notify you 24 hours and 1 hour before deadlines.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400">Connected</span>
          </div>
        </div>

        {/* Email Card */}
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Email Notifications</h3>
              <p className="text-xs text-slate-500">Daily digest & reminders</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-3">
            Get email reminders for upcoming deadlines and daily task summaries.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400">Enabled</span>
          </div>
        </div>
      </div>

      {/* Test Notification */}
      <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 
                      border border-violet-500/30 rounded-xl p-5 mb-8">
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

      {/* Upcoming Deadlines */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Upcoming Deadlines</h2>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
          Next 48 hours
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-800/50 rounded-xl p-4 h-24" />
          ))}
        </div>
      ) : upcomingTasks.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-1">All caught up!</h3>
          <p className="text-sm text-slate-500">No urgent deadlines in the next 48 hours.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingTasks.map((task) => (
            <div 
              key={task.id}
              className={`rounded-xl p-4 border transition-all ${getUrgencyStyle(task.urgency)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getUrgencyIcon(task.urgency)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{task.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <PriorityBadge priority={task.priority_level} />
                    {task.subject && (
                      <span className="text-xs text-slate-500">{task.subject}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {task.description?.substring(0, 100)}
                    {task.description?.length > 100 ? '...' : ''}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${
                    task.urgency === 'overdue' ? 'text-rose-400' :
                    task.urgency === 'critical' ? 'text-amber-400' :
                    task.urgency === 'urgent' ? 'text-yellow-400' :
                    'text-slate-400'
                  }`}>
                    {formatTimeUntil(task.hoursUntil)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(task.deadline).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notification Preview */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Notification Preview</h2>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          {/* Telegram Style Preview */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-blue-400">Telegram Message</span>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 text-sm">
              <p className="text-white font-medium">⏰ Deadline Reminder!</p>
              <p className="text-slate-300 mt-1">
                📚 <strong>Task:</strong> {upcomingTasks[0]?.title || 'Complete Assignment'}
              </p>
              <p className="text-slate-300">
                📅 <strong>Due:</strong> {upcomingTasks[0] 
                  ? new Date(upcomingTasks[0].deadline).toLocaleString()
                  : 'Tomorrow, 11:59 PM'}
              </p>
              <p className="text-slate-300">
                🎯 <strong>Priority:</strong> {upcomingTasks[0]?.priority_level || 'Schedule'}
              </p>
              <p className="text-amber-400 mt-2 text-xs">
                ⚠️ Don't forget to complete this task!
              </p>
            </div>
          </div>

          {/* Email Style Preview */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-medium text-violet-400">Email Preview</span>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 text-sm">
              <p className="text-slate-500 text-xs mb-2">From: Smart Task Manager &lt;noreply@taskmaster.com&gt;</p>
              <p className="text-white font-medium">Subject: ⏰ Reminder: Deadline Approaching</p>
              <hr className="my-2 border-slate-700" />
              <p className="text-slate-300">Hi Student,</p>
              <p className="text-slate-300 mt-2">
                This is a friendly reminder that your task <strong>"{upcomingTasks[0]?.title || 'Complete Assignment'}"</strong> is due soon.
              </p>
              <p className="text-slate-400 mt-2 text-xs">
                — Smart Task Manager Team
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
