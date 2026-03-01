const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/products
// @desc    Get all products (with optional filtering)
router.get('/', async (req, res) => {
    try {
        // Build query based on filters like category, search keyword
        const query = {};
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.keyword) {
            query.name = { $regex: req.query.keyword, $options: 'i' };
        }

        const products = await Product.find(query).populate('farmer', 'name farmName location pinCode');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/products/:id
// @desc    Get product by id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('farmer', 'name farmName location pinCode');
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/products/farmer/me
// @desc    Get logged in farmer's products
router.get('/farmer/me', protect, authorize('farmer'), async (req, res) => {
    try {
        const products = await Product.find({ farmer: req.user.id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/products
// @desc    Create a product
router.post('/', protect, authorize('farmer'), async (req, res) => {
    try {
        const { name, category, pricePerKg, quantityAvailable, description, image } = req.body;

        const product = new Product({
            farmer: req.user.id,
            name, category, pricePerKg, quantityAvailable, description, image
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
router.put('/:id', protect, authorize('farmer'), async (req, res) => {
    try {
        const { name, category, pricePerKg, quantityAvailable, description, image } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            // Check if this farmer owns the product
            if (product.farmer.toString() !== req.user.id) {
                return res.status(401).json({ message: 'Not authorized to update this product' });
            }

            product.name = name || product.name;
            product.category = category || product.category;
            product.pricePerKg = pricePerKg || product.pricePerKg;
            product.quantityAvailable = quantityAvailable || product.quantityAvailable;
            product.description = description || product.description;
            product.image = image || product.image;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
router.delete('/:id', protect, authorize('farmer'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            if (product.farmer.toString() !== req.user.id) {
                return res.status(401).json({ message: 'Not authorized to delete this product' });
            }
            await Product.deleteOne({ _id: product._id });
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
