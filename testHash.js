const Order = require("../Models/orderModel");
const Event = require("../Models/eventModel");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const pdfkit = require("pdfkit");
const sendEmail = require("../Utils/mailer"); // Import sendEmail from mailer.js

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { eventId, ticketType, quantity, buyerEmail } = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const ticket = event.ticketTypes.find(t => t.type === ticketType);
    if (!ticket || ticket.quantityAvailable < quantity) {
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    const totalPrice = ticket.price * quantity;
    const status = ticket.price === 0 ? "Confirmed" : "Pending";

    // Generate QR Code
    const qrCodeData = `order-${Date.now()}`;
    const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
    const qrCodePath = path.join(__dirname, `../public/qrCodes/${qrCodeData}.png`);
    await QRCode.toFile(qrCodePath, qrCodeData);

    // Generate PDF Ticket
    const ticketPdfPath = path.join(__dirname, `../public/tickets/${qrCodeData}.pdf`);
    const doc = new pdfkit();
    doc.pipe(fs.createWriteStream(ticketPdfPath));
    doc.fontSize(12).text(`Event: ${event.name}`, 100, 100);
    doc.fontSize(12).text(`Ticket Type: ${ticketType}`, 100, 120);
    doc.fontSize(12).text(`Price: $${ticket.price}`, 100, 140);
    doc.fontSize(12).text(`Quantity: ${quantity}`, 100, 160);
    doc.fontSize(12).text(`Expires At: ${ticket.expiresAt}`, 100, 180);
    doc.image(qrCodePath, 100, 220, { width: 150 });
    doc.end();

    // Create Order
    const newOrder = await Order.create({
      event: eventId,
      buyerEmail,
      ticketType,
      quantity,
      totalPrice,
      status,
      qrCodeUrl,
    });

    // Send Email with Ticket
    const subject = `Your Ticket for ${event.name}`;
    const text = `Here is your ticket for the event.`;
    const attachments = [
      { filename: `${qrCodeData}.pdf`, path: ticketPdfPath },
      { filename: `${qrCodeData}.png`, path: qrCodePath },
    ];

    const emailSent = sendEmail(buyerEmail, subject, text, attachments);

    if (emailSent) {
      return res.status(201).json({ status: "success", data: { order: newOrder } });
    } else {
      return res.status(500).json({ message: "Failed to send ticket email" });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
};

// Get Orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("event");
    res.status(200).json({ status: "success", data: { orders } });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve orders", error: err.message });
  }
};
