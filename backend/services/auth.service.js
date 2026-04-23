const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');

// 🔹 Register
exports.registerUser = async (userData) => {
  const { name, email, password } = userData;

  if (!name || !email || !password) {
    throw new AppError('All fields are required', 400);
  }

  // 🔥 email normalize (important)
  const normalizedEmail = email.toLowerCase();

  // check existing
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
  });

  newUser.password = undefined;
  return newUser;
};

// 🔹 Login
exports.loginUser = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  user.password = undefined;
  return user;
};

// 🔹 Update Profile
exports.updateProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  // name update
  if (data.name) user.name = data.name;

  // 🔥 email update with duplicate check
  if (data.email) {
    const normalizedEmail = data.email.toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing && existing._id.toString() !== userId) {
      throw new AppError('Email already in use', 400);
    }

    user.email = normalizedEmail;
  }

  if (data.address) user.address = data.address;

  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    address: user.address
  };
};

// 🔹 Update Password
exports.updatePassword = async (userId, oldPassword, newPassword) => {
  if (!oldPassword || !newPassword) {
    throw new AppError('Please provide old and new password', 400);
  }

  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new AppError('Invalid old password', 401);

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return true;
};