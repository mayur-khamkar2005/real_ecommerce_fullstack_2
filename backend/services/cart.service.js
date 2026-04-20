const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const AppError = require('../utils/AppError');

exports.getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

exports.addToCart = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);
  const addQty = parseInt(quantity, 10);
  if (Number.isNaN(addQty) || addQty < 1) {
    throw new AppError('Invalid quantity', 400);
  }
  const currentQuantity = itemIndex > -1 ? cart.items[itemIndex].quantity : 0;
  const newQuantity = currentQuantity + addQty;

  if (product.stock < newQuantity) {
    throw new AppError(`Cannot add more than ${product.stock} items to cart`, 400);
  }

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = newQuantity;
  } else {
    cart.items.push({ product: productId, quantity: addQty });
  }

  await cart.save();
  return cart.populate('items.product');
};

exports.updateCartItem = async (userId, itemId, quantity) => {
  const qty = parseInt(quantity, 10);
  if (Number.isNaN(qty)) {
    throw new AppError('Invalid quantity', 400);
  }

  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) throw new AppError('Cart not found', 404);

  const itemIndex = cart.items.findIndex(p => p._id.toString() === itemId);
  if (itemIndex === -1) throw new AppError('Item not found in cart', 404);

  const product = cart.items[itemIndex].product;
  if (product && qty > product.stock) {
    throw new AppError(`Only ${product.stock} items available in stock`, 400);
  }

  if (qty <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = qty;
  }

  await cart.save();
  return cart.populate('items.product');
};

exports.removeFromCart = async (userId, itemId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404);

  cart.items = cart.items.filter(item => item._id.toString() !== itemId);
  await cart.save();
  return cart.populate('items.product');
};

exports.clearCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  } else {
    cart.items = [];
    await cart.save();
  }
  return cart.populate('items.product');
};
