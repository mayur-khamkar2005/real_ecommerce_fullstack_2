const orderService = require('../services/order.service');
const catchAsync = require('../utils/catchAsync');

exports.createOrder = catchAsync(async (req, res, next) => {
  const { shippingAddress } = req.body;
  const order = await orderService.createOrder(req.user.id, shippingAddress);
  res.status(201).json({ success: true, data: order });
});

exports.getUserOrders = catchAsync(async (req, res, next) => {
  const orders = await orderService.getUserOrders(req.user.id);
  res.status(200).json({ success: true, data: orders });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await orderService.getAllOrders();
  res.status(200).json({ success: true, data: orders });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  res.status(200).json({ success: true, data: order });
});

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const stats = await orderService.getDashboardStats();
  res.status(200).json({ success: true, data: stats });
});
