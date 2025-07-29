const { Class } = require('../models');

// Create a new class
const createClass = async (req, res) => {
  try {
    const { name, startDate, graduationDate } = req.body;

    const newClass = await Class.create({
      name,
      startDate,
      graduationDate,
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all classes
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.findAll();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single class by ID
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const classObj = await Class.findByPk(id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a class
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, graduationDate } = req.body;

    const classObj = await Class.findByPk(id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    classObj.name = name || classObj.name;
    classObj.startDate = startDate || classObj.startDate;
    classObj.graduationDate = graduationDate || classObj.graduationDate;

    await classObj.save();
    res.json(classObj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classObj = await Class.findByPk(id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await classObj.destroy();
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
};
