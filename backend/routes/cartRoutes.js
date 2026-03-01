const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/cart
// @desc    Get user's cart
router.get('/', protect, authorize('customer'), async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate({
            path: 'items.product',
            populate: {
                path: 'farmer',
                select: 'name farmName location'
            }
        });

        if (!cart) {
            return res.json({ items: [] });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/cart/sync
// @desc    Sync local cart to database
router.post('/sync', protect, authorize('customer'), async (req, res) => {
    try {
        const { items } = req.body;

        let cart = await Cart.findOne({ user: req.user.id });

        if (cart) {
            cart.items = items.map(item => ({
                product: item.product._id || item.product,
                quantity: item.quantity
            }));
            await cart.save();
        } else {
            cart = await Cart.create({
                user: req.user.id,
                items: items.map(item => ({
                    product: item.product._id || item.product,
                    quantity: item.quantity
                }))
            });
        }

        const populatedCart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            populate: {
                path: 'farmer',
                select: 'name farmName location'
            }
        });

        res.json(populatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/cart
// @desc    Clear user cart
router.delete('/', protect, authorize('customer'), async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user.id });
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
