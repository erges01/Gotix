const express = require('express');
const router = express.Router();
const ticketController = require('../Controllers/ticketController');
const authMiddleware = require('../Middleware/authMiddleware'); // Assuming this is where your auth middleware is located

// Use the auth middleware to protect all routes
router.use(authMiddleware);

// Routes for getting all tickets and creating a new ticket
router
  .route('/')
  .get(ticketController.getAllTickets)    // Get all tickets
  .post(ticketController.createTicket);   // Create a ticket

// Route for fetching tickets by event
router
  .route('/event/:eventId')
  .get(ticketController.getTicketsByEvent); // Get all tickets for a specific event

// Routes for individual ticket operations
router
  .route('/:ticketId')
  .get(ticketController.getTicketById)      // Get a specific ticket
  .patch(ticketController.updateTicket)     // Update a ticket
  .delete(ticketController.deleteTicket);   // Delete a ticket

module.exports = router;
