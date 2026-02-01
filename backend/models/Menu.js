const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Menu item name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Starters', 'Main Course', 'Drinks', 'Desserts']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    image: {
        type: String,
        default: ''
    },
    available: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Menu', menuSchema);
