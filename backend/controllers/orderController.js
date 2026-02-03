const Order = require('../models/Order');

// Helper function to get date filter
const getDateFilter = (filter) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
        case 'today':
            return { createdAt: { $gte: startOfToday } };
        case 'yesterday':
            const startOfYesterday = new Date(startOfToday);
            startOfYesterday.setDate(startOfYesterday.getDate() - 1);
            return {
                createdAt: {
                    $gte: startOfYesterday,
                    $lt: startOfToday
                }
            };
        case 'week':
            const weekAgo = new Date(startOfToday);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return { createdAt: { $gte: weekAgo } };
        default:
            return {};
    }
};

// Create new order (Customer)
exports.createOrder = async (req, res) => {
    try {
        const { tableNumber, customerName, items } = req.body;

        // Validate input
        if (!tableNumber || !customerName || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide table number, customer name, and at least one item'
            });
        }

        // Validate customerName
        const trimmedName = customerName.trim();
        if (trimmedName.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Customer name must be at least 2 characters'
            });
        }

        // Validate tableNumber range
        if (tableNumber < 1 || tableNumber > 20) {
            return res.status(400).json({
                success: false,
                message: 'Table number must be between 1 and 20'
            });
        }

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        const order = await Order.create({
            tableNumber,
            customerName: trimmedName,
            items,
            totalAmount,
            status: 'Pending',
            paymentStatus: 'Unpaid',
            isClosed: false
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
        const { status, dateFilter, isClosed } = req.query;

        // Build filter object
        let filter = {};

        // Status filter
        if (status) {
            filter.status = status;
        }

        // Date filter
        const dateConditions = getDateFilter(dateFilter);
        filter = { ...filter, ...dateConditions };

        // isClosed filter
        if (isClosed !== undefined) {
            filter.isClosed = isClosed === 'true';
        }

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

// Update payment status (Admin only)
exports.updatePaymentStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Only allow payment update if order is Served
        if (order.status !== 'Served') {
            return res.status(400).json({
                success: false,
                message: 'Order must be served before marking as paid'
            });
        }

        // Update payment status and close the order
        order.paymentStatus = 'Paid';
        order.isClosed = true;
        await order.save();

        // Emit socket event for real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('order-updated', order);
            io.emit('order-closed', order);
        }

        res.json({
            success: true,
            message: 'Payment received and order closed',
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
