const wishlistService = require('../services/wishlist.service');
const catchAsync = require('../utils/catchAsync');

exports.getWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await wishlistService.getWishlist(req.user.id);
  res.status(200).json({ success: true, data: wishlist });
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await wishlistService.addToWishlist(req.user.id, req.params.productId);
  res.status(200).json({ success: true, data: wishlist });
});

exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await wishlistService.removeFromWishlist(req.user.id, req.params.productId);
  res.status(200).json({ success: true, data: wishlist });
});
