const express = require("express");
const router = express.Router();
const eventController = require("../Controllers/eventController");
const { authMiddleware } = require("../Middleware/authMiddleware"); // Import auth middleware

// Routes for events
router.post("/create", authMiddleware, eventController.createEvent); // Create an event
router.get("/", eventController.getAllEvents); // Get all events
router.get("/organizer", authMiddleware, eventController.getOrganizerEvents); // Get all events created by the logged-in organizer
router.get("/:eventId", eventController.getEventById); // Get a single event by ID
router.put("/:eventId", authMiddleware, eventController.updateEvent); // Update an event
router.delete("/:eventId", authMiddleware, eventController.deleteEvent); // Delete an event
router.get("/:eventId/sales", authMiddleware, eventController.getEventSales);
router.get("/:eventId/attendees/csv", authMiddleware, eventController.downloadAttendeeList);


module.exports = router;
