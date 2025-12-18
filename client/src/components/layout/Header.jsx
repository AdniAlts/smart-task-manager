import { Menu, Plus, Bell, User } from 'lucide-react';

export default function Header({ onMenuClick, onAddTask }) {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 lg:px-6">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5 text-slate-400" />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-white">Smart Task Manager</h1>
          <p className="text-xs text-slate-400">Organize your academic life</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Add Task Button */}
        <button 
          onClick={onAddTask}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 
                     text-white rounded-lg font-medium transition-all duration-200
                     hover:shadow-lg hover:shadow-violet-600/25 animate-pulse-glow"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
        </button>

        {/* Notification Bell */}
        <button className="p-2 rounded-lg hover:bg-slate-800 relative">
          <Bell className="w-5 h-5 text-slate-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* User Avatar */}
        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 
                          flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </button>
      </div>
    </header>
  );
}
