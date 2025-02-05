const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event", // Links ticket to an event
    required: true,
  },
  type: {
    type: String,
    enum: ["VIP", "General", "Early Bird", "Standard"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  currency: {
    type: String,
    default: "USD",
  },
  quantityAvailable: {
    type: Number,
    required: true,
  },
  quantitySold: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["Available", "Sold Out", "On Hold", "Expired"],
    default: "Available",
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
