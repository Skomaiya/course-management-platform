// const express = require('express');
// const router = express.Router();
// const allocationController = require('../controllers/allocationController');
// const { protect } = require('../middleware/authentication');
// const { manager } = require('../middleware/authorization');

// // Create a new allocation
// router.post('/', protect, manager, allocationController.createAllocation);

// // Get all allocations
// router.get('/', protect, manager, allocationController.getAllAllocations);

// // Get a single allocation by ID
// router.get('/:id', protect, manager, allocationController.getAllocationById);

// // Update an allocation
// router.put('/:id',  protect, manager,allocationController.updateAllocation);

// // Delete an allocation
// router.delete('/:id', protect, manager, allocationController.deleteAllocation);

// module.exports = router;
