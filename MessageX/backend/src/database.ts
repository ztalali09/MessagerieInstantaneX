import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'users.db');
let dbInstance: Database | null = null;

export async function initializeDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('Failed to connect to database:', err.message);
        reject(err);
      } else {
        console.log('Connected to SQLite database at:', DB_PATH);
        dbInstance = db;
        createTables(db).then(() => resolve(db)).catch(reject);
      }
    });
  });
}

async function createTables(db: Database): Promise<void> {
  const usersSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const messagesSql = `
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER,
      room TEXT,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users (id),
      FOREIGN KEY (to_user_id) REFERENCES users (id)
    );
  `;

  return new Promise((resolve, reject) => {
    db.run(usersSql, (err) => {
      if (err) {
        console.error('Failed to create users table:', err.message);
        reject(err);
      } else {
        console.log('Users table ready.');
        db.run(messagesSql, (err) => {
          if (err) {
            console.error('Failed to create messages table:', err.message);
            reject(err);
          } else {
            console.log('Messages table ready.');
            resolve();
          }
        });
      }
    });
  });
}

export function getDb(): Database {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return dbInstance;
}

export async function closeDatabase(): Promise<void> {
  if (!dbInstance) {
    return;
  }

  return new Promise((resolve, reject) => {
    dbInstance!.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
        reject(err);
      } else {
        console.log('Database connection closed.');
        dbInstance = null;
        resolve();
      }
    });
  });
}

// Graceful shutdown helper
export async function shutdownDatabase(): Promise<void> {
  try {
    await closeDatabase();
  } catch (error) {
    console.error('Error during database shutdown:', error);
    process.exit(1);
  }
}
