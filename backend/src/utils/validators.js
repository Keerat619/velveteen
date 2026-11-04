import { body, param, query, header } from 'express-validator';
import { PRODUCT_AVAILABILITY, PRODUCT_CATEGORIES } from '../models/Product.js';
import { CUSTOM_REQUEST_STATUSES, ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from './orderRules.js';

const imagePathOrHttpsUrl = (value) => {
  if (/^\/images\/[\w./-]+\.(?:avif|gif|jpe?g|png|webp)$/i.test(value) && !value.includes('..')) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const phoneFormat = (value) => /^\+?[0-9()\s.-]{7,24}$/.test(value);

export const mongoIdParam = [param('id').isMongoId().withMessage('A valid identifier is required.')];

export const loginBody = [
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').isString().isLength({ min: 1, max: 200 }).withMessage('Enter your password.'),
];

export const productBody = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Product name must be 2–120 characters.'),
  body('description').trim().isLength({ min: 5, max: 2500 }).withMessage('Description must be 5–2500 characters.'),
  body('price').isFloat({ min: 0.01, max: 10000000 }).withMessage('Enter a price greater than zero.').toFloat(),
  body('image').trim().custom(imagePathOrHttpsUrl).withMessage('Use a local /images path or a secure HTTPS image URL.'),
  body('category').isIn(PRODUCT_CATEGORIES).withMessage('Choose a valid product category.'),
  body('availability').optional().isIn(PRODUCT_AVAILABILITY).withMessage('Choose a valid availability setting.'),
  body('stock').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0, max: 100000 }).withMessage('Stock must be a non-negative whole number.').toInt(),
];

export const productUpdateBody = [
  body('name').optional().trim().isLength({ min: 2, max: 120 }).withMessage('Product name must be 2–120 characters.'),
  body('description').optional().trim().isLength({ min: 5, max: 2500 }).withMessage('Description must be 5–2500 characters.'),
  body('price').optional().isFloat({ min: 0.01, max: 10000000 }).withMessage('Enter a price greater than zero.').toFloat(),
  body('image').optional().trim().custom(imagePathOrHttpsUrl).withMessage('Use a local /images path or a secure HTTPS image URL.'),
  body('category').optional().isIn(PRODUCT_CATEGORIES).withMessage('Choose a valid product category.'),
  body('availability').optional().isIn(PRODUCT_AVAILABILITY).withMessage('Choose a valid availability setting.'),
  body('stock').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0, max: 100000 }).withMessage('Stock must be a non-negative whole number.').toInt(),
  body('isActive').optional().isBoolean().withMessage('Active must be true or false.').toBoolean(),
  body().custom((value) => Object.keys(value).some((key) => ['name', 'description', 'price', 'image', 'category', 'availability', 'stock', 'isActive'].includes(key))).withMessage('Provide at least one product field to update.'),
];

export const orderBody = [
  body('customerName').trim().isLength({ min: 2, max: 120 }).withMessage('Enter your full name.'),
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('phone').trim().custom(phoneFormat).withMessage('Enter a valid phone number.'),
  body('deliveryAddress').trim().isLength({ min: 5, max: 500 }).withMessage('Enter a complete delivery address.'),
  body('city').trim().isLength({ min: 2, max: 100 }).withMessage('Enter a city.'),
  body('pincode').trim().matches(/^[0-9A-Za-z -]{4,12}$/).withMessage('Enter a valid postal or PIN code.'),
  body('items').isArray({ min: 1, max: 40 }).withMessage('Add at least one product to your order.'),
  body('items.*.productId').isMongoId().withMessage('One of the selected products is invalid.'),
  body('items.*.quantity').isInt({ min: 1, max: 99 }).withMessage('Each quantity must be a whole number from 1 to 99.').toInt(),
  body('paymentMethod').isIn(PAYMENT_METHODS).withMessage('Choose Cash on Delivery or Manual Payment.'),
  body('specialInstructions').optional({ nullable: true }).isString().isLength({ max: 1200 }).withMessage('Instructions must be 1200 characters or fewer.').trim(),
  body('items').custom((items) => {
    if (!Array.isArray(items)) return true;
    const ids = items.map((item) => item?.productId);
    return new Set(ids).size === ids.length;
  }).withMessage('A product may appear only once in the order; use its quantity field.'),
];

export const orderLookup = [
  param('orderNumber').matches(/^VLT-\d{8}-[A-F0-9]{16}$/).withMessage('Enter a valid order number.'),
  header('x-order-email').isEmail().withMessage('Provide the email address used for this order.').normalizeEmail(),
];

export const customOrderBody = [
  body('customerName').trim().isLength({ min: 2, max: 120 }).withMessage('Enter your name.'),
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('phone').trim().custom(phoneFormat).withMessage('Enter a valid phone number.'),
  body('flowerType').trim().isLength({ min: 2, max: 160 }).withMessage('Tell us which kind of flower or piece you have in mind.'),
  body('preferredColours').custom((value) => {
    const colours = Array.isArray(value) ? value : String(value ?? '').split(',');
    return colours.length <= 12 && colours.every((colour) => typeof colour === 'string' && colour.trim().length <= 40);
  }).withMessage('Use up to 12 colour names, each 40 characters or fewer.'),
  body('bouquetSize').trim().isLength({ min: 1, max: 100 }).withMessage('Choose or describe a size.'),
  body('budget').trim().isLength({ min: 1, max: 120 }).withMessage('Share a budget or range so the studio can advise.'),
  body('deliveryDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Enter a valid preferred date.'),
  body('customMessage').optional({ nullable: true }).isString().isLength({ max: 1500 }).withMessage('Message must be 1500 characters or fewer.'),
  body('referenceImage').optional({ nullable: true, checkFalsy: true }).isURL({ protocols: ['https'], require_protocol: true }).withMessage('Reference image must be a secure HTTPS URL.'),
];

export const orderStatusBody = [
  body('orderStatus').isIn(ORDER_STATUSES).withMessage('Choose a valid order status.'),
];

export const paymentStatusBody = [
  body('paymentStatus').isIn(PAYMENT_STATUSES).withMessage('Choose a valid payment status.'),
];

export const customOrderStatusBody = [
  body('requestStatus').isIn(CUSTOM_REQUEST_STATUSES).withMessage('Choose a valid request status.'),
];

export const orderListQuery = [
  query('search').optional().isString().isLength({ max: 120 }).withMessage('Search must be 120 characters or fewer.'),
  query('status').optional().isIn(ORDER_STATUSES).withMessage('Choose a valid status filter.'),
  query('sort').optional().isIn(['newest', 'oldest']).withMessage('Sort must be newest or oldest.'),
  query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be from 1 to 500.').toInt(),
];

export const customOrderListQuery = [
  query('search').optional().isString().isLength({ max: 120 }).withMessage('Search must be 120 characters or fewer.'),
  query('status').optional().isIn(CUSTOM_REQUEST_STATUSES).withMessage('Choose a valid request status.'),
  query('sort').optional().isIn(['newest', 'oldest']).withMessage('Sort must be newest or oldest.'),
];
