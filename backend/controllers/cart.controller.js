const cartService = require('../services/cart.service');
const catchAsync = require('../utils/catchAsync');

exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await cartService.getCart(req.user.id);
  res.status(200).json({ success: true, data: cart });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const cart = await cartService.addToCart(req.user.id, productId, quantity || 1);
  res.status(200).json({ success: true, data: cart });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  const cart = await cartService.updateCartItem(req.user.id, req.params.itemId, req.body.quantity);
  res.status(200).json({ success: true, data: cart });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const cart = await cartService.removeFromCart(req.user.id, req.params.itemId);
  res.status(200).json({ success: true, data: cart });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  const cart = await cartService.clearCart(req.user.id);
  res.status(200).json({ success: true, data: cart });
});
