const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Morgan request logger in non-test environments
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Enable CORS for all origins (or configured origin)
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Express JSON and urlencoded body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'To-Do List API (Node.js/Express/MongoDB)',
    uptime: `${Math.round(process.uptime())} seconds`,
  });
});

// API Routes
app.use('/api/tasks', taskRoutes);

// In production or if client/dist exists, serve compiled React frontend
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
const fs = require('fs');

if (fs.existsSync(clientDistPath)) {
  console.log(`📦 Serving React frontend from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // Catch-all route to support client-side routing (SPA)
  app.get('*', (req, res, next) => {
    // If request starts with /api, pass to 404 handler
    if (req.url.startsWith('/api')) {
      return res.status(404).json({ success: false, message: 'API Route Not Found' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Friendly root route if frontend isn't built yet
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>To-Do List API Server</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center; }
            .card { background: #1e293b; border-radius: 12px; max-width: 600px; margin: 40px auto; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid #334155; }
            h1 { color: #38bdf8; margin-bottom: 8px; }
            a { color: #38bdf8; text-decoration: none; font-weight: 600; }
            a:hover { text-decoration: underline; }
            .badge { display: inline-block; background: #059669; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
            code { background: #0f172a; padding: 3px 8px; border-radius: 4px; font-family: monospace; color: #fbbf24; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">API Active</span>
            <h1>To-Do List REST API</h1>
            <p>Node.js, Express.js & MongoDB Backend is running successfully!</p>
            <hr style="border-color: #334155; margin: 24px 0;" />
            <p>Endpoints available:</p>
            <p><a href="/api/tasks" target="_blank"><code>GET /api/tasks</code></a> — View all tasks</p>
            <p><a href="/api/tasks/stats" target="_blank"><code>GET /api/tasks/stats</code></a> — View task statistics</p>
            <p><a href="/api/health" target="_blank"><code>GET /api/health</code></a> — API Health check</p>
          </div>
        </body>
      </html>
    `);
  });
}

// Centralized error handling
app.use(errorHandler);

// Start server
let server;
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api/tasks`);
    });
  }).catch((err) => {
    console.error('Fatal server startup error:', err.message);
  });
}

module.exports = { app, server };
