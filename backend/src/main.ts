// src/main.ts

import express from 'express';
import { createServer } from 'http'; // <-- Import Node's http server
import { initializeSocketIO } from './socket'; // <-- Import your socket initializer
import { initializeDatabase, closeDatabase } from './database';
import usersRouter from './routes/users';

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
const server = createServer(app); // <-- Create the HTTP server
const io = initializeSocketIO(server); // <-- Initialize Socket.IO and pass the server

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware (for HTTP requests)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// --- Routes ---

app.get('/', (req, res) => {
  res.json({
    message: 'MessageX API',
    version: '1.0.0',
    endpoints: {
      users: '/users',
    },
  });
});

// User routes
app.use('/users', usersRouter);

// Group routes - REMOVED

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
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
);

// --- Graceful Shutdown ---

const onShutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  await closeDatabase();
  await io.close();
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => onShutdown('SIGINT'));
process.on('SIGTERM', () => onShutdown('SIGTERM'));

// --- Start Server ---

// Initialize database *then* start the server
initializeDatabase()
  .then((prisma) => {
    console.log('Database initialized successfully.');

    // Start listening on the http server, NOT the express app
    server.listen(port, host, () => {
      console.log(`🚀 MessageX API server running at http://${host}:${port}`);
      console.log(`🔌 Socket.IO listening on the same port`);
      console.log(`📊 Health check available at http://${host}:${port}/health`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
