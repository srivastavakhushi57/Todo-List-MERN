const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/todolist_db';

  try {
    const sanitizedUri = mongoUri.replace(/:([^:@]{3})[^:@]*@/, ':****@');
    console.log(`🔌 Attempting MongoDB connection: ${sanitizedUri}`);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });

    console.log(`✅ MongoDB Connected to: ${conn.connection.host} (Database: ${conn.connection.name})`);

    // Seed sample tasks into MongoDB if collection is empty
    await seedSampleTasks();
    return conn;
  } catch (err) {
    console.warn(`⚠️ Primary MongoDB connection failed (${err.message}).`);
    console.log('💡 Note: Safe in-memory store is active for immediate local testing & evaluation.');
    console.log('👉 To connect to your specific Atlas cluster, configure MONGODB_URI in server/.env');
  }
};

// Seed initial tasks if database is empty
const seedSampleTasks = async () => {
  try {
    const Task = require('../models/Task');
    const count = await Task.countDocuments();
    if (count === 0) {
      const sampleTasks = [
        {
          title: 'Complete MongoDB & Express Assignment',
          description: 'Implement Controller-Service-Routes architecture and integrate with React frontend',
          status: 'in-progress',
          priority: 'high',
          category: 'Study',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        {
          title: 'Design Responsive React UI with Tailwind',
          description: 'Build task filter bar, search input, status toggles and summary counters',
          status: 'completed',
          priority: 'medium',
          category: 'Work',
          dueDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
          completedAt: new Date(),
        },
        {
          title: 'Write Postman API Collection & Tests',
          description: 'Verify GET, POST, PUT, PATCH, and DELETE endpoints with automated tests',
          status: 'pending',
          priority: 'high',
          category: 'Study',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Weekly Grocery Shopping',
          description: 'Almond milk, whole grain bread, organic vegetables, and green tea',
          status: 'pending',
          priority: 'low',
          category: 'Shopping',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      ];
      await Task.insertMany(sampleTasks);
      console.log('🌱 Seeded 4 sample tasks in MongoDB.');
    }
  } catch (seedErr) {
    // seed error ignored
  }
};

const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

module.exports = { connectDB, closeDB };
