// const express = require('express');
// const router = express.Router();
// const facilitatorController = require('../controllers/facilitatorController');
// const { protect } = require('../middleware/authentication');
// const { facilitator, manager } = require('../middleware/authorization');

// // CREATE
// router.post( '/', protect, manager, facilitatorController.createFacilitator);

// // READ ALL
// router.get('/', protect, facilitatorController.getAllFacilitators);

// // READ ONE by ID
// router.get('/:id', protect, manager, facilitatorController.getFacilitatorById);

// // UPDATE
// router.put('/:id', protect, facilitator, manager, facilitatorController.updateFacilitator);

// // DELETE 
// router.delete('/:id', protect, manager, facilitatorController.deleteFacilitator);

// module.exports = router;
