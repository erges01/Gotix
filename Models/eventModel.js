const mongoose = require("mongoose");

const ticketTypeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  price: { type: Number, required: true },
  quantityAvailable: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
  password: { type: String } // For invite-only tickets (optional)
});

const eventSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Event name is required"] },
  description: { type: String, required: [true, "Event description is required"] },
  dates: [{ type: Date, required: true }], // Supports multiple dates
  timeSlots: [{ type: String }], // Time slots for one-on-one events
  location: { type: String, required: [true, "Event location is required"] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ticketTypes: [ticketTypeSchema],
  customURL: { type: String, unique: true }, // Custom event URLs
  checkoutQuestions: [{ question: { type: String, required: true } }], // Fix required field
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
