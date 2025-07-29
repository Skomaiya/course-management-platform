// const express = require('express');
// const router = express.Router();

// const moduleController = require('../controllers/moduleController');
// const { protect } = require('../middleware/authentication');
// const { facilitator, manager } = require('../middleware/authorization');

// // CREATE
// router.post('/', protect, facilitator, manager, moduleController.createModule);

// // READ
// router.get('/', protect, moduleController.getAllModules);

// // READ
// router.get('/:id', facilitator, protect, moduleController.getModuleById);

// // UPDATE
// router.put('/:id', protect, facilitator, manager, moduleController.updateModule);

// // DELETE
// router.delete('/:id', protect, facilitator, manager, moduleController.deleteModule);

// module.exports = router;