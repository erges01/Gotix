const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController");

// Routes for orders
router.post("/create", orderController.createOrder);
router.get("/", orderController.getOrders);

module.exports = router;
