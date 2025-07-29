const bcrypt = require('bcryptjs');
const { Manager } = require('../models');

// Create a new manager
exports.createManager = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if manager already exists
    const existing = await Manager.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Manager already exists with this email.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = await Manager.create({ name, email, password: hashedPassword });
    res.status(201).json(manager);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create manager', error: error.message });
  }
};

// Get all managers
exports.getAllManagers = async (req, res) => {
  try {
    const managers = await Manager.findAll({
      attributes: { exclude: ['password'] },
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
      attributes: { exclude: ['password'] },
    });

    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    res.json(manager);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve manager', error: error.message });
  }
};

// Update a manager
exports.updateManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const manager = await Manager.findByPk(id);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    manager.name = name || manager.name;
    manager.email = email || manager.email;

    if (password) {
      manager.password = await bcrypt.hash(password, 10);
    }

    await manager.save();
    res.json({ message: 'Manager updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update manager', error: error.message });
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

    await manager.destroy();
    res.json({ message: 'Manager deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete manager', error: error.message });
  }
};
