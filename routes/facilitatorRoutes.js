const express = require('express');
const router = express.Router();
const facilitatorController = require('../controllers/facilitatorController');
const { protect } = require('../middleware/authentication');
const { authorizeRoles } = require('../middleware/authorization');

/**
 * @swagger
 * /api/facilitators:
 *   post:
 *     summary: Create a new facilitator
 *     description: Create a new facilitator profile (managers only)
 *     tags: [Facilitators]
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
 *               - qualification
 *               - location
 *               - managerId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Facilitator's name
 *                 example: "Dr. Jane Smith"
 *               qualification:
 *                 type: string
 *                 description: Facilitator's qualification
 *                 example: "PhD"
 *               location:
 *                 type: string
 *                 description: Facilitator's location
 *                 example: "Remote"
 *               managerId:
 *                 type: string
 *                 format: uuid
 *                 description: Manager ID
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       201:
 *         description: Facilitator created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Facilitator'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only managers can create facilitators
 *       409:
 *         description: Email already in use
 */
router.post('/', protect, authorizeRoles('manager'), facilitatorController.createFacilitator);

/**
 * @swagger
 * /api/facilitators:
 *   get:
 *     summary: Get all facilitators
 *     description: Retrieve all facilitators (managers only)
 *     tags: [Facilitators]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all facilitators
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Facilitator'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/', protect, authorizeRoles('manager'), facilitatorController.getAllFacilitators);

/**
 * @swagger
 * /api/facilitators/{id}:
 *   get:
 *     summary: Get facilitator by ID
 *     description: Retrieve a specific facilitator by ID (managers and the facilitator themselves)
 *     tags: [Facilitators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Facilitator ID
 *     responses:
 *       200:
 *         description: Facilitator details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Facilitator'
 *       404:
 *         description: Facilitator not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/:id', protect, facilitatorController.getFacilitatorById);

/**
 * @swagger
 * /api/facilitators/{id}:
 *   put:
 *     summary: Update facilitator
 *     description: Update facilitator information (managers and the facilitator themselves)
 *     tags: [Facilitators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Facilitator ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Facilitator's name
 *               qualification:
 *                 type: string
 *                 description: Facilitator's qualification
 *               location:
 *                 type: string
 *                 description: Facilitator's location
 *               managerId:
 *                 type: string
 *                 format: uuid
 *                 description: Manager ID
 *     responses:
 *       200:
 *         description: Facilitator updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Facilitator'
 *       404:
 *         description: Facilitator not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.put('/:id', protect, facilitatorController.updateFacilitator);

/**
 * @swagger
 * /api/facilitators/{id}:
 *   delete:
 *     summary: Delete facilitator
 *     description: Delete a facilitator (managers only)
 *     tags: [Facilitators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Facilitator ID
 *     responses:
 *       200:
 *         description: Facilitator deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Facilitator deleted successfully"
 *       404:
 *         description: Facilitator not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only managers can delete facilitators
 */
router.delete('/:id', protect, authorizeRoles('manager'), facilitatorController.deleteFacilitator);

module.exports = router;
