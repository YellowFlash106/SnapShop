const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');
const Permission = require('../constants/permissions');
const { validate } = require('../middleware/validate.middleware');

const isAdmin = require('../middleware/isAdmin.middleware')

const { createProduct, 
        getAllProducts,  
        getProduct,  
        updateProduct, 
        deleteProduct, 
        searchProducts, 
        addReview, 
        getProductReviews, 
        addToWishlist, 
        getWishlist, 
        removeFromWishlist, 
        productOwnership } = require("../controllers/product.controller");
const { createProductSchema, 
        productQuerySchema } = require("../validators/product.validator");

router.post("/create", auth, authorize(PERMISSIONS.CREATE_PRODUCT), validate(createProductSchema), createProduct);

router.get("/", validate(productQuerySchema), getAllProducts);
router.get("/search", validate(productQuerySchema), searchProducts);
router.get("/all", validate(productQuerySchema), getAllProducts);
router.get("/wishlist", auth, authorize(PERMISSIONS.VIEW_WISHLIST), getWishlist);
router.post("/:productId/wishlist", auth, authorize(PERMISSIONS.ADD_TO_WISHLIST), addToWishlist);
router.delete("/wishlist/:productId", auth, authorize(PERMISSIONS.REMOVE_FROM_WISHLIST), removeFromWishlist);
router.get("/:id/reviews", auth, authorize(PERMISSIONS.VIEW_REVIEWS), getProductReviews);
router.post("/:id/reviews", auth, authorize(PERMISSIONS.ADD_REVIEW), addReview);
router.get("/:id", productOwnership, getProduct);
router.put("/:id", productOwnership, auth, isAdmin, authorize(PERMISSIONS.UPDATE_PRODUCT), updateProduct);
router.delete("/:id", productOwnership, auth, isAdmin, authorize(PERMISSIONS.DELETE_PRODUCT), deleteProduct);

module.exports = router;
