const Order = require("../Models/orderModel");
const Event = require("../Models/eventModel");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const sendEmail = require("../Utils/mailer");

// ✅ Create Order (Supports Group Ticketing & Password-Protected Tickets)
exports.createOrder = async (req, res) => {
  try {
    const { eventId, ticketType, quantity, buyerEmail, attendees, password } = req.body;

    // Find the event and ticket
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const ticket = event.ticketTypes.find((t) => t.type === ticketType);
    if (!ticket) return res.status(400).json({ message: "Ticket type not found" });

    // Validate ticket password (for invite-only tickets)
    if (ticket.password && ticket.password !== password) {
      return res.status(403).json({ message: "Invalid ticket password" });
    }

    if (ticket.quantityAvailable < quantity) {
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    const totalPrice = ticket.price * quantity;
    const status = ticket.price === 0 ? "Confirmed" : "Pending";

    // Generate QR Codes & PDFs for each attendee
    const attendeeList = [];
    for (let i = 0; i < quantity; i++) {
      const qrCodeData = `order-${Date.now()}-${i}`;
      const qrCodePath = path.join(__dirname, `../public/qrCodes/${qrCodeData}.png`);
      await QRCode.toFile(qrCodePath, qrCodeData);

      const ticketPdfPath = path.join(__dirname, `../public/tickets/${qrCodeData}.pdf`);
      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(ticketPdfPath));
      doc.fontSize(12).text(`Event: ${event.name}`, 100, 100);
      doc.text(`Ticket Type: ${ticketType}`, 100, 120);
      doc.text(`Attendee: ${attendees?.[i]?.email || buyerEmail}`, 100, 140);
      doc.text(`Total Price: $${totalPrice}`, 100, 160);
      doc.image(qrCodePath, 100, 200, { width: 150 });
      doc.end();

      attendeeList.push({ email: attendees?.[i]?.email || buyerEmail, qrCodeUrl: `/public/qrCodes/${qrCodeData}.png` });
    }

    // Create Order
    const newOrder = await Order.create({
      ticketId: ticket._id,
      eventId,
      buyerEmail,
      quantity,
      totalPrice,
      status,
      attendees: attendeeList,
    });

    // Reduce ticket quantity
    ticket.quantityAvailable -= quantity;
    await event.save();

    // Send Email
    sendEmail(buyerEmail, `Your Ticket for ${event.name}`, "Here is your ticket.", attendeeList.map(att => ({ filename: `${att.qrCodeUrl}.pdf`, path: att.qrCodeUrl })));

    res.status(201).json({ status: "success", data: { order: newOrder } });
  } catch (err) {
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
};

// ✅ Approve Order (For Guest List Management)
exports.approveOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "Approved";
    await order.save();

    res.status(200).json({ message: "Order approved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Approval failed", error: err.message });
  }
};

// ✅ Get All Orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("ticketId");
    res.status(200).json({ status: "success", data: { orders } });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve orders", error: err.message });
  }
};

// ✅ Validate Ticket (Check-In)
exports.validateTicket = async (req, res) => {
  try {
    const { qrCodeUrl } = req.body;
    if (!qrCodeUrl) return res.status(400).json({ message: "QR Code URL is required" });

    const order = await Order.findOne({ "attendees.qrCodeUrl": qrCodeUrl });
    if (!order) return res.status(404).json({ message: "Invalid ticket" });

    if (order.status === "Checked In") {
      return res.status(400).json({ message: "Ticket has already been used" });
    }

    order.status = "Checked In";
    await order.save();

    res.status(200).json({ message: "Ticket validated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Validation failed", error: err.message });
  }
};

// ✅ Refund Processing
exports.refundOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "Paid") {
      return res.status(400).json({ message: "Only paid orders can be refunded" });
    }

    // 🔹 Here, you should integrate Paystack/Stripe/Flutterwave for actual refunds.
    order.status = "Refunded";
    await order.save();

    res.status(200).json({ message: "Refund processed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to process refund", error: err.message });
  }
};
