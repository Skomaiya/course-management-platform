exports.student = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied: Not a student' });
  }
  next();
};

exports.facilitator = (req, res, next) => {
  if (req.user.role !== 'facilitator') {
    return res.status(403).json({ message: 'Access denied: Not a facilitator' });
  }
  next();
};

exports.manager = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied: Not a manager' });
  }
  next();
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied for role: ${req.user.role}` });
    }
    next();
  };
};
