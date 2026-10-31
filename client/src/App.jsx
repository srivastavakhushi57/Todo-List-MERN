import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import TaskStats from './components/TaskStats';
import TaskFilterBar from './components/TaskFilterBar';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import ApiDocumentation from './components/ApiDocumentation';
import Toast from './components/Toast';
import taskApi from './api/taskApi';
import './App.css';

function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'api-docs'

  // Task Data & State
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    highPriority: 0,
    completionRate: 0,
  });

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  // Loading & Processing States
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendHealth, setBackendHealth] = useState({ status: 'checking' });

  // Modal & Toast States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check Backend Health
  const checkHealth = useCallback(async () => {
    try {
      const data = await taskApi.checkHealth();
      setBackendHealth(data);
    } catch (err) {
      setBackendHealth({ status: 'offline', error: err.message });
    }
  }, []);

  // Fetch Tasks from Backend
  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        sortBy: sortBy || 'createdAt',
      };

      const res = await taskApi.getTasks(params);
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      showToast(`Failed to load tasks: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy, showToast]);

  // Fetch Summary Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await taskApi.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch stats:', err.message);
    }
  }, []);

  // Initial Load & Debounced Filter Refresh
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
      fetchStats();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchTasks, fetchStats]);

  // Handler: Toggle Status (pending <-> completed)
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    setUpdatingTaskId(task._id);

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t._id === task._id
          ? {
              ...t,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
            }
          : t
      )
    );

    try {
      await taskApi.updateTaskStatus(task._id, newStatus);
      showToast(
        newStatus === 'completed'
          ? `Marked "${task.title}" as completed! 🎉`
          : `Marked "${task.title}" as pending.`,
        'success'
      );
      fetchStats();
    } catch (err) {
      showToast(`Status update failed: ${err.message}`, 'error');
      fetchTasks(); // Revert on failure
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Handler: Create or Update Task
  const handleSaveTask = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        // Update Task (PUT /api/tasks/:id)
        const res = await taskApi.updateTask(editingTask._id, formData);
        showToast(`Task "${res.data.title}" updated successfully!`, 'success');
      } else {
        // Create Task (POST /api/tasks)
        const res = await taskApi.createTask(formData);
        showToast(`Task "${res.data.title}" created successfully!`, 'success');
      }

      setIsModalOpen(false);
      setEditingTask(null);
      fetchTasks();
      fetchStats();
    } catch (err) {
      showToast(`Could not save task: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Delete Task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskApi.deleteTask(id);
      showToast('Task removed successfully.', 'info');
      // Optimistic delete
      setTasks((prev) => prev.filter((t) => t._id !== id));
      fetchStats();
    } catch (err) {
      showToast(`Failed to delete task: ${err.message}`, 'error');
      fetchTasks();
    }
  };

  // Handler: Clear Completed Tasks
  const handleClearCompleted = async () => {
    if (!window.confirm('Delete all completed tasks permanently?')) return;

    try {
      const res = await taskApi.deleteCompleted();
      showToast(`Removed ${res.deletedCount || 0} completed tasks.`, 'info');
      fetchTasks();
      fetchStats();
    } catch (err) {
      showToast(`Batch delete failed: ${err.message}`, 'error');
    }
  };

  // Handler: Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setSortBy('createdAt');
  };

  return (
    <div className="app-layout">
      {/* Navigation Header */}
      <Navbar
        backendHealth={backendHealth}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => {
          setEditingTask(null);
          setIsModalOpen(true);
        }}
        onRefreshTasks={() => {
          fetchTasks();
          fetchStats();
          checkHealth();
          showToast('Tasks refreshed from MongoDB', 'info');
        }}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'tasks' ? (
          <>
            {/* Summary Statistics */}
            <TaskStats stats={stats} />

            {/* Filter & Search Bar */}
            <TaskFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onResetFilters={handleResetFilters}
              taskCount={tasks.length}
            />

            {/* Tasks Dynamic List */}
            <TaskList
              tasks={tasks}
              isLoading={isLoading}
              onToggleStatus={handleToggleStatus}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onClearCompleted={handleClearCompleted}
              onOpenCreateModal={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              updatingTaskId={updatingTaskId}
            />
          </>
        ) : (
          /* API Documentation Tab */
          <ApiDocumentation />
        )}
      </main>

      {/* Create / Edit Modal Form */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialData={editingTask}
        isSubmitting={isSubmitting}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="footer">
        <p>
          TaskFlow Pro • Full Stack MERN To-Do Application • Node.js + Express.js + MongoDB + React
        </p>
      </footer>
    </div>
  );
}

export default App;
