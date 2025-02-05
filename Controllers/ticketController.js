const Ticket = require("../Models/ticketModel");

// Create Ticket
exports.createTicket = async (req, res) => {
  try {
    const { event, type, price = 0, quantityAvailable, expiresAt } = req.body;


    if (price < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    const newTicket = await Ticket.create({
      event,
      type,
      price,
      quantityAvailable,
      expiresAt,
    });

    res.status(201).json({
      status: "success",
      data: { ticket: newTicket },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create ticket", error: err.message });
  }
};

// Get Tickets by Event
exports.getTicketsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const tickets = await Ticket.find({ event: eventId });

    res.status(200).json({
      status: "success",
      data: { tickets },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve tickets", error: err.message });
  }
};

