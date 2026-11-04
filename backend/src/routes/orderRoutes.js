import { Router } from 'express';
import { lookupOrder, placeOrder } from '../controllers/orderController.js';
import { orderLimiter, orderLookupLimiter } from '../middleware/rateLimiters.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { orderBody, orderLookup } from '../utils/validators.js';

const router = Router();

router.post('/', orderLimiter, orderBody, validateRequest, placeOrder);
router.get('/:orderNumber', orderLookupLimiter, orderLookup, validateRequest, lookupOrder);

export default router;
