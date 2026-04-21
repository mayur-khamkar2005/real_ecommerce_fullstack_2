const express = require('express');
const couponController = require('../controllers/coupon.controller');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken);
router.get('/my', couponController.getMyCoupons);
router.post('/free-test', couponController.createFreeTestCoupon);
router.post('/apply', couponController.applyCoupon);

module.exports = router;

