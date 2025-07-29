const { Allocation, Module, Class, Facilitator, Mode } = require('../models');

// Create a new allocation
exports.createAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.create(req.body);
    res.status(201).json({ message: 'Allocation created successfully', data: allocation });
  } catch (error) {
    console.error('Error creating allocation:', error);
    res.status(500).json({ message: 'Failed to create allocation', error: error.message });
  }
};

// Get all allocations
exports.getAllAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.findAll({
      include: [
        { model: Module, as: 'module' },
        { model: Class, as: 'class' },
        { model: Facilitator, as: 'facilitator' },
        { model: Mode, as: 'mode' }
      ],
    });
    res.status(200).json({ data: allocations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve allocations', error: error.message });
  }
};

// Get single allocation by ID
exports.getAllocationById = async (req, res) => {
  try {
    const allocation = await Allocation.findByPk(req.params.id, {
      include: [
        { model: Module, as: 'module' },
        { model: Class, as: 'class' },
        { model: Facilitator, as: 'facilitator' },
        { model: Mode, as: 'mode' }
      ],
    });

    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    res.status(200).json({ data: allocation });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve allocation', error: error.message });
  }
};

// Update an allocation
exports.updateAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findByPk(req.params.id);

    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    await allocation.update(req.body);
    res.status(200).json({ message: 'Allocation updated successfully', data: allocation });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update allocation', error: error.message });
  }
};

// Delete an allocation
exports.deleteAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findByPk(req.params.id);

    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    await allocation.destroy();
    res.status(200).json({ message: 'Allocation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete allocation', error: error.message });
  }
};
