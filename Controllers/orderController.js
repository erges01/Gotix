const Order = require("../Models/orderModel");
const Event = require("../Models/eventModel");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const sendEmail = require("../Utils/mailer");

exports.createOrder = async (req, res) => {
  try {
    const { eventId, ticketType, quantity, buyerEmail } = req.body;

    // Find the event and ticket
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const ticket = event.ticketTypes.find((t) => t.type === ticketType);
    if (!ticket) return res.status(400).json({ message: "Ticket type not found" });

    if (ticket.quantityAvailable < quantity) {
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    const totalPrice = ticket.price * quantity;
    const status = ticket.price === 0 ? "Confirmed" : "Pending";

    // Generate QR Code
    const qrCodeData = `order-${Date.now()}`;
    const qrCodePath = path.join(__dirname, `../public/qrCodes/${qrCodeData}.png`);
    await QRCode.toFile(qrCodePath, qrCodeData);
    
    // Generate PDF Ticket
    const ticketPdfPath = path.join(__dirname, `../public/tickets/${qrCodeData}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(ticketPdfPath));
    doc.fontSize(12).text(`Event: ${event.name}`, 100, 100);
    doc.text(`Ticket Type: ${ticketType}`, 100, 120);
    doc.text(`Quantity: ${quantity}`, 100, 140);
    doc.text(`Total Price: $${totalPrice}`, 100, 160);
    doc.image(qrCodePath, 100, 200, { width: 150 });
    doc.end();

    // Create Order
    const newOrder = await Order.create({
      ticketId: ticket._id,
      eventId,
      buyerEmail,
      quantity,
      totalPrice,
      status,
      qrCodeUrl: `/public/qrCodes/${qrCodeData}.png`,
      ticketPdfUrl: `/public/tickets/${qrCodeData}.pdf`,
    });

    // Reduce ticket quantity
    ticket.quantityAvailable -= quantity;
    await event.save();

    // Send Email
    sendEmail(buyerEmail, `Your Ticket for ${event.name}`, "Here is your ticket.", [
      { filename: `${qrCodeData}.pdf`, path: ticketPdfPath },
      { filename: `${qrCodeData}.png`, path: qrCodePath },
    ]);

    res.status(201).json({ status: "success", data: { order: newOrder } });
  } catch (err) {
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
};

// Fixed Ticket Validation
exports.validateTicket = async (req, res) => {
  try {
    const { qrCodeUrl } = req.body;
    if (!qrCodeUrl) return res.status(400).json({ message: "QR Code URL is required" });

    const order = await Order.findOne({ qrCodeUrl });
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
