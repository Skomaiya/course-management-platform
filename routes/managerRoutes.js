const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { protect } = require('../middleware/authentication');
const { authorizeRoles } = require('../middleware/authorization');

/**
 * @swagger
 * /api/managers:
 *   post:
 *     summary: Create a new manager
 *     description: Create a new manager profile
 *     tags: [Managers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Manager's name
 *                 example: "Dr. John Smith"
 *     responses:
 *       201:
 *         description: Manager created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Manager'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Email already in use
 */
router.post('/', protect, authorizeRoles('manager'), managerController.createManager);

/**
 * @swagger
 * /api/managers:
 *   get:
 *     summary: Get all managers
 *     description: Retrieve all managers
 *     tags: [Managers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all managers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Manager'
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, managerController.getAllManagers);

/**
 * @swagger
 * /api/managers/{id}:
 *   get:
 *     summary: Get manager by ID
 *     description: Retrieve a specific manager by ID
 *     tags: [Managers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Manager ID
 *     responses:
 *       200:
 *         description: Manager details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Manager'
 *       404:
 *         description: Manager not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', protect, managerController.getManagerById);

/**
 * @swagger
 * /api/managers/{id}:
 *   put:
 *     summary: Update manager
 *     description: Update manager information
 *     tags: [Managers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Manager ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Manager's name
 *     responses:
 *       200:
 *         description: Manager updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Manager'
 *       404:
 *         description: Manager not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', protect, managerController.updateManager);

/**
 * @swagger
 * /api/managers/{id}:
 *   delete:
 *     summary: Delete manager
 *     description: Delete a manager
 *     tags: [Managers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Manager ID
 *     responses:
 *       200:
 *         description: Manager deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Manager deleted successfully"
 *       404:
 *         description: Manager not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', protect, managerController.deleteManager);

module.exports = router;
