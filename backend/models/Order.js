const mongoose = require('mongoose');
const crypto = require('crypto');

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderToken: {
        type: String,
        unique: true,
        required: true
    },
    orderType: {
        type: String,
        enum: ['Dine-In', 'Parcel'],
        required: [true, 'Order type is required']
    },
    tableNumber: {
        type: Number,
        min: [1, 'Table number must be at least 1'],
        // Required only for Dine-In orders (validated in controller)
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
        minlength: [2, 'Customer name must be at least 2 characters']
    },
    customerPhone: {
        type: String,
        required: [true, 'Customer phone number is required'],
        trim: true,
        match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'Order must have at least one item'
        }
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Preparing', 'Served'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Paid'],
        default: 'Unpaid'
    },
    isClosed: {
        type: Boolean,
        default: false
    },
    isCancelled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Generate unique order token before saving
orderSchema.statics.generateToken = function () {
    return crypto.randomBytes(16).toString('hex');
};

module.exports = mongoose.model('Order', orderSchema);
