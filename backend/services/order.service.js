const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const AppError = require('../utils/AppError');

exports.createOrder = async (userId, shippingAddress) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  
  if (!cart || cart.items.length === 0) {
    throw new AppError('Your cart is empty', 400);
  }

  // Validate stock and calculate total
  let totalPrice = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = item.product;
    if (!product) {
      throw new AppError('Your cart contains a product that is no longer available. Please remove it and try again.', 400);
    }

    if (product.stock < item.quantity) {
      throw new AppError(`Not enough stock for ${product.name}`, 400);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      image: product.image,
    });

    totalPrice += product.price * item.quantity;
  }

  if (orderItems.length === 0) {
    throw new AppError('Your cart is empty or invalid.', 400);
  }

  const order = await Order.create({
    user: userId,
    orderItems,
    shippingAddress,
    totalPrice,
    paymentMethod: 'Cash on Delivery',
  });

  // Decrease stock for products and increment purchase count
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, purchaseCount: 1 }
    });
  }

  // Clear cart
  cart.items = [];
  await cart.save();

  return order;
};

exports.getUserOrders = async (userId) => {
  return await Order.find({ user: userId }).sort('-createdAt');
};

exports.getAllOrders = async () => {
  return await Order.find().populate('user', 'name email').sort('-createdAt');
};

exports.updateOrderStatus = async (orderId, status) => {
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid order status', 400);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  order.status = status;
  await order.save();

  return order;
};

exports.getDashboardStats = async () => {
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  
  const revenueData = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  return {
    totalOrders,
    totalProducts,
    totalRevenue
  };
};
