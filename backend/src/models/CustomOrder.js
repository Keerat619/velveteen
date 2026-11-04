import mongoose from 'mongoose';
import { CUSTOM_REQUEST_STATUSES } from '../utils/orderRules.js';

const customOrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, required: true, trim: true, maxlength: 32 },
  flowerType: { type: String, required: true, trim: true, maxlength: 160 },
  preferredColours: { type: [String], default: [], validate: (colours) => colours.length <= 12 },
  bouquetSize: { type: String, required: true, trim: true, maxlength: 100 },
  budget: { type: String, required: true, trim: true, maxlength: 120 },
  deliveryDate: { type: Date, default: null },
  customMessage: { type: String, trim: true, maxlength: 1500, default: '' },
  referenceImage: { type: String, trim: true, maxlength: 2048, default: '' },
  requestStatus: { type: String, enum: CUSTOM_REQUEST_STATUSES, default: 'New', index: true },
}, { timestamps: true, versionKey: false });

customOrderSchema.index({ createdAt: -1 });
customOrderSchema.index({ customerName: 1, createdAt: -1 });

export const CustomOrder = mongoose.models.CustomOrder || mongoose.model('CustomOrder', customOrderSchema);
