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

  const groupsSql = `
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users (id)
    );
  `;

  const groupMembersSql = `
    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(group_id, user_id)
    );
  `;

  const messagesSql = `
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER,
      room TEXT,
      group_id INTEGER,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users (id),
      FOREIGN KEY (to_user_id) REFERENCES users (id),
      FOREIGN KEY (group_id) REFERENCES groups (id)
    );
  `;

  return new Promise((resolve, reject) => {
    db.run(usersSql, (err) => {
      if (err) {
        console.error('Failed to create users table:', err.message);
        reject(err);
      } else {
        console.log('Users table ready.');
        db.run(groupsSql, (err) => {
          if (err) {
            console.error('Failed to create groups table:', err.message);
            reject(err);
          } else {
            console.log('Groups table ready.');
            db.run(groupMembersSql, (err) => {
              if (err) {
                console.error('Failed to create group_members table:', err.message);
                reject(err);
              } else {
                console.log('Group members table ready.');
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
