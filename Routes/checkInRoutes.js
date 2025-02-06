const express = require('express');
const router = express.Router();
const checkInController = require('../Controllers/checkInController'); // Import the check-in controller

// Routes for Check-In
router.post('/qr-code', checkInController.checkInByQRCode); // Scan QR Code
router.post('/image', checkInController.checkInByImage); // Manually Check-In by Ticket Image

module.exports = router;
