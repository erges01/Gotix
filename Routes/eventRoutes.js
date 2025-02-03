const express = require("express");
const router = express.Router();
const eventController = require("../Controllers/eventController");

// Routes for events
router.post("/create", eventController.createEvent);
router.get("/", eventController.getAllEvents);
router.put("/:eventId", eventController.updateEvent);
router.delete("/:eventId", eventController.deleteEvent);

module.exports = router;
