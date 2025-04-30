const mongoose = require("mongoose");

const ticketTypeSchema = new mongoose.Schema({
  type: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  quantityAvailable: { type: Number, required: true, min: 0 },
  expiresAt: { type: Date },
  password: { type: String, default: null },
});

const eventSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Event name is required"], trim: true },
  description: { type: String, required: [true, "Event description is required"], trim: true },
  recurring: { type: Boolean, default: false },
  dates: {
    type: [{ type: Date, required: true }],
    validate: [v => v.length > 0, "At least one event date is required"],
  },
  timeSlots: [{ type: String, trim: true }],
  location: { type: String, required: [true, "Event location is required"], trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ticketTypes: {
    type: [ticketTypeSchema],
    validate: [v => v.length > 0, "At least one ticket type is required"],
  },
  customURL: { type: String, unique: true, trim: true, lowercase: true },
  checkoutQuestions: [{ question: { type: String, trim: true } }],
  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
