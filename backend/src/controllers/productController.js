import { Product } from '../models/Product.js';
import { getCurrency } from '../config/env.js';
import { HttpError } from '../utils/HttpError.js';

const publicStockFilter = [
  { stock: { $exists: false } },
  { stock: null },
  { stock: { $gt: 0 } },
];

function serializeProduct(product) {
  return { ...product.toObject(), currency: getCurrency() };
}

export async function listPublicProducts(req, res) {
  const filter = {
    isActive: true,
    availability: { $ne: 'unavailable' },
    $or: publicStockFilter,
  };
  if (req.query.category) filter.category = req.query.category;
  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  const currency = getCurrency();
  return res.json({ products: products.map((product) => ({ ...product, currency })) });
}

export async function getPublicProduct(req, res) {
  const product = await Product.findOne({
    _id: req.params.id,
    isActive: true,
    availability: { $ne: 'unavailable' },
    $or: publicStockFilter,
  });
  if (!product) throw new HttpError(404, 'Product not found or no longer available.');
  return res.json({ product: serializeProduct(product) });
}

export async function listAdminProducts(req, res) {
  const products = await Product.find().sort({ isActive: -1, createdAt: -1 }).lean();
  const currency = getCurrency();
  return res.json({ products: products.map((product) => ({ ...product, currency })) });
}

export async function createProduct(req, res) {
  const allowedFields = ['name', 'description', 'price', 'image', 'category', 'availability', 'stock'];
  const input = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
  const product = await Product.create({ ...input, isActive: true });
  return res.status(201).json({ product: serializeProduct(product) });
}

export async function updateProduct(req, res) {
  const allowedFields = ['name', 'description', 'price', 'image', 'category', 'availability', 'stock', 'isActive'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!product) throw new HttpError(404, 'Product not found.');
  return res.json({ product: serializeProduct(product) });
}

export async function archiveProduct(req, res) {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false, availability: 'unavailable' },
    { new: true, runValidators: true },
  );
  if (!product) throw new HttpError(404, 'Product not found.');
  return res.json({ message: 'Product archived. Existing order records remain intact.', product: serializeProduct(product) });
}
