const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['farmer', 'customer', 'admin'],
        default: 'customer',
    },
    // Farmer specific fields
    farmName: {
        type: String,
    },
    location: {
        type: String, // e.g., "City, State"
    },
    pinCode: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false, // Admin can verify farmers
    },
    // Common fields
    phone: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
