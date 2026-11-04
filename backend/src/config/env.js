import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: resolve(backendRoot, '.env') });

export function getCurrency() {
  const currency = (process.env.CURRENCY || 'INR').trim().toUpperCase();
  try {
    new Intl.NumberFormat('en', { style: 'currency', currency }).format(1);
  } catch {
    throw new Error('CURRENCY must be a valid ISO 4217 currency code.');
  }
  return currency;
}

export function assertRuntimeConfig() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required. Add it to backend/.env.');
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set to a random secret with at least 32 characters.');
  }
  getCurrency();
}
