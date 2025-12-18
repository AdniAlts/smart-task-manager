import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Plus, Bell } from 'lucide-react';
import MagicInputModal from './MagicInputModal';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const Layout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTestNotify = async () => {
    try {
      await apiService.testNotify();
      toast.success('Notification test triggered! Check your email/console.');
    } catch (error) {
      toast.error('Failed to test notification');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
                <CheckSquare className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-semibold text-white leading-tight">Smart Task Manager</h1>
              </div>
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </NavLink>

              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Tasks</span>
              </NavLink>

              <div className="w-px h-6 bg-slate-700 mx-2" />

              <button
                onClick={handleTestNotify}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors"
                title="Test Notification"
                aria-label="Test Notification"
              >
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-lg shadow-violet-600/40 hover:shadow-xl hover:shadow-violet-600/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        aria-label="Add new task"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Magic Input Modal */}
      <MagicInputModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Layout;
