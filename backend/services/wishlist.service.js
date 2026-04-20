const Wishlist = require('../models/wishlist.model');
const Product = require('../models/product.model');
const AppError = require('../utils/AppError');

exports.getWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate('products');
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }
  return wishlist;
};

exports.addToWishlist = async (userId, productId) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = new Wishlist({ user: userId, products: [] });
  }

  const alreadyHas = wishlist.products.some((p) => p.toString() === productId.toString());
  if (!alreadyHas) {
    wishlist.products.push(productId);
    await wishlist.save();
  }
  return wishlist.populate('products');
};

exports.removeFromWishlist = async (userId, productId) => {
  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) throw new AppError('Wishlist not found', 404);

  wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
  await wishlist.save();
  return wishlist.populate('products');
};
