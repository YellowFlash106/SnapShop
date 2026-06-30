const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const isAdmin = require('../middleware/isAdmin.middleware')

const { createProduct, getAllProducts,  getProduct,  updateProduct, deleteProduct, searchProducts, addReview, getProductReviews, addToWishlist, getWishlist, removeFromWishlist } = require("../controllers/product.controller");
const { createProductSchema, productQuerySchema } = require("../validators/product.validator");

router.post("/create", auth, validate(createProductSchema), createProduct);

router.get("/", validate(productQuerySchema), getAllProducts);
router.get("/search", validate(productQuerySchema), searchProducts);
router.get("/all", validate(productQuerySchema), getAllProducts);
router.get("/wishlist", auth, getWishlist);
router.post("/:productId/wishlist", auth, addToWishlist);
router.delete("/wishlist/:productId", auth, removeFromWishlist);
router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", auth, addReview);
router.get("/:id", getProduct);
router.put("/:id", auth, isAdmin, updateProduct);
router.delete("/:id", auth, isAdmin, deleteProduct);
module.exports = router;
