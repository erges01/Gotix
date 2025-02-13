const Order = require("../Models/orderModel");

// ✅ Check-In by QR Code
exports.checkInByQRCode = async (req, res) => {
  try {
    const { qrCodeUrl } = req.body;

    if (!qrCodeUrl) {
      return res.status(400).json({ message: "QR Code URL is required" });
    }

    const order = await Order.findOne({ qrCodeUrl });
    if (!order) return res.status(404).json({ message: "Invalid QR Code" });

    if (order.status === "Checked In") {
      return res.status(400).json({ message: "Ticket already checked in" });
    }

    order.status = "Checked In";
    await order.save();

    res.status(200).json({ message: "Checked in successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Check-in failed", error: err.message });
  }
};

// ✅ Manual Check-In by Ticket ID
exports.checkInByImage = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "Checked In") {
      return res.status(400).json({ message: "Ticket already checked in" });
    }

    order.status = "Checked In";
    await order.save();

    res.status(200).json({ message: "Checked in successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Check-in failed", error: err.message });
  }
};
