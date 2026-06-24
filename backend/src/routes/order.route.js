const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/isAdmin.middleware');

const { createOrder , getOrderById, getUserOrders, cancelOrder, updateOrderStatus, getOrderHistory, getOrderTracking, reorder, generateInvoice } = require('../controllers/order.controller');


router.post("/", auth, createOrder );
router.get("/:id", auth, getOrderById);
router.get("/user/:userId", auth, getUserOrders);
// router.get("/", auth, getUserOrders);
router.put("/:id/cancel", auth, cancelOrder);
router.get("/:id/history", auth, getOrderHistory);
router.patch("/:id/status", auth, updateOrderStatus);
router.get("/:id/tracking", auth, getOrderTracking);
router.post("/:id/reorder", auth, reorder);
router.get("/:id/invoice", auth, generateInvoice);
module.exports = router;