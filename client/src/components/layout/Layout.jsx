import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MagicInputModal from '../tasks/MagicInputModal';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          onAddTask={() => setModalOpen(true)}
        />
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <MagicInputModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </div>
  );
}
