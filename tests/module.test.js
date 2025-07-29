const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../config/config');
const { Manager, Module } = require('../models');
const generateToken = require('../utils/token');

let managerToken;
let testModuleId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create manager directly
  const manager = await Manager.create({
    name: 'Test Manager',
    email: 'manager@example.com',
    password: 'Password123!',
    role: 'manager',
  });

  // Generate token using utility
  managerToken = generateToken(manager.id, manager.email, 'manager');
});

afterAll(async () => {
  await sequelize.close();
});

describe('Module Management - CRUD', () => {
  test('Create a new module', async () => {
    const res = await request(app)
      .post('/api/modules')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        name: 'Software Engineering',
        half: 'H1',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Software Engineering');
    testModuleId = res.body.id;
  });

  test('Get all modules', async () => {
    const res = await request(app)
      .get('/api/modules')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Get module by ID', async () => {
    const res = await request(app)
      .get(`/api/modules/${testModuleId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(testModuleId);
  });

  test('Update a module', async () => {
    const res = await request(app)
      .put(`/api/modules/${testModuleId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ name: 'Advanced Software Engineering' });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Advanced Software Engineering');
  });

  test('Delete a module', async () => {
    const res = await request(app)
      .delete(`/api/modules/${testModuleId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(204);
  });
});
