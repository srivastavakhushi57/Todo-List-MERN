import React, { useState } from 'react';
import {
  Code2,
  Server,
  Layers,
  FileCheck2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Send,
  Database,
  CheckCircle,
} from 'lucide-react';
import taskApi from '../api/taskApi';

const endpoints = [
  {
    method: 'GET',
    path: '/api/tasks',
    title: '1. Retrieve All Tasks with Filters & Search',
    desc: 'Fetches tasks from MongoDB with optional query parameters: search, status, priority, category, sortBy, and order.',
    queryParams: [
      { name: 'search', type: 'string', desc: 'Case-insensitive regex search in title & description' },
      { name: 'status', type: 'string', desc: 'Filter: all | pending | in-progress | completed' },
      { name: 'priority', type: 'string', desc: 'Filter: all | low | medium | high' },
      { name: 'category', type: 'string', desc: 'Filter: Work | Personal | Study | Health | Shopping | Other' },
      { name: 'sortBy', type: 'string', desc: 'Sort by: createdAt | dueDate | priority | title' },
    ],
    response: `{
  "success": true,
  "count": 4,
  "data": [
    {
      "_id": "6724a1...",
      "title": "Complete MongoDB Assignment",
      "description": "Implement Controller-Service-Routes structure",
      "status": "in-progress",
      "priority": "high",
      "category": "Study",
      "dueDate": "2026-11-05T00:00:00.000Z",
      "createdAt": "2026-10-31T12:00:00.000Z"
    }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/api/tasks',
    title: '2. Create a New Task',
    desc: 'Validates and saves a new task document into MongoDB via Mongoose Task model.',
    requestBody: `{
  "title": "Build React Frontend with Axios",
  "description": "Integrate backend APIs into UI components with dynamic state updates",
  "status": "pending",
  "priority": "high",
  "category": "Study",
  "dueDate": "2026-11-06T18:00:00.000Z"
}`,
    response: `{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "6724a2...",
    "title": "Build React Frontend with Axios",
    "status": "pending",
    "priority": "high",
    "category": "Study",
    "createdAt": "2026-10-31T12:05:00.000Z"
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/tasks/:id',
    title: '3. Retrieve Single Task by ID',
    desc: 'Validates 24-character hexadecimal ObjectId and retrieves task document.',
    response: `{
  "success": true,
  "data": {
    "_id": "6724a1...",
    "title": "Complete MongoDB Assignment",
    "status": "in-progress"
  }
}`,
  },
  {
    method: 'PUT',
    path: '/api/tasks/:id',
    title: '4. Update Task Details',
    desc: 'Updates title, description, priority, category, or due date with Mongoose schema validation.',
    requestBody: `{
  "title": "Complete MongoDB Assignment (Updated)",
  "priority": "medium",
  "status": "completed"
}`,
    response: `{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "6724a1...",
    "title": "Complete MongoDB Assignment (Updated)",
    "status": "completed",
    "completedAt": "2026-10-31T12:15:00.000Z"
  }
}`,
  },
  {
    method: 'PATCH',
    path: '/api/tasks/:id/status',
    title: '5. Update Task Status Specifically',
    desc: 'Dedicated fast endpoint to toggle status (pending / in-progress / completed). Automatically updates completedAt timestamp.',
    requestBody: `{
  "status": "completed"
}`,
    response: `{
  "success": true,
  "message": "Task status updated to 'completed'",
  "data": {
    "_id": "6724a1...",
    "status": "completed",
    "completedAt": "2026-10-31T12:20:00.000Z"
  }
}`,
  },
  {
    method: 'DELETE',
    path: '/api/tasks/:id',
    title: '6. Delete Task by ID',
    desc: 'Removes task from MongoDB collection permanently.',
    response: `{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "id": "6724a1...",
    "title": "Completed Task"
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/tasks/stats',
    title: '7. Summary Dashboard Statistics',
    desc: 'Aggregates counts of total, pending, in-progress, completed, overdue, and completion rate %.',
    response: `{
  "success": true,
  "data": {
    "total": 4,
    "pending": 2,
    "inProgress": 1,
    "completed": 1,
    "highPriority": 2,
    "overdue": 0,
    "completionRate": 25
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/health',
    title: '8. Backend Health Check',
    desc: 'Verifies server uptime and service status.',
    response: `{
  "status": "online",
  "timestamp": "2026-10-31T12:00:00.000Z",
  "service": "To-Do List API (Node.js/Express/MongoDB)",
  "uptime": "120 seconds"
}`,
  },
];

const ApiDocumentation = () => {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [liveTestResponse, setLiveTestResponse] = useState(null);
  const [testingEndpoint, setTestingEndpoint] = useState(null);

  const testLiveEndpoint = async (endpoint) => {
    setTestingEndpoint(endpoint.path);
    try {
      let result;
      if (endpoint.path === '/api/tasks') {
        result = await taskApi.getTasks();
      } else if (endpoint.path === '/api/tasks/stats') {
        result = await taskApi.getStats();
      } else if (endpoint.path === '/api/health') {
        result = await taskApi.checkHealth();
      } else {
        result = await taskApi.getTasks({ limit: 1 });
      }
      setLiveTestResponse({
        endpoint: endpoint.path,
        status: 200,
        data: result,
      });
    } catch (err) {
      setLiveTestResponse({
        endpoint: endpoint.path,
        status: 'Error',
        data: { error: err.message },
      });
    } finally {
      setTestingEndpoint(null);
    }
  };

  return (
    <div className="api-docs-container animate-fade-in">
      {/* Architecture Overview Card */}
      <div className="api-hero-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Layers size={24} color="#38bdf8" />
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>
            Part 1: Controller-Service-Routes Architecture Overview
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
          In accordance with the assignment guidelines, the backend enforces a clean separation of concerns:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <div style={{ background: '#0e172a', padding: 14, borderRadius: 8, border: '1px solid #1e293b' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: 13 }}>🛣️ Routes Layer</span>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
              <code>routes/taskRoutes.js</code>: Maps incoming HTTP verbs & paths to controller methods and applies validation middleware.
            </p>
          </div>
          <div style={{ background: '#0e172a', padding: 14, borderRadius: 8, border: '1px solid #1e293b' }}>
            <span style={{ color: '#34d399', fontWeight: 700, fontSize: 13 }}>🎮 Controller Layer</span>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
              <code>controllers/taskController.js</code>: Unpacks request parameters/body, orchestrates responses, and returns HTTP status codes.
            </p>
          </div>
          <div style={{ background: '#0e172a', padding: 14, borderRadius: 8, border: '1px solid #1e293b' }}>
            <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13 }}>⚙️ Service Layer</span>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
              <code>services/taskService.js</code>: Implements core business logic, query building, regex search, and Mongoose operations.
            </p>
          </div>
          <div style={{ background: '#0e172a', padding: 14, borderRadius: 8, border: '1px solid #1e293b' }}>
            <span style={{ color: '#c084fc', fontWeight: 700, fontSize: 13 }}>🗄️ Database & Model</span>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
              <code>models/Task.js</code>: Schema definition with enum validators, virtual fields, and automatic timestamps.
            </p>
          </div>
        </div>
      </div>

      {/* Postman Collection Notice */}
      <div style={{ background: '#1e293b', padding: '16px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #334155', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: '#f8fafc' }}>
            📬 Postman Collection Ready
          </h4>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>
            Import <code>server/ToDo_List_APIs.postman_collection.json</code> directly into Postman to run pre-configured tests.
          </p>
        </div>
        <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '6px 12px', fontSize: 12 }}>
          Postman v2.1 Included
        </span>
      </div>

      {/* Endpoints List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-main)' }}>
          Implemented API Endpoints
        </h3>

        {endpoints.map((ep, idx) => {
          const isExpanded = expandedIndex === idx;
          const methodLower = ep.method.toLowerCase();

          return (
            <div key={idx} className="endpoint-card">
              <div
                className="endpoint-header"
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              >
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                <span className={`http-method ${methodLower}`}>{ep.method}</span>
                <span className="endpoint-path">{ep.path}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{ep.title}</span>
              </div>

              {isExpanded && (
                <div className="endpoint-body">
                  <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>{ep.desc}</p>

                  {/* Query Params */}
                  {ep.queryParams && (
                    <div style={{ marginBottom: 14 }}>
                      <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-dim)' }}>QUERY PARAMETERS:</span>
                      <ul style={{ listStyle: 'none', marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {ep.queryParams.map((q, qIdx) => (
                          <li key={qIdx} style={{ fontSize: 12, color: '#cbd5e1' }}>
                            <code style={{ color: '#38bdf8' }}>?{q.name}</code> ({q.type}): {q.desc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Request Body */}
                  {ep.requestBody && (
                    <div style={{ marginBottom: 14 }}>
                      <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-dim)' }}>REQUEST BODY (JSON):</span>
                      <pre className="code-block">{ep.requestBody}</pre>
                    </div>
                  )}

                  {/* Sample Response */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-dim)' }}>RESPONSE (JSON):</span>
                      {(ep.method === 'GET') && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => testLiveEndpoint(ep)}
                          disabled={testingEndpoint === ep.path}
                        >
                          <Send size={12} />
                          <span>{testingEndpoint === ep.path ? 'Calling...' : 'Test Live'}</span>
                        </button>
                      )}
                    </div>
                    <pre className="code-block">{ep.response}</pre>
                  </div>

                  {/* Live Output */}
                  {liveTestResponse && liveTestResponse.endpoint === ep.path && (
                    <div style={{ marginTop: 14, background: '#0a101f', padding: 12, borderRadius: 8, border: '1px solid #1e3a8a' }}>
                      <span style={{ color: '#34d399', fontSize: 12, fontWeight: 700 }}>⚡ Live API Response from Server:</span>
                      <pre className="code-block" style={{ color: '#a7f3d0' }}>
                        {JSON.stringify(liveTestResponse.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApiDocumentation;
