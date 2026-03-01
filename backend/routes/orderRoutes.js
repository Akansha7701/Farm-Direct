const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/orders
// @desc    Create new order
router.post('/', protect, authorize('customer'), async (req, res) => {
    try {
        const { farmer, products, totalAmount, shippingAddress, pinCode, paymentMethod } = req.body;

        if (products && products.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const order = new Order({
            customer: req.user.id,
            farmer,
            products,
            totalAmount,
            shippingAddress,
            pinCode,
            paymentMethod
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('farmer', 'name farmName')
            .populate('products.product', 'name image pricePerKg');

        if (order) {
            // Check if user is either the customer or the farmer of this order
            if (order.customer._id.toString() !== req.user.id && order.farmer._id.toString() !== req.user.id) {
                return res.status(401).json({ message: 'Not authorized to view this order' });
            }
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders (Customer or Farmer)
router.get('/myorders/all', protect, async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'customer') {
            orders = await Order.find({ customer: req.user.id })
                .populate('farmer', 'name farmName')
                .populate('products.product', 'name image');
        } else if (req.user.role === 'farmer') {
            orders = await Order.find({ farmer: req.user.id })
                .populate('customer', 'name email phone')
                .populate('products.product', 'name image');
        } else {
            orders = await Order.find({}); // Admin
        }
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Farmer only)
router.put('/:id/status', protect, authorize('farmer'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            if (order.farmer.toString() !== req.user.id) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            order.status = req.body.status || order.status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
