const Order = require("../Models/orderModel");

exports.checkInByQRCode = async (req, res) => {
  try {
    const { qrCodeUrl } = req.body;

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
