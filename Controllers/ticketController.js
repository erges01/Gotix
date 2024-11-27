const Ticket = require('../Models/ticketModel');

// Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    const { eventName, description, date, location, organizer, ticketTypes } = req.body;

    const newTicket = await Ticket.create({
      eventName,
      description,
      date,
      location,
      organizer: req.user._id, // Assuming `req.user` contains authenticated user info
      ticketTypes
    });

    res.status(201).json({
      status: 'success',
      data: {
        ticket: newTicket
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create ticket', error: err.message });
  }
};

// Get all tickets for a specific event
exports.getTicketsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const tickets = await Ticket.find({ event: eventId });

    res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: {
        tickets
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tickets', error: err.message });
  }
};

// Get a ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        ticket
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ticket', error: err.message });
  }
};

// Update a ticket
exports.updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const updates = req.body;

    const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, updates, {
      new: true,
      runValidators: true
    });

    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        ticket: updatedTicket
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update ticket', error: err.message });
  }
};

// Delete a ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const deletedTicket = await Ticket.findByIdAndDelete(ticketId);

    if (!deletedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete ticket', error: err.message });
  }
};

// Get all tickets
exports.getAllTickets = async (req, res) => {
  try {
    // Fetch tickets with optional filters
    const tickets = await Ticket.find(req.query).populate('createdBy', 'name email');

    res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: { tickets },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve tickets',
      error: err.message,
    });
  }
};


