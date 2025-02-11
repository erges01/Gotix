const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController");

// Routes for orders
router.post("/create", orderController.createOrder);
router.get("/", orderController.getOrders);
// Only organizers can validate tickets
router.post('/validate-ticket', authMiddleware, restrictTo('organizer'), validateTicket);

module.exports = router;
