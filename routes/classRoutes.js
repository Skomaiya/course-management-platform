// const express = require('express');
// const router = express.Router();
// const classController = require('../controllers/classController');
// const { protect } = require('../middleware/authentication');
// const { student, facilitator, manager } = require('../middleware/authorization');

// // Create a new class
// router.post('/', protect, facilitator, manager, classController.createClass);

// // Get all classes
// router.get('/', protect, classController.getAllClasses);

// // Get a class by ID
// router.get('/:id', protect, facilitator, manager, classController.getClassById);

// // Update a class
// router.put('/:id', protect, facilitator, manager, classController.updateClass);

// // Delete a class
// router.delete('/:id', protect, facilitator, manager, classController.deleteClass);

// module.exports = router;
