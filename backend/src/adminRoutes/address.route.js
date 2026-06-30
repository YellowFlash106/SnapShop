const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth.middleware');
const { createAddress, getAddresses, getAddressById, updateAddress, deleteAddress } = require('../controllers/address.controller');

router.post("/", auth, createAddress);
router.get("/", auth, getAddresses);
router.get("/:id", auth, getAddressById);
router.put("/:id", auth, updateAddress);
router.delete("/:id", auth, deleteAddress);

module.exports = router;