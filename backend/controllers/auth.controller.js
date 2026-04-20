const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    ),
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // Send only on HTTPS in prod
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user,
    },
  });
};

exports.register = catchAsync(async (req, res, next) => {
  // Controller simply delegates to service and handles the response
  const newUser = await authService.registerUser(req.body);
  createSendToken(newUser, 201, res, 'Registration successful');
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await authService.loginUser(email, password);
  createSendToken(user, 200, res, 'Login successful');
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  
  res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  // req.user is set by the verifyToken middleware
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.status(200).json({ success: true, data: user });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return next(new AppError('Please provide old and new password', 400));
  }
  await authService.updatePassword(req.user.id, oldPassword, newPassword);
  res.status(200).json({ success: true, message: 'Password updated successfully' });
});
