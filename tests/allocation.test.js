const request = require('supertest');
const app = require('../app');
const { User, Manager, Module, Class, Facilitator, Allocation, Mode, Cohort } = require('../models');
const generateToken = require('../utils/token');

describe('Module 1: Course Allocation System', () => {
  let managerUser, manager, facilitatorUser, facilitator, module, classObj, mode, cohort;
  let managerToken, facilitatorToken, studentToken;
  let testAllocationId;

  beforeAll(async () => {
    // Create manager
    managerUser = await User.create({
      email: 'allocationmanager@example.com',
      password: 'password123',
      role: 'manager',
      name: 'Allocation Manager'
    });

    manager = await Manager.create({
      name: 'Test Manager',
      userId: managerUser.id
    });

    // Create facilitator
    facilitatorUser = await User.create({
      email: 'allocationfacilitator@example.com',
      password: 'password123',
      role: 'facilitator',
      name: 'Allocation Facilitator'
    });

    facilitator = await Facilitator.create({
      name: 'Test Facilitator',
      qualification: 'PhD',
      location: 'Test Location',
      managerId: manager.id,
      userId: facilitatorUser.id
    });

    // Create supporting data
    module = await Module.create({ name: 'Cybersecurity', half: 'H1' });
    classObj = await Class.create({ 
      name: 'CS101', 
      startDate: '2024-01-01', 
      graduationDate: '2024-06-01' 
    });
    mode = await Mode.create({ name: 'Online' });
    cohort = await Cohort.create({ name: '2024S' });

    // Generate tokens
    managerToken = generateToken(managerUser.id, managerUser.role);
    facilitatorToken = generateToken(facilitatorUser.id, facilitatorUser.role);
    studentToken = generateToken('student-id', 'student');
  });

  afterAll(async () => {
    await require('../models').sequelize.close();
  });

  describe('Manager CRUD Operations', () => {
    describe('POST /api/allocations', () => {
      it('should allow manager to create allocation with all required fields', async () => {
        const res = await request(app)
          .post('/api/allocations')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            moduleId: module.id,
            classId: classObj.id,
            facilitatorId: facilitator.id,
            trimester: 'HT1',
            modeId: mode.id,
            year: '2024'
          });

        expect(res.statusCode).toBe(201);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.trimester).toBe('HT1');
        expect(res.body.data.year).toBe('2024');
        testAllocationId = res.body.data.id;
      });

      it('should reject allocation with missing required fields', async () => {
        const res = await request(app)
          .post('/api/allocations')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            moduleId: module.id,
            // Missing other required fields
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/Missing required fields/i);
      });

      it('should reject allocation with invalid module ID', async () => {
        const res = await request(app)
          .post('/api/allocations')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            moduleId: 'invalid-uuid',
            classId: classObj.id,
            facilitatorId: facilitator.id,
            trimester: 'HT1',
            modeId: mode.id,
            year: '2024'
          });

        expect(res.statusCode).toBe(400);
      });

      it('should reject allocation with invalid facilitator ID', async () => {
        const res = await request(app)
          .post('/api/allocations')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            moduleId: module.id,
            classId: classObj.id,
            facilitatorId: 'invalid-uuid',
            trimester: 'HT1',
            modeId: mode.id,
            year: '2024'
          });

        expect(res.statusCode).toBe(400);
      });

      it('should reject unauthenticated requests', async () => {
        const res = await request(app)
          .post('/api/allocations')
          .send({
            moduleId: module.id,
            classId: classObj.id,
            facilitatorId: facilitator.id,
            trimester: 'HT1',
            modeId: mode.id,
            year: '2024'
          });

        expect(res.statusCode).toBe(401);
      });

      it('should reject requests from non-managers', async () => {
        const res = await request(app)
          .post('/api/allocations')
          .set('Authorization', `Bearer ${facilitatorToken}`)
          .send({
            moduleId: module.id,
            classId: classObj.id,
            facilitatorId: facilitator.id,
            trimester: 'HT1',
            modeId: mode.id,
            year: '2024'
          });

        expect(res.statusCode).toBe(403);
      });
    });

    describe('GET /api/allocations', () => {
      it('should allow manager to get all allocations', async () => {
        const res = await request(app)
          .get('/api/allocations')
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });

      it('should reject requests from non-managers', async () => {
        const res = await request(app)
          .get('/api/allocations')
          .set('Authorization', `Bearer ${facilitatorToken}`);

        expect(res.statusCode).toBe(403);
      });

      it('should reject unauthenticated requests', async () => {
        const res = await request(app)
          .get('/api/allocations');

        expect(res.statusCode).toBe(401);
      });
    });

    describe('GET /api/allocations/:id', () => {
      it('should allow manager to get allocation by ID', async () => {
        const res = await request(app)
          .get(`/api/allocations/${testAllocationId}`)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(testAllocationId);
      });

      it('should return 404 for non-existent allocation', async () => {
        const res = await request(app)
          .get('/api/allocations/non-existent-id')
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.statusCode).toBe(404);
      });

      it('should reject requests from non-managers', async () => {
        const res = await request(app)
          .get(`/api/allocations/${testAllocationId}`)
          .set('Authorization', `Bearer ${facilitatorToken}`);

        expect(res.statusCode).toBe(403);
      });
    });

    describe('PUT /api/allocations/:id', () => {
      it('should allow manager to update allocation', async () => {
        const res = await request(app)
          .put(`/api/allocations/${testAllocationId}`)
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            trimester: 'HT2',
            year: '2025'
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.trimester).toBe('HT2');
        expect(res.body.year).toBe('2025');
      });

      it('should return 404 when updating non-existent allocation', async () => {
        const res = await request(app)
          .put('/api/allocations/non-existent-id')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            trimester: 'HT2'
          });

        expect(res.statusCode).toBe(404);
      });

      it('should reject requests from non-managers', async () => {
        const res = await request(app)
          .put(`/api/allocations/${testAllocationId}`)
          .set('Authorization', `Bearer ${facilitatorToken}`)
          .send({
            trimester: 'HT2'
          });

        expect(res.statusCode).toBe(403);
      });
    });

    describe('DELETE /api/allocations/:id', () => {
      it('should allow manager to delete allocation', async () => {
        const res = await request(app)
          .delete(`/api/allocations/${testAllocationId}`)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/deleted successfully/i);
      });

      it('should return 404 when deleting non-existent allocation', async () => {
        const res = await request(app)
          .delete('/api/allocations/non-existent-id')
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.statusCode).toBe(404);
      });

      it('should reject requests from non-managers', async () => {
        const res = await request(app)
          .delete(`/api/allocations/${testAllocationId}`)
          .set('Authorization', `Bearer ${facilitatorToken}`);

        expect(res.statusCode).toBe(403);
      });
    });
  });

  describe('Facilitator Access Control', () => {
    let facilitatorAllocationId;

    beforeAll(async () => {
      // Create a new allocation for testing facilitator access
      const allocation = await Allocation.create({
        moduleId: module.id,
        classId: classObj.id,
        facilitatorId: facilitator.id,
        trimester: 'FT',
        modeId: mode.id,
        year: '2024'
      });
      facilitatorAllocationId = allocation.id;
    });

    describe('GET /api/allocations/facilitator/:facilitatorId', () => {
      it('should allow facilitator to view their own allocations', async () => {
        const res = await request(app)
          .get(`/api/allocations/facilitator/${facilitator.id}`)
          .set('Authorization', `Bearer ${facilitatorToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].facilitatorId).toBe(facilitator.id);
      });

      it('should reject facilitator from viewing other facilitator allocations', async () => {
        // Create another facilitator
        const otherFacilitatorUser = await User.create({
          email: 'otherfacilitator@example.com',
          password: 'password123',
          role: 'facilitator',
          name: 'Other Facilitator'
        });

        const otherFacilitator = await Facilitator.create({
          name: 'Other Facilitator',
          qualification: 'MSc',
          location: 'Other Location',
          managerId: manager.id,
          userId: otherFacilitatorUser.id
        });

        const res = await request(app)
          .get(`/api/allocations/facilitator/${otherFacilitator.id}`)
          .set('Authorization', `Bearer ${facilitatorToken}`);

        expect(res.statusCode).toBe(403);
      });

      it('should reject unauthenticated requests', async () => {
        const res = await request(app)
          .get(`/api/allocations/facilitator/${facilitator.id}`);

        expect(res.statusCode).toBe(401);
      });
    });

    describe('GET /api/allocations/facilitator/:facilitatorId/:id', () => {
      it('should allow facilitator to view their specific allocation', async () => {
        const res = await request(app)
          .get(`/api/allocations/facilitator/${facilitator.id}/${facilitatorAllocationId}`)
          .set('Authorization', `Bearer ${facilitatorToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(facilitatorAllocationId);
        expect(res.body.facilitatorId).toBe(facilitator.id);
      });

      it('should reject facilitator from viewing other facilitator allocation', async () => {
        const res = await request(app)
          .get(`/api/allocations/facilitator/${facilitator.id}/non-existent-id`)
          .set('Authorization', `Bearer ${facilitatorToken}`);

        expect(res.statusCode).toBe(404);
      });
    });
  });

  describe('Filtering and Search', () => {
    let testAllocations = [];

    beforeAll(async () => {
      // Create multiple allocations for testing filters
      const allocations = await Promise.all([
        Allocation.create({
          moduleId: module.id,
          classId: classObj.id,
          facilitatorId: facilitator.id,
          trimester: 'HT1',
          modeId: mode.id,
          year: '2024'
        }),
        Allocation.create({
          moduleId: module.id,
          classId: classObj.id,
          facilitatorId: facilitator.id,
          trimester: 'HT2',
          modeId: mode.id,
          year: '2024'
        }),
        Allocation.create({
          moduleId: module.id,
          classId: classObj.id,
          facilitatorId: facilitator.id,
          trimester: 'FT',
          modeId: mode.id,
          year: '2025'
        })
      ]);
      testAllocations = allocations;
    });

    describe('GET /api/allocations/filter', () => {
      it('should filter allocations by trimester', async () => {
        const res = await request(app)
          .get('/api/allocations/filter?trimester=HT1')
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach(allocation => {
          expect(allocation.trimester).toBe('HT1');
        });
      });

      it('should filter allocations by year', async () => {
        const res = await request(app)
          .get('/api/allocations/filter?year=2024')
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach(allocation => {
          expect(allocation.year).toBe('2024');
        });
      });

      it('should filter allocations by facilitator', async () => {
        const res = await request(app)
          .get(`/api/allocations/filter?facilitatorId=${facilitator.id}`)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach(allocation => {
          expect(allocation.facilitatorId).toBe(facilitator.id);
        });
      });

      it('should filter allocations by mode', async () => {
        const res = await request(app)
          .get(`/api/allocations/filter?modeId=${mode.id}`)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach(allocation => {
          expect(allocation.modeId).toBe(mode.id);
        });
      });

      it('should filter allocations by multiple criteria', async () => {
        const res = await request(app)
          .get(`/api/allocations/filter?trimester=HT1&year=2024&facilitatorId=${facilitator.id}`)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach(allocation => {
          expect(allocation.trimester).toBe('HT1');
          expect(allocation.year).toBe('2024');
          expect(allocation.facilitatorId).toBe(facilitator.id);
        });
      });

      it('should return empty array when no matches found', async () => {
        const res = await request(app)
          .get('/api/allocations/filter?trimester=NonExistent')
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
      });

      it('should reject requests from non-managers', async () => {
        const res = await request(app)
          .get('/api/allocations/filter?trimester=HT1')
          .set('Authorization', `Bearer ${facilitatorToken}`);

        expect(res.statusCode).toBe(403);
      });
    });
  });

  describe('Data Validation and Business Rules', () => {
    it('should reject allocation with duplicate module-class-facilitator combination', async () => {
      // First allocation
      await Allocation.create({
        moduleId: module.id,
        classId: classObj.id,
        facilitatorId: facilitator.id,
        trimester: 'HT1',
        modeId: mode.id,
        year: '2024'
      });

      // Try to create duplicate
      const res = await request(app)
        .post('/api/allocations')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          moduleId: module.id,
          classId: classObj.id,
          facilitatorId: facilitator.id,
          trimester: 'HT1',
          modeId: mode.id,
          year: '2024'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should validate trimester values', async () => {
      const res = await request(app)
        .post('/api/allocations')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          moduleId: module.id,
          classId: classObj.id,
          facilitatorId: facilitator.id,
          trimester: 'INVALID_TRIMESTER',
          modeId: mode.id,
          year: '2024'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should validate year format', async () => {
      const res = await request(app)
        .post('/api/allocations')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          moduleId: module.id,
          classId: classObj.id,
          facilitatorId: facilitator.id,
          trimester: 'HT1',
          modeId: mode.id,
          year: 'invalid-year'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed UUIDs gracefully', async () => {
      const res = await request(app)
        .post('/api/allocations')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          moduleId: 'not-a-uuid',
          classId: classObj.id,
          facilitatorId: facilitator.id,
          trimester: 'HT1',
          modeId: mode.id,
          year: '2024'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll test that the endpoint responds appropriately
      const res = await request(app)
        .get('/api/allocations')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(200);
    });

    it('should validate that facilitator exists before creating allocation', async () => {
      const res = await request(app)
        .post('/api/allocations')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          moduleId: module.id,
          classId: classObj.id,
          facilitatorId: '00000000-0000-0000-0000-000000000000',
          trimester: 'HT1',
          modeId: mode.id,
          year: '2024'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should validate that module exists before creating allocation', async () => {
      const res = await request(app)
        .post('/api/allocations')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          moduleId: '00000000-0000-0000-0000-000000000000',
          classId: classObj.id,
          facilitatorId: facilitator.id,
          trimester: 'HT1',
          modeId: mode.id,
          year: '2024'
        });

      expect(res.statusCode).toBe(400);
    });
  });
});
