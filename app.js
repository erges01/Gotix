require('dotenv').config();
const express = require('express');
const app = express();

const authRoutes = require('./Routes/authRoutes');
const orderRoutes = require('./Routes/orderRoutes');
const eventRoutes = require('./Routes/eventRoutes');
const checkInRoutes = require('./Routes/checkInRoutes'); // Import check-in routes

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/events', eventRoutes); // Add event routes
app.use('/api/checkin', checkInRoutes); // Add check-in routes

// Error Handling
app.use((req, res, next) => res.status(404).json({ message: 'Resource not found' }));
app.use((err, req, res, next) => res.status(500).json({ message: 'Internal server error' }));

module.exports = app;
