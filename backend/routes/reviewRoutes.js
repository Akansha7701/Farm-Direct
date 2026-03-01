const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/reviews
// @desc    Create a new review for a farmer
router.post('/', protect, authorize('customer'), async (req, res) => {
    try {
        const { farmerId, rating, comment } = req.body;

        // Optional: Check if the customer has ordered from this farmer before allowing review

        const review = new Review({
            farmer: farmerId,
            customer: req.user.id,
            rating: Number(rating),
            comment,
        });

        const createdReview = await review.save();
        res.status(201).json(createdReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/reviews/farmer/:id
// @desc    Get all reviews for a specific farmer
router.get('/farmer/:id', async (req, res) => {
    try {
        const reviews = await Review.find({ farmer: req.params.id })
            .populate('customer', 'name');

        // Calculate average rating
        const numReviews = reviews.length;
        const avgRating = numReviews > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews : 0;

        res.json({ reviews, avgRating, numReviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
