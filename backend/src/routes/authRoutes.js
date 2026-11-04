import { Router } from 'express';
import { getCurrentAdmin, loginAdmin } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiters.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginBody } from '../utils/validators.js';

const router = Router();

router.post('/login', loginLimiter, loginBody, validateRequest, loginAdmin);
router.get('/me', requireAdmin, getCurrentAdmin);

export default router;
