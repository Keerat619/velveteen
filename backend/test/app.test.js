import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

test('health endpoint reports an unconfigured database as unavailable', async () => {
  const response = await request(app).get('/api/health').expect(503);
  assert.deepEqual(response.body, { status: 'unavailable', database: 'disconnected' });
});

test('owner order APIs reject anonymous access without returning order data', async () => {
  const response = await request(app).get('/api/admin/orders').expect(401);
  assert.deepEqual(response.body, { message: 'Admin sign-in is required.' });
  assert.equal(response.headers['cache-control'], 'no-store, private');
});

test('owner product APIs reject anonymous mutations', async () => {
  await request(app).post('/api/admin/products').send({ name: 'Not allowed' }).expect(401);
  await request(app).delete('/api/admin/products/507f1f77bcf86cd799439011').expect(401);
});
