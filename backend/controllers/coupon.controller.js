const couponService = require('../services/coupon.service');
const catchAsync = require('../utils/catchAsync');

exports.getMyCoupons = catchAsync(async (req, res) => {
  const coupons = await couponService.getUserCoupons(req.user.id);
  res.status(200).json({ success: true, data: coupons });
});

exports.createFreeTestCoupon = catchAsync(async (req, res) => {
  const coupon = await couponService.createFreeTestCouponForUser(req.user.id);
  res.status(201).json({ success: true, data: coupon });
});

exports.applyCoupon = catchAsync(async (req, res) => {
  const { code, subtotal } = req.body;
  const result = await couponService.applyCoupon(req.user.id, code, subtotal);
  res.status(200).json({ success: true, data: result });
});

