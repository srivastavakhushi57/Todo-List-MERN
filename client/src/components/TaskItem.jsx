import React from 'react';
import {
  Check,
  Calendar,
  Tag,
  Edit2,
  Trash2,
  Clock,
  AlertCircle,
} from 'lucide-react';

const TaskItem = ({
  task,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  isUpdating,
}) => {
  const isCompleted = task.status === 'completed';

  // Format Due Date
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isOverdue = date < now && !isCompleted;
    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });

    return {
      text: formatted,
      isOverdue,
    };
  };

  const dueDateInfo = formatDueDate(task.dueDate);

  return (
    <div className={`task-card ${isCompleted ? 'completed' : ''} animate-fade-in`}>
      {/* Checkbox Button */}
      <button
        className={`task-checkbox-btn ${isCompleted ? 'checked' : ''}`}
        onClick={() => onToggleStatus(task)}
        disabled={isUpdating}
        title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
      >
        {isCompleted && <Check size={14} strokeWidth={3} />}
      </button>

      {/* Task Content */}
      <div className="task-body">
        <h4 className="task-title">{task.title}</h4>

        {task.description && <p className="task-desc">{task.description}</p>}

        {/* Badges / Metadata */}
        <div className="task-meta">
          {/* Status Badge */}
          <span className={`badge badge-status-${task.status}`}>
            {task.status === 'in-progress'
              ? 'In Progress'
              : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>

          {/* Priority Badge */}
          <span className={`badge badge-priority-${task.priority}`}>
            {task.priority.toUpperCase()}
          </span>

          {/* Category Badge */}
          {task.category && (
            <span className="badge badge-category">
              <Tag size={10} />
              {task.category}
            </span>
          )}

          {/* Due Date */}
          {dueDateInfo && (
            <span
              className={`badge-date ${dueDateInfo.isOverdue ? 'overdue' : ''}`}
              title={dueDateInfo.isOverdue ? 'This task is overdue!' : 'Due Date'}
            >
              {dueDateInfo.isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
              <span>{dueDateInfo.text}</span>
            </span>
          )}

          {/* Completed Timestamp */}
          {isCompleted && task.completedAt && (
            <span className="badge-date" style={{ color: '#10b981' }}>
              <Clock size={12} />
              <span>
                Done on {new Date(task.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="task-actions">
        {/* Edit Button */}
        <button
          className="icon-btn"
          onClick={() => onEditTask(task)}
          title="Edit Task Details"
        >
          <Edit2 size={15} />
        </button>

        {/* Delete Button */}
        <button
          className="icon-btn delete"
          onClick={() => onDeleteTask(task._id)}
          title="Delete Task"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
