import { Router } from 'express';
import { archiveProduct, createProduct, getPublicProduct, listAdminProducts, listPublicProducts, updateProduct } from '../controllers/productController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { mongoIdParam, productBody, productUpdateBody } from '../utils/validators.js';

const router = Router();

router.get('/', listPublicProducts);
router.get('/admin/all', requireAdmin, listAdminProducts);
router.get('/:id', mongoIdParam, validateRequest, getPublicProduct);
router.post('/', requireAdmin, productBody, validateRequest, createProduct);
router.put('/:id', requireAdmin, mongoIdParam, productUpdateBody, validateRequest, updateProduct);
router.delete('/:id', requireAdmin, mongoIdParam, validateRequest, archiveProduct);

export default router;
