const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');

exports.registerUser = async (userData) => {
  const { name, email, password } = userData;

  // 1) Check if email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  // 2) Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3) Create user
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Remove password from output
  newUser.password = undefined;

  return newUser;
};

exports.loginUser = async (email, password) => {
  // 1) Check if email and password exist
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  // Remove password from output
  user.password = undefined;
  
  return user;
};

exports.updateProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  if (data.name) user.name = data.name;
  if (data.email) user.email = data.email;
  if (data.address) user.address = data.address;

  await user.save();
  return { id: user._id, name: user.name, email: user.email, role: user.role, address: user.address };
};

exports.updatePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new AppError('Invalid old password', 401);

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  
  return true;
};
