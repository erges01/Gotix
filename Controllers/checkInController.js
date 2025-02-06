const Ticket = require('../Models/ticketModel'); // Import the Ticket model

// Scan QR Code for Check-In
exports.checkInByQRCode = async (req, res) => {
  try {
    const { qrCodeData } = req.body; // The data from the scanned QR code
    const ticket = await Ticket.findOne({ qrCodeData });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found or invalid QR code' });
    }

    // Mark ticket as checked-in or processed
    ticket.status = 'Checked In';
    await ticket.save();

    res.status(200).json({ message: 'Ticket checked in successfully', ticket });
  } catch (err) {
    res.status(500).json({ message: "Check-in failed", error: err.message });
  }
};

// Manually Check-In by Ticket Image (if QR scanning isn't available)
exports.checkInByImage = async (req, res) => {
  try {
    const { ticketId } = req.body; // Ticket ID to verify manually
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Mark ticket as checked-in
    ticket.status = 'Checked In';
    await ticket.save();

    res.status(200).json({ message: 'Ticket checked in successfully', ticket });
  } catch (err) {
    res.status(500).json({ message: "Check-in failed", error: err.message });
  }
};
