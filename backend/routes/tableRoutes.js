const express = require('express');
const router = express.Router();
const {
    getAvailableTables,
    getAllTables,
    updateTableStatus,
    initializeTables
} = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/available', getAvailableTables);

// Protected routes (Admin only)
router.get('/', protect, authorize('owner'), getAllTables);
router.patch('/:id', protect, authorize('owner'), updateTableStatus);
router.post('/initialize', protect, authorize('owner'), initializeTables);

module.exports = router;
