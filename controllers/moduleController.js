const { Module } = require('../models');

// Create a new module
const createModule = async (req, res) => {
  try {
    const { name, half } = req.body;

    const newModule = await Module.create({ name, half });
    res.status(201).json(newModule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all modules
const getAllModules = async (req, res) => {
  try {
    const modules = await Module.findAll();
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single module by ID
const getModuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const module = await Module.findByPk(id);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json(module);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a module
const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, half } = req.body;

    const module = await Module.findByPk(id);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    module.name = name || module.name;
    module.half = half || module.half;

    await module.save();
    res.json(module);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a module
const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    const module = await Module.findByPk(id);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    await module.destroy();
    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createModule,
  getAllModules,
  getModuleById,
  updateModule,
  deleteModule,
};
