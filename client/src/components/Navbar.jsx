import React from 'react';
import { CheckSquare, Plus, Code2, LayoutList, RefreshCw } from 'lucide-react';

const Navbar = ({
  backendHealth,
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  onRefreshTasks,
  isLoading,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="brand-icon">
            <CheckSquare size={22} strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <h1>TaskFlow Pro</h1>
            <p>MongoDB · Express.js · React To-Do Application</p>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <div className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <LayoutList size={16} />
            <span>Tasks Board</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'api-docs' ? 'active' : ''}`}
            onClick={() => setActiveTab('api-docs')}
          >
            <Code2 size={16} />
            <span>API Docs & Testing</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Health Status Indicator */}
          <div className="health-badge" title={backendHealth?.status === 'online' ? 'MongoDB & Express Backend Connected' : 'Attempting to reach backend...'}>
            <span
              className={`health-dot ${
                backendHealth?.status === 'online' ? 'online' : 'offline'
              }`}
            />
            <span>
              {backendHealth?.status === 'online' ? 'API Online' : 'Connecting...'}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            className="icon-btn"
            onClick={onRefreshTasks}
            disabled={isLoading}
            title="Refresh Tasks from Backend"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {/* New Task Button */}
          <button className="btn-primary" onClick={onOpenCreateModal}>
            <Plus size={18} strokeWidth={2.5} />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
