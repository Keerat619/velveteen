import rateLimit from 'express-rate-limit';

function createLimiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message },
  });
}

export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  message: 'Too many login attempts. Please wait a few minutes and try again.',
});

export const orderLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  message: 'Too many order requests. Please try again later.',
});

export const customOrderLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 12,
  message: 'Too many custom requests. Please try again later.',
});

export const orderLookupLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: 'Too many order lookups. Please wait and try again.',
});
