const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../config/config');
const { Manager } = require('../models');
const generateToken = require('../utils/token');

describe('Manager API Integration Tests', () => {
  let testManagerId;
  let authToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create a manager directly via model for authentication
    const manager = await Manager.create({
      name: 'Auth Manager',
      email: 'authmanager@example.com',
      password: 'authpass123'
    });

    authToken = generateToken(manager.id, 'manager');
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a new manager', async () => {
    const res = await request(app)
      .post('/api/managers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Jane Doe',
        email: 'janedoe@example.com',
        password: 'securepass123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Jane Doe');
    expect(res.body).toHaveProperty('email', 'janedoe@example.com');

    testManagerId = res.body.id;
  });

  it('should not allow duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/managers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Duplicate',
        email: 'janedoe@example.com',
        password: 'anotherpass'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Manager already exists/i);
  });

  it('should fetch all managers', async () => {
    const res = await request(app)
      .get('/api/managers')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should fetch a single manager by ID', async () => {
    const res = await request(app)
      .get(`/api/managers/${testManagerId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', testManagerId);
    expect(res.body).not.toHaveProperty('password');
  });

  it('should update manager info', async () => {
    const res = await request(app)
      .put(`/api/managers/${testManagerId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Jane Updated',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated successfully/i);
  });

  it('should delete the manager', async () => {
    const res = await request(app)
      .delete(`/api/managers/${testManagerId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  it('should return 404 for deleted manager', async () => {
    const res = await request(app)
      .get(`/api/managers/${testManagerId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(404);
  });
});
