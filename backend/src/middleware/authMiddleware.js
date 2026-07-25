const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  // Accept token from httpOnly cookie or Authorization header
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies && req.cookies['lm-token'];

  const token = cookieToken || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('Missing JWT_SECRET environment variable');
      return res.status(500).json({ message: 'Server misconfiguration' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = { protect, authorize };
