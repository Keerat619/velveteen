import test from 'node:test';
import assert from 'node:assert/strict';
import { canTransitionOrderStatus, nextOrderStatuses, ORDER_STATUSES } from '../src/utils/orderRules.js';

test('order state transitions permit only the next fulfilment step', () => {
  assert.equal(canTransitionOrderStatus('Pending', 'Confirmed'), true);
  assert.equal(canTransitionOrderStatus('Confirmed', 'Preparing'), true);
  assert.equal(canTransitionOrderStatus('Pending', 'Delivered'), false);
  assert.equal(canTransitionOrderStatus('Delivered', 'Cancelled'), false);
  assert.deepEqual(nextOrderStatuses('Pending'), ['Pending', 'Confirmed', 'Cancelled']);
  assert.deepEqual(nextOrderStatuses('Delivered'), ['Delivered']);
});

test('all configured statuses are reachable in the transition table', () => {
  assert.deepEqual(ORDER_STATUSES, [
    'Pending', 'Confirmed', 'Preparing', 'Ready for Dispatch', 'Shipped', 'Delivered', 'Cancelled',
  ]);
  for (const status of ORDER_STATUSES) assert.ok(nextOrderStatuses(status).includes(status));
});
