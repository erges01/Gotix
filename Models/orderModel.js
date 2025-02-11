const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event.ticketTypes", // Reference ticket type inside Event model
    required: true,
  },
  buyerEmail: {
    type: String,
    required: [true, "Buyer email is required"],
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Cancelled", "Confirmed"],
    default: "Pending",
  },
  qrCodeUrl: {
    type: String,
  },
  ticketPdfUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
