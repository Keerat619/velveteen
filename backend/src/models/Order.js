import mongoose from 'mongoose';
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../utils/orderRules.js';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true, trim: true, maxlength: 120 },
  image: { type: String, required: true, trim: true, maxlength: 2048 },
  quantity: { type: Number, required: true, min: 1, max: 99, validate: Number.isInteger },
  price: { type: Number, required: true, min: 0.01 },
  stockReserved: { type: Boolean, default: false },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, immutable: true, index: true },
  customerName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, required: true, trim: true, maxlength: 32 },
  deliveryAddress: { type: String, required: true, trim: true, maxlength: 500 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  pincode: { type: String, required: true, trim: true, maxlength: 12 },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: { validator: (items) => Array.isArray(items) && items.length > 0 && items.length <= 40, message: 'An order must contain between 1 and 40 different products.' },
  },
  totalAmount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, required: true, default: 'INR', uppercase: true, minlength: 3, maxlength: 3 },
  paymentMethod: { type: String, required: true, enum: PAYMENT_METHODS },
  paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'Pending' },
  orderStatus: { type: String, enum: ORDER_STATUSES, default: 'Pending', index: true },
  specialInstructions: { type: String, trim: true, maxlength: 1200, default: '' },
}, { timestamps: true, versionKey: false });

orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerName: 1, createdAt: -1 });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
