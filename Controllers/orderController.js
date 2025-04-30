// /controllers/orderController.js

const Order = require("../Models/orderModel");
const Event = require("../Models/eventModel");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const sendEmail = require("../Utils/mailer");

const ensureDirectoryExistence = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createOrder = async (req, res) => {
  try {
    const { eventId, ticketType, quantity, buyerEmail, attendees, password } = req.body;

    if (!eventId || !ticketType || !quantity || !buyerEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const ticket = event.ticketTypes.find((t) => t.type === ticketType);
    if (!ticket) return res.status(400).json({ message: "Ticket type not found" });

    if (ticket.password && (!password || ticket.password !== password)) {
      return res.status(403).json({ message: "Invalid or missing invite-only ticket password" });
    }

    if (ticket.quantityAvailable < quantity) {
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    const totalPrice = ticket.price * quantity;
    const status = ticket.price === 0 ? "Confirmed" : "Pending";

    const qrCodeDir = path.resolve(__dirname, "../public/qrCodes");
    const ticketDir = path.resolve(__dirname, "../public/tickets");

    ensureDirectoryExistence(qrCodeDir);
    ensureDirectoryExistence(ticketDir);

    const attendeeList = [];

    for (let i = 0; i < quantity; i++) {
      const qrCodeData = `order-${Date.now()}-${i}-${Math.random()}`;
      const qrCodePath = path.join(qrCodeDir, `${qrCodeData}.png`);
      const ticketPdfPath = path.join(ticketDir, `${qrCodeData}.pdf`);

      await QRCode.toFile(qrCodePath, qrCodeData);

      const doc = new PDFDocument();
      const pdfStream = fs.createWriteStream(ticketPdfPath);

      doc.pipe(pdfStream);
      doc.fontSize(12).text(`Event: ${event.name}`, 100, 100);
      doc.text(`Ticket Type: ${ticketType}`, 100, 120);
      doc.text(`Attendee: ${attendees?.[i]?.email || buyerEmail}`, 100, 140);
      doc.text(`Total Price: $${totalPrice}`, 100, 160);
      doc.image(qrCodePath, 100, 200, { width: 150 });
      doc.end();

      await new Promise((resolve, reject) => {
        pdfStream.on("finish", resolve);
        pdfStream.on("error", reject);
      });

      attendeeList.push({
        email: attendees?.[i]?.email || buyerEmail,
        qrCodeUrl: `/public/qrCodes/${qrCodeData}.png`,
        pdfPath: ticketPdfPath,
      });
    }

    const newOrder = await Order.create({
      ticketId: ticket._id,
      eventId,
      buyerEmail,
      quantity,
      totalPrice,
      status,
      attendees: attendeeList,
    });

    ticket.quantityAvailable -= quantity;
    await event.save();

    const emailMessage = event.confirmationEmailMessage || "Thank you for your purchase! Here are your event details.";

    const attachments = attendeeList.map((att) => ({ filename: path.basename(att.pdfPath), path: att.pdfPath }));

    await sendEmail(buyerEmail, `Your Ticket for ${event.name}`, emailMessage, attachments);

    res.status(201).json({ status: "success", data: { order: newOrder } });
  } catch (err) {
    console.error(`Order creation error: ${err.message}`);
    res.status(500).json({ message: err.message || "Failed to create order" });
  }
};

const validateTicket = async (req, res) => {
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

const captureCheckoutResponses = async (req, res) => {
  try {
    const { orderId, checkoutResponses } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.checkoutResponses = checkoutResponses;
    await order.save();

    res.status(200).json({ message: "Checkout responses saved successfully", data: { order } });
  } catch (err) {
    res.status(500).json({ message: "Failed to save checkout responses", error: err.message });
  }
};

const refundOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "Paid") {
      return res.status(400).json({ message: "Only paid orders can be refunded" });
    }

    order.status = "Refunded";
    await order.save();

    res.status(200).json({ message: "Refund processed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to process refund", error: err.message });
  }
};

const downloadTicket = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const ticketPath = order.attendees?.[0]?.pdfPath;
    if (!ticketPath || !fs.existsSync(ticketPath)) {
      return res.status(404).json({ message: "Ticket PDF not found" });
    }

    const filename = path.basename(ticketPath);
    res.download(ticketPath, filename);
  } catch (err) {
    console.error("Ticket download failed:", err);
    res.status(500).json({ message: "Failed to download ticket" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("eventId");
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ status: "success", data: { order } });
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ message: "Failed to get order details" });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("ticketId");
    res.status(200).json({ status: "success", data: { orders } });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve orders", error: err.message });
  }
};

const approveOrder = async (req, res) => {
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

module.exports = {
  createOrder,
  validateTicket,
  captureCheckoutResponses,
  refundOrder,
  downloadTicket,
  getOrderById,
  getOrders,
  approveOrder,
};
