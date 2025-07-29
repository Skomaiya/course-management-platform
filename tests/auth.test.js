const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../config/config');
const { Student, Facilitator, Manager } = require('../models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth Controller - Register & Login', () => {
  const studentUser = {
    name: 'Test Student',
    email: 'student@example.com',
    password: 'StudentPass123!',
    role: 'student',
    classID: '11111111-1111-1111-1111-111111111111',
    cohortID: '22222222-2222-2222-2222-222222222222',
  };

  const facilitatorUser = {
    name: 'Test Facilitator',
    email: 'facilitator@example.com',
    password: 'FacilitatorPass123!',
    role: 'facilitator',
    qualification: 'MSc Cybersecurity',
    location: 'Remote',
  };

  const managerUser = {
    name: 'Test Manager',
    email: 'manager@example.com',
    password: 'ManagerPass123!',
    role: 'manager',
  };

  const users = [studentUser, facilitatorUser, managerUser];

  describe.each(users)('Registration and Login for %s', (user) => {
    test(`Register ${user.role}`, async () => {
      const res = await request(app).post('/api/register').send(user);

      expect(res.statusCode).toBe(201);
      expect(res.body.token).toBeDefined();
    });

    test(`Login ${user.role}`, async () => {
      const res = await request(app).post('/api/login').send({
        email: user.email,
        password: user.password,
        role: user.role,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });
  });

  // ─── Negative Cases ─────────────────────────────────────────────

  test('Should not register with missing email', async () => {
    const res = await request(app).post('/api/register').send({
      name: 'No Email',
      password: 'TestPass123!',
      role: 'student',
      classID: '11111111-1111-1111-1111-111111111111',
      cohortID: '22222222-2222-2222-2222-222222222222',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/email/i);
  });

  test('Should not register with duplicate email', async () => {
    const res = await request(app).post('/api/register').send(studentUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('Should not login with incorrect password', async () => {
    const res = await request(app).post('/api/login').send({
      email: studentUser.email,
      password: 'WrongPass!',
      role: 'student',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test('Should not login with invalid role', async () => {
    const res = await request(app).post('/api/login').send({
      email: studentUser.email,
      password: studentUser.password,
      role: 'admin', // invalid
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid role/i);
  });

  test('Should not register facilitator without qualification', async () => {
    const res = await request(app).post('/api/register').send({
      name: 'No Qualification',
      email: 'noqual@example.com',
      password: 'NoQual123!',
      role: 'facilitator',
      location: 'Remote',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/qualification/i);
  });

  test('Should not register student without classID', async () => {
    const res = await request(app).post('/api/register').send({
      name: 'Missing ClassID',
      email: 'noclass@example.com',
      password: 'NoClass123!',
      role: 'student',
      cohortID: '22222222-2222-2222-2222-222222222222',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/classID/i);
  });
});
