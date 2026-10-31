/**
 * Automated Test Suite for To-Do List APIs
 * Tests all endpoints: GET, POST, PUT, PATCH, DELETE, Search, Filtering, Stats, and Validation Errors
 */
process.env.NODE_ENV = 'test';
process.env.PORT = '5055';

const http = require('http');
const { app, server } = require('./server');
const { connectDB, closeDB } = require('./config/db');

const BASE_URL = 'http://localhost:5055';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting Automated To-Do List API Verification Tests');
  console.log('======================================================\n');

  let testServer;
  let createdTaskId = null;
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? '(' + detail + ')' : ''}`);
      failedCount++;
    }
  }

  try {
    await connectDB();
    await new Promise((resolve) => {
      testServer = app.listen(5055, resolve);
    });

    // Test 1: Health check
    const health = await request({
      hostname: 'localhost',
      port: 5055,
      path: '/api/health',
      method: 'GET',
    });
    assert(health.status === 200 && health.body.status === 'online', '1. GET /api/health returns 200 OK');

    // Test 2: Create a new task (POST /api/tasks)
    const createRes = await request(
      {
        hostname: 'localhost',
        port: 5055,
        path: '/api/tasks',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        title: 'Review Express Service Architecture',
        description: 'Verify clean separation between controllers, services, and route definitions',
        priority: 'high',
        category: 'Study',
        status: 'pending',
        dueDate: '2026-11-04T12:00:00.000Z',
      }
    );
    assert(
      createRes.status === 201 && createRes.body.success === true,
      '2. POST /api/tasks creates task with 201 Created'
    );
    createdTaskId = createRes.body.data?._id;
    assert(!!createdTaskId, '   Created task has valid MongoDB _id');

    // Test 3: Retrieve all tasks (GET /api/tasks)
    const listRes = await request({
      hostname: 'localhost',
      port: 5055,
      path: '/api/tasks',
      method: 'GET',
    });
    assert(
      listRes.status === 200 && Array.isArray(listRes.body.data) && listRes.body.data.length > 0,
      '3. GET /api/tasks returns 200 and list of tasks'
    );

    // Test 4: Retrieve task by ID (GET /api/tasks/:id)
    const getOneRes = await request({
      hostname: 'localhost',
      port: 5055,
      path: `/api/tasks/${createdTaskId}`,
      method: 'GET',
    });
    assert(
      getOneRes.status === 200 && getOneRes.body.data?.title === 'Review Express Service Architecture',
      '4. GET /api/tasks/:id retrieves specific task'
    );

    // Test 5: Search tasks by keyword (GET /api/tasks?search=Architecture)
    const searchRes = await request({
      hostname: 'localhost',
      port: 5055,
      path: '/api/tasks?search=Architecture',
      method: 'GET',
    });
    assert(
      searchRes.status === 200 && searchRes.body.data.some((t) => t._id === createdTaskId),
      '5. GET /api/tasks?search=... searches by keyword'
    );

    // Test 6: Filter by status (GET /api/tasks?status=pending)
    const statusFilterRes = await request({
      hostname: 'localhost',
      port: 5055,
      path: '/api/tasks?status=pending',
      method: 'GET',
    });
    assert(
      statusFilterRes.status === 200 && statusFilterRes.body.data.every((t) => t.status === 'pending'),
      '6. GET /api/tasks?status=pending filters by status'
    );

    // Test 7: Filter by priority (GET /api/tasks?priority=high)
    const prioFilterRes = await request({
      hostname: 'localhost',
      port: 5055,
      path: '/api/tasks?priority=high',
      method: 'GET',
    });
    assert(
      prioFilterRes.status === 200 && prioFilterRes.body.data.every((t) => t.priority === 'high'),
      '7. GET /api/tasks?priority=high filters by priority'
    );

    // Test 8: Update task details (PUT /api/tasks/:id)
    const updateRes = await request(
      {
        hostname: 'localhost',
        port: 5055,
        path: `/api/tasks/${createdTaskId}`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        title: 'Review Express Service Architecture (Updated)',
        priority: 'medium',
      }
    );
    assert(
      updateRes.status === 200 && updateRes.body.data?.title === 'Review Express Service Architecture (Updated)',
      '8. PUT /api/tasks/:id updates task details'
    );

    // Test 9: Update task status specifically (PATCH /api/tasks/:id/status)
    const patchRes = await request(
      {
        hostname: 'localhost',
        port: 5055,
        path: `/api/tasks/${createdTaskId}/status`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      },
      { status: 'completed' }
    );
    assert(
      patchRes.status === 200 &&
        patchRes.body.data?.status === 'completed' &&
        patchRes.body.data?.completedAt !== null,
      '9. PATCH /api/tasks/:id/status updates status and sets completedAt'
    );

    // Test 10: Task stats (GET /api/tasks/stats)
    const statsRes = await request({
      hostname: 'localhost',
      port: 5055,
      path: '/api/tasks/stats',
      method: 'GET',
    });
    assert(
      statsRes.status === 200 &&
        statsRes.body.data?.total > 0 &&
        typeof statsRes.body.data?.completionRate === 'number',
      '10. GET /api/tasks/stats returns summary counts and completion rate'
    );

    // Test 11: Error handling - 400 Bad Request on empty title
    const invalidCreate = await request(
      {
        hostname: 'localhost',
        port: 5055,
        path: '/api/tasks',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { title: '' }
    );
    assert(invalidCreate.status === 400, '11. POST /api/tasks rejects empty title with 400 Bad Request');

    // Test 12: Error handling - 400 Bad Request on invalid ObjectId format
    const invalidIdRes = await request({
      hostname: 'localhost',
      port: 5055,
      path: '/api/tasks/invalid-mongo-id-123',
      method: 'GET',
    });
    assert(invalidIdRes.status === 400, '12. GET /api/tasks/:id handles invalid ID format with 400 Bad Request');

    // Test 13: Error handling - 404 Not Found on non-existent ObjectId
    const notFoundRes = await request({
      hostname: 'localhost',
      port: 5055,
      path: '/api/tasks/6631bfa2e12456001a1c9001',
      method: 'GET',
    });
    assert(notFoundRes.status === 404, '13. GET /api/tasks/:id handles non-existent task with 404 Not Found');

    // Test 14: Delete task (DELETE /api/tasks/:id)
    const deleteRes = await request({
      hostname: 'localhost',
      port: 5055,
      path: `/api/tasks/${createdTaskId}`,
      method: 'DELETE',
    });
    assert(deleteRes.status === 200 && deleteRes.body.success === true, '14. DELETE /api/tasks/:id deletes task');

    console.log('\n======================================================');
    console.log(`🎉 Results: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Fatal test error:', err);
  } finally {
    if (testServer) testServer.close();
    await closeDB();
    process.exit(failedCount === 0 ? 0 : 1);
  }
}

runTests();
