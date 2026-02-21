const Category = require('../models/Category');
const Menu = require('../models/Menu');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const trimmedName = name.trim();

        // Check for duplicate (case-insensitive)
        const existing = await Category.findOne({
            name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists'
            });
        }

        const category = await Category.create({ name: trimmedName });

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if any menu items use this category
        const menuCount = await Menu.countDocuments({ category: category.name });
        if (menuCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete: ${menuCount} menu item(s) use this category. Reassign them first.`
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Category deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
