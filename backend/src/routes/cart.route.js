const express = require('express');

const router = express.Router();
const auth = require("../middleware/auth.middleware");

const { addToCart, getCart } = require('../controllers/cart.controller');


router.post("/add", auth, addToCart);
router.get("/", auth, getCart);