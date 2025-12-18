import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { TaskProvider } from './context/TaskContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

function App() {
  return (
    <BrowserRouter>
      <TaskProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#8b5cf6',
                secondary: '#f1f5f9',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#f1f5f9',
              },
            },
          }}
        />
      </TaskProvider>
    </BrowserRouter>
  );
}

export default App;
