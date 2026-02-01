const express = require('express');
const router = express.Router();
const {
    getAllMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllMenuItems);
router.get('/:id', getMenuItem);

// Protected routes (Admin only)
router.post('/', protect, authorize('owner'), createMenuItem);
router.put('/:id', protect, authorize('owner'), updateMenuItem);
router.delete('/:id', protect, authorize('owner'), deleteMenuItem);

module.exports = router;
