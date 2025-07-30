const express = require('express');
const router = express.Router();

// Route modules
const moduleRoutes = require('./moduleRoutes');
const classRoutes = require('./classRoutes');
const studentRoutes = require('./studentRoutes');
const facilitatorRoutes = require('./facilitatorRoutes');
const managerRoutes = require('./managerRoutes');
const allocationRoutes = require('./allocationRoutes');
const activityLogRoutes = require('./activityLogRoutes');
const authRoutes = require('./authRoutes');

// User routes
router.use('/api/modules', moduleRoutes);
router.use('/api/classes', classRoutes);
router.use('/api/students', studentRoutes);
router.use('/api/facilitators', facilitatorRoutes);
router.use('/api/managers', managerRoutes);
router.use('/api/allocations', allocationRoutes);
router.use('/api/logs', activityLogRoutes);
router.use('/api/auth', authRoutes); // Register and Login

// Optional: health check or base route
router.get('/', (req, res) => {
  res.json({ message: 'Course Management Platform API is running.' });
});

module.exports = router;
