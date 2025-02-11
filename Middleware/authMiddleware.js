const jwt = require('jsonwebtoken');
const User = require('../Models/userSignUp');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Authentication failed', error: err.message });
  }
};

// Middleware to restrict access by role
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  restrictTo,
};
