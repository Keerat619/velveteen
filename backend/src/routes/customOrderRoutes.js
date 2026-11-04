import { Router } from 'express';
import { submitCustomOrder } from '../controllers/customOrderController.js';
import { customOrderLimiter } from '../middleware/rateLimiters.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { customOrderBody } from '../utils/validators.js';

const router = Router();

router.post('/', customOrderLimiter, customOrderBody, validateRequest, submitCustomOrder);

export default router;
