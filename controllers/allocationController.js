const { Allocation, Facilitator } = require('../models');

// Create a new allocation
const createAllocation = async (req, res) => {
  try {
    const { moduleId, classId, facilitatorId, modeId, trimester, year } = req.body;
    
    // Validate required fields
    if (!moduleId || !classId || !facilitatorId || !modeId || !trimester || !year) {
      return res.status(400).json({ message: 'Missing required fields: moduleId, classId, facilitatorId, modeId, trimester, year' });
    }

    // Validate trimester values
    const validTrimesters = ['HT1', 'HT2', 'FT'];
    if (!validTrimesters.includes(trimester)) {
      return res.status(400).json({ message: 'Invalid trimester. Must be one of: HT1, HT2, FT' });
    }

    // Validate year format (should be a 4-digit year)
    if (!/^\d{4}$/.test(year)) {
      return res.status(400).json({ message: 'Invalid year format. Must be a 4-digit year' });
    }

    // Check for duplicate allocation
    const existingAllocation = await Allocation.findOne({
      where: {
        moduleId,
        classId,
        facilitatorId,
        trimester,
        year
      }
    });

    if (existingAllocation) {
      return res.status(400).json({ message: 'Allocation already exists for this module, class, facilitator, trimester, and year combination' });
    }

    const newAllocation = await Allocation.create(req.body);
    res.status(201).json({ data: newAllocation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all allocations
const getAllAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.findAll();
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single allocation by ID
const getAllocationById = async (req, res) => {
  try {
    const { id } = req.params;

    const allocation = await Allocation.findByPk(id);
    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    res.json(allocation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an allocation
const updateAllocation = async (req, res) => {
  try {
    const { id } = req.params;

    const allocation = await Allocation.findByPk(id);
    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    allocation.moduleId = req.body.moduleId || allocation.moduleId;
    allocation.classId = req.body.classId || allocation.classId;
    allocation.facilitatorId = req.body.facilitatorId || allocation.facilitatorId;
    allocation.trimester = req.body.trimester || allocation.trimester;
    allocation.modeId = req.body.modeId || allocation.modeId;
    allocation.year = req.body.year || allocation.year;

    await allocation.save();
    res.json(allocation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an allocation
const deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params;

    const allocation = await Allocation.findByPk(id);
    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    await allocation.destroy();
    res.json({ message: 'Allocation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get allocations for a specific facilitator
const getFacilitatorAllocations = async (req, res) => {
  try {
    const { facilitatorId } = req.params;
    const { id: userId, role } = req.user;

    // Check if user is the facilitator or a manager
    if (role !== 'manager') {
      // For facilitators, ensure they can only view their own allocations
      const facilitator = await Facilitator.findOne({ where: { userId } });
      if (!facilitator || facilitator.id !== facilitatorId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const allocations = await Allocation.findAll({
      where: { facilitatorId }
    });

    res.json(allocations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific allocation for a facilitator
const getFacilitatorAllocationById = async (req, res) => {
  try {
    const { facilitatorId, id } = req.params;
    const { id: userId, role } = req.user;

    // Check if user is the facilitator or a manager
    if (role !== 'manager') {
      const facilitator = await Facilitator.findOne({ where: { userId } });
      if (!facilitator || facilitator.id !== facilitatorId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const allocation = await Allocation.findOne({
      where: { id, facilitatorId }
    });

    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    res.json(allocation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Filter allocations
const filterAllocations = async (req, res) => {
  try {
    const { trimester, year, facilitatorId, modeId, moduleId, classId } = req.query;
    const whereClause = {};

    if (trimester) whereClause.trimester = trimester;
    if (year) whereClause.year = year;
    if (facilitatorId) whereClause.facilitatorId = facilitatorId;
    if (modeId) whereClause.modeId = modeId;
    if (moduleId) whereClause.moduleId = moduleId;
    if (classId) whereClause.classId = classId;

    const allocations = await Allocation.findAll({
      where: whereClause
    });

    res.json(allocations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAllocation,
  getAllAllocations,
  getAllocationById,
  updateAllocation,
  deleteAllocation,
  getFacilitatorAllocations,
  getFacilitatorAllocationById,
  filterAllocations,
};
