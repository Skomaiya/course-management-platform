const express = require('express');
const router = express.Router();

const moduleController = require('../controllers/moduleController');
const { protect } = require('../middleware/authentication');
const { authorizeRoles } = require('../middleware/authorization');

/**
 * @swagger
 * /api/modules:
 *   post:
 *     summary: Create a new module
 *     description: Create a new module (facilitators and managers only)
 *     tags: [Modules]
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
 *               - half
 *             properties:
 *               name:
 *                 type: string
 *                 description: Module name
 *                 example: "Cybersecurity Fundamentals"
 *               half:
 *                 type: string
 *                 enum: [H1, H2]
 *                 description: Half of the academic year
 *                 example: "H1"
 *     responses:
 *       201:
 *         description: Module created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.post('/', protect, authorizeRoles('facilitator', 'manager'), moduleController.createModule);

/**
 * @swagger
 * /api/modules:
 *   get:
 *     summary: Get all modules
 *     description: Retrieve all modules
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all modules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Module'
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, moduleController.getAllModules);

/**
 * @swagger
 * /api/modules/{id}:
 *   get:
 *     summary: Get module by ID
 *     description: Retrieve a specific module by ID (facilitators and managers only)
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Module ID
 *     responses:
 *       200:
 *         description: Module details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *       404:
 *         description: Module not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/:id', protect, authorizeRoles('facilitator', 'manager'), moduleController.getModuleById);

/**
 * @swagger
 * /api/modules/{id}:
 *   put:
 *     summary: Update module
 *     description: Update module information (facilitators and managers only)
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Module ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Module name
 *               half:
 *                 type: string
 *                 enum: [H1, H2]
 *                 description: Half of the academic year
 *     responses:
 *       200:
 *         description: Module updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *       404:
 *         description: Module not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.put('/:id', protect, authorizeRoles('facilitator', 'manager'), moduleController.updateModule);

/**
 * @swagger
 * /api/modules/{id}:
 *   delete:
 *     summary: Delete module
 *     description: Delete a module (facilitators and managers only)
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Module ID
 *     responses:
 *       204:
 *         description: Module deleted successfully
 *       404:
 *         description: Module not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.delete('/:id', protect, authorizeRoles('facilitator', 'manager'), moduleController.deleteModule);

module.exports = router;