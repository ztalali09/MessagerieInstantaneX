import express from 'express';
// Importing closeDatabase, which we will use in the shutdown hooks
import { initializeDatabase, closeDatabase } from './database';
import usersRouter from './routes/users';
import { seed } from './seed';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware (basic)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize database
initializeDatabase().then(async () => {
  console.log('Database initialized successfully.');
  // Seed the database with initial users
  await seed();
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// --- Routes ---

app.get('/', (req, res) => {
  res.json({
    message: 'MessageX API',
    version: '1.0.0',
    endpoints: {
      users: '/users'
    }
  });
});

// User routes
app.use('/users', usersRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --- Error Handlers ---

// 404 handler (must be after all other routes)
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handling middleware (must be last)
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// --- Graceful Shutdown ---

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  // **FIX:** Changed shutdownDatabase to the imported closeDatabase
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  // **FIX:** Changed shutdownDatabase to the imported closeDatabase
  await closeDatabase();
  process.exit(0);
});

// --- Start Server ---

app.listen(port, host, () => {
  console.log(`🚀 MessageX API server running at http://${host}:${port}`);
  console.log(`📊 Health check available at http://${host}:${port}/health`);
});
