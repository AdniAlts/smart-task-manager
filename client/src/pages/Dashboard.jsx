import { useTask } from '../context/TaskContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, ListTodo, Clock, BarChart3 } from 'lucide-react';

// Map API priority keys to display names and colors
const PRIORITY_MAP = {
  'do_first': { name: 'Do First', color: '#f43f5e' },
  'schedule': { name: 'Schedule', color: '#f59e0b' },
  'delegate': { name: 'Delegate', color: '#3b82f6' },
  'eliminate': { name: 'Eliminate', color: '#6b7280' },
};

const Dashboard = () => {
  const { dashboardData, loading, tasks } = useTask();

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-72 bg-slate-800 rounded-xl" />
          <div className="h-72 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const summary = dashboardData?.summary || { total_pending: 0, total_urgent: 0 };
  const weeklyLoad = dashboardData?.weekly_load || [];
  const priorityDist = dashboardData?.priority_distribution || [];

  // Transform priority data - API returns priority_level (snake_case) and total
  const chartData = priorityDist.map(item => {
    const priorityInfo = PRIORITY_MAP[item.priority_level] || { name: item.priority_level, color: '#6b7280' };
    return {
      name: priorityInfo.name,
      value: item.total || 0,
      color: priorityInfo.color,
    };
  });

  const stats = [
    {
      label: 'Total Tasks',
      value: tasks.length,
      icon: ListTodo,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/20',
    },
    {
      label: 'Pending',
      value: summary.total_pending || 0,
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      label: 'Urgent',
      value: Number(summary.total_urgent) || 0,
      icon: AlertCircle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Your task overview at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} border ${stat.borderColor} rounded-xl p-4 transition-colors hover:border-opacity-40`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Load Bar Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-base font-medium text-white mb-4">Weekly Task Load</h2>
          {weeklyLoad.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyLoad} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#64748b" 
                  tick={{ fontSize: 12 }} 
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" name="Tasks" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-slate-500">
              <BarChart3 className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No weekly data available</p>
            </div>
          )}
        </div>

        {/* Priority Distribution Pie Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-base font-medium text-white mb-4">Priority Distribution</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={85}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-slate-500">
              <ListTodo className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No priority data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
