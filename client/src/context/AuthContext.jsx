import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Set token in axios headers
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Fetch current user on mount
  const fetchUser = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Token invalid, clear it
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Register
  const register = async (name, email, password, telegram_chat_id) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        telegram_chat_id
      });
      
      const { user: userData, token: newToken } = response.data.data;
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { user: userData, token: newToken } = response.data.data;
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  // Update user data after settings change
  const updateUser = (newUserData) => {
    setUser(prev => ({ ...prev, ...newUserData }));
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    register,
    login,
    logout,
    updateUser,
    fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
