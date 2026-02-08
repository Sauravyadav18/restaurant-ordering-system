const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: [true, 'Table number is required'],
        unique: true,
        min: [1, 'Table number must be at least 1'],
        max: [20, 'Table number must be at most 20']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isOccupied: {
        type: Boolean,
        default: false
    },
    currentOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Table', tableSchema);
