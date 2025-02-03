const express = require("express");
const router = express.Router();
const ticketController = require("../Controllers/ticketController");

// Routes for tickets
router.post("/create", ticketController.createTicket);
router.get("/:eventId", ticketController.getTicketsByEvent);

module.exports = router;
