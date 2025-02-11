const mongoose = require("mongoose");

const ticketTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantityAvailable: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Event name is required"],
  },
  description: {
    type: String,
    required: [true, "Event description is required"],
  },
  date: {
    type: Date,
    required: [true, "Event date is required"],
  },
  location: {
    type: String,
    required: [true, "Event location is required"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ticketTypes: [ticketTypeSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
