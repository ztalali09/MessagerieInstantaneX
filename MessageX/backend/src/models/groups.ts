import { getDb } from '../database';

export interface Group {
  id: number;
  name: string;
  description?: string;
  created_by: number;
  created_at: string;
}

export interface GroupResponse {
  id: number;
  name: string;
  description?: string;
  created_by: number;
  created_at: string;
  member_count?: number;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  joined_at: string;
  username?: string;
} // <-- This closing brace was missing

export const createGroup = async (name: string, description: string | null, createdBy: number): Promise<number> => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO groups (name, description, created_by) VALUES (?, ?, ?)',
      [name, description, createdBy],
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

export const getAllGroups = async (): Promise<GroupResponse[]> => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        g.id,
        g.name,
        g.description,
        g.created_by,
        g.created_at,
        COUNT(gm.user_id) as member_count
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `;
    db.all(sql, [], (err: Error, rows: GroupResponse[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const getGroupById = async (id: number): Promise<Group | null> => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM groups WHERE id = ?', [id], (err: Error, row: Group) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
};

export const getGroupsForUser = async (userId: number): Promise<GroupResponse[]> => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        g.id,
        g.name,
        g.description,
        g.created_by,
        g.created_at,
        COUNT(gm2.user_id) as member_count
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN group_members gm2 ON g.id = gm2.group_id
      WHERE gm.user_id = ?
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `;
    db.all(sql, [userId], (err: Error, rows: GroupResponse[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const addUserToGroup = async (groupId: number, userId: number): Promise<number> => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)',
      [groupId, userId],
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

export const removeUserFromGroup = async (groupId: number, userId: number): Promise<void> => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId],
      function(this: { changes: number }, err: Error) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

export const getGroupMembers = async (groupId: number): Promise<GroupMember[]> => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        gm.id,
        gm.group_id,
        gm.user_id,
        gm.joined_at,
        u.username
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.joined_at ASC
    `;
    db.all(sql, [groupId], (err: Error, rows: GroupMember[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const isUserInGroup = async (groupId: number, userId: number): Promise<boolean> => {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId],
      (err: Error, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      }
    );
  });
};
