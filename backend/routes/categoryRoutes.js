const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public
router.get('/', getAllCategories);

// Protected (Admin only)
router.post('/', protect, authorize('owner'), createCategory);
router.delete('/:id', protect, authorize('owner'), deleteCategory);

module.exports = router;
