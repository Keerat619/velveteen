import mongoose from 'mongoose';
import { HttpError } from '../utils/HttpError.js';

export function notFound(req, res) {
  res.status(404).json({ message: 'The requested API resource was not found.' });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message, ...(error.details ? { details: error.details } : {}) });
  }
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(422).json({ message: 'The submitted information is not valid.', errors: Object.values(error.errors).map(({ path, message }) => ({ field: path, message })) });
  }
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: 'The supplied identifier or value is invalid.' });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ message: 'A record with those details already exists.' });
  }
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  if (error?.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'This website origin is not allowed to call the API.' });
  }
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
}
