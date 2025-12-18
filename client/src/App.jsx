import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

// Auth redirect component - redirects to dashboard if already logged in
function AuthRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes - redirect to dashboard if logged in */}
      <Route path="/login" element={
        <AuthRoute>
          <Login />
        </AuthRoute>
      } />
      <Route path="/register" element={
        <AuthRoute>
          <Register />
        </AuthRoute>
      } />
      
      {/* Protected routes - require authentication */}
      <Route path="/" element={
        <ProtectedRoute>
          <TaskProvider>
            <Layout />
          </TaskProvider>
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
