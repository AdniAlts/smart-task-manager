import { useState } from 'react';
import { useTask } from '../context/TaskContext';
import TaskList from '../components/tasks/TaskList';
import { 
  Filter, 
  Calendar, 
  Tag,
  CheckCircle2,
  Circle,
  Search
} from 'lucide-react';

export default function Tasks() {
  const { tasks, isLoading } = useTask();
  const [groupBy, setGroupBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (filterStatus === 'pending' && task.is_completed) return false;
    if (filterStatus === 'completed' && !task.is_completed) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title?.toLowerCase().includes(query) ||
        task.subject?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const pendingCount = tasks.filter(t => !t.is_completed).length;
  const completedCount = tasks.filter(t => t.is_completed).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Tasks</h1>
        <p className="text-slate-400 mt-1">
          Manage and organize all your tasks in one place.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg
                       text-white placeholder-slate-500 text-sm
                       focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Group By */}
          <div className="flex gap-2">
            <button
              onClick={() => setGroupBy('date')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${groupBy === 'date' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">By Date</span>
            </button>
            <button
              onClick={() => setGroupBy('priority')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${groupBy === 'priority' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
            >
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">By Priority</span>
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${filterStatus === 'all'
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/50'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:text-slate-300'
              }`}
          >
            <Filter className="w-3 h-3" />
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${filterStatus === 'pending'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/50'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:text-slate-300'
              }`}
          >
            <Circle className="w-3 h-3" />
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${filterStatus === 'completed'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:text-slate-300'
              }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Task List */}
      <TaskList 
        tasks={filteredTasks} 
        isLoading={isLoading} 
        groupBy={groupBy}
      />
    </div>
  );
}
