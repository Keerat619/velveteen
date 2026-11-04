import { randomBytes } from 'node:crypto';

export function createOrderNumber(date = new Date()) {
  const day = date.toISOString().slice(0, 10).replaceAll('-', '');
  return `VLT-${day}-${randomBytes(8).toString('hex').toUpperCase()}`;
}
