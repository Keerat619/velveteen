import { CustomOrder } from '../models/CustomOrder.js';
import { createCustomOrder } from '../services/orderService.js';
import { CUSTOM_REQUEST_STATUSES } from '../utils/orderRules.js';
import { HttpError } from '../utils/HttpError.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function submitCustomOrder(req, res) {
  const request = await createCustomOrder(req.body);
  return res.status(201).json({
    message: 'Your custom flower request has been received.',
    request: { id: request._id, requestStatus: request.requestStatus, createdAt: request.createdAt },
  });
}

export async function listCustomOrders(req, res) {
  const filter = {};
  if (req.query.status) filter.requestStatus = req.query.status;
  if (req.query.search) {
    const search = new RegExp(escapeRegex(String(req.query.search).trim()), 'i');
    filter.$or = [{ customerName: search }, { email: search }, { flowerType: search }];
  }
  const sortDirection = req.query.sort === 'oldest' ? 1 : -1;
  const requests = await CustomOrder.find(filter).sort({ createdAt: sortDirection }).limit(500).lean();
  return res.json({ requests, statuses: CUSTOM_REQUEST_STATUSES });
}

export async function changeCustomOrderStatus(req, res) {
  const request = await CustomOrder.findByIdAndUpdate(
    req.params.id,
    { requestStatus: req.body.requestStatus },
    { new: true, runValidators: true },
  );
  if (!request) throw new HttpError(404, 'Custom request not found.');
  return res.json({ message: 'Custom request status updated.', request });
}
