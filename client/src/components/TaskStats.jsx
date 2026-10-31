import React from 'react';
import { ListTodo, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

const TaskStats = ({ stats }) => {
  const {
    total = 0,
    inProgress = 0,
    completed = 0,
    highPriority = 0,
    completionRate = 0,
  } = stats || {};

  return (
    <div className="stats-grid">
      {/* 1. Total Tasks */}
      <div className="stat-card">
        <div className="stat-info">
          <p>Total Tasks</p>
          <h3>{total}</h3>
        </div>
        <div className="stat-icon blue">
          <ListTodo size={22} />
        </div>
      </div>

      {/* 2. In Progress */}
      <div className="stat-card">
        <div className="stat-info">
          <p>In Progress</p>
          <h3>{inProgress}</h3>
        </div>
        <div className="stat-icon amber">
          <Clock size={22} />
        </div>
      </div>

      {/* 3. Completed */}
      <div className="stat-card">
        <div className="stat-info">
          <p>Completed ({completionRate}%)</p>
          <h3>{completed}</h3>
        </div>
        <div className="stat-icon green">
          <CheckCircle2 size={22} />
        </div>
      </div>

      {/* 4. High Priority */}
      <div className="stat-card">
        <div className="stat-info">
          <p>High Priority</p>
          <h3>{highPriority}</h3>
        </div>
        <div className="stat-icon red">
          <AlertTriangle size={22} />
        </div>
      </div>
    </div>
  );
};

export default TaskStats;
