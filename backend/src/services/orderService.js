import mongoose from 'mongoose';
import { CustomOrder } from '../models/CustomOrder.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { getCurrency } from '../config/env.js';
import { HttpError } from '../utils/HttpError.js';
import { canTransitionOrderStatus } from '../utils/orderRules.js';
import { createOrderNumber } from '../utils/orderNumber.js';

const roundMoney = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;

export function normalizeCartItems(items) {
  if (!Array.isArray(items) || items.length === 0) throw new HttpError(422, 'Your cart is empty.');
  const quantities = new Map();
  for (const item of items) {
    const productId = String(item?.productId || '');
    const quantity = Number(item?.quantity);
    if (!mongoose.isValidObjectId(productId)) throw new HttpError(422, 'One of the selected products is invalid.');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new HttpError(422, 'Each quantity must be a whole number from 1 to 99.');
    const combined = (quantities.get(productId) || 0) + quantity;
    if (combined > 99) throw new HttpError(422, 'A product quantity cannot exceed 99.');
    quantities.set(productId, combined);
  }
  return [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
}

export function buildTrustedOrderLines(cartItems, productDocuments) {
  const productsById = new Map(productDocuments.map((product) => [String(product._id), product]));
  const lines = cartItems.map(({ productId, quantity }) => {
    const product = productsById.get(String(productId));
    if (!product || product.isActive === false || product.availability === 'unavailable') {
      throw new HttpError(409, 'One or more products are no longer available. Please review your cart.');
    }
    const price = roundMoney(Number(product.price));
    if (!Number.isFinite(price) || price <= 0) throw new HttpError(409, `${product.name} needs a valid price before it can be ordered.`);
    return {
      productId: product._id,
      productName: product.name,
      image: product.image,
      quantity,
      price,
      stockReserved: false,
    };
  });
  const totalAmount = roundMoney(lines.reduce((sum, line) => sum + line.price * line.quantity, 0));
  if (totalAmount <= 0) throw new HttpError(422, 'The order total must be greater than zero.');
  return { lines, totalAmount };
}

export async function createOrderFromCart(orderInput) {
  const cartItems = normalizeCartItems(orderInput.items);
  const productIds = cartItems.map((item) => item.productId);
  const session = await mongoose.startSession();
  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const products = await Product.find({
        _id: { $in: productIds },
        isActive: true,
        availability: { $ne: 'unavailable' },
      }).session(session);
      const { lines, totalAmount } = buildTrustedOrderLines(cartItems, products);

      for (const line of lines) {
        const product = products.find((candidate) => String(candidate._id) === String(line.productId));
        if (product.stock === undefined || product.stock === null) continue;
        const reserved = await Product.findOneAndUpdate(
          { _id: product._id, isActive: true, availability: { $ne: 'unavailable' }, stock: { $gte: line.quantity } },
          { $inc: { stock: -line.quantity } },
          { new: true, session },
        );
        if (!reserved) throw new HttpError(409, `${product.name} does not have enough stock for that quantity.`);
        line.stockReserved = true;
      }

      const order = new Order({
        orderNumber: createOrderNumber(),
        customerName: orderInput.customerName,
        email: orderInput.email,
        phone: orderInput.phone,
        deliveryAddress: orderInput.deliveryAddress,
        city: orderInput.city,
        pincode: orderInput.pincode,
        items: lines,
        totalAmount,
        currency: getCurrency(),
        paymentMethod: orderInput.paymentMethod,
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        specialInstructions: orderInput.specialInstructions || '',
      });
      await order.save({ session });
      createdOrder = order;
    });
  } finally {
    await session.endSession();
  }

  return createdOrder;
}

export async function updateOrderStatus(orderId, orderStatus) {
  const session = await mongoose.startSession();
  let updatedOrder;
  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new HttpError(404, 'Order not found.');
      if (!canTransitionOrderStatus(order.orderStatus, orderStatus)) {
        throw new HttpError(409, `Order cannot move from ${order.orderStatus} to ${orderStatus}.`);
      }
      if (order.orderStatus === orderStatus) {
        updatedOrder = order;
        return;
      }
      if (orderStatus === 'Cancelled') {
        for (const item of order.items) {
          if (!item.stockReserved) continue;
          await Product.updateOne(
            { _id: item.productId, stock: { $type: 'number' } },
            { $inc: { stock: item.quantity } },
            { session },
          );
        }
      }
      order.orderStatus = orderStatus;
      await order.save({ session });
      updatedOrder = order;
    });
  } finally {
    await session.endSession();
  }
  return updatedOrder;
}

export async function createCustomOrder(input) {
  const colours = Array.isArray(input.preferredColours)
    ? input.preferredColours
    : String(input.preferredColours || '').split(',');
  const preferredColours = [...new Set(colours.map((colour) => colour.trim()).filter(Boolean))];
  return CustomOrder.create({
    customerName: input.customerName,
    email: input.email,
    phone: input.phone,
    flowerType: input.flowerType,
    preferredColours,
    bouquetSize: input.bouquetSize,
    budget: input.budget,
    deliveryDate: input.deliveryDate || null,
    customMessage: input.customMessage || '',
    referenceImage: input.referenceImage || '',
  });
}

export function publicOrderSummary(order) {
  return {
    orderNumber: order.orderNumber,
    items: order.items.map(({ productId, productName, image, quantity, price }) => ({ productId, productName, image, quantity, price })),
    totalAmount: order.totalAmount,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt,
  };
}
