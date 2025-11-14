import { Request, Response } from 'express';
import { getAllUsers, createUser as createUserModel, getUserById, getUserByUsername } from '../models/users';
import bcrypt from 'bcrypt';
import { generateRSAKeyPair } from '../crypto/rsa';
import * as crypto from 'crypto';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsers();
    res.json({ users, count: users.length });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    if (username.length < 3 || password.length < 6) {
      res.status(400).json({ error: 'Username must be at least 3 characters and password at least 6 characters' });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate RSA key pair
    const { publicKey, privateKey } = generateRSAKeyPair();

    // Derive AES key from password using SHA-256
    const aesKey = crypto.createHash('sha256').update(password).digest();

    // Encrypt private key with AES-256-ECB
    const cipher = crypto.createCipheriv('aes-256-ecb', aesKey, Buffer.alloc(0)); // ECB mode does not use an IV
    let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'base64');
    encryptedPrivateKey += cipher.final('base64');

    const userId = await createUserModel(username, passwordHash, publicKey, encryptedPrivateKey);
    res.status(201).json({
      id: userId,
      username,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const user = await getUserByUsername(username);
    if (!user) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
