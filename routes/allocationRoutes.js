const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocationController');
const { protect } = require('../middleware/authentication');
const { authorizeRoles } = require('../middleware/authorization');

/**
 * @swagger
 * /api/allocations:
 *   post:
 *     summary: Create a new allocation
 *     description: Create a new course allocation (managers only)
 *     tags: [Allocations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - moduleId
 *               - classId
 *               - facilitatorId
 *               - modeId
 *               - trimester
 *               - year
 *             properties:
 *               moduleId:
 *                 type: string
 *                 format: uuid
 *                 description: Module ID
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               classId:
 *                 type: string
 *                 format: uuid
 *                 description: Class ID
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               facilitatorId:
 *                 type: string
 *                 format: uuid
 *                 description: Facilitator ID
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               modeId:
 *                 type: string
 *                 format: uuid
 *                 description: Mode ID (Online, In-Person, Hybrid)
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               trimester:
 *                 type: string
 *                 enum: [HT1, HT2, FT]
 *                 description: Trimester
 *                 example: "HT1"
 *               year:
 *                 type: string
 *                 pattern: '^\\d{4}$'
 *                 description: Academic year (4 digits)
 *                 example: "2024"
 *     responses:
 *       201:
 *         description: Allocation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Allocation'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only managers can create allocations
 *       409:
 *         description: Allocation already exists
 */
router.post('/', protect, authorizeRoles('manager'), allocationController.createAllocation);

/**
 * @swagger
 * /api/allocations:
 *   get:
 *     summary: Get all allocations
 *     description: Retrieve all allocations (managers only)
 *     tags: [Allocations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all allocations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Allocation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/', protect, authorizeRoles('manager'), allocationController.getAllAllocations);

/**
 * @swagger
 * /api/allocations/filter:
 *   get:
 *     summary: Filter allocations
 *     description: Filter allocations by various criteria (managers only)
 *     tags: [Allocations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: trimester
 *         schema:
 *           type: string
 *           enum: [HT1, HT2, FT]
 *         description: Filter by trimester
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *           pattern: '^\\d{4}$'
 *         description: Filter by year
 *       - in: query
 *         name: facilitatorId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by facilitator ID
 *       - in: query
 *         name: modeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by mode ID
 *     responses:
 *       200:
 *         description: Filtered allocations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Allocation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/filter', protect, authorizeRoles('manager'), allocationController.filterAllocations);

/**
 * @swagger
 * /api/allocations/facilitator/{facilitatorId}:
 *   get:
 *     summary: Get facilitator's allocations
 *     description: Get all allocations for a specific facilitator (facilitators can only view their own)
 *     tags: [Allocations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilitatorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Facilitator ID
 *     responses:
 *       200:
 *         description: Facilitator's allocations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Allocation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - facilitators can only view their own allocations
 */
router.get('/facilitator/:facilitatorId', protect, allocationController.getFacilitatorAllocations);

/**
 * @swagger
 * /api/allocations/facilitator/{facilitatorId}/{id}:
 *   get:
 *     summary: Get specific facilitator allocation
 *     description: Get a specific allocation for a facilitator (facilitators can only view their own)
 *     tags: [Allocations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilitatorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Facilitator ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Allocation ID
 *     responses:
 *       200:
 *         description: Specific allocation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Allocation'
 *       404:
 *         description: Allocation not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - facilitators can only view their own allocations
 */
router.get('/facilitator/:facilitatorId/:id', protect, allocationController.getFacilitatorAllocationById);

/**
 * @swagger
 * /api/allocations/{id}:
 *   get:
 *     summary: Get allocation by ID
 *     description: Retrieve a specific allocation by ID (managers only)
 *     tags: [Allocations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Allocation ID
 *     responses:
 *       200:
 *         description: Allocation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Allocation'
 *       404:
 *         description: Allocation not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/:id', protect, authorizeRoles('manager'), allocationController.getAllocationById);

/**
 * @swagger
 * /api/allocations/{id}:
 *   put:
 *     summary: Update allocation
 *     description: Update allocation information (managers only)
 *     tags: [Allocations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Allocation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moduleId:
 *                 type: string
 *                 format: uuid
 *                 description: Module ID
 *               classId:
 *                 type: string
 *                 format: uuid
 *                 description: Class ID
 *               facilitatorId:
 *                 type: string
 *                 format: uuid
 *                 description: Facilitator ID
 *               modeId:
 *                 type: string
 *                 format: uuid
 *                 description: Mode ID
 *               trimester:
 *                 type: string
 *                 enum: [HT1, HT2, FT]
 *                 description: Trimester
 *               year:
 *                 type: string
 *                 pattern: '^\\d{4}$'
 *                 description: Academic year
 *     responses:
 *       200:
 *         description: Allocation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Allocation'
 *       404:
 *         description: Allocation not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only managers can update allocations
 */
router.put('/:id', protect, authorizeRoles('manager'), allocationController.updateAllocation);

/**
 * @swagger
 * /api/allocations/{id}:
 *   delete:
 *     summary: Delete allocation
 *     description: Delete an allocation (managers only)
 *     tags: [Allocations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Allocation ID
 *     responses:
 *       200:
 *         description: Allocation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Allocation deleted successfully"
 *       404:
 *         description: Allocation not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only managers can delete allocations
 */
router.delete('/:id', protect, authorizeRoles('manager'), allocationController.deleteAllocation);

module.exports = router;
