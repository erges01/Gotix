const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required']
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date and time are required']
  },
  location: {
    type: String,
    required: [true, 'Event location is required']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming the user model stores organizer info
    required: true
  },
  ticketTypes: [
    {
      type: {
        type: String,
        enum: ['VIP', 'General', 'Early Bird', 'Standard'], // Different ticket categories
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'USD' // You can change this to suit your requirements
      },
      quantityAvailable: {
        type: Number,
        required: true
      },
      quantitySold: {
        type: Number,
        default: 0
      },
      status: {
        type: String,
        enum: ['Available', 'Sold Out', 'On Hold', 'Expired'],
        default: 'Available'
      },
      expiresAt: {
        type: Date,
        required: true
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check if a ticket type is available
ticketSchema.methods.isAvailable = function(ticketTypeIndex) {
  const ticketType = this.ticketTypes[ticketTypeIndex];
  return ticketType && ticketType.quantityAvailable > ticketType.quantitySold;
};

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
