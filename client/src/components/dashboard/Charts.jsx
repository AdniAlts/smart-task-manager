import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const PRIORITY_COLORS = {
  'do_first': '#f43f5e',   // rose-500
  'schedule': '#f59e0b',   // amber-500
  'delegate': '#3b82f6',   // blue-500
  'eliminate': '#6b7280',  // gray-500
  // Also support display names
  'Do First': '#f43f5e',
  'Schedule': '#f59e0b',
  'Delegate': '#3b82f6',
  'Eliminate': '#6b7280',
};

// Convert snake_case to display name
const formatPriorityName = (priority) => {
  const map = {
    'do_first': 'Do First',
    'schedule': 'Schedule',
    'delegate': 'Delegate',
    'eliminate': 'Eliminate',
  };
  return map[priority] || priority;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-sm text-slate-300">{label}</p>
        <p className="text-sm font-semibold text-violet-400">
          {payload[0].value} tasks
        </p>
      </div>
    );
  }
  return null;
};

export function WeeklyLoadChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500">
        <p>No weekly data yet</p>
        <p className="text-xs mt-1">Tasks will appear here as you add them</p>
      </div>
    );
  }

  // Transform data for the chart - format dates properly
  const chartData = data.map(item => {
    let name = item.day || item.day_name;
    
    // If we have a date string, format it nicely
    if (item.date) {
      const date = new Date(item.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const isToday = date.toDateString() === today.toDateString();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = date.toDateString() === tomorrow.toDateString();
      
      if (isToday) {
        name = 'Today';
      } else if (isTomorrow) {
        name = 'Tomorrow';
      } else {
        name = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      }
    }
    
    return {
      name,
      tasks: item.task_count || item.count || item.total || 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis 
          dataKey="name" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 12 }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
        <Bar 
          dataKey="tasks" 
          fill="#8b5cf6" 
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PriorityDistributionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500">
        <p>No priority data yet</p>
        <p className="text-xs mt-1">Add tasks to see distribution</p>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = data.map(item => {
    const priority = item.priority_level || item.priority;
    return {
      name: formatPriorityName(priority),
      value: item.total || item.count || item.task_count || 0,
      color: PRIORITY_COLORS[priority] || '#6b7280',
    };
  });

  const CustomLegend = ({ payload }) => (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-slate-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
                  <p className="text-sm text-slate-300">{payload[0].name}</p>
                  <p className="text-sm font-semibold" style={{ color: payload[0].payload.color }}>
                    {payload[0].value} tasks
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
