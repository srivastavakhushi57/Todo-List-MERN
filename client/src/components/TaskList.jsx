import React from 'react';
import TaskItem from './TaskItem';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';

const TaskList = ({
  tasks,
  isLoading,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onClearCompleted,
  onOpenCreateModal,
  updatingTaskId,
}) => {
  const hasCompletedTasks = tasks.some((t) => t.status === 'completed');

  if (isLoading) {
    return (
      <div className="task-list-container">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="task-card"
            style={{ opacity: 0.6, pointerEvents: 'none' }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: '#1f293d',
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  width: '60%',
                  height: 16,
                  borderRadius: 4,
                  background: '#1f293d',
                  marginBottom: 8,
                }}
              />
              <div
                style={{
                  width: '40%',
                  height: 12,
                  borderRadius: 4,
                  background: '#1a2333',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <ClipboardList size={32} />
        </div>
        <h3>No tasks found</h3>
        <p>
          There are no tasks matching your current filters. Add a new task to
          get started!
        </p>
        <button className="btn-primary" onClick={onOpenCreateModal}>
          <Plus size={16} />
          <span>Add New Task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      {/* Header bar with count and bulk action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
          padding: '0 4px',
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 500 }}>
          Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>

        {hasCompletedTasks && (
          <button
            className="btn-danger"
            onClick={onClearCompleted}
            title="Permanently remove all completed tasks"
          >
            <Trash2 size={13} />
            <span>Clear Completed</span>
          </button>
        )}
      </div>

      {/* Task Cards */}
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onToggleStatus={onToggleStatus}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          isUpdating={updatingTaskId === task._id}
        />
      ))}
    </div>
  );
};

export default TaskList;
