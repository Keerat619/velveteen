import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { changeCustomOrderStatus, listCustomOrders } from '../controllers/customOrderController.js';
import { changeOrderStatus, changePaymentStatus, getAdminOrder, getOrderStatusRules, listAdminOrders } from '../controllers/orderController.js';
import { archiveProduct, createProduct, listAdminProducts, updateProduct } from '../controllers/productController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { customOrderListQuery, customOrderStatusBody, mongoIdParam, orderListQuery, orderStatusBody, paymentStatusBody, productBody, productUpdateBody } from '../utils/validators.js';

const router = Router();
router.use(requireAdmin);

router.get('/dashboard/stats', getDashboardStats);
router.get('/orders', orderListQuery, validateRequest, listAdminOrders);
router.get('/orders/status-rules', getOrderStatusRules);
router.get('/orders/:id', mongoIdParam, validateRequest, getAdminOrder);
router.patch('/orders/:id/status', mongoIdParam, orderStatusBody, validateRequest, changeOrderStatus);
router.patch('/orders/:id/payment-status', mongoIdParam, paymentStatusBody, validateRequest, changePaymentStatus);

router.get('/custom-orders', customOrderListQuery, validateRequest, listCustomOrders);
router.patch('/custom-orders/:id/status', mongoIdParam, customOrderStatusBody, validateRequest, changeCustomOrderStatus);

router.get('/products', listAdminProducts);
router.post('/products', productBody, validateRequest, createProduct);
router.put('/products/:id', mongoIdParam, productUpdateBody, validateRequest, updateProduct);
router.delete('/products/:id', mongoIdParam, validateRequest, archiveProduct);

export default router;
