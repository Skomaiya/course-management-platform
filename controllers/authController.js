const bcrypt = require('bcryptjs');
const { User, Student, Facilitator, Manager } = require('../models');
const generateToken = require('../utils/token');
const e = require('express');

// Helper for field validation based on role
const validateExtraData = (role, extraData) => {
  switch (role) {
    case 'student':
      if (!extraData.name) {
        return 'Student must provide name';
      } else if (!extraData.classId) {
        return 'Student must provide classId';
      } else if (!extraData.cohortId) {
        return 'Student must provide cohortId';
      }
      break;
    case 'facilitator':
      if (!extraData.name) {
        return 'Facilitator must provide name';
      } else if (!extraData.qualification) {
        return 'Facilitator must provide qualification';
      } else if (!extraData.location) {
        return 'Facilitator must provide location';
      } else if (!extraData.managerId) {
        return 'Facilitator must provide managerId';
      }
      break;
    case 'manager':
      if (!extraData.name) {
        return 'Manager must provide name';
      }
      break;
  }
  return null;
};

exports.register = async (req, res) => {
  try {
    const { email, password, role, extraData = {} } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    if (!['student', 'facilitator', 'manager'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const validationError = validateExtraData(role, extraData);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Validate foreign keys before creating user
    if (role === 'facilitator' && extraData.managerId) {
      const manager = await Manager.findByPk(extraData.managerId);
      if (!manager) {
        return res.status(400).json({ message: 'Invalid managerId: manager does not exist' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      email, 
      password: hashedPassword, 
      role,
      name: extraData.name 
    });

    // Create associated profile
    const data = { ...extraData, userId: user.id };
    if (role === 'student') {
      await Student.create(data);
    } else if (role === 'facilitator') {
      await Facilitator.create(data);
    } else if (role === 'manager') {
      await Manager.create(data);
    }

    const token = generateToken(user.id, user.role);
    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);
    res.status(200).json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
