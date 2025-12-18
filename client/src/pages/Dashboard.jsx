import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import { WeeklyLoadChart, PriorityDistributionChart } from '../components/dashboard/Charts';
import { StatCardSkeleton, ChartSkeleton } from '../components/ui/Skeleton';
import TaskList from '../components/tasks/TaskList';
import { 
  CheckSquare, 
  AlertTriangle, 
  Clock, 
  Trophy,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { tasks, dashboardData, isLoading } = useTask();
  const { user } = useAuth();

  // Calculate stats from tasks if dashboard data not available
  const pendingTasks = tasks.filter(t => !t.is_completed);
  const urgentTasks = pendingTasks.filter(t => t.priority_level === 'do_first');
  const completedToday = tasks.filter(t => {
    if (!t.is_completed) return false;
    const today = new Date().toDateString();
    return new Date(t.updated_at).toDateString() === today;
  });

  // Get upcoming tasks (next 3)
  const upcomingTasks = pendingTasks
    .filter(t => t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  const stats = [
    {
      title: 'Total Pending',
      value: dashboardData?.summary?.total_pending ?? pendingTasks.length,
      subtitle: 'Tasks to complete',
      icon: CheckSquare,
      color: 'violet',
    },
    {
      title: 'Urgent Tasks',
      value: dashboardData?.summary?.total_urgent ?? urgentTasks.length,
      subtitle: 'Need attention now',
      icon: AlertTriangle,
      color: 'rose',
    },
    {
      title: 'Due This Week',
      value: dashboardData?.summary?.due_this_week ?? pendingTasks.filter(t => {
        if (!t.deadline) return false;
        const deadline = new Date(t.deadline);
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return deadline <= weekFromNow;
      }).length,
      subtitle: 'Coming up soon',
      icon: Clock,
      color: 'amber',
    },
    {
      title: 'Completed Today',
      value: completedToday.length,
      subtitle: 'Great progress!',
      icon: Trophy,
      color: 'emerald',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get first name only
  const firstName = user?.name?.split(' ')[0] || 'Student';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-slate-400 mt-1">
            Here's what's happening with your tasks today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Load Chart */}
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Task Load</h3>
          {isLoading ? (
            <div className="h-64 animate-pulse bg-slate-700/30 rounded-lg" />
          ) : (
            <WeeklyLoadChart data={dashboardData?.weekly_load} />
          )}
        </div>

        {/* Priority Distribution Chart */}
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Priority Distribution</h3>
          {isLoading ? (
            <div className="h-64 animate-pulse bg-slate-700/30 rounded-lg" />
          ) : (
            <PriorityDistributionChart data={dashboardData?.priority_distribution} />
          )}
        </div>
      </div>

      {/* Upcoming Tasks Section */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Upcoming Deadlines</h3>
          <Link 
            to="/tasks" 
            className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {upcomingTasks.length > 0 ? (
          <div className="space-y-3">
            {upcomingTasks.map(task => (
              <div 
                key={task.id}
                className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority_level === 'Do First' ? 'bg-rose-500' :
                    task.priority_level === 'Schedule' ? 'bg-amber-500' :
                    task.priority_level === 'Delegate' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <p className="font-medium text-white">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.subject}</p>
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  {new Date(task.deadline).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No upcoming deadlines</p>
          </div>
        )}
      </div>
    </div>
  );
}
