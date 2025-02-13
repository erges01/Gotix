const express = require("express");
const router = express.Router();
const { createOrder, getOrders, validateTicket, approveOrder, refundOrder } = require("../Controllers/orderController");
const { authMiddleware, restrictTo } = require("../Middleware/authMiddleware"); // Import authentication middleware

// Routes for orders
router.post("/create", createOrder); // Create a new order
router.get("/", authMiddleware, getOrders); // Get all orders (Protected route)
router.put("/approve/:orderId", authMiddleware, restrictTo("organizer"), approveOrder); // Approve an order for guest list management
router.post("/validate-ticket", authMiddleware, restrictTo("organizer"), validateTicket); // Validate a ticket (Check-in)
router.post("/refund/:orderId", authMiddleware, restrictTo("organizer"), refundOrder); // Process a refund

module.exports = router;
