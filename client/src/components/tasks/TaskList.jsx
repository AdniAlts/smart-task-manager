import TaskCard from './TaskCard';
import { CardSkeleton } from '../ui/Skeleton';
import { ClipboardList } from 'lucide-react';

export default function TaskList({ tasks, isLoading, groupBy = 'date' }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <ClipboardList className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-slate-300 mb-1">No tasks yet</h3>
        <p className="text-sm text-slate-500">
          Click "Add Task" to create your first task
        </p>
      </div>
    );
  }

  // Group tasks by date
  const groupTasksByDate = (tasks) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const groups = {
      overdue: [],
      today: [],
      tomorrow: [],
      upcoming: [],
      noDeadline: [],
    };

    tasks.forEach(task => {
      if (!task.deadline) {
        groups.noDeadline.push(task);
        return;
      }

      const deadline = new Date(task.deadline);
      deadline.setHours(0, 0, 0, 0);

      if (!task.is_completed && deadline < today) {
        groups.overdue.push(task);
      } else if (deadline.getTime() === today.getTime()) {
        groups.today.push(task);
      } else if (deadline.getTime() === tomorrow.getTime()) {
        groups.tomorrow.push(task);
      } else {
        groups.upcoming.push(task);
      }
    });

    return groups;
  };

  // Group tasks by priority
  const groupTasksByPriority = (tasks) => {
    const groups = {
      'Do First': [],
      'Schedule': [],
      'Delegate': [],
      'Eliminate': [],
    };

    tasks.forEach(task => {
      const priority = task.priority_level || 'Eliminate';
      if (groups[priority]) {
        groups[priority].push(task);
      } else {
        groups['Eliminate'].push(task);
      }
    });

    return groups;
  };

  const renderGroup = (title, tasks, icon, color) => {
    if (tasks.length === 0) return null;
    
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2 h-2 rounded-full ${color}`} />
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            {title}
          </h3>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    );
  };

  if (groupBy === 'date') {
    const groups = groupTasksByDate(tasks);
    return (
      <div>
        {renderGroup('Overdue', groups.overdue, null, 'bg-rose-500')}
        {renderGroup('Today', groups.today, null, 'bg-emerald-500')}
        {renderGroup('Tomorrow', groups.tomorrow, null, 'bg-amber-500')}
        {renderGroup('Upcoming', groups.upcoming, null, 'bg-blue-500')}
        {renderGroup('No Deadline', groups.noDeadline, null, 'bg-slate-500')}
      </div>
    );
  }

  if (groupBy === 'priority') {
    const groups = groupTasksByPriority(tasks);
    return (
      <div>
        {renderGroup('Do First', groups['Do First'], null, 'bg-rose-500')}
        {renderGroup('Schedule', groups['Schedule'], null, 'bg-amber-500')}
        {renderGroup('Delegate', groups['Delegate'], null, 'bg-blue-500')}
        {renderGroup('Eliminate', groups['Eliminate'], null, 'bg-gray-500')}
      </div>
    );
  }

  // Default: flat list
  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
