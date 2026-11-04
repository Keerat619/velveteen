import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET is not configured securely.');
  return secret;
}

export function signAdminToken(admin) {
  return jwt.sign({ role: admin.role }, getSecret(), {
    subject: String(admin._id),
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    issuer: 'velveteen-api',
    audience: 'velveteen-admin',
  });
}

export async function requireAdmin(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Admin sign-in is required.' });
  }

  try {
    const payload = jwt.verify(token, getSecret(), {
      issuer: 'velveteen-api',
      audience: 'velveteen-admin',
    });
    if (payload.role !== 'owner' || !payload.sub) {
      return res.status(403).json({ message: 'This account is not allowed to access the owner dashboard.' });
    }
    const admin = await Admin.findById(payload.sub).select('_id username email role');
    if (!admin || admin.role !== 'owner') {
      return res.status(401).json({ message: 'Admin account is no longer active.' });
    }
    req.admin = admin;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      return res.status(401).json({ message: 'Admin session is invalid or expired. Please sign in again.' });
    }
    return next(error);
  }
}
