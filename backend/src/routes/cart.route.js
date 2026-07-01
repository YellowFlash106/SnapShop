const express = require('express');

const router = express.Router();
const auth = require("../middleware/auth.middleware");

const { addToCart, 
        getCart, 
        updateCartItemQuantity, 
        clearCart, 
        removeFromCart } = require('../controllers/cart.controller');


router.post("/add", auth, addToCart);
router.get("/", auth, getCart);
router.patch("/items/:productId", auth, updateCartItemQuantity);
router.delete("/clear", auth, clearCart);
router.delete("/items/:productId", auth, removeFromCart);

module.exports = router;