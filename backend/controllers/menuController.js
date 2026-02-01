const Menu = require('../models/Menu');

// Get all menu items
exports.getAllMenuItems = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};

        const menuItems = await Menu.find(filter).sort({ category: 1, name: 1 });

        res.json({
            success: true,
            count: menuItems.length,
            data: menuItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get single menu item
exports.getMenuItem = async (req, res) => {
    try {
        const menuItem = await Menu.findById(req.params.id);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.json({
            success: true,
            data: menuItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Create menu item (Admin only)
exports.createMenuItem = async (req, res) => {
    try {
        const { name, description, category, price, image, available } = req.body;

        const menuItem = await Menu.create({
            name,
            description,
            category,
            price,
            image,
            available
        });

        res.status(201).json({
            success: true,
            data: menuItem
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update menu item (Admin only)
exports.updateMenuItem = async (req, res) => {
    try {
        const menuItem = await Menu.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.json({
            success: true,
            data: menuItem
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Delete menu item (Admin only)
exports.deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await Menu.findByIdAndDelete(req.params.id);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
