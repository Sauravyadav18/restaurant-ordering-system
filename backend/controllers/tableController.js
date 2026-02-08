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

// Set total number of tables (admin only)
exports.setTotalTables = async (req, res) => {
    try {
        const { totalTables } = req.body;

        if (!totalTables || totalTables < 1 || totalTables > 100) {
            return res.status(400).json({
                success: false,
                message: 'Total tables must be between 1 and 100'
            });
        }

        const currentTables = await Table.find().sort({ tableNumber: 1 });
        const currentCount = currentTables.length;

        if (totalTables > currentCount) {
            // Add new tables
            const newTables = [];
            for (let i = currentCount + 1; i <= totalTables; i++) {
                newTables.push({
                    tableNumber: i,
                    isActive: true,
                    isOccupied: false
                });
            }
            await Table.insertMany(newTables);
        } else if (totalTables < currentCount) {
            // Check if any tables to be removed are occupied
            const tablesToRemove = currentTables.slice(totalTables);
            const occupiedTables = tablesToRemove.filter(t => t.isOccupied);

            if (occupiedTables.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot remove tables ${occupiedTables.map(t => t.tableNumber).join(', ')} as they are currently occupied`
                });
            }

            // Remove extra tables
            const idsToRemove = tablesToRemove.map(t => t._id);
            await Table.deleteMany({ _id: { $in: idsToRemove } });
        }

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.emit('tables-updated');
        }

        res.json({
            success: true,
            message: `Total tables set to ${totalTables}`,
            totalTables
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
