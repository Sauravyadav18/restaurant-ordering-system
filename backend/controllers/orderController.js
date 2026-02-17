const Order = require('../models/Order');
const Table = require('../models/Table');

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
        const { tableNumber, customerName, items, orderType } = req.body;

        // Validate orderType
        if (!orderType || !['Dine-In', 'Parcel'].includes(orderType)) {
            return res.status(400).json({
                success: false,
                message: 'Please select order type (Dine-In or Parcel)'
            });
        }

        // Validate customerName
        if (!customerName) {
            return res.status(400).json({
                success: false,
                message: 'Customer name is required'
            });
        }

        const trimmedName = customerName.trim();
        if (trimmedName.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Customer name must be at least 2 characters'
            });
        }

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please add at least one item to your order'
            });
        }

        let table = null;

        // For Dine-In orders, validate table
        if (orderType === 'Dine-In') {
            if (!tableNumber) {
                return res.status(400).json({
                    success: false,
                    message: 'Please select a table for Dine-In orders'
                });
            }

            table = await Table.findOne({ tableNumber });

            if (!table) {
                return res.status(400).json({
                    success: false,
                    message: 'Table not found'
                });
            }

            if (!table.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'This table is currently inactive'
                });
            }

            if (table.isOccupied) {
                return res.status(400).json({
                    success: false,
                    message: 'This table is already occupied. Please select another table.'
                });
            }
        }

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        // Generate unique order token
        const orderToken = Order.generateToken();

        // Create order
        const orderData = {
            orderToken,
            orderType,
            customerName: trimmedName,
            items,
            totalAmount,
            status: 'Pending',
            paymentStatus: 'Unpaid',
            isClosed: false
        };

        // Add tableNumber only for Dine-In orders
        if (orderType === 'Dine-In') {
            orderData.tableNumber = tableNumber;
        }

        const order = await Order.create(orderData);

        // Lock the table for Dine-In orders
        if (orderType === 'Dine-In' && table) {
            table.isOccupied = true;
            table.currentOrder = order._id;
            await table.save();
        }

        // Emit socket events for real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('new-order', order);
            if (orderType === 'Dine-In') {
                io.emit('table-occupied', { tableNumber, orderId: order._id });
            }
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

// Get order by token (Customer - for persistence)
exports.getOrderByToken = async (req, res) => {
    try {
        const order = await Order.findOne({ orderToken: req.params.token });

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


// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
    try {
        const { status, dateFilter, isClosed } = req.query;

        // Build filter object - always exclude cancelled orders
        let filter = { isCancelled: { $ne: true } };

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

        // Unlock the table (only for Dine-In orders)
        if (order.orderType === 'Dine-In' && order.tableNumber) {
            const table = await Table.findOne({ tableNumber: order.tableNumber });
            if (table) {
                table.isOccupied = false;
                table.currentOrder = null;
                await table.save();

                // Emit socket event for table available
                const io = req.app.get('io');
                if (io) {
                    io.emit('table-available', { tableNumber: order.tableNumber });
                }
            }
        }

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

// Cancel order (Admin only)
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order is already closed
        if (order.isClosed) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a closed order'
            });
        }

        // Check if order is already cancelled
        if (order.isCancelled) {
            return res.status(400).json({
                success: false,
                message: 'Order is already cancelled'
            });
        }

        // Check if order is already paid
        if (order.paymentStatus === 'Paid') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a paid order'
            });
        }

        // Cancel the order
        order.isCancelled = true;
        order.isClosed = true;
        await order.save();

        // Unlock the table for Dine-In orders
        if (order.orderType === 'Dine-In' && order.tableNumber) {
            const table = await Table.findOne({ tableNumber: order.tableNumber });
            if (table) {
                table.isOccupied = false;
                table.currentOrder = null;
                await table.save();

                // Emit socket event for table available
                const io = req.app.get('io');
                if (io) {
                    io.emit('table-available', { tableNumber: order.tableNumber });
                }
            }
        }

        // Emit socket events for real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('order-cancelled', order);
            io.emit('order-updated', order);
        }

        res.json({
            success: true,
            message: 'Order cancelled successfully',
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
