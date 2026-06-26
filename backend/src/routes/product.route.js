const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth.middleware');

const isAdmin = require('../middleware/isAdmin.middleware')

const { createProduct, getAllProducts,  getProduct,  updateProduct, deleteProduct, searchProducts, addReview, getProductReviews, addToWishlist, getWishlist, removeFromWishlist } = require("../controllers/product.controller");

router.post("/create", auth, createProduct);

router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/all", getAllProducts);
router.get("/wishlist", auth, getWishlist);
router.post("/:productId/wishlist", auth, addToWishlist);
router.delete("/wishlist/:productId", auth, removeFromWishlist);
router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", auth, addReview);
router.get("/:id", getProduct);
router.put("/:id", auth, isAdmin, updateProduct);
router.delete("/:id", auth, isAdmin, deleteProduct);
module.exports = router;
