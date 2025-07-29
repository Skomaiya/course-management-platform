const { Facilitator, Manager } = require('../models');
const bcrypt = require('bcryptjs');

// Create a new facilitator
exports.createFacilitator = async (req, res) => {
  try {
    const { name, email, password, qualification, location, managerId } = req.body;

    // Check for duplicates
    const existing = await Facilitator.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Facilitator with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const facilitator = await Facilitator.create({
      name,
      email,
      password: hashedPassword,
      qualification,
      location,
      managerId,
    });

    res.status(201).json(facilitator);
  } catch (error) {
    res.status(500).json({ message: 'Error creating facilitator', error: error.message });
  }
};

// Update own facilitator profile
exports.updateProfile = async (req, res) => {
  try {
    const facilitatorId = req.user.id;
    const { name, email, password, qualification, location } = req.body;

    const facilitator = await Facilitator.findByPk(facilitatorId);
    if (!facilitator) {
      return res.status(404).json({ message: 'Facilitator not found' });
    }

    if (email && email !== facilitator.email) {
      const existing = await Facilitator.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      facilitator.email = email;
    }

    facilitator.name = name || facilitator.name;
    facilitator.qualification = qualification || facilitator.qualification;
    facilitator.location = location || facilitator.location;

    if (password) {
      facilitator.password = await bcrypt.hash(password, 10);
    }

    await facilitator.save();

    res.status(200).json({
      id: facilitator.id,
      name: facilitator.name,
      email: facilitator.email,
      qualification: facilitator.qualification,
      location: facilitator.location,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating facilitator profile', error: error.message });
  }
};

// Get all facilitators
exports.getAllFacilitators = async (req, res) => {
  try {
    const facilitators = await Facilitator.findAll({
      include: [
        { model: Manager, as: 'manager', attributes: ['id', 'name'] }
      ],
    });
    res.status(200).json(facilitators);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching facilitators', error: error.message });
  }
};

// Get a facilitator by ID
exports.getFacilitatorById = async (req, res) => {
  try {
    const facilitator = await Facilitator.findByPk(req.params.id, {
      include: [{ model: Manager, as: 'manager', attributes: ['id', 'name'] }]
    });

    if (!facilitator) {
      return res.status(404).json({ message: 'Facilitator not found' });
    }

    res.status(200).json(facilitator);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching facilitator', error: error.message });
  }
};

// Update a facilitator
exports.updateFacilitator = async (req, res) => {
  try {
    const { name, email, password, qualification, location, managerId } = req.body;

    const facilitator = await Facilitator.findByPk(req.params.id);
    if (!facilitator) {
      return res.status(404).json({ message: 'Facilitator not found' });
    }

    if (email && email !== facilitator.email) {
      const existing = await Facilitator.findOne({ where: { email } });
      if (existing) return res.status(400).json({ message: 'Email already in use' });
    }

    let updatedFields = {
      name: name || facilitator.name,
      email: email || facilitator.email,
      qualification: qualification || facilitator.qualification,
      location: location || facilitator.location,
      managerId: managerId || facilitator.managerId,
    };

    if (password) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    await facilitator.update(updatedFields);

    res.status(200).json(facilitator);
  } catch (error) {
    res.status(500).json({ message: 'Error updating facilitator', error: error.message });
  }
};

// Delete a facilitator
exports.deleteFacilitator = async (req, res) => {
  try {
    const facilitator = await Facilitator.findByPk(req.params.id);
    if (!facilitator) {
      return res.status(404).json({ message: 'Facilitator not found' });
    }

    await facilitator.destroy();
    res.status(200).json({ message: 'Facilitator deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting facilitator', error: error.message });
  }
};
