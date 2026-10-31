const Task = require('../models/Task');
const mongoose = require('mongoose');

// In-memory fallback store if MongoDB Atlas is offline or connecting
let inMemoryTasks = [
  {
    _id: new mongoose.Types.ObjectId().toString(),
    title: 'Complete MongoDB & Express Assignment',
    description: 'Implement Controller-Service-Routes architecture and integrate with React frontend',
    status: 'in-progress',
    priority: 'high',
    category: 'Study',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    title: 'Design Responsive React UI with Tailwind',
    description: 'Build task filter bar, search input, status toggles and summary counters',
    status: 'completed',
    priority: 'medium',
    category: 'Work',
    dueDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    title: 'Write Postman API Collection & Tests',
    description: 'Verify GET, POST, PUT, PATCH, and DELETE endpoints with automated tests',
    status: 'pending',
    priority: 'high',
    category: 'Study',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    title: 'Weekly Grocery Shopping',
    description: 'Almond milk, whole grain bread, organic vegetables, and green tea',
    status: 'pending',
    priority: 'low',
    category: 'Shopping',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Task Service Layer
 * Encapsulates all business logic, database queries, and search/filter operations
 */
class TaskService {
  /**
   * Retrieve all tasks with optional search, filtering, and sorting
   */
  async getAllTasks(queryParams = {}) {
    const { search, status, priority, category, sortBy, order } = queryParams;

    if (isDbConnected()) {
      const filter = {};

      if (search && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        filter.$or = [{ title: searchRegex }, { description: searchRegex }];
      }

      if (status && status !== 'all') filter.status = status;
      if (priority && priority !== 'all') filter.priority = priority;
      if (category && category !== 'all') filter.category = category;

      let sortOptions = { createdAt: -1 };
      if (sortBy) {
        const dir = order === 'asc' ? 1 : -1;
        if (sortBy === 'dueDate') sortOptions = { dueDate: dir, createdAt: -1 };
        else if (sortBy === 'priority') sortOptions = { priority: dir, createdAt: -1 };
        else if (sortBy === 'title') sortOptions = { title: dir };
        else if (sortBy === 'createdAt') sortOptions = { createdAt: dir };
      }

      return await Task.find(filter).sort(sortOptions);
    }

    // In-memory fallback
    let result = [...inMemoryTasks];

    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(term)) ||
          (t.description && t.description.toLowerCase().includes(term))
      );
    }

    if (status && status !== 'all') {
      result = result.filter((t) => t.status === status);
    }

    if (priority && priority !== 'all') {
      result = result.filter((t) => t.priority === priority);
    }

    if (category && category !== 'all') {
      result = result.filter((t) => t.category === category);
    }

    // Sort in-memory
    result.sort((a, b) => {
      const dir = order === 'asc' ? 1 : -1;
      if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return (dateA - dateB) * dir;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title) * dir;
      }
      if (sortBy === 'priority') {
        const pOrder = { high: 3, medium: 2, low: 1 };
        return ((pOrder[a.priority] || 0) - (pOrder[b.priority] || 0)) * dir;
      }
      return (new Date(b.createdAt) - new Date(a.createdAt)) * (order === 'asc' ? -1 : 1);
    });

    return result;
  }

  /**
   * Retrieve single task by its MongoDB _id
   */
  async getTaskById(id) {
    if (isDbConnected()) {
      return await Task.findById(id);
    }
    return inMemoryTasks.find((t) => t._id.toString() === id.toString()) || null;
  }

  /**
   * Create a new task
   */
  async createTask(taskData) {
    if (isDbConnected()) {
      const task = new Task({
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'Personal',
        dueDate: taskData.dueDate || null,
        completedAt: taskData.status === 'completed' ? new Date() : null,
      });
      return await task.save();
    }

    const newTask = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      category: taskData.category || 'Personal',
      dueDate: taskData.dueDate || null,
      completedAt: taskData.status === 'completed' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryTasks.unshift(newTask);
    return newTask;
  }

  /**
   * Update task details
   */
  async updateTask(id, updateData) {
    if (updateData.status) {
      updateData.completedAt = updateData.status === 'completed' ? new Date() : null;
    }

    if (isDbConnected()) {
      return await Task.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }

    const idx = inMemoryTasks.findIndex((t) => t._id.toString() === id.toString());
    if (idx === -1) return null;

    inMemoryTasks[idx] = {
      ...inMemoryTasks[idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryTasks[idx];
  }

  /**
   * Update task status specifically (PATCH /api/tasks/:id/status)
   */
  async updateTaskStatus(id, newStatus) {
    const completedAt = newStatus === 'completed' ? new Date() : null;

    if (isDbConnected()) {
      return await Task.findByIdAndUpdate(
        id,
        {
          $set: {
            status: newStatus,
            completedAt,
          },
        },
        { new: true, runValidators: true }
      );
    }

    const idx = inMemoryTasks.findIndex((t) => t._id.toString() === id.toString());
    if (idx === -1) return null;

    inMemoryTasks[idx].status = newStatus;
    inMemoryTasks[idx].completedAt = completedAt ? completedAt.toISOString() : null;
    inMemoryTasks[idx].updatedAt = new Date().toISOString();
    return inMemoryTasks[idx];
  }

  /**
   * Delete a task
   */
  async deleteTask(id) {
    if (isDbConnected()) {
      return await Task.findByIdAndDelete(id);
    }

    const idx = inMemoryTasks.findIndex((t) => t._id.toString() === id.toString());
    if (idx === -1) return null;

    const [deleted] = inMemoryTasks.splice(idx, 1);
    return deleted;
  }

  /**
   * Batch delete all completed tasks
   */
  async deleteCompletedTasks() {
    if (isDbConnected()) {
      return await Task.deleteMany({ status: 'completed' });
    }

    const before = inMemoryTasks.length;
    inMemoryTasks = inMemoryTasks.filter((t) => t.status !== 'completed');
    const deletedCount = before - inMemoryTasks.length;
    return { deletedCount };
  }

  /**
   * Aggregate statistics
   */
  async getTaskStats() {
    let allTasks;
    if (isDbConnected()) {
      allTasks = await Task.find();
    } else {
      allTasks = inMemoryTasks;
    }

    const now = new Date();
    const stats = {
      total: allTasks.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      highPriority: 0,
      overdue: 0,
      completionRate: 0,
    };

    allTasks.forEach((t) => {
      if (t.status === 'pending') stats.pending++;
      if (t.status === 'in-progress') stats.inProgress++;
      if (t.status === 'completed') stats.completed++;
      if (t.priority === 'high' && t.status !== 'completed') stats.highPriority++;
      if (t.dueDate && t.status !== 'completed' && new Date(t.dueDate) < now) {
        stats.overdue++;
      }
    });

    if (stats.total > 0) {
      stats.completionRate = Math.round((stats.completed / stats.total) * 100);
    }

    return stats;
  }
}

module.exports = new TaskService();
