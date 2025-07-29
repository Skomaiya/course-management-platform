const request = require('supertest');
const { Facilitator, Manager } = require('../models');
const { sequelize } = require('../config/config');
const app = require('../server');
const generateToken = require('../utils/token');

let managerToken;
let facilitatorId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create a mock manager user and token
  const manager = await Manager.create({
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Test Manager',
    email: 'manager@example.com',
    password: 'password',
    qualification: 'MSc',
    location: 'Remote',
    managerId: null,
  });

  managerToken = generateToken({ id: manager.id, role: 'manager' });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Facilitator Integration Tests', () => {
  test('POST /api/facilitators - create facilitator (manager only)', async () => {
    const res = await request(app)
      .post('/api/facilitators')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'testpass123',
        qualification: 'PhD',
        location: 'Onsite',
        managerId: '00000000-0000-0000-0000-000000000001',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('John Doe');

    facilitatorId = res.body.id;
  });

  test('GET /api/facilitators - get all facilitators (any authenticated user)', async () => {
    const res = await request(app)
      .get('/api/facilitators')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/facilitators/:id - get one facilitator by ID (manager only)', async () => {
    const res = await request(app)
      .get(`/api/facilitators/${facilitatorId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', facilitatorId);
  });
});

describe('Facilitator Update and Delete Tests', () => {
  let facilitatorToken;

  beforeAll(() => {
    // Simulate login for facilitator
    facilitatorToken = generateToken({
      id: facilitatorId,
      role: 'facilitator',
    });
  });

  test('PUT /api/facilitators/:id - update facilitator (facilitator & manager only)', async () => {
    const res = await request(app)
      .put(`/api/facilitators/${facilitatorId}`)
      .set('Authorization', `Bearer ${facilitatorToken}`)
      .send({
        name: 'Updated Name',
        location: 'Hybrid',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.location).toBe('Hybrid');
  });

  test('DELETE /api/facilitators/:id - delete facilitator (manager only)', async () => {
    const res = await request(app)
      .delete(`/api/facilitators/${facilitatorId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  test('GET /api/facilitators/:id - should return 404 after deletion', async () => {
    const res = await request(app)
      .get(`/api/facilitators/${facilitatorId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(404);
  });
});
