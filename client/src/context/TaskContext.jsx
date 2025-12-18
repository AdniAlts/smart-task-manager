import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { tasksAPI, dashboardAPI } from '../services/api';
import toast from 'react-hot-toast';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tasksAPI.getAll();
      setTasks(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      toast.error('Failed to load tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch dashboard stats
  const fetchDashboard = useCallback(async () => {
    try {
      const response = await dashboardAPI.getStats();
      setDashboardData(response.data.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      toast.error('Failed to load dashboard data');
    }
  }, []);

  // Create new task
  const createTask = useCallback(async (taskData) => {
    try {
      const response = await tasksAPI.create(taskData);
      const newTask = response.data.data;
      setTasks(prev => [newTask, ...prev]);
      toast.success('Task created successfully!');
      // Refresh dashboard to update stats
      fetchDashboard();
      return newTask;
    } catch (err) {
      toast.error('Failed to create task');
      console.error('Error creating task:', err);
      throw err;
    }
  }, [fetchDashboard]);

  // Update task
  const updateTask = useCallback(async (id, data) => {
    try {
      const response = await tasksAPI.update(id, data);
      const updatedTask = response.data.data;
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updatedTask } : task
      ));
      toast.success('Task updated!');
      fetchDashboard();
      return updatedTask;
    } catch (err) {
      toast.error('Failed to update task');
      console.error('Error updating task:', err);
      throw err;
    }
  }, [fetchDashboard]);

  // Delete task
  const deleteTask = useCallback(async (id) => {
    try {
      await tasksAPI.delete(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Task deleted!');
      fetchDashboard();
    } catch (err) {
      toast.error('Failed to delete task');
      console.error('Error deleting task:', err);
      throw err;
    }
  }, [fetchDashboard]);

  // Toggle task completion
  const toggleComplete = useCallback(async (id, isCompleted) => {
    try {
      await tasksAPI.update(id, { is_completed: isCompleted });
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, is_completed: isCompleted } : task
      ));
      toast.success(isCompleted ? 'Task completed! 🎉' : 'Task marked as pending');
      fetchDashboard();
    } catch (err) {
      toast.error('Failed to update task');
      console.error('Error toggling task:', err);
    }
  }, [fetchDashboard]);

  // Analyze task with AI
  const analyzeTask = useCallback(async (rawText) => {
    try {
      const response = await tasksAPI.analyze(rawText);
      return response.data.data;
    } catch (err) {
      toast.error('AI analysis failed');
      console.error('Error analyzing task:', err);
      throw err;
    }
  }, []);

  // Test notification
  const testNotification = useCallback(async () => {
    try {
      await tasksAPI.testNotify();
      toast.success('Test notification sent!');
    } catch (err) {
      toast.error('Failed to send test notification');
      console.error('Error testing notification:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
    fetchDashboard();
  }, [fetchTasks, fetchDashboard]);

  const value = {
    tasks,
    dashboardData,
    isLoading,
    error,
    fetchTasks,
    fetchDashboard,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    analyzeTask,
    testNotification,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}
