import { getDb } from './database';
import bcrypt from 'bcrypt';
import { RunResult } from 'sqlite3';

const users = [
  { username: 'Alice', password: 'password123' },
  { username: 'Bob', password: 'password123' }
];

export async function seed() {
  console.log('Seeding database...');
  const db = getDb();
  if (!db) {
    console.error('Database not initialized. Seeding cannot be performed.');
    return;
  }

  try {
    const saltRounds = 10;
    const insert = db.prepare('INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)');

    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, saltRounds);
      await new Promise<void>((resolve, reject) => {
        insert.run(user.username, passwordHash, function (this: RunResult, err: Error | null) {
          if (err) {
            console.error(`Error seeding user ${user.username}:`, err.message);
            return reject(err);
          }
          if (this.changes > 0) {
            console.log(`User ${user.username} inserted with ID: ${this.lastID}`);
          } else {
            // This part is optional as it can be noisy if run every time
            // console.log(`User ${user.username} already exists.`);
          }
          resolve();
        });
      });
    }
    insert.finalize();
    console.log('Database seeding check complete.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
