import { useState } from 'react';
import { Check, Trash2, Clock, BookOpen, MoreVertical, Eye, Edit } from 'lucide-react';
import { PriorityBadge, SubjectBadge, LateBadge } from '../ui/Badge';
import { useTask } from '../../context/TaskContext';

export default function TaskCard({ task, onViewDetail, onEdit }) {
  const { toggleComplete, deleteTask } = useTask();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = () => {
    toggleComplete(task.id, !task.is_completed);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      await deleteTask(task.id);
    }
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const isOverdue = () => {
    if (!task.deadline || task.is_completed) return false;
    return new Date(task.deadline) < new Date();
  };

  return (
    <div 
      className={`
        group bg-slate-800/50 rounded-xl p-4 border border-slate-700/50
        hover:border-slate-600 transition-all duration-200
        ${task.is_completed ? 'opacity-60' : ''}
        ${isDeleting ? 'animate-pulse' : 'animate-fade-in'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`
            mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0
            flex items-center justify-center transition-all duration-200
            ${task.is_completed 
              ? 'bg-violet-600 border-violet-600' 
              : 'border-slate-500 hover:border-violet-500'
            }
          `}
        >
          {task.is_completed && <Check className="w-3 h-3 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`
            font-medium text-white mb-1 truncate
            ${task.is_completed ? 'line-through text-slate-400' : ''}
          `}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm text-slate-400 mb-2 line-clamp-2">
              {task.description}
            </p>
          )}
          
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {isOverdue() && <LateBadge />}
            <PriorityBadge priority={task.priority_level} />
            {task.subject && <SubjectBadge subject={task.subject} />}
          </div>
          
          {/* Deadline */}
          <div className={`
            flex items-center gap-1.5 mt-2 text-xs
            ${isOverdue() ? 'text-rose-400' : 'text-slate-500'}
          `}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDeadline(task.deadline)}</span>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 
                       opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-40 bg-slate-800 rounded-lg shadow-xl 
                              border border-slate-700 py-1 z-10">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onViewDetail && onViewDetail(task);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 
                             hover:bg-slate-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit && onEdit(task);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-violet-400 
                             hover:bg-slate-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Task
                </button>
                <hr className="my-1 border-slate-700" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDelete();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 
                             hover:bg-slate-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Task
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
