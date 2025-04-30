const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser'); // CRUCIAL
require('dotenv').config();

const app = express();

const authRoutes = require('./Routes/authRoutes');
const orderRoutes = require('./Routes/orderRoutes');
const eventRoutes = require('./Routes/eventRoutes');
const checkInRoutes = require('./Routes/checkInRoutes');

// CORS Setup
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,  // CRUCIAL for sending cookies
}));

// Middleware
app.use(express.json());
app.use(cookieParser()); // CRUCIAL for req.cookies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/checkin', checkInRoutes);

// Error Handling
app.use((req, res, next) => res.status(404).json({ message: 'Resource not found' }));
app.use((err, req, res, next) => res.status(500).json({ message: 'Internal server error' }));

module.exports = app;
