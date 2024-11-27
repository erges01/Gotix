const jwt = require('jsonwebtoken');
const User = require('../Models/userSignUp'); 
const util= require('util');

const authMiddleware = async (req, res, next) => {
  try {
    // Check if token is provided
    const testToken = req.headers.authorization
    let token;
    if (testToken && testToken.toLowerCase().startsWith('bearer')){
      token=testToken.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized access' });
  }
};

module.exports = authMiddleware;
