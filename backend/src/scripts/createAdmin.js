import '../config/env.js';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { Admin } from '../models/Admin.js';

async function createOwner() {
  const username = String(process.env.ADMIN_USERNAME || '').trim();
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  if (!username || username.length < 2) throw new Error('Set ADMIN_USERNAME to the owner name (at least 2 characters).');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Set ADMIN_EMAIL to a valid owner email.');
  if (password.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');

  await connectDatabase();
  const existing = await Admin.findOne({});
  if (existing) throw new Error('An admin account already exists. The setup script is one-time; use the dashboard login instead.');

  const admin = await Admin.create({ username, email, password, role: 'owner' });
  console.log(`Owner account created for ${admin.email}. The password was hashed before storage.`);
}

try {
  await createOwner();
} catch (error) {
  console.error(`Owner setup failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
