const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { protect } = require('../middleware/authentication');
const { authorizeRoles } = require('../middleware/authorization');

/**
 * @swagger
 * /api/logs:
 *   post:
 *     summary: Create a new activity log
 *     description: Create a new weekly activity log (facilitators only)
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - allocationId
 *               - week
 *             properties:
 *               allocationId:
 *                 type: string
 *                 format: uuid
 *                 description: Allocation ID
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               week:
 *                 type: integer
 *                 minimum: 1
 *                 description: Week number
 *                 example: 1
 *               attendance:
 *                 type: array
 *                 items:
 *                   type: boolean
 *                 description: Array of boolean values representing daily attendance
 *                 example: [true, false, true, true, false]
 *               formativeOneGrading:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Formative One grading status
 *                 example: "Done"
 *               formativeTwoGrading:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Formative Two grading status
 *                 example: "Pending"
 *               summativeGrading:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Summative grading status
 *                 example: "Not Started"
 *               courseModeration:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Course moderation status
 *                 example: "Done"
 *               intranetSync:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Intranet sync status
 *                 example: "Pending"
 *               gradeBookStatus:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Gradebook status
 *                 example: "Not Started"
 *     responses:
 *       201:
 *         description: Activity log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityLog'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - facilitators can only create logs for their own allocations
 *       404:
 *         description: Allocation not found
 */
router.post('/', protect, authorizeRoles('facilitator'), activityLogController.createLog);

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: Get all activity logs
 *     description: Retrieve all activity logs with optional filtering (managers only)
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *         description: Filter by week number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Done, Pending, Not Started]
 *         description: Filter by status (any grading field)
 *       - in: query
 *         name: gradingStatus
 *         schema:
 *           type: string
 *           enum: [formativeOneGrading, formativeTwoGrading, summativeGrading, courseModeration, intranetSync, gradeBookStatus]
 *         description: Specific grading field to filter by
 *       - in: query
 *         name: gradingStatusValue
 *         schema:
 *           type: string
 *           enum: [Done, Pending, Not Started]
 *         description: Status value for the specific grading field
 *       - in: query
 *         name: facilitatorId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by facilitator ID
 *       - in: query
 *         name: moduleId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by module ID
 *     responses:
 *       200:
 *         description: List of activity logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ActivityLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only managers can view all logs
 */
router.get('/', protect, authorizeRoles('manager'), activityLogController.getAllLogs);

/**
 * @swagger
 * /api/logs/overdue/all:
 *   get:
 *     summary: Get overdue logs
 *     description: Retrieve all overdue activity logs (managers only)
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of overdue activity logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ActivityLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only managers can view overdue logs
 */
router.get('/overdue/all', protect, authorizeRoles('manager'), activityLogController.getOverdueLogs);

/**
 * @swagger
 * /api/logs/{id}:
 *   get:
 *     summary: Get activity log by ID
 *     description: Retrieve a specific activity log (facilitators can only view their own logs)
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Activity log ID
 *     responses:
 *       200:
 *         description: Activity log details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityLog'
 *       404:
 *         description: Activity log not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - facilitators can only view their own logs
 */
router.get('/:id', protect, activityLogController.getLogById);

/**
 * @swagger
 * /api/logs/{id}:
 *   put:
 *     summary: Update activity log
 *     description: Update activity log information (facilitators can only update their own logs)
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Activity log ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               week:
 *                 type: integer
 *                 minimum: 1
 *                 description: Week number
 *               attendance:
 *                 type: array
 *                 items:
 *                   type: boolean
 *                 description: Array of boolean values representing daily attendance
 *               formativeOneGrading:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Formative One grading status
 *               formativeTwoGrading:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Formative Two grading status
 *               summativeGrading:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Summative grading status
 *               courseModeration:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Course moderation status
 *               intranetSync:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Intranet sync status
 *               gradeBookStatus:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Gradebook status
 *     responses:
 *       200:
 *         description: Activity log updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityLog'
 *       404:
 *         description: Activity log not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - facilitators can only update their own logs
 */
router.put('/:id', protect, activityLogController.updateLog);

/**
 * @swagger
 * /api/logs/{id}:
 *   delete:
 *     summary: Delete activity log
 *     description: Delete an activity log (managers only)
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Activity log ID
 *     responses:
 *       200:
 *         description: Activity log deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Log deleted successfully"
 *       404:
 *         description: Activity log not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only managers can delete logs
 */
router.delete('/:id', protect, authorizeRoles('manager'), activityLogController.deleteLog);

module.exports = router;
