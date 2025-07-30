const request = require('supertest');
const { Facilitator, Manager, User } = require('../models');
const sequelize = require('../config/database');
const app = require('../app');
const generateToken = require('../utils/token');
const { v4: uuidv4 } = require('uuid');

let managerToken, facilitatorToken;
let facilitatorId, managerId;

const ts = Date.now();

beforeAll(async () => {
  // Create Manager User & Manager Profile
  const managerUser = await User.create({
    name: 'Manager One',
    email: `manager_${ts}@example.com`,
    password: 'TestPass123!',
    role: 'manager',
  });
  const manager = await Manager.create({
    name: 'Manager One',
    userId: managerUser.id,
  });
  managerToken = generateToken(managerUser.id, 'manager');
  managerId = manager.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Facilitator Registration & Retrieval', () => {
      test('POST /api/facilitators - Should create facilitator (manager only)', async () => {
    const res = await request(app)
      .post('/api/facilitators')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        name: 'Jane Doe',
        email: `jane.doe_${ts}@example.com`,
        password: 'Secure1234!',
        qualification: 'MSc',
        location: 'Remote',
        managerId,
      });

    if (res.statusCode !== 201) {
      console.log('Facilitator creation failed:', res.body);
    }

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Jane Doe');
    facilitatorId = res.body.id;

    // Get the user ID to generate proper token
    const user = await User.findOne({ where: { email: `jane.doe_${ts}@example.com` } });
    facilitatorToken = generateToken(user.id, 'facilitator');
  });

      test('POST /api/facilitators - Missing name should return 400', async () => {
    const res = await request(app)
      .post('/api/facilitators')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        email: `missing.name_${ts}@example.com`,
        password: 'Somepass123!',
        qualification: 'BSc',
        location: 'Hybrid',
        managerId,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/All fields are required/i);
  });

      test('GET /api/facilitators - Should retrieve all facilitators', async () => {
    const res = await request(app)
      .get('/api/facilitators')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

      test('GET /api/facilitators/:id - Should retrieve facilitator by ID', async () => {
    const res = await request(app)
      .get(`/api/facilitators/${facilitatorId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', facilitatorId);
  });

      test('GET /api/facilitators/:id - Invalid ID should return 404', async () => {
    const res = await request(app)
      .get('/api/facilitators/invalid-id-123')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(404);
  });
});

describe('Facilitator Update & Deletion', () => {
      test('PUT /api/facilitators/:id - Should update facilitator (self or manager)', async () => {
    const res = await request(app)
      .put(`/api/facilitators/${facilitatorId}`)
      .set('Authorization', `Bearer ${facilitatorToken}`)
      .send({
        name: 'Jane Updated',
        location: 'Hybrid',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Jane Updated');
    expect(res.body.location).toBe('Hybrid');
  });

      test('PUT /api/facilitators/:id - Unauthorized user should be blocked', async () => {
    const randomToken = generateToken(uuidv4(), 'student');

    const res = await request(app)
      .put(`/api/facilitators/${facilitatorId}`)
      .set('Authorization', `Bearer ${randomToken}`)
      .send({ name: 'Unauthorized Attempt' });

    expect(res.statusCode).toBe(401);
  });

      test('DELETE /api/facilitators/:id - Should delete facilitator (manager only)', async () => {
    const res = await request(app)
      .delete(`/api/facilitators/${facilitatorId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

      test('GET /api/facilitators/:id - Should return 404 after deletion', async () => {
    const res = await request(app)
      .get(`/api/facilitators/${facilitatorId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(404);
  });
});
