export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready for Dispatch',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];
export const PAYMENT_METHODS = ['Cash on Delivery', 'Manual Payment'];
export const CUSTOM_REQUEST_STATUSES = ['New', 'Contacted', 'Accepted', 'Rejected', 'Completed'];

const ORDER_TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Preparing', 'Cancelled'],
  Preparing: ['Ready for Dispatch', 'Cancelled'],
  'Ready for Dispatch': ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

export function canTransitionOrderStatus(current, next) {
  return current === next || (ORDER_TRANSITIONS[current] || []).includes(next);
}

export function nextOrderStatuses(current) {
  return [current, ...(ORDER_TRANSITIONS[current] || [])];
}
