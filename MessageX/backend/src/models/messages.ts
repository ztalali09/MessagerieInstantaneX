import { getDb } from '../database';

export interface Message {
  id: number;
  from_user_id: number;
  to_user_id?: number;
  room?: string;
  message: string;
  timestamp: string;
}

export interface MessageResponse {
  id: number;
  from_user_id: number;
  to_user_id: number;
  room?: string;
  message: string;
  timestamp: string;
  from_username?: string;
  to_username?: string;
}

export const saveMessage = async (fromUserId: number, toUserId: number | null, room: string | null, message: string): Promise<number> => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO messages (from_user_id, to_user_id, room, message) VALUES (?, ?, ?, ?)',
      [fromUserId, toUserId, room, message],
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

export const getMessagesBetweenUsers = async (userId1: number, userId2: number): Promise<MessageResponse[]> => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        m.id,
        m.from_user_id,
        m.to_user_id,
        m.room,
        m.message,
        m.timestamp,
        u1.username as from_username,
        u2.username as to_username
      FROM messages m
      JOIN users u1 ON m.from_user_id = u1.id
      LEFT JOIN users u2 ON m.to_user_id = u2.id
      WHERE (m.from_user_id = ? AND m.to_user_id = ?)
         OR (m.from_user_id = ? AND m.to_user_id = ?)
      ORDER BY m.timestamp ASC
    `;
    db.all(sql, [userId1, userId2, userId2, userId1], (err: Error, rows: MessageResponse[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const getRecentMessagesForUser = async (userId: number, limit: number = 50, conversationUserId?: number, room?: string): Promise<MessageResponse[]> => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT
        m.id,
        m.from_user_id,
        m.to_user_id,
        m.room,
        m.message,
        m.timestamp,
        u1.username as from_username,
        u2.username as to_username
      FROM messages m
      JOIN users u1 ON m.from_user_id = u1.id
      LEFT JOIN users u2 ON m.to_user_id = u2.id
      WHERE (m.from_user_id = ? OR m.to_user_id = ?)
    `;
    const params: any[] = [userId, userId];

    if (conversationUserId) {
      sql += ` AND ((m.from_user_id = ? AND m.to_user_id = ?) OR (m.from_user_id = ? AND m.to_user_id = ?))`;
      params.push(conversationUserId, userId, userId, conversationUserId);
    } else if (room) {
      sql += ` AND m.room = ?`;
      params.push(room);
    }

    sql += ` ORDER BY m.timestamp DESC LIMIT ?`;
    params.push(limit);

    db.all(sql, params, (err: Error, rows: MessageResponse[]) => {
      if (err) {
        reject(err);
      } else {
        // Reverse to get chronological order
        resolve(rows.reverse());
      }
    });
  });
};
