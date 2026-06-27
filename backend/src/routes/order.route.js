const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/isAdmin.middleware');

const { createOrder , getUserOrders, getOrderById, cancelOrder, updateOrderStatus, getOrderHistory, getOrderTracking, reorder, getOrderSummary, getInvoice, confirmOrder } = require('../controllers/order.controller');


router.post("/", auth, createOrder );
router.get("/user/:userId", auth, getUserOrders);
router.get("/:id", auth, getOrderById);
// router.get("/", auth, getUserOrders);
router.put("/:id/cancel", auth, cancelOrder);
router.get("/:id/history", auth, getOrderHistory);
router.patch("/:id/status", auth, isAdmin, updateOrderStatus);
router.get("/:id/tracking", auth, getOrderTracking);
router.patch("/:id/confirm", auth, isAdmin, confirmOrder);
router.get("/:id/summary", auth, getOrderSummary);
router.post("/:id/reorder", auth, reorder);
router.get("/:id/invoice", auth, getInvoice);


module.exports = router;