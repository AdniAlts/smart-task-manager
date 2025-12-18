import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Plus, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Header({ onMenuClick, onAddTask }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully!');
    setShowProfileMenu(false);
  };

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

        {/* User Avatar with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 
                            flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-xl 
                              border border-slate-700 py-1 z-20 animate-fade-in">
                <div className="px-3 py-2 border-b border-slate-700">
                  <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email || '-'}</p>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 
                             hover:bg-slate-700 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <hr className="my-1 border-slate-700" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 
                             hover:bg-slate-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
