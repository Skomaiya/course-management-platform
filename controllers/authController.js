const bcrypt = require('bcrypt');
const { User, Student, Facilitator, Manager } = require('../models');

exports.register = async (req, res) => {
  try {
    const { email, password, role, extraData = {} } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    if (!['student', 'facilitator', 'manager'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, role });

    // Create role-specific record with optional extraData
    if (role === 'student') {
      await Student.create({ userId: user.id, ...extraData });
    } else if (role === 'facilitator') {
      await Facilitator.create({ userId: user.id, ...extraData });
    } else if (role === 'manager') {
      await Manager.create({ userId: user.id, ...extraData });
    }

    const token = generateToken(user);
    res.status(201).json({ token });
  } catch (err) {
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
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
