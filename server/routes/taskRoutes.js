const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const {
  validateObjectId,
  validateCreateTask,
  validateStatusUpdate,
} = require('../middleware/validator');

// Summary statistics endpoint
router.get('/stats', (req, res, next) => taskController.getTaskStats(req, res, next));

// Batch delete completed tasks
router.delete('/completed/all', (req, res, next) => taskController.deleteCompletedTasks(req, res, next));

// Core CRUD Endpoints
router
  .route('/')
  .get((req, res, next) => taskController.getAllTasks(req, res, next))
  .post(validateCreateTask, (req, res, next) => taskController.createTask(req, res, next));

router
  .route('/:id')
  .get(validateObjectId, (req, res, next) => taskController.getTaskById(req, res, next))
  .put(validateObjectId, (req, res, next) => taskController.updateTask(req, res, next))
  .delete(validateObjectId, (req, res, next) => taskController.deleteTask(req, res, next));

// Dedicated status update endpoint (PATCH /api/tasks/:id/status)
router.patch('/:id/status', validateObjectId, validateStatusUpdate, (req, res, next) =>
  taskController.updateTaskStatus(req, res, next)
);

module.exports = router;
