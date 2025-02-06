const jwt = require('jsonwebtoken');
const User = require('../Models/userSignUp');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure you match the exact key used in the token payload
    const userId = decoded.id || decoded._id; 

    req.user = await User.findById(userId).select("-password"); // Exclude password for security
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized access', error: err.message });
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
