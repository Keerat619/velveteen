import mongoose from 'mongoose';

export const PRODUCT_CATEGORIES = [
  'roses',
  'tulip-bouquets',
  'sunflowers',
  'custom-bouquets',
  'mini-arrangements',
  'pipe-cleaner-crafts',
  'decorative-gifts',
];

export const PRODUCT_AVAILABILITY = ['available', 'made-to-order', 'unavailable'];

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2500 },
  price: { type: Number, required: true, min: 0.01, max: 10000000 },
  image: { type: String, required: true, trim: true, maxlength: 2048 },
  category: { type: String, required: true, enum: PRODUCT_CATEGORIES, index: true },
  availability: { type: String, enum: PRODUCT_AVAILABILITY, default: 'available', index: true },
  stock: { type: Number, min: 0, max: 100000, validate: Number.isInteger },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true, versionKey: false });

productSchema.index({ isActive: 1, availability: 1, createdAt: -1 });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
