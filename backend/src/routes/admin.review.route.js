const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth.middleware');

const { getAllReviews, approveReview, hideReview, deleteReview } = require('../controllers/admin.review.controller');

router.get("/", auth, getAllReviews);
router.put("/:id/approve", auth, approveReview);
router.put("/:id/hide", auth, hideReview);
router.delete("/:id", auth, deleteReview);

module.exports = router;
