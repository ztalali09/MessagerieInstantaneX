import { getDb } from '../database';

interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  id: number;
  username: string;
  created_at: string;
}

export const getAllUsers = async (): Promise<UserResponse[]> => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all('SELECT id, username, created_at FROM users ORDER BY created_at DESC', [], (err: Error, rows: UserResponse[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const createUser = async (username: string, passwordHash: string): Promise<number> => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash],
      // FIX: Explicitly type 'this' for the callback function.
      // The 'sqlite3' library binds 'this' to an object containing 'lastID' on success.
      function(this: { lastID: number }, err: Error) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err: Error, row: User) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
};

export const getUserById = async (id: number): Promise<User | null> => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err: Error, row: User) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
};
