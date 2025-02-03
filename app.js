require('dotenv').config();
const express = require('express');
const app = express();

const ticketRoutes = require('./Routes/ticketRoutes');
const authRoutes = require('./Routes/authRoutes');
const orderRoutes = require('./Routes/orderRoutes');
const eventRoutes= require('./Routes/eventRoutes')

// Middleware
app.use(express.json());

// Routes
app.use('/api/tickets', ticketRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/order', orderRoutes);


// Error Handling
app.use((req, res, next) => res.status(404).json({ message: 'Resource not found' }));
app.use((err, req, res, next) => res.status(500).json({ message: 'Internal server error' }));

module.exports = app;
