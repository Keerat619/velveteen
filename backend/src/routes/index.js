import { Router } from 'express';
import mongoose from 'mongoose';
import adminRoutes from './adminRoutes.js';
import authRoutes from './authRoutes.js';
import customOrderRoutes from './customOrderRoutes.js';
import orderRoutes from './orderRoutes.js';
import productRoutes from './productRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  return res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? 'ok' : 'unavailable',
    database: databaseReady ? 'connected' : 'disconnected',
  });
});
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/custom-orders', customOrderRoutes);
router.use('/admin/auth', authRoutes);
router.use('/admin', adminRoutes);

export default router;
