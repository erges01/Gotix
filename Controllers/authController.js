require('dotenv').config();
const User = require('../Models/userSignUp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Organizer Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmpassword } = req.body;

    if (password !== confirmpassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with that email' });
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password, // Do NOT hash it here! Mongoose will handle it.
      role: 'organizer',
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || '1d',
    });

    res.status(201).json({
      status: 'success',
      token,
      data: { user: { id: newUser._id, name: newUser.name, email: newUser.email } },
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};


// Organizer Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //console.log('Incoming login request:', req.body);

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    //console.log('User retrieved from DB:', user);

    if (!user) {
      return res.status(400).json({ message: 'Incorrect email or password' });
    }

    const isPasswordCorrect = await user.comparePasswordInDb(password);
    //console.log('Password match:', isPasswordCorrect);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Incorrect email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || '1d',
    });

    user.password = undefined; // Hide password from response

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};
