const Ticket = require("../Models/ticketModel");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const pdfkit = require("pdfkit");
const sendEmail = require("../Utils/mailer"); // Import sendEmail from mailer.js

// Create Ticket with QR Code and PDF
exports.createTicket = async (req, res) => {
  try {
    const { event, type, price = 0, quantityAvailable, expiresAt, email } = req.body;

    // Price validation
    if (price < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    // Generate QR code URL for the ticket
    const qrCodeData = `ticket-${Date.now()}`; // Unique ticket identifier
    const qrCodeUrl = await QRCode.toDataURL(qrCodeData); // Create a URL for the QR code

    // Generate QR Code image for PDF and email attachment
    const qrCodePath = path.join(__dirname, `../public/qrCodes/${qrCodeData}.png`);
    await QRCode.toFile(qrCodePath, qrCodeData); // Save QR code as image

    // Generate PDF for the ticket
    const ticketPdfPath = path.join(__dirname, `../public/tickets/${qrCodeData}.pdf`);
    const doc = new pdfkit();
    doc.pipe(fs.createWriteStream(ticketPdfPath));

    // Add content to PDF (ticket info and QR code)
    doc.fontSize(12).text(`Event: ${event}`, 100, 100);
    doc.fontSize(12).text(`Ticket Type: ${type}`, 100, 120);
    doc.fontSize(12).text(`Price: $${price}`, 100, 140);
    doc.fontSize(12).text(`Quantity Available: ${quantityAvailable}`, 100, 160);
    doc.fontSize(12).text(`Expires At: ${expiresAt}`, 100, 180);
    doc.image(qrCodePath, 100, 220, { width: 150 });

    doc.end();

    // Create new ticket document
    const newTicket = await Ticket.create({
      event,
      type,
      price,
      quantityAvailable,
      expiresAt,
      qrCodeUrl, // Save the QR code URL in the database
    });

    // Send email to attendee with the PDF and QR code
    const subject = `Your Ticket for ${event}`;
    const text = `Here is your ticket for the event.`;
    const attachments = [
      {
        filename: `${qrCodeData}.pdf`,
        path: ticketPdfPath, // Attach the PDF file
      },
      {
        filename: `${qrCodeData}.png`,
        path: qrCodePath, // Attach the QR code image
      },
    ];

    const emailSent = sendEmail(email, subject, text, attachments);

    if (emailSent) {
      return res.status(201).json({
        status: "success",
        data: { ticket: newTicket },
      });
    } else {
      return res.status(500).json({
        message: "Failed to send ticket email",
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to create ticket", error: err.message });
  }
};

// Get Tickets by Event
exports.getTicketsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const tickets = await Ticket.find({ event: eventId });

    res.status(200).json({
      status: "success",
      data: { tickets },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve tickets", error: err.message });
  }
};
