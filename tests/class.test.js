const request = require('supertest');
const app = require('../app');
const Class = require('../models');
const generateToken = require('../utils/token');
const { sequelize } = require('../config/config');

let managerToken, facilitatorToken, studentToken;
let createdClassId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  managerToken = generateToken('manager');
  facilitatorToken = generateToken('facilitator');
  studentToken = generateToken('student');
});

afterAll(async () => {
  await sequelize.close();
});

describe('Class Routes', () => {
  describe('POST /api/classes', () => {
    it('should allow creation by a manager', async () => {
      const res = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Class A',
          startDate: '2025-01-01',
          graduationDate: '2025-12-01',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Class A');
      createdClassId = res.body.id;
    });

    it('should allow creation by a facilitator', async () => {
      const res = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          name: 'Class B',
          startDate: '2025-02-01',
          graduationDate: '2025-12-20',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Class B');
    });

    it('should reject creation by a student', async () => {
      const res = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Class C',
          startDate: '2025-01-01',
          graduationDate: '2025-12-01',
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/classes', () => {
    it('should return all classes for any authenticated user', async () => {
      const res = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/classes/:id', () => {
    it('should allow manager to get class details', async () => {
      const res = await request(app)
        .get(`/api/classes/${createdClassId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBeDefined();
    });

    it('should allow facilitator to get class details', async () => {
      const res = await request(app)
        .get(`/api/classes/${createdClassId}`)
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(res.statusCode).toBe(200);
    });

    it('should return 404 for non-existent class', async () => {
      const res = await request(app)
        .get('/api/classes/nonexistent-id')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/classes/:id', () => {
    it('should allow manager to update class', async () => {
      const res = await request(app)
        .put(`/api/classes/${createdClassId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ name: 'Class A Updated' });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Class A Updated');
    });

    it('should allow facilitator to update class', async () => {
      const res = await request(app)
        .put(`/api/classes/${createdClassId}`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({ name: 'Class A - Facilitator Edit' });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Class A - Facilitator Edit');
    });
  });

  describe('DELETE /api/classes/:id', () => {
    it('should allow manager to delete class', async () => {
      const res = await request(app)
        .delete(`/api/classes/${createdClassId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/i);
    });
  });
});
