import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { buildTrustedOrderLines, normalizeCartItems } from '../src/services/orderService.js';
import { HttpError } from '../src/utils/HttpError.js';

const firstId = '507f1f77bcf86cd799439011';
const secondId = '507f1f77bcf86cd799439012';
const makeProduct = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(firstId),
  name: 'Studio flower',
  image: '/images/studio-flower.jpg',
  price: 12.345,
  isActive: true,
  availability: 'available',
  ...overrides,
});

function assertHttpError(action, message) {
  assert.throws(action, (error) => error instanceof HttpError && error.status === 422 && error.message === message);
}

test('normalizeCartItems combines repeated product ids and preserves valid quantities', () => {
  assert.deepEqual(normalizeCartItems([
    { productId: firstId, quantity: 2 },
    { productId: secondId, quantity: 1 },
    { productId: firstId, quantity: 3 },
  ]), [
    { productId: firstId, quantity: 5 },
    { productId: secondId, quantity: 1 },
  ]);
});

test('normalizeCartItems rejects empty carts, invalid ids, and quantities outside the allowed range', () => {
  assertHttpError(() => normalizeCartItems([]), 'Your cart is empty.');
  assert.throws(() => normalizeCartItems([{ productId: 'not-an-id', quantity: 1 }]), /selected products is invalid/);
  assert.throws(() => normalizeCartItems([{ productId: firstId, quantity: 0 }]), /quantity must be a whole number/);
  assert.throws(() => normalizeCartItems([{ productId: firstId, quantity: 60 }, { productId: firstId, quantity: 40 }]), /quantity cannot exceed 99/);
});

test('buildTrustedOrderLines prices from product documents and rounds server-side totals', () => {
  const result = buildTrustedOrderLines([{ productId: firstId, quantity: 2 }], [makeProduct()]);
  assert.equal(result.lines[0].price, 12.35);
  assert.equal(result.lines[0].productName, 'Studio flower');
  assert.equal(result.lines[0].stockReserved, false);
  assert.equal(result.totalAmount, 24.7);
});

test('buildTrustedOrderLines rejects unavailable products and products without a trusted price', () => {
  assert.throws(() => buildTrustedOrderLines([{ productId: firstId, quantity: 1 }], []), /no longer available/);
  assert.throws(() => buildTrustedOrderLines([{ productId: firstId, quantity: 1 }], [makeProduct({ isActive: false })]), /no longer available/);
  assert.throws(() => buildTrustedOrderLines([{ productId: firstId, quantity: 1 }], [makeProduct({ availability: 'unavailable' })]), /no longer available/);
  assert.throws(() => buildTrustedOrderLines([{ productId: firstId, quantity: 1 }], [makeProduct({ price: 0 })]), /valid price/);
});
