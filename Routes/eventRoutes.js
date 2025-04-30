const express = require("express");
const router = express.Router();
const eventController = require("../Controllers/eventController");
const { authMiddleware } = require("../Middleware/authMiddleware");
const multer = require('multer');
const upload = multer();

// Correct - only one POST /create route
router.post('/create', authMiddleware, upload.none(), eventController.createEvent);

router.get("/", eventController.getAllEvents);
router.get("/organizer", authMiddleware, eventController.getOrganizerEvents);
router.get("/:eventId", eventController.getEventById);
router.put("/:eventId", authMiddleware, eventController.updateEvent);
router.delete("/:eventId", authMiddleware, eventController.deleteEvent);
router.get("/:eventId/sales", authMiddleware, eventController.getEventSales);
router.get("/:eventId/attendees/csv", authMiddleware, eventController.downloadAttendeeList);
router.put("/:eventId/ticket/:ticketType/password", authMiddleware, eventController.updateTicketPassword);
router.get("/:eventId/analytics", authMiddleware, eventController.getEventAnalytics);
router.get("/organizer/analytics", authMiddleware, eventController.getOrganizerAnalytics);

module.exports = router;
