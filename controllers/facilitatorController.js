const { Facilitator, Manager, User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

// Create a new facilitator and associated user
const createFacilitator = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, password, qualification, location, managerId } = req.body;

    if (!name || !email || !password || !qualification || !location || !managerId) {
      await t.rollback();
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate managerId BEFORE creating user
    const manager = await Manager.findByPk(managerId, { transaction: t });
    if (!manager) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid managerId: manager does not exist' });
    }

    // Check for existing email BEFORE creating user
    const existingUser = await User.findOne({ where: { email }, transaction: t });
    if (existingUser) {
      await t.rollback();
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Only now create user and facilitator
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'facilitator',
    }, { transaction: t });

    const facilitator = await Facilitator.create({
      userId: user.id,
      name,
      qualification,
      location,
      managerId,
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      id: facilitator.id,
      name: user.name,
      email: user.email,
      qualification: facilitator.qualification,
      location: facilitator.location,
      managerId: facilitator.managerId,
    });

  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: 'Facilitator creation failed', error: error.message });
  }
};


// Update own facilitator profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password, qualification, location } = req.body;

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'facilitator') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const facilitator = await Facilitator.findOne({ where: { userId } });
    if (!facilitator) {
      return res.status(404).json({ message: 'Facilitator not found' });
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

    facilitator.qualification = qualification || facilitator.qualification;
    facilitator.location = location || facilitator.location;

    await user.save();
    await facilitator.save();

    res.json({
      id: facilitator.id,
      name: user.name,
      email: user.email,
      qualification: facilitator.qualification,
      location: facilitator.location,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all facilitators
const getAllFacilitators = async (req, res) => {
  try {
    const facilitators = await Facilitator.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Manager,
          attributes: ['id', 'name'],
        },
      ],
    });

    res.json(facilitators);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get facilitator by ID
const getFacilitatorById = async (req, res) => {
  try {
    const { id } = req.params;

    const facilitator = await Facilitator.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Manager,
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!facilitator) {
      return res.status(404).json({ message: 'Facilitator not found' });
    }

    res.json(facilitator);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin/Manager: Update facilitator
const updateFacilitator = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { name, email, password, qualification, location, managerId } = req.body;

    const facilitator = await Facilitator.findByPk(id, { transaction: t });
    if (!facilitator) {
      await t.rollback();
      return res.status(404).json({ message: 'Facilitator not found' });
    }

    const user = await User.findByPk(facilitator.userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'Associated user not found' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email }, transaction: t });
      if (existing) {
        await t.rollback();
        return res.status(409).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    // ✅ Validate managerId if it’s changing
    if (managerId && managerId !== facilitator.managerId) {
      const manager = await Manager.findByPk(managerId, { transaction: t });
      if (!manager) {
        await t.rollback();
        return res.status(400).json({ message: 'Invalid managerId: manager does not exist' });
      }
      facilitator.managerId = managerId;
    }

    user.name = name || user.name;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    facilitator.qualification = qualification || facilitator.qualification;
    facilitator.location = location || facilitator.location;

    await user.save({ transaction: t });
    await facilitator.save({ transaction: t });

    await t.commit();

    res.json({
      id: facilitator.id,
      name: user.name,
      email: user.email,
      qualification: facilitator.qualification,
      location: facilitator.location,
      managerId: facilitator.managerId,
    });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: 'Facilitator update failed', error: error.message });
  }
};


// Delete facilitator and associated user
const deleteFacilitator = async (req, res) => {
  try {
    const { id } = req.params;

    const facilitator = await Facilitator.findByPk(id);
    if (!facilitator) {
      return res.status(404).json({ message: 'Facilitator not found' });
    }

    const user = await User.findByPk(facilitator.userId);
    if (user) {
      await user.destroy();
    }

    await facilitator.destroy();

    res.json({ message: 'Facilitator deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createFacilitator,
  updateProfile,
  getAllFacilitators,
  getFacilitatorById,
  updateFacilitator,
  deleteFacilitator,
};
