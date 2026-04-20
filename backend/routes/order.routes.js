const express = require('express');
const orderController = require('../controllers/order.controller');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// All order routes require authentication
router.use(verifyToken);

// User routes
router.post('/', orderController.createOrder);
router.get('/myorders', orderController.getUserOrders);

// Admin routes (static paths before generic handlers)
router.get('/stats/dashboard', isAdmin, orderController.getDashboardStats);
router.get('/', isAdmin, orderController.getAllOrders);
router.put('/:id/status', isAdmin, orderController.updateOrderStatus);

module.exports = router;
