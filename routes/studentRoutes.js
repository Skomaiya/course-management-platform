const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect } = require('../middleware/authentication');
const { authorizeRoles } = require('../middleware/authorization');
const { Student } = require('../models');

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve all students (managers only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/', protect, authorizeRoles('manager'), studentController.getAllStudents);

/**
 * @swagger
 * /api/students/profile:
 *   get:
 *     summary: Get student's own profile
 *     description: Retrieve the authenticated student's own profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student's profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 student:
 *                   $ref: '#/components/schemas/Student'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only students can access their own profile
 */
router.get('/profile', protect, authorizeRoles('student'), studentController.getStudentProfile);

/**
 * @swagger
 * /api/students/profile:
 *   put:
 *     summary: Update student's own profile
 *     description: Allow students to update their own profile information
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Student's name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Student's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (optional)
 *               classId:
 *                 type: string
 *                 format: uuid
 *                 description: Class ID
 *               cohortId:
 *                 type: string
 *                 format: uuid
 *                 description: Cohort ID
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 student:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only students can update their own profile
 *       409:
 *         description: Email already in use
 */
router.put('/profile', protect, authorizeRoles('student'), studentController.updateProfile);

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     description: Retrieve a specific student by ID (managers can access any, students can access their own)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
 router.get('/:id', protect, async (req, res, next) => {
   if (req.user.role === 'manager') {
     return studentController.getStudentById(req, res);
   }

   if (req.user.role === 'student') {
     // For students, find their student profile and check if they're accessing their own data
     const student = await Student.findOne({ where: { userId: req.user.id } });
     if (student && student.id === req.params.id) {
       return studentController.getStudentById(req, res);
     }
   }

   return res.status(403).json({ message: 'Access denied' });
 });

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update student
 *     description: Update student information (managers can update any, students can update their own)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Student's name
 *               classId:
 *                 type: string
 *                 format: uuid
 *                 description: Class ID
 *               cohortId:
 *                 type: string
 *                 format: uuid
 *                 description: Cohort ID
 *     responses:
 *       200:
 *         description: Student updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
 router.put('/:id', protect, async (req, res, next) => {
   if (req.user.role === 'manager') {
     return studentController.updateStudent(req, res);
   }

   if (req.user.role === 'student') {
     // For students, find their student profile and check if they're accessing their own data
     const student = await Student.findOne({ where: { userId: req.user.id } });
     if (student && student.id === req.params.id) {
       return studentController.updateStudent(req, res);
     }
   }

   return res.status(403).json({ message: 'Access denied' });
 });

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Delete student
 *     description: Delete a student (managers only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Student deleted successfully"
 *       404:
 *         description: Student not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.delete('/:id', protect, authorizeRoles('manager'), studentController.deleteStudent);

module.exports = router;
