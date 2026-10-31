const taskService = require('../services/taskService');

/**
 * Task Controller
 * Handles incoming HTTP requests and structures API responses
 */
class TaskController {
  /**
   * GET /api/tasks
   * Retrieve all tasks with filtering, search, and sorting
   */
  async getAllTasks(req, res, next) {
    try {
      const tasks = await taskService.getAllTasks(req.query);
      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/stats
   * Retrieve summary statistics for tasks
   */
  async getTaskStats(req, res, next) {
    try {
      const stats = await taskService.getTaskStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/:id
   * Retrieve a single task by ID
   */
  async getTaskById(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: `Task not found with ID: ${req.params.id}`,
        });
      }
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tasks
   * Create a new task
   */
  async createTask(req, res, next) {
    try {
      const newTask = await taskService.createTask(req.body);
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: newTask,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/tasks/:id
   * Update task details
   */
  async updateTask(req, res, next) {
    try {
      const updatedTask = await taskService.updateTask(req.params.id, req.body);
      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          message: `Task not found with ID: ${req.params.id}`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: updatedTask,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/tasks/:id/status
   * Toggle or update task status specifically
   */
  async updateTaskStatus(req, res, next) {
    try {
      const { status } = req.body;
      const updatedTask = await taskService.updateTaskStatus(req.params.id, status);
      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          message: `Task not found with ID: ${req.params.id}`,
        });
      }
      res.status(200).json({
        success: true,
        message: `Task status updated to '${status}'`,
        data: updatedTask,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/tasks/:id
   * Delete a task
   */
  async deleteTask(req, res, next) {
    try {
      const deletedTask = await taskService.deleteTask(req.params.id);
      if (!deletedTask) {
        return res.status(404).json({
          success: false,
          message: `Task not found with ID: ${req.params.id}`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: { id: req.params.id, title: deletedTask.title },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/tasks/completed/all
   * Batch delete all completed tasks
   */
  async deleteCompletedTasks(req, res, next) {
    try {
      const result = await taskService.deleteCompletedTasks();
      res.status(200).json({
        success: true,
        message: `Deleted ${result.deletedCount} completed tasks`,
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
