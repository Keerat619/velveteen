import { CustomOrder } from '../models/CustomOrder.js';
import { Order } from '../models/Order.js';

export async function getDashboardStats(req, res) {
  const [totalOrders, newOrders, inProgressOrders, completedOrders, newCustomRequests] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: 'Pending' }),
    Order.countDocuments({ orderStatus: { $in: ['Confirmed', 'Preparing', 'Ready for Dispatch', 'Shipped'] } }),
    Order.countDocuments({ orderStatus: 'Delivered' }),
    CustomOrder.countDocuments({ requestStatus: 'New' }),
  ]);
  return res.json({ stats: { totalOrders, newOrders, inProgressOrders, completedOrders, newCustomRequests } });
}
