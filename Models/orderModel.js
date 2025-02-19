const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Event.ticketTypes", required: true },
  buyerEmail: { type: String, required: [true, "Buyer email is required"] },
  quantity: { type: Number, required: true },
  attendees: [{ email: String, qrCodeUrl: String }], // Store individual attendees for group tickets
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Paid", "Cancelled", "Confirmed", "Approved"], default: "Pending" },
  checkoutResponses: [{ question: String, answer: String }], // Store attendee responses to checkout questions
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
