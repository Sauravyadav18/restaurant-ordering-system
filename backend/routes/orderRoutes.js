const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAllOrders,
    getOrder,
    getOrderByToken,
    updateOrder,
    addItemsToOrder,
    updateOrderStatus,
    updatePaymentStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/', createOrder);
router.get('/token/:token', getOrderByToken);
router.get('/:id', getOrder);
router.put('/:id', updateOrder);
router.put('/:id/add-items', addItemsToOrder);

// Protected routes (Admin only)
router.get('/', protect, authorize('owner'), getAllOrders);
router.patch('/:id', protect, authorize('owner'), updateOrderStatus);
router.patch('/:id/payment', protect, authorize('owner'), updatePaymentStatus);

module.exports = router;
