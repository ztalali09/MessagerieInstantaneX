import { Router } from 'express';
import { getUsers, createUser, getUser } from '../controllers/users';

const router = Router();

// GET /users - Get all users
router.get('/', getUsers);

// GET /users/:id - Get user by ID
router.get('/:id', getUser);

// POST /users - Create a new user
router.post('/', createUser);

export default router;
