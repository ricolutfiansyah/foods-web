import * as orderService from '../services/orderService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendError, sendResponse } from '../utils/response.js';
import { checkoutSchema, updateOrderStatusSchema } from '../validators/orderValidator.js';

export const checkout = asyncHandler(async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
    return sendError(res, 400, 'Validation error', errors);
  }

  const order = await orderService.checkout(req.user.id, parsed.data);
  return sendResponse(res, 201, 'Order created successfully', order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const { data, meta } = await orderService.getMyOrders(req.user.id, req.query);
  return sendResponse(res, 200, 'Orders retrieved successfully', data, meta);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.user, req.params.id);
  return sendResponse(res, 200, 'Order retrieved successfully', order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const parsed = updateOrderStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
    return sendError(res, 400, 'Validation error', errors);
  }

  const order = await orderService.updateOrderStatus(req.params.id, parsed.data.status);
  return sendResponse(res, 200, 'Status order berhasil diubah', order);
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelMyOrder(req.user.id, req.params.id);
  return sendResponse(res, 200, 'Pesanan berhasil dibatalkan', order);
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { data, meta } = await orderService.getAllOrders(req.query);
  return sendResponse(res, 200, 'Semua order berhasil diambil', data, meta);
});
