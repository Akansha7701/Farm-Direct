const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number, // in kg or units
                required: true,
            },
            priceAtPurchase: {
                type: Number,
                required: true, // stores the price at the time of purchase
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        type: String,
        required: true,
    },
    pinCode: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Shipped', 'Delivered'],
        default: 'Pending',
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'UPI'],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending',
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
