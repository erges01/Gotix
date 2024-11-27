require('dotenv').config();
const express = require('express');
const app = express();

const ticketRoutes = require('./Routes/ticketRoutes');
const authRoutes = require('./Routes/authRoutes');

// Middleware
app.use(express.json());

// Main route
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// Authentication routes
app.use('/api/tickets', ticketRoutes); // Base route for tickets
app.use('/api/auth', authRoutes); // Base route for auth (e.g., /api/auth/login)

// Error handling for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});




module.exports=app;