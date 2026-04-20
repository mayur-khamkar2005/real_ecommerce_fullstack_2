const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/user.model');

exports.verifyToken = catchAsync(async (req, res, next) => {
  let token;

  // Retrieve token from cookies
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }
  next();
};
