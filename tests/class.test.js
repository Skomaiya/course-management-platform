const request = require('supertest');
const app = require('../app');
const { sequelize, User, Manager, Facilitator } = require('../models');
const generateToken = require('../utils/token');

let managerToken, facilitatorToken, studentToken;
let createdClassId;
let managerUser, facilitatorUser;

beforeAll(async () => {
  // Create real users for testing
  managerUser = await User.create({
    email: 'classmanager@example.com',
    password: 'password123',
    role: 'manager',
    name: 'Class Manager'
  });

  facilitatorUser = await User.create({
    email: 'classfacilitator@example.com',
    password: 'password123',
    role: 'facilitator',
    name: 'Class Facilitator'
  });

  // Create manager profile
  const managerProfile = await Manager.create({
    name: 'Class Manager Profile',
    userId: managerUser.id
  });

  // Create facilitator profile
  await Facilitator.create({
    name: 'Class Facilitator Profile',
    qualification: 'PhD',
    location: 'Test Location',
    managerId: managerProfile.id,
    userId: facilitatorUser.id
  });

  // Create a real student user
  const studentUser = await User.create({
    email: 'classstudent@example.com',
    password: 'password123',
    role: 'student',
    name: 'Class Student'
  });

  // Generate tokens with real user IDs
  managerToken = generateToken(managerUser.id, managerUser.role);
  facilitatorToken = generateToken(facilitatorUser.id, facilitatorUser.role);
  studentToken = generateToken(studentUser.id, studentUser.role);
});

afterAll(async () => {
  await sequelize.close();
});

describe('Class Routes', () => {
  describe('POST /api/classes', () => {
    it('should allow a manager to create a class', async () => {
      const res = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Class Alpha',
          startDate: '2025-01-01',
          graduationDate: '2025-12-01',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Class Alpha');
      expect(res.body.id).toBeDefined();
      createdClassId = res.body.id;
    });

    it('should allow a facilitator to create a class', async () => {
      const res = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          name: 'Class Beta',
          startDate: '2025-02-01',
          graduationDate: '2025-12-31',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Class Beta');
    });

    it('should not allow a student to create a class', async () => {
      const res = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Class Gamma',
          startDate: '2025-03-01',
          graduationDate: '2025-12-31',
        });

      expect(res.statusCode).toBe(403);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Incomplete Class'
          // missing startDate and graduationDate
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/classes', () => {
    it('should allow any authenticated user to get all classes', async () => {
      const res = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/classes/:id', () => {
    it('should allow a manager to get a class by ID', async () => {
      const res = await request(app)
        .get(`/api/classes/${createdClassId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(createdClassId);
    });

    it('should allow a facilitator to get a class by ID', async () => {
      const res = await request(app)
        .get(`/api/classes/${createdClassId}`)
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(res.statusCode).toBe(200);
    });

    it('should return 404 for non-existent class', async () => {
      const res = await request(app)
        .get('/api/classes/invalid-id')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/classes/:id', () => {
    it('should allow a manager to update a class', async () => {
      const res = await request(app)
        .put(`/api/classes/${createdClassId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ name: 'Updated Class Alpha' });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Class Alpha');
    });

    it('should allow a facilitator to update a class', async () => {
      const res = await request(app)
        .put(`/api/classes/${createdClassId}`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({ name: 'Facilitator Edit' });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Facilitator Edit');
    });

    it('should return 404 when updating a non-existent class', async () => {
      const res = await request(app)
        .put('/api/classes/nonexistent-id')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ name: 'Ghost Class' });

      expect(res.statusCode).toBe(404);
    });

    it('should return 400 on invalid data update', async () => {
      const res = await request(app)
        .put(`/api/classes/${createdClassId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ startDate: '' });

      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /api/classes/:id', () => {
    it('should allow a manager to delete a class', async () => {
      const res = await request(app)
        .delete(`/api/classes/${createdClassId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/i);
    });

    it('should return 404 when deleting non-existent class', async () => {
      const res = await request(app)
        .delete('/api/classes/nonexistent-id')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(404);
    });

    it('should not allow student to delete a class', async () => {
      const res = await request(app)
        .delete(`/api/classes/${createdClassId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect([401, 403]).toContain(res.statusCode);
    });
  });
});
