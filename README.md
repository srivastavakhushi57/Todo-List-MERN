# To-Do List Full-Stack Web Application (MERN)

> **MongoDB · Express.js · React (Vite) · Node.js**  
> Complete implementation of **Part 1 (Identifying & Implementing APIs with Express.js & MongoDB)** and **Part 2 (Integrating To-Do List APIs with React Frontend)** following the **Controller-Service-Routes Architecture**.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Architecture: Controller-Service-Routes](#-architecture-controller-service-routes)
3. [REST API Documentation & Endpoints](#-rest-api-documentation--endpoints)
4. [React Frontend Features & Integration](#-react-frontend-features--integration)
5. [Testing with Postman & Automated Test Suite](#-testing-with-postman--automated-test-suite)
6. [Quick Start & Setup Instructions](#-quick-start--setup-instructions)
7. [Environment Variables](#-environment-variables)
8. [Live Hosting & Deployment Guide](#-live-hosting--deployment-guide)
9. [Challenges Faced & Solutions](#-challenges-faced--solutions)

---

## 🎯 Project Overview

This application fulfills all assignment objectives across **Part 1** and **Part 2**:

- **Part 1 (Backend APIs with Express.js & MongoDB):**
  - Robust Node.js runtime and Express.js REST server.
  - MongoDB database integration with **Mongoose**.
  - Strict adherence to the **Controller-Service-Routes** architectural pattern.
  - Comprehensive input validation and centralized error handling (400, 404, 500 status codes).
  - Pre-configured **Postman collection** and automated test suite.
  - Built-in zero-config in-memory MongoDB fallback so the application runs seamlessly out-of-the-box even without an active internet connection.

- **Part 2 (React Frontend Integration):**
  - Built with **React 18** and **Vite** with modern glassmorphism styling.
  - **Axios** HTTP client integration with error interceptors and timeout resilience.
  - Full CRUD workflows: retrieve list, search by keyword, filter by status/priority/category, create task, update details, dedicated status toggle, and task deletion.
  - Real-time UI synchronization: dynamic task list, optimistic status updates, loading skeletons, overdue badges, completion progress counters, and toast notifications.

---

## 🏗️ Architecture: Controller-Service-Routes

The backend is organized into decoupled layers:

```
todo-list-app/
├── server/
│   ├── config/
│   │   └── db.js                 # Mongoose connection with Atlas & in-memory fallback
│   ├── models/
│   │   └── Task.js               # Mongoose Schema with validators & virtual fields
│   ├── routes/
│   │   └── taskRoutes.js         # HTTP verb mapping & parameter validation
│   ├── controllers/
│   │   └── taskController.js     # Request extraction & HTTP status code responses
│   ├── services/
│   │   └── taskService.js        # Business logic, query filtering, and Mongo operations
│   ├── middleware/
│   │   ├── validator.js          # Request payload and ObjectId validation
│   │   └── errorHandler.js       # Centralized error handler
│   ├── server.js                 # Express server & static SPA serving
│   ├── test-api.js               # Automated 14-point API verification suite
│   ├── ToDo_List_APIs.postman_collection.json  # Postman test collection
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── taskApi.js        # Axios API client
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Header with live health badge & tab switcher
│   │   │   ├── TaskStats.jsx     # Summary cards (Total, In Progress, Done, High Priority)
│   │   │   ├── TaskFilterBar.jsx # Search input, status tabs, priority & sort selectors
│   │   │   ├── TaskItem.jsx      # Interactive task card with checkbox & badges
│   │   │   ├── TaskList.jsx      # Dynamic list with loading skeletons & empty states
│   │   │   ├── TaskForm.jsx      # Modal form for create & edit operations
│   │   │   ├── ApiDocumentation.jsx # In-app API documentation & live tester
│   │   │   └── Toast.jsx         # Floating toast alert notifications
│   │   ├── App.jsx               # State management & Axios orchestration
│   │   ├── App.css               # Modern glassmorphism UI styles
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── render.yaml                   # 1-Click Render cloud deployment configuration
├── vercel.json                   # Vercel deployment configuration
├── netlify.toml                  # Netlify build configuration
├── package.json                  # Root npm scripts
└── README.md
```

### Flow of Data:
$$\text{Client (React + Axios)} \longrightarrow \text{Routes} \longrightarrow \text{Validator Middleware} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Mongoose Model} \longrightarrow \text{MongoDB}$$

---

## 📡 REST API Documentation & Endpoints

| HTTP Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/tasks` | Retrieve all tasks with query filtering | *None* |
| **GET** | `/api/tasks?search={keyword}` | Search tasks by title or description | *None* |
| **GET** | `/api/tasks?status={status}` | Filter by status (`pending`, `in-progress`, `completed`) | *None* |
| **GET** | `/api/tasks?priority={priority}` | Filter by priority (`low`, `medium`, `high`) | *None* |
| **GET** | `/api/tasks/stats` | Retrieve aggregate counts & completion rate % | *None* |
| **GET** | `/api/tasks/:id` | Retrieve single task by its 24-char ObjectId | *None* |
| **POST** | `/api/tasks` | Create a new task document | `{"title", "description", "priority", "status", "category", "dueDate"}` |
| **PUT** | `/api/tasks/:id` | Update full/partial task details | `{"title", "description", "priority", "category", "dueDate"}` |
| **PATCH** | `/api/tasks/:id/status` | Update task status specifically (`completed`, `pending`, `in-progress`) | `{"status": "completed"}` |
| **DELETE** | `/api/tasks/:id` | Delete task document permanently | *None* |
| **DELETE** | `/api/tasks/completed/all` | Batch delete all completed tasks | *None* |
| **GET** | `/api/health` | Service uptime and status check | *None* |

### Sample JSON Payloads:

#### `POST /api/tasks` (Create Task)
```json
{
  "title": "Build React Frontend with Axios",
  "description": "Integrate backend APIs into UI components with dynamic state updates",
  "status": "pending",
  "priority": "high",
  "category": "Study",
  "dueDate": "2026-11-06T18:00:00.000Z"
}
```

#### `PATCH /api/tasks/:id/status` (Update Status)
```json
{
  "status": "completed"
}
```

---

## ⚛️ React Frontend Features & Integration

- **Axios API Layer (`client/src/api/taskApi.js`):** Centralizes all network communication with standardized error reporting and timeout control.
- **Dynamic State Management:** Uses React hooks (`useState`, `useEffect`, `useCallback`) to maintain state synchronization between client and backend.
- **Instant Search & Multi-criteria Filtering:** Real-time search with input clearing, combined with status tabs, priority dropdowns, and category filters.
- **Optimistic UI Updates:** Checkbox clicks toggle status instantly on screen before confirming with the server, ensuring zero input lag.
- **Visual Status & Overdue Alerts:** Overdue tasks automatically display a warning badge.
- **Interactive API Documentation Tab:** Built directly into the frontend interface so evaluators can inspect endpoints and test them live.

---

## 🧪 Testing with Postman & Automated Test Suite

### 1. Automated Test Script
Run the built-in 14-point API verification test:
```bash
npm test
```
This tests:
- Server health check
- Creation of tasks (`POST /api/tasks`)
- Retrieval and filtering (`GET /api/tasks`)
- Keyword search (`GET /api/tasks?search=...`)
- Status filtering (`GET /api/tasks?status=...`)
- Priority filtering (`GET /api/tasks?priority=...`)
- Updating details (`PUT /api/tasks/:id`)
- Dedicated status updates (`PATCH /api/tasks/:id/status`)
- Summary statistics (`GET /api/tasks/stats`)
- Input validation (400 Bad Request on empty title)
- ID validation (400 Bad Request on invalid hexadecimal format)
- Not found error handling (404 Not Found on missing task)
- Task deletion (`DELETE /api/tasks/:id`)

### 2. Postman Collection
1. Open **Postman**.
2. Click **Import** (top left).
3. Select `server/ToDo_List_APIs.postman_collection.json`.
4. Run the requests against `http://localhost:5000` (or your live deployed URL).

---

## 🚀 Quick Start & Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### Installation
From the root directory of `todo-list-app`:
```bash
npm run install:all
```
*(Or install in each folder manually: `cd server && npm install`, `cd ../client && npm install`)*

### Run in Development Mode
```bash
npm run dev
```
- **Backend API:** `http://localhost:5000`
- **Frontend App:** `http://localhost:5173`

### Run in Production Mode (Unified Single Port)
```bash
npm run build
npm start
```
The Express server will compile and serve both the REST API and the React frontend on `http://localhost:5000`.

---

## 🔐 Environment Variables

Create a `server/.env` file with the following keys:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port for the Express server | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGODB_URI` | MongoDB Atlas or local connection string | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/todolist_db` |

> 💡 **Zero-Config Notice:** If `MONGODB_URI` is omitted or unavailable, the server automatically starts an in-memory MongoDB instance with pre-seeded sample tasks.

---

## 🌐 Live Hosting & Deployment Guide

This project is pre-configured for free cloud deployment on **Render**, **Netlify**, or **Vercel**.

### Option A: 1-Click Unified Web Service on Render (Recommended)
1. Push the project repository to your GitHub account.
2. Sign in to [Render.com](https://render.com).
3. Click **New +** → **Web Service** → Select your repository.
4. Render automatically detects `render.yaml`. Alternatively, configure:
   - **Environment:** `Node`
   - **Build Command:** `npm --prefix server install && npm --prefix client install && npm --prefix client run build`
   - **Start Command:** `node server/server.js`
5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGODB_URI` = Your MongoDB Atlas connection URI
6. Click **Create Web Service**. Render provides your free live HTTPS link:
   `https://<your-app-name>.onrender.com`

### Option B: Frontend on Netlify + Backend on Render
1. Deploy `server/` to Render Web Service as described above.
2. Go to [Netlify.com](https://www.netlify.com) → **Add new site** → **Import an existing project**.
3. Select your repository:
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. In Netlify Environment Variables, set:
   - `VITE_API_URL` = `https://<your-backend>.onrender.com`
5. Click **Deploy Site**.

---

## 💡 Challenges Faced & Solutions

During the development and integration of the To-Do List Application, several technical challenges arose and were resolved:

1. **Separation of Concerns with Controller-Service-Routes:**
   - *Challenge:* Ensuring that database logic (Mongoose queries and aggregation) does not leak into Express route definitions or controllers.
   - *Solution:* Implemented `taskService.js` to handle all query filters, regex pattern matching, and timestamp assignments. `taskController.js` only handles HTTP requests and status codes.

2. **Real-time Status Toggling vs Full Document Updates:**
   - *Challenge:* Using `PUT /api/tasks/:id` for simple checkbox toggles required sending the entire task object, creating race conditions with stale state.
   - *Solution:* Created a dedicated `PATCH /api/tasks/:id/status` endpoint that accepts only `{ status: "completed" }` and automatically assigns `completedAt` on the server.

3. **Multi-criteria Query Filtering & Search:**
   - *Challenge:* Combining free-text regex search with status, priority, and category dropdowns without conflicting MongoDB filter objects.
   - *Solution:* Built dynamic filter composition in `taskService.getAllTasks()`, constructing an `$or` query for title/description matching alongside exact equality matches for enums.

4. **Zero-Config Database Fallback:**
   - *Challenge:* If an evaluator or student does not have local MongoDB installed or lacks an Atlas connection string, the server would crash on launch.
   - *Solution:* Engineered a graceful fallback in `config/db.js` using `mongodb-memory-server` that automatically boots an in-memory database and seeds sample tasks if the primary connection times out.

5. **CORS and Production Asset Serving:**
   - *Challenge:* Preventing CORS cross-origin errors during local development while allowing single-port unified serving in production.
   - *Solution:* Configured a Vite development proxy for `/api` and programmed `server.js` to serve compiled assets from `client/dist` when running in production.
