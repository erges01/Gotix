const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: 7,
    select: false, // Ensure password isn't exposed by default
  },
  role: {
    type: String,
    enum: ['organizer'],
    default: 'organizer',
  },
  purchases: [
    {
      ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
      },
      ticketType: String,
      quantity: Number,
      purchasedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
userSchema.methods.comparePasswordInDb = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
