const request = require('supertest');
const app = require('../app');
const { User, Manager, Module } = require('../models');
const generateToken = require('../utils/token');

describe('Module Management - CRUD', () => {
  let managerUser, manager, module, managerToken;

  beforeAll(async () => {
    // Create manager directly
    managerUser = await User.create({
      email: 'modulemanager@example.com',
      password: 'Password123!',
      role: 'manager',
      name: 'Module Manager'
    });

    manager = await Manager.create({
      name: 'Test Manager',
      userId: managerUser.id
    });

    module = await Module.create({
      name: 'Test Module',
      half: 'H1'
    });

    managerToken = generateToken(managerUser.id, managerUser.role);
  });

  test('Create a new module', async () => {
    const res = await request(app)
      .post('/api/modules')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        name: 'New Module',
        half: 'H1'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('New Module');
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
      .get(`/api/modules/${module.id}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(module.id);
  });

  test('Update a module', async () => {
    const res = await request(app)
      .put(`/api/modules/${module.id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        name: 'Updated Module Name'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Module Name');
  });

  test('Delete a module', async () => {
    const res = await request(app)
      .delete(`/api/modules/${module.id}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(204);
  });
});
