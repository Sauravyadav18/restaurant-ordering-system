const Table = require('../models/Table');

// Get available tables (for customers)
exports.getAvailableTables = async (req, res) => {
    try {
        const tables = await Table.find({
            isActive: true,
            isOccupied: false
        }).sort({ tableNumber: 1 });

        res.json({
            success: true,
            count: tables.length,
            data: tables
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all tables (for admin)
exports.getAllTables = async (req, res) => {
    try {
        const tables = await Table.find().sort({ tableNumber: 1 }).populate('currentOrder');

        res.json({
            success: true,
            count: tables.length,
            data: tables
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update table status (admin only)
exports.updateTableStatus = async (req, res) => {
    try {
        const { isActive } = req.body;

        const table = await Table.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        );

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found'
            });
        }

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.emit('table-updated', table);
        }

        res.json({
            success: true,
            data: table
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Initialize tables (run once to seed)
exports.initializeTables = async (req, res) => {
    try {
        const existingTables = await Table.countDocuments();

        if (existingTables > 0) {
            return res.json({
                success: true,
                message: 'Tables already initialized',
                count: existingTables
            });
        }

        const tables = [];
        for (let i = 1; i <= 20; i++) {
            tables.push({
                tableNumber: i,
                isActive: true,
                isOccupied: false
            });
        }

        await Table.insertMany(tables);

        res.status(201).json({
            success: true,
            message: '20 tables created',
            count: 20
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Free a table manually (admin only)
exports.freeTable = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found'
            });
        }

        if (!table.isOccupied) {
            return res.status(400).json({
                success: false,
                message: 'Table is already free'
            });
        }

        table.isOccupied = false;
        table.currentOrder = null;
        await table.save();

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.emit('table-available', { tableNumber: table.tableNumber });
            io.emit('table-updated', table);
        }

        res.json({
            success: true,
            message: `Table ${table.tableNumber} is now free`,
            data: table
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
