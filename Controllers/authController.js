require('dotenv').config();
const User = require('../Models/userSignUp');
const bcrypt = require('bcryptjs'); // For password comparison
const jwt = require('jsonwebtoken'); // For generating JWT tokens
//const app= require('./app');


exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmpassword } = req.body;

    // Check if passwords match
    if (password !== confirmpassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Create the new user with the hashed password
    const newUser = await User.create({
       name, 
       email,
        password});
   
      // Generate a JWT token for the new user
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || '1d' // Token expires in 1 day
    });

    // Exclude password from the response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    

    res.status(201).json({
       status: 'success',
       token,
        data: {
           user: userResponse
           } 
      });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// LOGGING IN FUNCTION
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists with the given email
    const user = await User.findOne({ email }).select('+password'); // Explicitly select password
    if (!user || !(await user.comparePasswordInDb(password))) {
      return res.status(400).json({ message: 'Incorrect email or password' });
    }

    
    // 2. Generate a JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || '1d' // Token expires in 1 day
    });


    // Exclude password from the response
    user.password = undefined;


    

    // 4. Respond with token and basic user info
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};
