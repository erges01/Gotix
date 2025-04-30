const express = require('express');
const authController = require('../Controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
//router.get('/verify-email/:token', authController.verifyEmail); // ✅ New route for email verification
router.post('/login', authController.login);

module.exports = router;
