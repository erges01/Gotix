const express = require("express");
const router = express.Router();
const { checkInByQRCode, checkInByImage } = require("../Controllers/checkInController");

// ✅ Routes for Check-In
router.post("/qr-code", checkInByQRCode); // Scan QR Code
router.post("/image", checkInByImage); // Manually Check-In by Ticket ID

module.exports = router;
