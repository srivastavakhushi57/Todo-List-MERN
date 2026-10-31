const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId in request parameters
 */
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid Task ID format: '${id}'. Must be a 24-character hexadecimal string.`,
    });
  }
  next();
};

/**
 * Validate Task Creation Payload
 */
const validateCreateTask = (req, res, next) => {
  const { title, status, priority, category } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Task title is required and cannot be empty.',
      field: 'title',
    });
  }

  if (title.trim().length > 150) {
    return res.status(400).json({
      success: false,
      message: 'Task title cannot exceed 150 characters.',
      field: 'title',
    });
  }

  const validStatuses = ['pending', 'in-progress', 'completed'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`,
      field: 'status',
    });
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: `Invalid priority '${priority}'. Must be one of: ${validPriorities.join(', ')}`,
      field: 'priority',
    });
  }

  const validCategories = ['Work', 'Personal', 'Study', 'Health', 'Shopping', 'Other'];
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Invalid category '${category}'. Must be one of: ${validCategories.join(', ')}`,
      field: 'category',
    });
  }

  next();
};

/**
 * Validate Task Status Update Payload
 */
const validateStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'in-progress', 'completed'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `A valid status is required: ${validStatuses.join(', ')}`,
      field: 'status',
    });
  }

  next();
};

module.exports = {
  validateObjectId,
  validateCreateTask,
  validateStatusUpdate,
};
