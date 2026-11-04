import { validationResult } from 'express-validator';

export function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return res.status(422).json({
    message: 'Please check the submitted information.',
    errors: result.array().map(({ path, msg }) => ({ field: path, message: msg })),
  });
}
