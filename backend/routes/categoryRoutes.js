const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public
router.get('/', getAllCategories);

// Protected (Admin only)
router.post('/', protect, authorize('owner'), createCategory);

module.exports = router;
