const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');
const { protect } = require('../middleware/authentication');
const { manager, student } = require('../middleware/authorization');

// Create a student
router.post('/', protect, manager, studentController.createStudent);

// Get all students
router.get('/', protect, manager, studentController.getAllStudents);

// Get student by ID
router.get('/:id', protect, async (req, res, next) => {
  if (req.user.role === 'manager') {
    return studentController.getStudentById(req, res);
  }

  if (req.user.role === 'student' && req.user.id === req.params.id) {
    return studentController.getStudentById(req, res);
  }

  return res.status(403).json({ message: 'Access denied' });
});

// Update student
router.put('/:id', protect, async (req, res, next) => {
  if (req.user.role === 'manager') {
    return studentController.updateStudent(req, res);
  }

  if (req.user.role === 'student' && req.user.id === req.params.id) {
    return studentController.updateStudent(req, res);
  }

  return res.status(403).json({ message: 'Access denied' });
});

// Delete student (Managers only)
router.delete('/:id', protect, manager, studentController.deleteStudent);

module.exports = router;
