const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/user.model');

exports.verifyToken = catchAsync(async (req, res, next) => {
  let token;

  // ✅ 1. Cookie se token lo (primary)
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // ✅ 2. Header fallback (Postman / mobile apps)
  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // ❌ No token
  if (!token) {
    return next(new AppError('You are not logged in!', 401));
  }

  let decoded;

  try {
    // ✅ verify token
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }

  // ✅ check user exists
  const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');

  if (!currentUser) {
    return next(new AppError('User no longer exists', 401));
  }

  // ✅ check password change (important security)
  if (
    currentUser.passwordChangedAt &&
    decoded.iat * 1000 < currentUser.passwordChangedAt.getTime()
  ) {
    return next(new AppError('Password recently changed. Please login again.', 401));
  }

  // ✅ attach user
  req.user = currentUser;
  next();
});

// 🔐 Admin middleware
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError('Access denied. Admin only.', 403));
  }
  next();
};