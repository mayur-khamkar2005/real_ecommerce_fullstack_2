const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const wishlistController = require('../controllers/wishlist.controller');

const router = express.Router();

router.get('/', verifyToken, wishlistController.getWishlist);
router.post('/:productId', verifyToken, wishlistController.addToWishlist);
router.delete('/:productId', verifyToken, wishlistController.removeFromWishlist);

module.exports = router;
