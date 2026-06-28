const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const { createReview, updateReview, deleteReview, getProductReviews } = require('../controllers/review.controller');

router.post("/", auth, createReview);
router.put("/:id", auth, updateReview);
router.delete("/:id", auth, deleteReview);
router.get("/product/:productId", getProductReviews);

module.exports = router;
