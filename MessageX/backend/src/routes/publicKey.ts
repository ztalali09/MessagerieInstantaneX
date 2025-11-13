import { Router } from 'express';
import { getUserPublicKey } from '../controllers/users';

const router = Router();

router.get('/users/:username/publicKey', getUserPublicKey);

export default router;
