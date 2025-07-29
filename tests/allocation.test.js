const request = require('supertest');
const app = require('../app');
const { Allocation, Module, Class, Facilitator, Mode, Manager } = require('../models');
const generateToken = require('../utils/token');
const { sequelize } = require('../config/config');

let token;
let allocationId;
let moduleId, classId, facilitatorId, modeId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create required foreign key records
  const manager = await Manager.create({ name: 'Test Manager' });
  const module = await Module.create({ name: 'Cybersecurity', half: 'A' });
  const classObj = await Class.create({ name: 'Class A', startDate: new Date(), graduationDate: new Date() });
  const facilitator = await Facilitator.create({ name: 'John Doe', email: 'john@example.com', qualification: 'MSc', location: 'NY', managerId: manager.id });
  const mode = await Mode.create({ name: 'Online' });

  moduleId = module.id;
  classId = classObj.id;
  facilitatorId = facilitator.id;
  modeId = mode.id;

  token = generateToken({ id: manager.id, role: 'manager' });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Allocation API', () => {
  test('POST /api/allocations → should create an allocation (manager only)', async () => {
    const res = await request(app)
      .post('/api/allocations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        moduleId,
        classId,
        facilitatorId,
        modeId,
        trimester: 2,
        year: 2025
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/created/i);
    allocationId = res.body.data.id;
  });

  test('GET /api/allocations → should return all allocations', async () => {
    const res = await request(app)
      .get('/api/allocations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/allocations/:id → should return single allocation', async () => {
    const res = await request(app)
      .get(`/api/allocations/${allocationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(allocationId);
  });

  test('PUT /api/allocations/:id → should update allocation', async () => {
    const res = await request(app)
      .put(`/api/allocations/${allocationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ trimester: 3 });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
    expect(res.body.data.trimester).toBe(3);
  });

  test('DELETE /api/allocations/:id → should delete allocation', async () => {
    const res = await request(app)
      .delete(`/api/allocations/${allocationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  test('GET /api/allocations/:id → should return 404 for deleted allocation', async () => {
    const res = await request(app)
      .get(`/api/allocations/${allocationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});
