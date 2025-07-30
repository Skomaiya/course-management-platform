const { User, Manager } = require('../models');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/token');

// Create a new Manager (by Manager or Admin)
exports.createManager = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Create User with role 'manager'
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'manager',
    });

    // Create associated Manager profile
    const manager = await Manager.create({
      name,
      userId: user.id,
    });

    res.status(201).json({
      message: 'Manager account created successfully.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile: manager,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create manager', error: error.message });
  }
};

// Get all managers
exports.getAllManagers = async (req, res) => {
  try {
    const managers = await Manager.findAll({
      include: {
        model: User,
        attributes: ['id', 'email', 'role'],
      },
    });
    res.json(managers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve managers', error: error.message });
  }
};

// Get a single manager by ID
exports.getManagerById = async (req, res) => {
  try {
    const { id } = req.params;

    const manager = await Manager.findByPk(id, {
      include: {
        model: User,
        attributes: ['id', 'email', 'role'],
      },
    });

    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    res.json(manager);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve manager', error: error.message });
  }
};

// Update own manager profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password } = req.body;

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'manager') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const manager = await Manager.findOne({ where: { userId } });
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    user.name = name || user.name;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    manager.name = name || manager.name;

    await user.save();
    await manager.save();

    res.json({
      id: manager.id,
      name: manager.name,
      email: user.email,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update manager (Admin/Manager access)
exports.updateManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const manager = await Manager.findByPk(id);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    const user = await User.findByPk(manager.userId);
    if (!user) {
      return res.status(404).json({ message: 'Associated user not found' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    user.name = name || user.name;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    manager.name = name || manager.name;

    await user.save();
    await manager.save();

    res.json({
      id: manager.id,
      name: manager.name,
      email: user.email,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a manager
exports.deleteManager = async (req, res) => {
  try {
    const { id } = req.params;
    const manager = await Manager.findByPk(id);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    // Cascade delete via User (since onDelete: 'CASCADE')
    await User.destroy({ where: { id: manager.userId } });

    res.json({ message: 'Manager and associated user deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete manager', error: error.message });
  }
};
