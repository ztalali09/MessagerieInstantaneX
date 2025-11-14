import { Router } from 'express';
import { getUsers, createUser, getUser, loginUser, getEncryptedPrivateKey } from '../controllers/users';

const router = Router();

// GET /users - Get all users
router.get('/', getUsers);

// GET /users/:id - Get user by ID
router.get('/:id', getUser);

// GET /users/:id/private-key - Get encrypted private key
router.get('/:id/private-key', getEncryptedPrivateKey);

// POST /users/register - Create a new user
router.post('/register', createUser);

// POST /users/login - Login user
router.post('/login', loginUser);
export default router;
