import axios from 'axios';

/**
 * Configure Axios client for To-Do List APIs
 * In development, requests to /api are proxied to http://localhost:5000
 * In production, it can use the current origin or an external VITE_API_URL
 */
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to extract data payload or handle standardized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    console.error('API Request Failed:', errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
);

export const taskApi = {
  /**
   * 1. Retrieve all tasks with query filters
   */
  async getTasks(params = {}) {
    const response = await apiClient.get('/tasks', { params });
    return response.data;
  },

  /**
   * 2. Retrieve summary stats
   */
  async getStats() {
    const response = await apiClient.get('/tasks/stats');
    return response.data;
  },

  /**
   * 3. Retrieve single task by ID
   */
  async getTaskById(id) {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },

  /**
   * 4. Create new task
   */
  async createTask(taskData) {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  },

  /**
   * 5. Update task details
   */
  async updateTask(id, taskData) {
    const response = await apiClient.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  /**
   * 6. Update task status specifically (PATCH /api/tasks/:id/status)
   */
  async updateTaskStatus(id, status) {
    const response = await apiClient.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  /**
   * 7. Delete task by ID
   */
  async deleteTask(id) {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },

  /**
   * 8. Bulk delete completed tasks
   */
  async deleteCompleted() {
    const response = await apiClient.delete('/tasks/completed/all');
    return response.data;
  },

  /**
   * 9. Health check
   */
  async checkHealth() {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default taskApi;
