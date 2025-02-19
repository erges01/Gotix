const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController"); // ✅ Fix: Import the full controller
const { authMiddleware, restrictTo } = require("../Middleware/authMiddleware"); 

// Routes for orders
router.post("/create", orderController.createOrder); // Create a new order
router.get("/", authMiddleware, orderController.getOrders); // Get all orders (Protected route)
router.put("/approve/:orderId", authMiddleware, restrictTo("organizer"), orderController.approveOrder); // Approve an order for guest list management
router.post("/validate-ticket", authMiddleware, restrictTo("organizer"), orderController.validateTicket); // Validate a ticket (Check-in)
router.post("/refund/:orderId", authMiddleware, restrictTo("organizer"), orderController.refundOrder); // Process a refund

module.exports = router;
