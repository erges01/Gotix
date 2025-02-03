const Order = require("../Models/orderModel");
const Ticket = require("../Models/ticketModel");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { ticketId, quantity, buyerEmail } = req.body;
    const ticket = await Ticket.findById(ticketId);

    if (!ticket || ticket.quantityAvailable < quantity) {
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    const totalPrice = ticket.price * quantity;

    const newOrder = await Order.create({
      ticket: ticketId,
      buyerEmail,
      quantity,
      totalPrice,
      status: "Pending",
    });

    res.status(201).json({
      status: "success",
      data: { order: newOrder },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
};

// Get Orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("ticket");
    res.status(200).json({ status: "success", data: { orders } });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve orders", error: err.message });
  }
};
