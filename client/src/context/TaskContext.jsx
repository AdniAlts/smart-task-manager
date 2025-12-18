import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTasks();
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      const response = await apiService.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
    }
  };

  // Create new task
  const createTask = async (taskData) => {
    try {
      const response = await apiService.createTask(taskData);
      toast.success('Task created successfully!');
      await fetchTasks();
      await fetchDashboard();
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  };

  // Update task (mark as complete, etc.)
  const updateTask = async (id, data) => {
    try {
      await apiService.updateTask(id, data);
      toast.success('Task updated!');
      await fetchTasks();
      await fetchDashboard();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      throw error;
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      await apiService.deleteTask(id);
      toast.success('Task deleted!');
      await fetchTasks();
      await fetchDashboard();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      throw error;
    }
  };

  // Analyze text with AI
  const analyzeText = async (rawText) => {
    try {
      const response = await apiService.analyzeTask(rawText);
      return response.data.data;
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast.error('Failed to analyze text');
      throw error;
    }
  };

  // Initial load
  useEffect(() => {
    fetchTasks();
    fetchDashboard();
  }, []);

  const value = {
    tasks,
    dashboardData,
    loading,
    fetchTasks,
    fetchDashboard,
    createTask,
    updateTask,
    deleteTask,
    analyzeText,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
