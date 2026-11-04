import { Order } from '../models/Order.js';
import { createOrderFromCart, publicOrderSummary, updateOrderStatus } from '../services/orderService.js';
import { ORDER_STATUSES, PAYMENT_STATUSES, canTransitionOrderStatus, nextOrderStatuses } from '../utils/orderRules.js';
import { HttpError } from '../utils/HttpError.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function placeOrder(req, res) {
  const order = await createOrderFromCart(req.body);
  return res.status(201).json({ message: 'Your order has been placed.', order: publicOrderSummary(order) });
}

export async function lookupOrder(req, res) {
  const orderNumber = String(req.params.orderNumber).toUpperCase();
  const email = String(req.get('x-order-email') || '').trim().toLowerCase();
  const order = await Order.findOne({ orderNumber, email });
  if (!order) throw new HttpError(404, 'No order was found for that order number and email.');
  return res.json({ order: publicOrderSummary(order) });
}

export async function listAdminOrders(req, res) {
  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.search) {
    const search = new RegExp(escapeRegex(String(req.query.search).trim()), 'i');
    filter.$or = [{ orderNumber: search }, { customerName: search }];
  }
  const sortDirection = req.query.sort === 'oldest' ? 1 : -1;
  const limit = Math.min(Number(req.query.limit) || 200, 500);
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: sortDirection }).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  return res.json({ orders, total, orderStatuses: ORDER_STATUSES, paymentStatuses: PAYMENT_STATUSES });
}

export async function getAdminOrder(req, res) {
  const order = await Order.findById(req.params.id).lean();
  if (!order) throw new HttpError(404, 'Order not found.');
  return res.json({ order, allowedNextStatuses: nextOrderStatuses(order.orderStatus) });
}

export async function changeOrderStatus(req, res) {
  const order = await updateOrderStatus(req.params.id, req.body.orderStatus);
  return res.json({ message: 'Order status updated.', order, allowedNextStatuses: nextOrderStatuses(order.orderStatus) });
}

export async function changePaymentStatus(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) throw new HttpError(404, 'Order not found.');
  order.paymentStatus = req.body.paymentStatus;
  await order.save();
  return res.json({ message: 'Payment status updated.', order });
}

export function getOrderStatusRules(req, res) {
  return res.json({ statuses: ORDER_STATUSES, transitions: Object.fromEntries(ORDER_STATUSES.map((status) => [status, ORDER_STATUSES.filter((next) => canTransitionOrderStatus(status, next))])) });
}
