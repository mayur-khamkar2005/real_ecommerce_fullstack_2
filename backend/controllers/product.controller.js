const productService = require('../services/product.service');
const catchAsync = require('../utils/catchAsync');

exports.getProducts = catchAsync(async (req, res, next) => {
  const result = await productService.getAllProducts(req.query);
  res.status(200).json({
    success: true,
    data: result,
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ success: true, data: product });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await productService.createProduct(req.body, req.file);
  res.status(201).json({
    success: true,
    data: product,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.file);
  res.status(200).json({ success: true, data: product });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  await productService.deleteProduct(req.params.id);
  res.status(204).send();
});

exports.getReviews = catchAsync(async (req, res, next) => {
  const reviews = await productService.getReviews(req.params.id);
  res.status(200).json({ success: true, data: reviews });
});

exports.addReview = catchAsync(async (req, res, next) => {
  const review = await productService.addReview(req.params.id, req.user.id, req.body);
  res.status(201).json({ success: true, data: review });
});

exports.incrementView = catchAsync(async (req, res, next) => {
  const product = await productService.incrementView(req.params.id);
  res.status(200).json({ success: true, data: { views: product.views } });
});

exports.rateProduct = catchAsync(async (req, res, next) => {
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
  }
  const result = await productService.rateProduct(req.params.id, req.user.id, rating);
  res.status(200).json({ success: true, data: result });
});

exports.getProductAnalytics = catchAsync(async (req, res, next) => {
  const analytics = await productService.getProductAnalytics(req.params.id);
  res.status(200).json({ success: true, data: analytics });
});
