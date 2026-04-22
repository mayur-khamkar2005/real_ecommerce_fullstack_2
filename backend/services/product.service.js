const Product = require('../models/product.model');
const Review = require('../models/review.model');
const AppError = require('../utils/AppError');
const fs = require('fs');
const path = require('path');
const { downloadImage } = require('../utils/imageDownloader');

exports.getAllProducts = async (query) => {
  const { keyword, category, page, limit, sort } = query;
  
  // 1. Filtering
  const filter = {};
  if (keyword) {
    filter.name = { $regex: keyword, $options: 'i' };
  }
  if (category) {
    filter.category = category;
  }

  // 2. Query execution
  let mongooseQuery = Product.find(filter);

  // 3. Sorting (whitelist fields to avoid invalid sort keys)
  if (sort) {
    const [sortField, sortOrder] = sort.split('_');
    const allowed = { price: true, createdAt: true };
    if (allowed[sortField] && (sortOrder === 'asc' || sortOrder === 'desc')) {
      mongooseQuery = mongooseQuery.sort({ [sortField]: sortOrder === 'desc' ? -1 : 1 });
    }
  } else {
    mongooseQuery = mongooseQuery.sort('-createdAt'); // Default sort
  }

  // 4. Pagination
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  mongooseQuery = mongooseQuery.skip(skip).limit(limitNum);

  const products = await mongooseQuery;
  const total = await Product.countDocuments(filter);

  return {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

exports.getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
};

exports.createProduct = async (productData, file) => {
  let imagePath = null;

  if (file) {
    // File upload takes priority
    imagePath = `/uploads/${file.filename}`;
  } else if (productData.image) {
    // External URL — download and serve locally to avoid broken-image issues
    try {
      imagePath = await downloadImage(productData.image);
    } catch (err) {
      console.warn(`Failed to download image from "${productData.image}":`, err.message);
    }
    // If download failed, fall back to picsum
    if (!imagePath) {
      const seed = (productData.name || 'product').toLowerCase().replace(/\s+/g, '-');
      imagePath = `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/600`;
    }
  } else {
    // No image provided — use picsum
    const seed = (productData.name || 'product').toLowerCase().replace(/\s+/g, '-');
    imagePath = `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/600`;
  }

  const product = await Product.create({
    ...productData,
    image: imagePath,
  });

  return product;
};

exports.updateProduct = async (id, updateData, file) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (file) {
    // New file uploaded — delete old local file if it was from /uploads/
    if (product.image && product.image.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    updateData.image = `/uploads/${file.filename}`;
  } else if (updateData.image) {
    // URL changed — download new image if it's an external URL
    const isLocalPath = updateData.image.startsWith('/uploads/') || updateData.image.startsWith('/images/');
    if (!isLocalPath && /^https?:\/\//i.test(updateData.image)) {
      try {
        const newLocalPath = await downloadImage(updateData.image);
        if (newLocalPath) {
          // Delete old local file
          if (product.image && product.image.startsWith('/uploads/')) {
            const oldImagePath = path.join(__dirname, '..', product.image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
          updateData.image = newLocalPath;
        }
        // If download failed, keep the URL as-is (existing behavior)
      } catch (err) {
        console.warn(`Failed to download image from "${updateData.image}":`, err.message);
        // Keep updateData.image — will be used as-is
      }
    }
  }
  // else: no new image provided, product.image is preserved automatically

  Object.assign(product, updateData);
  await product.save();

  return await Product.findById(id);
};



exports.deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Delete local upload only (slug paths under /images/ are not stored as files here)
  if (product.image && product.image.startsWith('/uploads/')) {
    const imageAbs = path.join(__dirname, '..', product.image);
    if (fs.existsSync(imageAbs)) {
      fs.unlinkSync(imageAbs);
    }
  }

  await product.deleteOne();
};

exports.getReviews = async (productId) => {
  return await Review.find({ product: productId }).populate('user', 'name').sort('-createdAt');
};

exports.addReview = async (productId, userId, { rating, comment }) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  const existingReview = await Review.findOne({ product: productId, user: userId });
  if (existingReview) throw new AppError('You have already reviewed this product', 400);

  const review = await Review.create({ user: userId, product: productId, rating: Number(rating), comment });

  const reviews = await Review.find({ product: productId });
  product.numReviews = reviews.length;
  product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
  await product.save();

  return review;
};

// Analytics: Increment view count (idempotent via localStorage on frontend, but we use $inc for atomicity)
exports.incrementView = async (id) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

// Analytics: Increment purchase count (called when order is placed)
exports.incrementPurchaseCount = async (id) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { $inc: { purchaseCount: 1 } },
    { new: true }
  );
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

// Analytics: Get product with full analytics
exports.getProductAnalytics = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found', 404);
  return {
    views: product.views || 0,
    purchaseCount: product.purchaseCount || 0,
    ratings: product.rating || 0,
    avgRating: product.rating || 0,
    numReviews: product.numReviews || 0,
  };
};

// Analytics: Submit or update a rating (one user → one rating)
exports.rateProduct = async (productId, userId, ratingValue) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  // This uses the Review model - find existing or create new
  const existingReview = await Review.findOne({ product: productId, user: userId });

  if (existingReview) {
    // Update existing rating
    existingReview.rating = Number(ratingValue);
    existingReview.comment = existingReview.comment || 'Updated rating';
    await existingReview.save();
  } else {
    // Create new rating entry
    await Review.create({
      user: userId,
      product: productId,
      rating: Number(ratingValue),
      comment: 'Rated product',
    });
  }

  // Recalculate aggregate rating
  const reviews = await Review.find({ product: productId });
  product.numReviews = reviews.length;
  product.rating = reviews.length > 0
    ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
    : 0;
  await product.save();

  return { numReviews: product.numReviews, avgRating: product.rating };
};
