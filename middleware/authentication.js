const jwt = require('jsonwebtoken');
const { Student, Facilitator, Manager } = require('../models');

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user model based on role
    let userModel;
    switch (decoded.role) {
      case 'student':
        userModel = Student;
        break;
      case 'facilitator':
        userModel = Facilitator;
        break;
      case 'manager':
        userModel = Manager;
        break;
      default:
        return res.status(403).json({ message: 'Unknown user role' });
    }

    const user = await userModel.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user.id,
      role: decoded.role,
      email: user.email,
    };

    next();
  } catch (err) {
    console.error('Token Verification Error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};
