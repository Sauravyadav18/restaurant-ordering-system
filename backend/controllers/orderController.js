const Order = require('../models/Order');

// Create new order (Customer)
exports.createOrder = async (req, res) => {
    try {
        const { tableNumber, items } = req.body;

        // Validate input
        if (!tableNumber || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide table number and at least one item'
            });
        }

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        const order = await Order.create({
            tableNumber,
            items,
            totalAmount,
            status: 'Pending'
        });

        // Emit socket event for real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('new-order', order);
        }

        res.status(201).json({
            success: true,
            data: order
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

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const orders = await Order.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get single order
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['Pending', 'Preparing', 'Served'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid status (Pending, Preparing, or Served)'
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Emit socket event for real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('order-updated', order);
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
