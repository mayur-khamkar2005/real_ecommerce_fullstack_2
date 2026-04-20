const express = require('express');
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Cart is only for logged-in users
router.use(verifyToken);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:itemId', cartController.updateCartItem);
router.delete('/:itemId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

module.exports = router;
