const express = require('express');
const productController = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.get('/:id/reviews', productController.getReviews);

router.post('/:id/reviews', verifyToken, productController.addReview);

// Analytics routes (public for view, protected for rating)
router.post('/:id/view', productController.incrementView);
router.post('/:id/rate', verifyToken, productController.rateProduct);
router.get('/:id/analytics', productController.getProductAnalytics);

// Admin routes
router.use(verifyToken, isAdmin);

router.post('/', upload.single('image'), productController.createProduct);
router.put('/:id', upload.single('image'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
