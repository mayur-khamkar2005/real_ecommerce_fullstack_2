const Coupon = require('../models/coupon.model');
const AppError = require('../utils/AppError');

function randomCode() {
  const part = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `MS-${part}-${stamp}`;
}

async function generateUniqueCode() {
  let tries = 0;
  while (tries < 8) {
    const code = randomCode();
    // eslint-disable-next-line no-await-in-loop
    const exists = await Coupon.findOne({ code }).lean();
    if (!exists) return code;
    tries += 1;
  }
  throw new AppError('Unable to generate coupon code. Please try again.', 500);
}

exports.createCouponForUser = async (userId, discount) => {
  const code = await generateUniqueCode();
  return Coupon.create({
    userId,
    discount,
    code,
    isUsed: false,
  });
};

exports.createFreeTestCouponForUser = async (userId) => {
  const discounts = [10, 15, 20];
  const discount = discounts[Math.floor(Math.random() * discounts.length)];
  const code = `FREE-${await generateUniqueCode()}`;
  return Coupon.create({
    userId,
    discount,
    code,
    isUsed: false,
  });
};

exports.getUserCoupons = async (userId) => {
  return Coupon.find({ userId }).sort('-createdAt');
};

exports.applyCoupon = async (userId, code, subtotal) => {
  const normalized = (code || '').toString().trim().toUpperCase();
  if (!normalized) throw new AppError('Coupon code is required', 400);

  const coupon = await Coupon.findOne({ code: normalized });
  if (!coupon) throw new AppError('Invalid coupon code', 404);
  if (String(coupon.userId) !== String(userId)) {
    throw new AppError('This coupon is not assigned to your account', 403);
  }
  if (coupon.isUsed) throw new AppError('Coupon already used', 400);

  const safeSubtotal = Number(subtotal || 0);
  if (!Number.isFinite(safeSubtotal) || safeSubtotal <= 0) {
    throw new AppError('Subtotal must be greater than 0', 400);
  }

  const discountAmount = Number(((safeSubtotal * coupon.discount) / 100).toFixed(2));
  const finalTotal = Number((safeSubtotal - discountAmount).toFixed(2));

  return {
    couponId: coupon._id,
    code: coupon.code,
    discount: coupon.discount,
    discountAmount,
    finalTotal,
  };
};

exports.consumeCoupon = async (userId, code) => {
  if (!code) return null;
  const normalized = code.toString().trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: normalized });
  if (!coupon) throw new AppError('Invalid coupon code', 404);
  if (String(coupon.userId) !== String(userId)) {
    throw new AppError('This coupon is not assigned to your account', 403);
  }
  if (coupon.isUsed) throw new AppError('Coupon already used', 400);

  coupon.isUsed = true;
  coupon.usedAt = new Date();
  await coupon.save();
  return coupon;
};

