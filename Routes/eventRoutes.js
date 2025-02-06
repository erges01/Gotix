const express = require("express");
const router = express.Router();
const eventController = require("../Controllers/eventController");
const { authMiddleware } = require("../Middleware/authMiddleware"); // Import auth middleware

// Routes for events
router.post("/create", authMiddleware, eventController.createEvent); // Protect route
router.get("/", eventController.getAllEvents);
router.put("/:eventId", authMiddleware, eventController.updateEvent); // Protect route
router.delete("/:eventId", authMiddleware, eventController.deleteEvent); // Protect route

module.exports = router;
