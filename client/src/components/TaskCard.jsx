import { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { Check, Circle, Trash2, Clock, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

const PRIORITY_STYLES = {
  'Do First': 'bg-rose-500/15 text-rose-400 border-rose-500/25',
  'Schedule': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'Delegate': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'Eliminate': 'bg-slate-500/15 text-slate-400 border-slate-500/25',
};

const TaskCard = ({ task }) => {
  const { updateTask, deleteTask } = useTask();
  const [deleting, setDeleting] = useState(false);

  const handleToggleComplete = async () => {
    await updateTask(task.id, { is_completed: !task.is_completed });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setDeleting(true);
      try {
        await deleteTask(task.id);
      } catch (error) {
        setDeleting(false);
      }
    }
  };

  const formatDeadline = (deadline) => {
    try {
      const date = new Date(deadline);
      return format(date, 'EEE, dd MMM, HH:mm');
    } catch {
      return deadline;
    }
  };

  return (
    <div
      className={`group bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 transition-all hover:bg-slate-800/70 hover:border-slate-600/50 ${
        task.is_completed ? 'opacity-50' : ''
      } ${deleting ? 'opacity-30 pointer-events-none scale-98' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.is_completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-slate-500 hover:border-violet-400'
          }`}
          aria-label={task.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.is_completed && <Check className="w-3 h-3" strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-sm font-medium text-white leading-snug ${
                task.is_completed ? 'line-through text-slate-400' : ''
              }`}
            >
              {task.title}
            </h3>
            
            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="flex-shrink-0 p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all rounded"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-violet-500/15 text-violet-400 border border-violet-500/25">
              <BookOpen className="w-3 h-3" />
              {task.subject}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                PRIORITY_STYLES[task.priority_level] || PRIORITY_STYLES['Eliminate']
              }`}
            >
              {task.priority_level}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {formatDeadline(task.deadline)}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p className="mt-2 text-xs text-slate-500 line-clamp-2">{task.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
