const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth.middleware');

const isAdmin = require('../middleware/isAdmin')

const { createProduct, getAllProducts,  getProduct,  updateProduct,  deleteProduct} = require("../controllers/product.controller");

router.post("/create", auth, createProduct);

router.get("/", getAllProducts);
router.get("/all", getAllProducts);
router.get("/:id", getProduct);
router.put("/:id", auth, isAdmin, updateProduct);
router.delete("/:id", auth, isAdmin, deleteProduct);

module.exports = router;
