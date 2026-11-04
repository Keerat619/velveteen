import { Admin } from '../models/Admin.js';
import { HttpError } from '../utils/HttpError.js';
import { signAdminToken } from '../middleware/auth.js';

function publicAdmin(admin) {
  return { id: String(admin._id), username: admin.username, email: admin.email, role: admin.role };
}

export async function loginAdmin(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const admin = await Admin.findOne({ email }).select('+password');
  const validPassword = admin ? await admin.comparePassword(String(req.body.password || '')) : false;
  if (!admin || !validPassword || admin.role !== 'owner') {
    throw new HttpError(401, 'Email or password is incorrect.');
  }
  return res.json({ token: signAdminToken(admin), admin: publicAdmin(admin) });
}

export function getCurrentAdmin(req, res) {
  return res.json({ admin: publicAdmin(req.admin) });
}
