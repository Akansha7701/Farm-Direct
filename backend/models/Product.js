const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Grains', 'Vegetables', 'Fruits', 'Dairy', 'Other'],
    },
    pricePerKg: {
        type: Number,
        required: true,
    },
    quantityAvailable: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String, // URL to image
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
