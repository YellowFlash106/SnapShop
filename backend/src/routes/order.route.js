const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const athorize = require('../middleware/authorize.middleware');
const permissions = require('../constants/permissions');
const isAdmin = require('../middleware/isAdmin.middleware');

const { createOrder , 
        getUserOrders, 
        getOrderById, 
        cancelOrder, 
        updateOrderStatus, 
        getOrderHistory, 
        getOrderTracking, 
        reorder, 
        getOrderSummary, 
        getInvoice, 
        confirmOrder } = require('../controllers/order.controller');


router.post("/", auth, authorize(permissions.CREATE_ORDER), createOrder);
router.get("/user/:userId", auth, getUserOrders);
router.get("/:id", auth, getOrderById);
// router.get("/", auth, getUserOrders);
router.put("/:id/cancel", auth, authorize(permissions.CANCEL_ORDER), cancelOrder);
router.get("/:id/history", auth, getOrderHistory);
router.patch("/:id/status", auth, isAdmin, updateOrderStatus);
router.get("/:id/tracking", auth, getOrderTracking);
router.patch("/:id/confirm", auth, isAdmin, confirmOrder);
router.get("/:id/summary", auth, getOrderSummary);
router.post("/:id/reorder", auth, authorize(permissions.REORDER), reorder);
router.get("/:id/invoice", auth, getInvoice);


module.exports = router;