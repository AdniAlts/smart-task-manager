import { useState } from 'react';
import { useTask } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import { AlertTriangle, Calendar, ArrowRight, Inbox } from 'lucide-react';
import { isToday, isTomorrow, parseISO, isPast } from 'date-fns';

// Group icons mapping
const GROUP_ICONS = {
  'Overdue': AlertTriangle,
  'Today': Calendar,
  'Tomorrow': ArrowRight,
  'Upcoming': Inbox,
  'Do First': AlertTriangle,
  'Schedule': Calendar,
  'Delegate': ArrowRight,
  'Eliminate': Inbox,
};

const Tasks = () => {
  const { tasks, loading } = useTask();
  const [filterBy, setFilterBy] = useState('date');
  const [showCompleted, setShowCompleted] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-32 bg-slate-800 rounded-lg" />
        <div className="h-10 w-64 bg-slate-800 rounded-lg" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-800 rounded-xl" />
        ))}
      </div>
    );
  }

  let filteredTasks = tasks;
  if (!showCompleted) {
    filteredTasks = filteredTasks.filter((task) => !task.is_completed);
  }

  const groupTasks = () => {
    if (filterBy === 'priority') {
      const priorities = ['Do First', 'Schedule', 'Delegate', 'Eliminate'];
      return priorities.map((priority) => ({
        label: priority,
        tasks: filteredTasks.filter((t) => t.priority_level === priority),
      }));
    } else {
      const today = [];
      const tomorrow = [];
      const overdue = [];
      const upcoming = [];

      filteredTasks.forEach((task) => {
        try {
          const deadline = parseISO(task.deadline);
          if (isPast(deadline) && !isToday(deadline)) {
            overdue.push(task);
          } else if (isToday(deadline)) {
            today.push(task);
          } else if (isTomorrow(deadline)) {
            tomorrow.push(task);
          } else {
            upcoming.push(task);
          }
        } catch {
          upcoming.push(task);
        }
      });

      const groups = [];
      if (overdue.length > 0) groups.push({ label: 'Overdue', tasks: overdue, urgent: true });
      if (today.length > 0) groups.push({ label: 'Today', tasks: today });
      if (tomorrow.length > 0) groups.push({ label: 'Tomorrow', tasks: tomorrow });
      if (upcoming.length > 0) groups.push({ label: 'Upcoming', tasks: upcoming });
      
      return groups;
    }
  };

  const groupedTasks = groupTasks();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Tasks</h1>
        <p className="text-sm text-slate-400 mt-1">Manage and organize your assignments</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 pb-2">
        {/* Toggle Filter */}
        <div className="inline-flex bg-slate-800/70 border border-slate-700/50 rounded-lg p-0.5">
          <button
            onClick={() => setFilterBy('date')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filterBy === 'date'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            By Date
          </button>
          <button
            onClick={() => setFilterBy('priority')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filterBy === 'priority'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            By Priority
          </button>
        </div>

        {/* Show Completed Toggle */}
        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none hover:text-slate-300 transition-colors">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-violet-600 focus:ring-violet-500 focus:ring-offset-0"
          />
          Show completed
        </label>

        {/* Task Count */}
        <span className="ml-auto text-xs text-slate-500">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Task Groups */}
      {groupedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
            <Inbox className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400 font-medium">No tasks found</p>
          <p className="text-slate-500 text-sm mt-1">
            Click the + button to add your first task
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedTasks.map((group) =>
            group.tasks.length > 0 ? (
              <section key={group.label}>
                <div className="flex items-center gap-2 mb-3">
                  {GROUP_ICONS[group.label] && (
                    <span className={`${group.urgent ? 'text-rose-400' : 'text-slate-500'}`}>
                      {(() => {
                        const Icon = GROUP_ICONS[group.label];
                        return <Icon className="w-4 h-4" />;
                      })()}
                    </span>
                  )}
                  <h2 className={`text-sm font-semibold uppercase tracking-wide ${
                    group.urgent ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {group.label}
                  </h2>
                  <span className="text-xs text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">
                    {group.tasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </section>
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;